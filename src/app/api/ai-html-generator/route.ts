import { NextRequest, NextResponse } from 'next/server';
import { ProxyAgent } from 'undici';
import { request as undiciRequest } from 'undici';

interface HTMLGenerationRequest {
  prompt: string;
  modelId?: string;
}

interface ModelConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  hasWebSearch?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

// AI调用核心函数
async function callAI(modelId: string, prompt: string): Promise<string> {
  // 构建消息
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: prompt
    }
  ];

  // 获取模型配置
  const config = getModelConfig(modelId);
  if (!config) {
    throw new Error(`不支持的模型: ${modelId}`);
  }

  // 根据提供商调用不同的API
  if (config.provider === 'google') {
    return await callGeminiAPI(config, messages);
  }

  // 其他提供商暂时未实现，可以在这里扩展
  throw new Error(`暂不支持的提供商: ${config.provider}`);
}

// 获取模型配置
function getModelConfig(modelId: string): ModelConfig | null {
  const configs: Record<string, ModelConfig> = {
    'gemini-2.0-flash': {
      provider: 'google',
      model: 'gemini-2.0-flash-experimental',
      apiKey: process.env.GOOGLE_API_KEY || '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      hasWebSearch: false
    },
    'gemini-1.5-pro': {
      provider: 'google', 
      model: 'gemini-1.5-pro',
      apiKey: process.env.GOOGLE_API_KEY || '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      hasWebSearch: false
    }
  };

  const config = configs[modelId];
  if (!config || !config.apiKey) {
    console.error('模型配置无效或API Key缺失:', modelId);
    return null;
  }

  return config;
}

// Gemini API调用（带重试机制）
async function callGeminiAPI(config: ModelConfig, messages: ChatMessage[]): Promise<string> {
  const contents = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.3, // 降低温度以获得更一致的代码输出
      maxOutputTokens: 8192, // 增加输出限制以支持完整的HTML文件
    }
  };

  const geminiUrl = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;

  // 重试逻辑
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini请求尝试 ${attempt}/${maxRetries}`);
      
      // 只在开发环境使用代理
      const proxyAgent = process.env.NODE_ENV === 'development' 
        ? new ProxyAgent('http://127.0.0.1:7890')
        : undefined;
      
      const response = await undiciRequest(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        ...(proxyAgent && { dispatcher: proxyAgent }),
        headersTimeout: 90000,  // 增加到90秒，HTML生成可能需要更长时间
        bodyTimeout: 90000      // 增加到90秒
      });

      if (response.statusCode !== 200) {
        const errorText = await response.body.text();
        console.error('Gemini API错误:', response.statusCode, errorText);
        throw new Error(`Gemini API错误: ${response.statusCode} ${errorText}`);
      }

      const result = await response.body.json() as Record<string, unknown>;
      const content = (result.candidates as Array<{content: {parts: Array<{text: string}>}}>)?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('Gemini返回空内容');
      }

      console.log('Gemini HTML生成请求成功，响应长度:', content.length);
      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Gemini请求尝试 ${attempt} 失败:`, lastError.message);
      
      // 如果是网络连接错误且还有重试机会，等待后重试
      if (attempt < maxRetries && (
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ENOTFOUND') ||
        lastError.message.includes('socket')
      )) {
        const waitTime = attempt * 2000; // 2秒、4秒的递增等待
        console.log(`等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // 非网络错误或最后一次尝试失败，直接抛出
      break;
    }
  }

  throw new Error(`Gemini请求失败: ${lastError?.message || '未知错误'}`);
} 