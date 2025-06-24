import { PRDGenerationData } from './prd-generator';
import { buildPRDToHTMLPrompt } from '@/prompts/prd-to-html-prompt';

// AI服务接口
export interface AIService {
  generateResponse(prompt: string): Promise<string>;
}

// Gemini AI服务实现
export class GeminiAIService implements AIService {
  constructor(private modelId: string = 'gemini-2.0-flash') {}

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('Calling Gemini AI for HTML generation with model:', this.modelId);
      
      const response = await fetch('/api/ai-html-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          modelId: this.modelId 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API调用失败');
      }

      console.log('Gemini HTML生成成功，响应长度:', data.content?.length || 0);
      return data.content;
    } catch (error) {
      console.error('Gemini AI服务调用失败:', error);
      throw new Error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// HTML生成结果接口
export interface HTMLGenerationResult {
  success: boolean;
  htmlContent?: string;
  error?: string;
}

// 从AI响应中提取HTML代码
export function extractHTMLFromResponse(aiResponse: string): string | null {
  // 尝试提取 ```html 代码块
  const htmlMatch = aiResponse.match(/```html\s*([\s\S]*?)\s*```/);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1].trim();
  }
  
  // 如果没有代码块标记，尝试提取DOCTYPE开始的内容
  const doctypeMatch = aiResponse.match(/(<!DOCTYPE[\s\S]*)/);
  if (doctypeMatch && doctypeMatch[1]) {
    return doctypeMatch[1].trim();
  }
  
  // 如果都没有，返回null
  return null;
}

// 验证生成的HTML内容
export function validateHTML(htmlContent: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // 检查基本的HTML结构
  if (!htmlContent.includes('<!DOCTYPE')) {
    issues.push('缺少DOCTYPE声明');
  }
  
  if (!htmlContent.includes('<html')) {
    issues.push('缺少html标签');
  }
  
  if (!htmlContent.includes('<head>') || !htmlContent.includes('</head>')) {
    issues.push('缺少head标签');
  }
  
  if (!htmlContent.includes('<body>') || !htmlContent.includes('</body>')) {
    issues.push('缺少body标签');
  }
  
  // 检查Tailwind CSS CDN
  if (!htmlContent.includes('tailwindcss.com')) {
    issues.push('缺少Tailwind CSS CDN链接');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// 主要的HTML生成函数
export async function generateHTMLFromPRD(
  prdData: PRDGenerationData,
  aiService: AIService,
  userQuery?: string
): Promise<HTMLGenerationResult> {
  try {
    // 1. 构建AI提示
    const prompt = buildPRDToHTMLPrompt({ prdData, userQuery });
    
    // 2. 调用AI服务
    const aiResponse = await aiService.generateResponse(prompt);
    
    // 3. 提取HTML内容
    const htmlContent = extractHTMLFromResponse(aiResponse);
    
    if (!htmlContent) {
      return {
        success: false,
        error: '无法从AI响应中提取有效的HTML内容'
      };
    }
    
    // 4. 验证HTML内容
    const validation = validateHTML(htmlContent);
    
    if (!validation.isValid) {
      console.warn('HTML验证发现问题:', validation.issues);
      // 即使有问题，也返回内容，让用户自己判断
    }
    
    return {
      success: true,
      htmlContent
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 创建可下载的HTML文件
export function createDownloadableHTML(htmlContent: string, filename: string = 'prd-prototype.html'): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理URL对象
  URL.revokeObjectURL(url);
}

// 为iframe创建可预览的URL
export function createPreviewURL(htmlContent: string): string {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
} 