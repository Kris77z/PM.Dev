import { NextResponse } from 'next/server';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST() {
  try {
    console.log('=== Google连接测试 ===');
    
    // 测试Google的简单API
    const testUrl = 'https://www.google.com/robots.txt'; // 简单的文本文件
    
    console.log('测试URL:', testUrl);
    
    // 不使用代理的请求
    console.log('--- 直连Google测试 ---');
    let directSuccess = false;
    try {
      const directResponse = await fetch(testUrl, {
        signal: AbortSignal.timeout(5000)
      });
      if (directResponse.ok) {
        const directResult = await directResponse.text();
        console.log('直连成功，内容长度:', directResult.length);
        directSuccess = true;
      }
    } catch (error) {
      console.log('直连Google失败:', error instanceof Error ? error.message : error);
    }
    
    // 使用代理的请求
    console.log('--- 代理Google测试 ---');
    let proxySuccess = false;
    try {
      const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
      const proxyResponse = await fetch(testUrl, {
        // @ts-expect-error - Node.js fetch支持agent属性但TypeScript类型定义中没有
        agent: proxyAgent,
        signal: AbortSignal.timeout(10000) // 给代理更多时间
      });
      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.text();
        console.log('代理成功，内容长度:', proxyResult.length);
        proxySuccess = true;
      }
    } catch (error) {
      console.log('代理Google失败:', error instanceof Error ? error.message : error);
    }
    
    // 现在测试Gemini API
    console.log('--- 代理Gemini测试 ---');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        directSuccess,
        proxySuccess,
        geminiError: 'API Key未配置'
      });
    }
    
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
      
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: '你好' }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      };
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // @ts-expect-error - Node.js fetch支持agent属性但TypeScript类型定义中没有
        agent: proxyAgent,
        signal: AbortSignal.timeout(15000)
      });
      
      if (geminiResponse.ok) {
        const geminiResult = await geminiResponse.json();
        const content = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '无内容';
        console.log('Gemini代理成功:', content);
        
        return NextResponse.json({
          success: true,
          directSuccess,
          proxySuccess,
          geminiSuccess: true,
          geminiContent: content
        });
      } else {
        const errorText = await geminiResponse.text();
        console.log('Gemini代理失败:', geminiResponse.status, errorText);
        
        return NextResponse.json({
          directSuccess,
          proxySuccess,
          geminiSuccess: false,
          geminiError: `HTTP ${geminiResponse.status}: ${errorText}`
        });
      }
      
    } catch (error) {
      console.log('Gemini代理异常:', error instanceof Error ? error.message : error);
      
      return NextResponse.json({
        directSuccess,
        proxySuccess,
        geminiSuccess: false,
        geminiError: error instanceof Error ? error.message : '未知错误'
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
    return NextResponse.json({ 
      error: '测试失败', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
} 