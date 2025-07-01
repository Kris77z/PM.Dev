import { NextRequest, NextResponse } from 'next/server';
import { getModelConfig, ModelConfig } from '@/config/models';
import { ProxyAgent, request as undiciRequest } from 'undici';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface HTMLGenerationRequest {
  prompt: string;
  modelId?: string;
}





export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as HTMLGenerationRequest;
    const { prompt, modelId = 'gemini-2.0-flash' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt是必需的字符串参数' },
        { status: 400 }
      );
    }

    console.log('开始HTML生成请求，模型:', modelId);

    const result = await callAI(modelId, prompt);

    return NextResponse.json({
      success: true,
      content: result,
      model: modelId
    });

  } catch (error) {
    console.error('HTML生成失败:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '生成过程中发生未知错误' 
      },
      { status: 500 }
    );
  }
}

// AI调用核心函数 - 支持多种提供商
async function callAI(modelId: string, prompt: string): Promise<string> {
  // 获取模型配置
  const config = getModelConfig(modelId);
  if (!config) {
    throw new Error(`不支持的模型: ${modelId}`);
  }

  // 根据提供商调用不同的API
  switch (config.provider) {
    case 'google':
      return await callGeminiWithUndici(config, prompt);
    
    case 'openai-proxy':
    case 'anthropic-proxy':
    case 'openrouter':
      return await callOpenAICompatibleAPI(config, prompt);
    
    default:
      throw new Error(`暂不支持的提供商: ${config.provider}`);
  }
}

// 添加重试函数
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 1): Promise<Response> {
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
        const delay = attempt * 2000; // 递增延迟：2s, 4s
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// 使用undici直接调用Gemini API - 参考chat-multi的实现
async function callGeminiWithUndici(config: ModelConfig, prompt: string): Promise<string> {
  try {
    console.log('使用undici调用Gemini，模型:', config.model);
    console.log('API Key长度:', config.apiKey.length, '(前5位:', config.apiKey.substring(0, 5) + '...)');
    console.log('Base URL:', config.baseUrl);
    
    const geminiUrl = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
    console.log('完整URL:', geminiUrl.replace(config.apiKey, 'KEY_HIDDEN'));
    
    // 构建请求体 - 简化版，只处理单个prompt
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 32768, // 大幅提升到32K tokens，约12万字符
      }
    };

    // 代理配置：优先使用环境变量，然后根据环境判断
    let proxyAgent = undefined;
    
    if (process.env.USE_PROXY === 'true') {
      // 明确启用代理
      const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:7890';
      proxyAgent = new ProxyAgent(proxyUrl);
      console.log(`强制使用代理: ${proxyUrl}`);
    } else if (process.env.USE_PROXY === 'false') {
      // 明确禁用代理
      console.log('强制禁用代理，使用直连');
    } else if (process.env.NODE_ENV === 'development') {
      // 开发环境默认尝试使用代理，但允许失败
      try {
        proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
        console.log('开发环境默认使用代理: 127.0.0.1:7890');
      } catch (error) {
        console.log('代理初始化失败，将使用直连:', error);
        proxyAgent = undefined;
      }
    }

    if (proxyAgent) {
      console.log('正在为Gemini配置undici代理...');
    }
    
    const response = await undiciRequest(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      ...(proxyAgent && { dispatcher: proxyAgent }),
      headersTimeout: 120000,  // 增加到120秒，Gemini 2.5 Pro需要更长时间
      bodyTimeout: 180000     // 增加到180秒，给最慢的模型足够时间
    });

    if (response.statusCode !== 200) {
      const errorText = await response.body.text();
      console.error('Gemini API错误:', response.statusCode, errorText);
      throw new Error(`Gemini API错误: ${response.statusCode} - ${errorText}`);
    }

    const result = await response.body.json() as Record<string, unknown>;
    const content = (result.candidates as Array<{content: {parts: Array<{text: string}>}}>)?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Gemini返回空内容');
    }

    console.log('Gemini undici调用成功，响应长度:', content.length);
    return content;

  } catch (error) {
    console.error('Gemini undici调用失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
        throw new Error('Gemini API密钥无效，请检查GEMINI_API_KEY环境变量');
      } else if (error.message.includes('Connect Timeout') || error.message.includes('timeout')) {
        throw new Error(`连接Gemini API超时，请检查网络连接或代理设置。代理服务器(127.0.0.1:7890)是否正常工作？`);
      }
      throw new Error(`Gemini API调用失败: ${error.message}`);
    }
    
    throw new Error('Gemini API调用失败: 未知错误');
  }
}

// OpenAI兼容API调用函数（支持 GPT、Claude、DeepSeek等）
async function callOpenAICompatibleAPI(config: ModelConfig, prompt: string): Promise<string> {
  try {
    console.log('调用OpenAI兼容API，提供商:', config.provider, '模型:', config.model);
    
    // 构建API URL
    const apiUrl = `${config.baseUrl}/chat/completions`;
    
    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // 根据提供商设置认证头
    switch (config.provider) {
      case 'openai-proxy':
        headers['x-auth-key'] = config.apiKey;
        break;
      case 'anthropic-proxy':
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        break;
      case 'openrouter':
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        headers['HTTP-Referer'] = 'https://pm-assistant.vercel.app';
        headers['X-Title'] = 'PM Assistant';
        break;
      default:
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    // 构建请求体 - 针对不同提供商优化参数
    const requestBody: Record<string, unknown> = {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      stream: false
    };
    
    // 根据提供商和模型设置合适的token限制
    if (config.provider === 'openrouter') {
      // DeepSeek 等免费模型，提升到16K
      requestBody.max_tokens = 16384;
    } else if (config.provider === 'openai-proxy') {
      // OpenAI模型有16K的限制
      requestBody.max_tokens = 16384;
    } else if (config.provider === 'anthropic-proxy') {
      // Claude模型，设置到16K
      requestBody.max_tokens = 16384;
    } else {
      // 其他模型提升到32K
      requestBody.max_tokens = 32768;
    }
    
    // 配置代理（仅开发环境）
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(180000), // 增加到180秒，给最慢的模型足够时间
    };
    
    // 在开发环境下为需要代理的提供商配置代理
    if (process.env.NODE_ENV === 'development' && process.env.USE_PROXY === 'true') {
      const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:7890';
      (fetchOptions as RequestInit & { agent?: unknown }).agent = new HttpsProxyAgent(proxyUrl);
      console.log(`为${config.provider}配置代理: ${proxyUrl}`);
    }
    
    const response = await fetchWithRetry(apiUrl, fetchOptions, 1); // 允许1次重试
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误:', response.status, errorText);
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('API返回空内容');
    }
    
    console.log('OpenAI兼容API调用成功，响应长度:', content.length);
    return content;
    
  } catch (error) {
    console.error('OpenAI兼容API调用失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error(`${config.provider} API密钥无效，请检查配置`);
      } else if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('Timeout')) {
        throw new Error(`连接${config.provider} API超时，请检查网络连接或增加超时时间`);
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
        throw new Error(`无法连接到${config.provider} API，请检查网络和代理设置`);
      }
      throw new Error(`${config.provider} API调用失败: ${error.message}`);
    }
    
    throw new Error(`${config.provider} API调用失败: 未知错误`);
  }
}