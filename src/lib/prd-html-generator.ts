import { PRDGenerationData } from './prd-generator';
import { buildPRDToHTMLPrompt } from '@/prompts/prd-to-html-prompt';
import { 
  transformPRDToBuildInstructions, 
  buildInstructionsToText,
  BuildInstructions 
} from './prd-to-build-instructions';

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
  buildInstructions?: BuildInstructions;
  instructionsSummary?: string;
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
  
  // 检查是否包含产品功能（而非文档展示）
  if (htmlContent.toLowerCase().includes('prd') || 
      htmlContent.toLowerCase().includes('产品需求文档') ||
      htmlContent.toLowerCase().includes('竞品分析') ||
      htmlContent.toLowerCase().includes('用户画像')) {
    issues.push('⚠️ 警告：生成的HTML可能是文档展示页面而非产品原型');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// 构建增强的提示词（包含构建指令）
function buildEnhancedPrompt(
  prdData: PRDGenerationData,
  buildInstructions: BuildInstructions,
  userQuery?: string
): string {
  // 生成构建指令摘要
  const instructionsSummary = buildInstructionsToText(buildInstructions);
  
  // 使用新的集成了Franken/UI的提示词系统
  const basePrompt = buildPRDToHTMLPrompt({ prdData, userQuery });
  
  // 增强提示词，添加构建指令
  const enhancedPrompt = `${basePrompt}

# 🎯 产品构建指令分析

**重要**：以下是基于PRD数据智能分析得出的产品构建指令，这些指令已经将文档化的需求转换为具体的产品功能描述。请严格按照这些指令构建产品原型，而不是展示PRD文档内容。

${instructionsSummary}

---

## 🚀 构建要求强化

### 产品类型适配
基于分析，这是一个 **${buildInstructions.productType}** 类型的产品，请采用相应的界面模式和交互设计。

### 核心构建指令
1. **构建目标**：${buildInstructions.productVision.coreValue}
2. **解决方案**：为 ${buildInstructions.productVision.problemSolved} 提供解决方案
3. **目标用户**：服务于 ${buildInstructions.productVision.targetMarket}
4. **差异化特色**：${buildInstructions.productVision.differentiation}

### 必须实现的功能模块
${buildInstructions.keyFeatures.map((feature, index) => `
${index + 1}. **${feature.featureName}** (优先级: ${feature.priority})
   - 用户操作流程：${feature.userFlow}
   - 需要的UI组件：${feature.uiComponents.join('、')}
   - 交互方式：${feature.interactions.join('、')}
`).join('')}

### 用户体验设计重点
${buildInstructions.targetUsers.map(user => `
- **${user.userType}场景**：${user.usageScenario}
  - 必须解决的痛点：${user.painPoints.join('、')}
  - 设计考虑：${user.designImplications}
`).join('')}

### 设计规范要求
${buildInstructions.designSpecs.map(spec => `
- **${spec.category}**：${spec.requirements.join('、')}
`).join('')}

## ⚠️ 最终提醒

**绝对禁止**：不要创建任何形式的PRD文档展示、用户画像卡片展示、竞品对比表格。

**必须做到**：构建一个真实的、可操作的${buildInstructions.productType}产品原型，用户可以实际体验核心功能。

现在请基于以上分析和指令，构建一个高质量的产品应用原型！
`;

  return enhancedPrompt;
}

// 主要的HTML生成函数（重构版）
export async function generateHTMLFromPRD(
  prdData: PRDGenerationData,
  aiService: AIService,
  userQuery?: string
): Promise<HTMLGenerationResult> {
  try {
    console.log('🔄 开始PRD到HTML的转换流程...');
    
    // 1. 数据转换：PRD → 构建指令
    console.log('📊 第1步：转换PRD数据为构建指令');
    const buildInstructions = transformPRDToBuildInstructions(prdData);
    const instructionsSummary = buildInstructionsToText(buildInstructions);
    
    console.log('✅ 构建指令生成成功，产品类型:', buildInstructions.productType);
    console.log('🎯 核心功能数量:', buildInstructions.keyFeatures.length);
    console.log('👥 目标用户数量:', buildInstructions.targetUsers.length);
    
    // 2. 构建增强提示词
    console.log('🎨 第2步：构建增强提示词');
    const enhancedPrompt = buildEnhancedPrompt(prdData, buildInstructions, userQuery);
    
    // 3. 调用AI服务
    console.log('🤖 第3步：调用AI服务生成HTML');
    const aiResponse = await aiService.generateResponse(enhancedPrompt);
    
    // 4. 提取HTML内容
    console.log('📋 第4步：提取HTML内容');
    const htmlContent = extractHTMLFromResponse(aiResponse);
    
    if (!htmlContent) {
      return {
        success: false,
        error: '无法从AI响应中提取有效的HTML内容',
        buildInstructions,
        instructionsSummary
      };
    }
    
    // 5. 验证HTML内容
    console.log('✅ 第5步：验证HTML内容');
    const validation = validateHTML(htmlContent);
    
    if (!validation.isValid) {
      console.warn('⚠️ HTML验证发现问题:', validation.issues);
      // 即使有问题，也返回内容，让用户自己判断
    }
    
    console.log('🎉 HTML生成完成！内容长度:', htmlContent.length);
    
    return {
      success: true,
      htmlContent,
      buildInstructions,
      instructionsSummary
    };
    
  } catch (error) {
    console.error('❌ HTML生成失败:', error);
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