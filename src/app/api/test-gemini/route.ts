import { NextRequest, NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(request: NextRequest) {
  try {
    const { useProxy = true } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    
    console.log('=== Gemini连接测试 ===');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未配置');
    console.log('Base URL:', baseUrl);
    console.log('使用代理:', useProxy);
    console.log('环境:', process.env.NODE_ENV);
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY未配置' }, { status: 400 });
    }
    
    const url = `${baseUrl}/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    console.log('请求URL:', url);
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: '你好，请简短回复' }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    };
    
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000), // 15秒超时
    };
    
    // 如果使用代理
    if (useProxy && process.env.NODE_ENV === 'development') {
      try {
        console.log('配置代理: 127.0.0.1:7890');
        (fetchOptions as RequestInit & { agent?: unknown }).agent = new HttpsProxyAgent('http://127.0.0.1:7890');
        console.log('代理配置完成');
      } catch (error) {
        console.error('代理配置失败:', error);
        return NextResponse.json({ error: '代理配置失败', details: error }, { status: 500 });
      }
    }
    
    console.log('开始发送请求...');
    const startTime = Date.now();
    
    const response = await fetch(url, fetchOptions);
    const responseTime = Date.now() - startTime;
    
    console.log('响应状态:', response.status);
    console.log('响应时间:', responseTime + 'ms');
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
      return NextResponse.json({ 
        error: `HTTP ${response.status}`, 
        details: errorText,
        responseTime 
      }, { status: response.status });
    }
    
    const responseData = await response.json();
    console.log('响应数据:', JSON.stringify(responseData, null, 2));
    
    const content = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '无响应内容';
    
    return NextResponse.json({
      success: true,
      responseTime,
      content,
      fullResponse: responseData
    });
    
  } catch (error) {
    console.error('测试失败:', error);
    
    let errorMessage = '未知错误';
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = '请求超时';
      } else if (error.message.includes('fetch failed')) {
        errorMessage = '网络连接失败';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '连接被拒绝，可能是代理问题';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage, 
      details: error instanceof Error ? error.stack : error 
    }, { status: 500 });
  }
} 