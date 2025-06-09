import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig, ModelConfig } from '@/config/models';
import { ProxyAgent, request as undiciRequest } from 'undici';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSearchRequest {
  model: string;
  messages: ChatMessage[];
  context?: string;
  stream?: boolean;
  enableWebSearch?: boolean;
}

function buildSearchRequestBody(config: ModelConfig, messages: ChatMessage[], context?: string, enableWebSearch?: boolean): Record<string, unknown> {
  let searchContext = "";
  if (enableWebSearch && config.hasWebSearch) {
    searchContext = "你拥有网络搜索能力。当需要获取最新信息、实时数据或验证事实时，请主动使用网络搜索功能。请根据用户的问题判断是否需要搜索最新信息。";
  }
  
  const finalMessages = context 
    ? [{ role: 'system' as const, content: `${context}${searchContext ? '\n\n' + searchContext : ''}` }, ...messages]
    : searchContext 
    ? [{ role: 'system' as const, content: searchContext }, ...messages]
    : messages;

  switch (config.provider) {
    case 'google':
      const contents = finalMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      
      const systemMessage = finalMessages.find(msg => msg.role === 'system');
      if (systemMessage && contents.length > 0 && contents[0].role === 'user') {
        contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
      }

      const geminiBody: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      };

      // 根据Google官方文档，对于Gemini 2.0使用Search作为tool
      // 参考: https://ai.google.dev/gemini-api/docs/grounding?lang=python
      if (enableWebSearch && config.hasWebSearch) {
        geminiBody.tools = [
          {
            google_search: {}
          }
        ];
        // 设置响应模态为文本
        if (!geminiBody.generationConfig) {
          geminiBody.generationConfig = {};
        }
        (geminiBody.generationConfig as Record<string, unknown>).response_modalities = ["TEXT"];
      }

      return geminiBody;
    
    case 'anthropic-proxy':
      const claudeBody: Record<string, unknown> = {
        model: config.model,
        messages: finalMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      };

      // 为Bedrock代理使用OpenAI兼容的function calling格式
      // 因为Bedrock代理虽然托管Claude模型，但使用OpenAI兼容的API接口
      if (enableWebSearch && config.hasWebSearch) {
        claudeBody.tools = [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for real-time information and current data"
            }
          }
        ];
      }

      // 为Claude模型添加扩展思考支持
      // 根据官方文档: https://docs.anthropic.com/zh-CN/docs/build-with-claude/extended-thinking
      const isClaudeThinkingModel = config.model.includes('claude-3-7') || config.model.includes('claude-4') || config.model.includes('claude-opus-4') || config.model.includes('claude-sonnet-4');
      if (isClaudeThinkingModel) {
        claudeBody.thinking = {
          type: "enabled",
          budget_tokens: 8000 // 合理的思考预算
        };
      }

      return claudeBody;
    
    case 'openai-proxy':
      // 特殊处理：o3模型需要使用max_completion_tokens而不是max_tokens
      const isO3Model = config.model.includes('o3');
      const tokenParam = isO3Model ? 'max_completion_tokens' : 'max_tokens';
      
      const openaiBody: Record<string, unknown> = {
        messages: finalMessages,
        stream: true,
        temperature: 0.7,
        [tokenParam]: 2048,
        model: config.model, // 直接使用配置中的模型名
      };

      // 根据OpenAI官方文档配置web search
      // 参考: https://platform.openai.com/docs/guides/tools-web-search
      if (enableWebSearch && config.hasWebSearch) {
        // 重要：这里的逻辑是基于标准的OpenAI API。
        // 您的代理 `gpt.co.link` 可能不支持这些参数，特别是 `web_search_preview`。
        // 从日志看，它返回了400错误，因此我们暂时为代理禁用此功能，以避免请求失败。
        // 如果您的代理服务确认了开启网络搜索的方法，我们可以在此更新。
        const isStandardOpenAI = !config.baseUrl.includes('gpt.co.link');

        if (isStandardOpenAI) {
          if (config.model.includes('gpt-4.1') || config.model.includes('responses')) {
            // Responses API方式 - 使用tools参数
            openaiBody.tools = [
              {
                type: "web_search_preview",
                search_context_size: "medium",
                user_location: {
                  type: "approximate",
                  country: "US"
                }
              }
            ];
          } else if (config.model.includes('search-preview')) {
            // Chat Completions API方式 - 使用web_search_options参数
            openaiBody.web_search_options = {
              search_context_size: "medium",
              user_location: {
                type: "approximate",
                approximate: {
                  country: "US"
                }
              }
            };
          }
        } else {
          // 对于gpt.co.link代理，不添加搜索工具
          // 因为测试显示它不支持这些高级功能
          console.log(`[搜索API] 跳过代理服务的搜索工具配置: ${config.baseUrl}`);
        }
      }
      
      return openaiBody;
    
    case 'openrouter':
      const openrouterBody: Record<string, unknown> = {
        model: config.model,
        messages: finalMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      };

      // DeepSeek R1 通过OpenRouter可能支持推理格式
      // 但需要测试验证
      if (config.model.includes('deepseek-r1')) {
        console.log(`[搜索API] 检测到DeepSeek R1模型，保持标准参数`);
      }

      return openrouterBody;
    
    default:
      return {
        model: config.model,
        messages: finalMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      };
  }
}

