import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig, ModelConfig } from '@/config/models';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ProxyAgent, request as undiciRequest } from 'undici';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  context?: string;
  stream?: boolean;
  enableWebSearch?: boolean;
}

// 为不同提供商构建请求体
function buildRequestBody(config: ModelConfig, messages: ChatMessage[], context?: string, enableWebSearch = false): Record<string, unknown> {
  // 如果有context，将其作为系统消息添加到开头
  const finalMessages = context 
    ? [{ role: 'system' as const, content: context }, ...messages]
    : messages;

  switch (config.provider) {
    case 'google':
      // Gemini API 格式 - 简化为最后一条用户消息
      const systemMessage = finalMessages.find(msg => msg.role === 'system');
      const lastUserMessage = finalMessages.filter(msg => msg.role === 'user').pop();
      
      if (!lastUserMessage) {
        throw new Error('Gemini API需要至少一条用户消息');
      }
      
      // 只发送最后一条用户消息，合并system消息
      let text = lastUserMessage.content;
      if (systemMessage) {
        text = `${systemMessage.content}\n\n${text}`;
      }
      
      const contents = [
        {
          parts: [{ text: text }]
        }
      ];

      const geminiBody: Record<string, unknown> = {
        contents
      };

      // 为Gemini配置web search工具
      if (enableWebSearch && config.hasWebSearch) {
        geminiBody.tools = [{
          google_search: {}
        }];
        geminiBody.tool_config = {
          function_calling_config: {
            mode: "ANY"
          }
        };
      }

      return geminiBody;
    
    case 'openai-proxy':
    case 'anthropic-proxy':
    case 'openrouter':
    default:
      // OpenAI 兼容格式
      return {
        model: config.model,
        messages: finalMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      };
  }
}

// 为不同提供商构建请求头
function buildHeaders(config: ModelConfig) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (config.provider) {
    case 'openai-proxy':
      // GPT-4o 使用 x-auth-key
      headers['x-auth-key'] = config.apiKey;
      break;
    
    case 'anthropic-proxy':
      // Claude 使用 Bearer token
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    
    case 'google':
      // Gemini API key 已经在URL中，不需要额外的header
      break;
    
    case 'openrouter':
      // OpenRouter 使用标准 Authorization
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      headers['HTTP-Referer'] = 'https://pm-assistant.vercel.app';
      headers['X-Title'] = 'PM Assistant';
      break;
    
    default:
      headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return headers;
}

// 构建API URL
function buildApiUrl(config: ModelConfig) {
  switch (config.provider) {
    case 'google':
      // 使用正确的Gemini API端点格式
      return `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
    
    case 'openai-proxy':
    case 'anthropic-proxy':
    case 'openrouter':
    default:
      return `${config.baseUrl}/chat/completions`;
  }
}

// 为其他提供商创建fetch选项
function createFetchOptions(config: ModelConfig, requestBody: Record<string, unknown>, headers: Record<string, string>): RequestInit {
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(45000), // 增加到45秒超时，给Claude代理更多时间
  };

  // 如果是Google API且在开发环境，使用代理（但这里不会用到，因为Google用undici）
  if (config.provider === 'google' && process.env.NODE_ENV === 'development') {
    try {
      console.log('正在为Gemini配置代理: 127.0.0.1:7890');
      // 类型断言：Node.js环境下的fetch选项包含agent属性
      (fetchOptions as RequestInit & { agent?: unknown }).agent = new HttpsProxyAgent('http://127.0.0.1:7890');
      console.log('代理配置成功');
    } catch (error) {
      console.error('代理配置失败:', error);
    }
  }

  return fetchOptions;
}

// 添加重试函数
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`尝试请求 ${url} (第${attempt}次)`);
      const response = await fetch(url, options);
      console.log(`请求成功: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`请求失败 (第${attempt}次):`, error);
      
      if (attempt <= maxRetries) {
        const delay = attempt * 1000; // 递增延迟：1s, 2s
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { model, messages, context, enableWebSearch } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: { message: '缺少必要参数: model 和 messages' } },
        { status: 400 }
      );
    }

    // 获取模型配置
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

    console.log(`调用 ${config.provider} API: ${config.name}`);
    
    // Gemini处理 - 使用undici代理
    if (config.provider === 'google') {
      try {
        const geminiUrl = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
        
        const requestBody = buildRequestBody(config, messages, context, enableWebSearch);

        // 使用undici代理进行请求
        const proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
        
        const response = await undiciRequest(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          dispatcher: proxyAgent,
          headersTimeout: 30000,
          bodyTimeout: 30000
        });

        if (response.statusCode !== 200) {
          const errorText = await response.body.text();
          console.error('Gemini API错误:', response.statusCode, errorText);
          return NextResponse.json(
            { error: { message: `Gemini API错误: ${response.statusCode}` } },
            { status: response.statusCode }
          );
        }

        const result = await response.body.json() as Record<string, unknown>;
        const content = (result.candidates as Array<{content: {parts: Array<{text: string}>}}>)?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
          return NextResponse.json(
            { error: { message: 'Gemini返回空内容' } },
            { status: 500 }
          );
        }

        // 转换为OpenAI格式的流式响应 - 直接发送完整内容
        const stream = new ReadableStream({
          start(controller) {
            // 发送完整内容
            const chunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: config.model,
              choices: [{
                index: 0,
                delta: { content: content },
                finish_reason: null
              }]
            };
            
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            
            // 发送结束标记
            const finalChunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: config.model,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: 'stop'
              }]
            };
            
            controller.enqueue(`data: ${JSON.stringify(finalChunk)}\n\n`);
            controller.enqueue('data: [DONE]\n\n');
            controller.close();
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (error) {
        console.error('Gemini请求失败:', error);
        return NextResponse.json(
          { error: { message: `Gemini请求失败: ${error instanceof Error ? error.message : '未知错误'}` } },
          { status: 500 }
        );
      }
    }

    // 其他提供商处理 - 使用标准fetch
    const requestBody = buildRequestBody(config, messages, context, enableWebSearch);
    const headers = buildHeaders(config);
    const apiUrl = buildApiUrl(config);
    const fetchOptions = createFetchOptions(config, requestBody, headers);

    const response = await fetchWithRetry(apiUrl, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${config.provider} API 错误:`, response.status, errorText);
      
      // 提供更友好的错误信息
      let friendlyError = `${config.provider} API 错误: ${response.status}`;
      if (response.status === 401) {
        friendlyError = `${config.name} API密钥无效，请检查环境变量配置`;
      } else if (response.status === 429) {
        friendlyError = `${config.name} API请求频率过高，请稍后重试`;
      } else if (response.status >= 500) {
        friendlyError = `${config.name} 服务器错误，请稍后重试`;
      }
      
      return NextResponse.json(
        { error: { message: friendlyError } },
        { status: response.status }
      );
    }

    // 处理流式响应
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '') continue;

              // 对于 OpenAI 兼容的 API，直接转发
              if (line.startsWith('data: ')) {
                controller.enqueue(encoder.encode(`${line}\n\n`));
              }
            }
          }
        } catch (error) {
          console.error('流处理错误:', error);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('多模型API错误:', error);
    
    // 提供更友好的错误信息
    let errorMessage = '服务器内部错误';
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = `请求超时，请检查网络连接或稍后重试`;
      } else if (error.message.includes('fetch failed')) {
        errorMessage = `无法连接到服务，请检查网络连接`;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: { message: errorMessage } },
      { status: 500 }
    );
  }
}