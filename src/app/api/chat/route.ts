import { NextRequest } from 'next/server';

// 这是Next.js Edge Runtime的推荐方式来处理流式响应
export const config = {
  runtime: 'edge',
};

// 读取和转换上游API响应流的辅助函数
async function* transformChunks(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const content = line.substring(6).trim();
            
            // 如果内容是[DONE]，直接传递
            if (content === '[DONE]') {
              yield encoder.encode(`data: [DONE]\n\n`);
              continue;
            }
            
            // 尝试解析JSON
            JSON.parse(content); // 只是验证，不使用结果
            
            // 如果解析成功，则传递原始行
            yield encoder.encode(`${line}\n\n`);
          } catch (e) {
            // 如果解析失败，发送一个安全的消息
            console.error('Error parsing JSON from upstream:', e, 'Content:', line);
            // 不传递错误的JSON数据
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

// 在 App Router (app目录) 中，我们导出特定HTTP方法的处理函数
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.O3_MODEL_API_KEY;
    const completionsUrl = process.env.O3_MODEL_URL;

    if (!apiKey || !completionsUrl) {
      console.error("O3 Model API key or URL is not configured in environment variables. Check O3_MODEL_API_KEY and O3_MODEL_URL.");
      return new Response(JSON.stringify({ error: 'Server configuration error. Check O3_MODEL_API_KEY and O3_MODEL_URL.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { model, messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const proxyResponse = await fetch(completionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-key': apiKey, // 使用从环境变量中获取的 key
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: messages,
        stream: true,
      }),
    });

    if (!proxyResponse.ok) {
      const errorBody = await proxyResponse.text();
      console.error(`Error from OpenAI proxy: ${proxyResponse.status}`, errorBody);
      return new Response(JSON.stringify({ error: `Upstream API error: ${proxyResponse.status}`, details: errorBody }), {
        status: proxyResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!proxyResponse.body) {
        return new Response(JSON.stringify({ error: 'No response body from upstream API' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    // 创建一个新的转换后的流
    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          // 使用类型断言，我们已经确保proxyResponse.body不为null
          const responseBody = proxyResponse.body as ReadableStream<Uint8Array>;
          const generator = transformChunks(responseBody);
          for await (const chunk of generator) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          console.error('Error in stream transformation:', error);
          controller.error(error);
        }
      }
    });
    
    // 返回经过验证和转换的流
    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      status: proxyResponse.status
    });

  } catch (error) {
    console.error('Error in API route (pm-assistant/src/app/api/chat/route.ts):', error);
    let errorMessage = 'Internal server error in proxy';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 