function buildHeaders(config: ModelConfig) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (config.provider) {
    case 'openai-proxy':
      headers['x-auth-key'] = config.apiKey;
      break;
    case 'anthropic-proxy':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'openrouter':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      headers['HTTP-Referer'] = 'https://pm-assistant.vercel.app';
      headers['X-Title'] = 'PM Assistant';
      break;
    default:
      headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return headers;
}

function buildApiUrl(config: ModelConfig, useResponsesApi: boolean = false) {
  if (useResponsesApi) {
    return `${config.baseUrl}/responses`;
  }
  switch (config.provider) {
    case 'google':
      return `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
    default:
      return `${config.baseUrl}/chat/completions`;
  }
}

// 为 Responses API 定义简单的响应类型
interface ResponsesApiOutput {
  type: string;
  content?: {
    type: string;
    text: string;
  }[];
}

interface ResponsesApiResponse {
  output?: ResponsesApiOutput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatSearchRequest = await request.json();
    const { model, messages, context, enableWebSearch = false } = body;

    if (!model || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: { message: '缺少必要参数: model 和 messages' } },
        { status: 400 }
      );
    }

    const config = getModelConfig(model);
    if (!config) {
      return NextResponse.json(
        { error: { message: `不支持的模型: ${model}` } },
        { status: 400 }
      );
    }

    if (!config.apiKey) {
      return NextResponse.json(
        { error: { message: `模型 ${model} 未配置API密钥` } },
        { status: 400 }
      );
    }

    // 决定是否使用新的 /responses API
    const useResponsesApi = model === 'gpt-4.1' && config.provider === 'openai-proxy' && enableWebSearch;

    const searchStatus = enableWebSearch && config.hasWebSearch ? "✅ 网络搜索已启用" : "❌ 网络搜索未启用";
    console.log(`[搜索API] 调用 ${config.provider} API: ${config.name} - ${searchStatus}`);
    console.log(`[搜索API] 使用 /responses API: ${useResponsesApi}`);
    
    // 如果是 Responses API，则构建不同的请求体
    if (useResponsesApi) {
      const responsesApiBody = {
        model,
        input: messages.map(m => m.content).join('\n'), // 将消息合并为单个input
        tools: [{ "type": "web_search_preview" }]
      };
      
      const apiUrl = buildApiUrl(config, true);
      const headers = buildHeaders(config);

      console.log(`[搜索API] openai-proxy 请求URL: ${apiUrl}`);
      console.log(`[搜索API] openai-proxy 请求头:`, JSON.stringify(headers, null, 2));
      console.log(`[搜索API] openai-proxy 请求体:`, JSON.stringify(responsesApiBody, null, 2));
      
      const response = await undiciRequest(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(responsesApiBody),
        headersTimeout: 60000,
        bodyTimeout: 60000
      });

      console.log(`[搜索API] openai-proxy 响应状态: ${response.statusCode}`);
      console.log(`[搜索API] openai-proxy 响应头:`, JSON.stringify(response.headers, null, 2));

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        console.error('[搜索API] Responses API 错误:', response.statusCode, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json({ error: errorJson.error || { message: 'Responses API 返回错误' } }, { status: response.statusCode });
        } catch {
          return NextResponse.json({ error: { message: errorText } }, { status: response.statusCode });
        }
      }

      // 解析单次返回的JSON
      const result = await response.body.json() as ResponsesApiResponse;
      console.log('[搜索API] Responses API 完整响应:', JSON.stringify(result, null, 2));

      // 从复杂的JSON结构中提取文本内容
      const outputMessage = result.output?.find((o) => o.type === 'message');
      const textContent = outputMessage?.content?.find((c) => c.type === 'output_text')?.text;
      
      if (!textContent) {
        console.error('[搜索API] 未能从Responses API的响应中提取到文本内容', result);
        return NextResponse.json({ error: { message: '未能从API响应中提取有效内容' } }, { status: 500 });
      }
      
      // 模拟流式响应，将完整内容一次性发送
      const stream = new ReadableStream({
        start(controller) {
          const chunk = `data: ${JSON.stringify({ choices: [{ delta: { content: textContent } }] })}\n\n`;
          controller.enqueue(new TextEncoder().encode(chunk));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // --- 以下是原始的 /chat/completions 逻辑 ---

    if (config.provider === 'google') {
      try {
        const geminiUrl = `${config.baseUrl}/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`;
        const requestBody = buildSearchRequestBody(config, messages, context, enableWebSearch);

        console.log(`[搜索API] google 请求URL: ${geminiUrl}`);
        console.log(`[搜索API] google 请求体:`, JSON.stringify(requestBody, null, 2));

        const proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
        
        const response = await undiciRequest(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          dispatcher: proxyAgent,
          headersTimeout: 30000,
          bodyTimeout: 180000 // 延长到3分钟
        });

        if (response.statusCode !== 200) {
          const errorText = await response.body.text();
          console.error('[搜索API] Gemini API错误:', response.statusCode, errorText);
          return NextResponse.json(
            { error: { message: `Gemini API错误: ${response.statusCode}` } },
            { status: response.statusCode }
          );
        }

        // 直接转发 Gemini 的流式响应
        const stream = new ReadableStream({
          async start(controller) {
            console.log('[搜索API] Gemini 开始处理流响应');
            let buffer = '';
            const decoder = new TextDecoder();
            
            for await (const chunk of response.body) {
              buffer += decoder.decode(chunk, { stream: true });
              
              while (true) {
                const newlineIndex = buffer.indexOf('\n');
                if (newlineIndex === -1) break;
                
                const line = buffer.substring(0, newlineIndex + 1);
                buffer = buffer.substring(newlineIndex + 1);

                if (line.trim().startsWith('data:')) {
                  try {
                    const jsonStr = line.trim().substring(5).trim();
                    const parsed = JSON.parse(jsonStr);
                    const textContent = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textContent) {
                      const newChunk = {
                        choices: [{ delta: { content: textContent } }]
                      };
                      controller.enqueue(`data: ${JSON.stringify(newChunk)}\n\n`);
                    }
                  } catch (e) {
                     console.error('[搜索API] Gemini 流JSON解析失败:', e, '原始行:', line);
                  }
                }
              }
            }
             if (buffer.length > 0) {
                console.log('[搜索API] Gemini 流剩余buffer:', buffer);
            }
            console.log('[搜索API] Gemini 流处理结束');
            controller.enqueue('data: [DONE]\n\n');
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });

      } catch (error) {
        console.error('[搜索API] 调用Gemini API时发生异常:', error);
        return NextResponse.json(
          { error: { message: '调用Gemini API失败' } },
          { status: 500 }
        );
      }
    }

    const apiUrl = buildApiUrl(config);
    const headers = buildHeaders(config);
    const requestBody = buildSearchRequestBody(config, messages, context, enableWebSearch);

    console.log(`[搜索API] openai-proxy 请求URL: ${apiUrl}`);
    console.log(`[搜索API] openai-proxy 请求头:`, JSON.stringify(headers, null, 2));
    console.log(`[搜索API] openai-proxy 请求体:`, JSON.stringify(requestBody, null, 2));
    
    const response = await undiciRequest(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      headersTimeout: 60000,
      bodyTimeout: 180000
    });

    console.log(`[搜索API] openai-proxy 响应状态: ${response.statusCode}`);
    console.log(`[搜索API] openai-proxy 响应头:`, JSON.stringify(response.headers, null, 2));

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/event-stream')) {
       const errorText = await response.body.text();
       console.error(`[搜索API] API未返回流式响应，状态码: ${response.statusCode}, 响应: ${errorText}`);
       try {
         const errorJson = JSON.parse(errorText);
         return NextResponse.json({ error: errorJson.error || { message: 'API 返回非流式错误' } }, { status: response.statusCode });
       } catch {
         return NextResponse.json({ error: { message: errorText } }, { status: response.statusCode });
       }
    }

    // 直接将服务端的流转发给客户端
    const stream = new ReadableStream({
      async start(controller) {
        console.log('[搜索API] openai-proxy 开始处理流响应');
        let totalChunks = 0;
        for await (const chunk of response.body) {
          totalChunks++;
          controller.enqueue(chunk);
        }
        console.log(`[搜索API] openai-proxy 流读取完成，总块数: ${totalChunks}`);
        controller.close();
        console.log('[搜索API] openai-proxy 流处理结束');
      },
    });

    return new Response(stream, { headers: response.headers });

  } catch (error: unknown) {
    console.error('[搜索API] API路由发生未知错误:', error);
    const errorMessage = error instanceof Error ? error.message : '一个未知错误发生';
    return NextResponse.json(
      { error: { message: `API路由错误: ${errorMessage}` } },
      { status: 500 }
    );
  }
} 