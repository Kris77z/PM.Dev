/**
 * 增强版PRD到HTML生成器
 * 集成智能模板匹配系统和参考模板融合
 */

import { PRDGenerationData } from './prd-generator';
import { buildPRDToHTMLPrompt } from '@/prompts/prd-to-html-prompt';
import { 
  transformPRDToBuildInstructions, 
  buildInstructionsToText,
  BuildInstructions 
} from './prd-to-build-instructions';
import { 
  IntelligentTemplateMatcher, 
  TemplateMatchResult 
} from '@/prompts/intelligent-template-matcher';
import { SimpleTemplate } from '@/prompts/reference-templates/template-library-simplified';

// 扩展的HTML生成结果接口
export interface EnhancedHTMLGenerationResult {
  success: boolean;
  htmlContent?: string;
  buildInstructions?: BuildInstructions;
  instructionsSummary?: string;
  templateMatchResult?: TemplateMatchResult;
  error?: string;
}

// AI服务接口（复用原有的）
export interface AIService {
  generateResponse(prompt: string): Promise<string>;
}

// Gemini AI服务实现（复用并增强）
export class EnhancedGeminiAIService implements AIService {
  constructor(private modelId: string = 'gemini-2.0-flash') {}

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('🚀 调用增强版Gemini AI服务，模型:', this.modelId);
      
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

      console.log('✅ 增强版Gemini生成成功，响应长度:', data.content?.length || 0);
      return data.content;
    } catch (error) {
      console.error('❌ 增强版Gemini AI服务调用失败:', error);
      throw new Error(`AI服务调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 构建参考模板信息文本
function buildTemplateReferenceText(templates: SimpleTemplate[]): string {
  if (templates.length === 0) {
    return '';
  }

  let referenceText = `\n\n## 🎨 设计参考模板\n\n`;
  
  if (templates.length === 1) {
    const template = templates[0];
    referenceText += `**参考模板**: ${template.name}\n`;
    referenceText += `**说明**: ${template.description}\n`;
    referenceText += `**布局类型**: ${template.layoutType}\n`;
    referenceText += `**产品类型**: ${template.productType}\n`;
    referenceText += `**行业类型**: ${template.industryType}\n`;
    referenceText += `**信任评分**: ${template.trustScore}/10\n\n`;

    // 设计系统配置
    referenceText += `### 🎨 设计系统配置\n\n`;
    referenceText += `**配色方案**:\n`;
    referenceText += `- 主色调: ${template.designSystem.colorPalette.primary}\n`;
    referenceText += `- 副色调: ${template.designSystem.colorPalette.secondary}\n`;
    referenceText += `- 背景色: ${template.designSystem.colorPalette.background}\n`;
    referenceText += `- 主要文字色: ${template.designSystem.colorPalette.text.primary}\n`;
    referenceText += `- 次要文字色: ${template.designSystem.colorPalette.text.secondary}\n`;
    
    if (template.designSystem.colorPalette.accent) {
      referenceText += `- 强调色: ${template.designSystem.colorPalette.accent}\n`;
    }
    referenceText += `- 边框色: ${template.designSystem.colorPalette.border}\n\n`;

    referenceText += `**字体系统**:\n`;
    referenceText += `- 主字体: ${template.designSystem.typography.fontFamily.primary}\n`;
    referenceText += `- H1标题: ${template.designSystem.typography.scale.h1}\n`;
    referenceText += `- H2标题: ${template.designSystem.typography.scale.h2}\n`;
    referenceText += `- H3标题: ${template.designSystem.typography.scale.h3}\n`;
    referenceText += `- 正文: ${template.designSystem.typography.scale.body}\n`;
    referenceText += `- 小字: ${template.designSystem.typography.scale.small}\n\n`;

    referenceText += `**间距系统**:\n`;
    referenceText += `- 超小: ${template.designSystem.spacing.xs}\n`;
    referenceText += `- 小: ${template.designSystem.spacing.sm}\n`;
    referenceText += `- 中: ${template.designSystem.spacing.md}\n`;
    referenceText += `- 大: ${template.designSystem.spacing.lg}\n`;
    referenceText += `- 超大: ${template.designSystem.spacing.xl}\n`;
    referenceText += `- 特大: ${template.designSystem.spacing["2xl"]}\n\n`;

    // 布局结构
    referenceText += `### 📐 布局结构参考\n\n`;
    referenceText += `**布局类型**: ${template.layoutType}\n`;
    referenceText += `**结构配置**: ${JSON.stringify(template.layoutStructure, null, 2)}\n\n`;

    // 交互模式
    if (template.interactionPatterns) {
      referenceText += `### 🔄 交互模式\n\n`;
      for (const [key, value] of Object.entries(template.interactionPatterns)) {
        referenceText += `- **${key}**: ${value}\n`;
      }
      referenceText += `\n`;
    }

    referenceText += `### 🏷️ 设计标签\n`;
    referenceText += `${template.tags.join(', ')}\n\n`;

  } else {
    // 多模板融合
    referenceText += `**融合模板策略**: 结合${templates.length}个参考模板的优势\n\n`;
    
    templates.forEach((template, index) => {
      referenceText += `**模板${index + 1}**: ${template.name}\n`;
      referenceText += `- 布局类型: ${template.layoutType}\n`;
      referenceText += `- 评分: ${template.trustScore}/10\n`;
      referenceText += `- 特色: ${template.tags.slice(0, 3).join(', ')}\n\n`;
    });

    // 提供融合建议
    referenceText += `### 💡 融合建议\n\n`;
    referenceText += `1. 采用评分最高的模板作为主要布局框架\n`;
    referenceText += `2. 借鉴其他模板的色彩搭配和组件设计\n`;
    referenceText += `3. 结合各模板的交互模式创造最佳用户体验\n`;
    referenceText += `4. 保持设计一致性和品牌统一性\n\n`;
  }

  return referenceText;
}

// 构建超级增强的提示词（模板+构建指令+AI优化）
function buildSuperEnhancedPrompt(
  prdData: PRDGenerationData,
  buildInstructions: BuildInstructions,
  templateMatchResult: TemplateMatchResult,
  userQuery?: string
): string {
  // 1. 获取基础提示词
  const basePrompt = buildPRDToHTMLPrompt({ prdData, userQuery });
  
  // 2. 生成构建指令摘要
  const instructionsSummary = buildInstructionsToText(buildInstructions);
  
  // 3. 生成模板匹配建议
  const templateSuggestion = IntelligentTemplateMatcher.getMatchingSuggestionText(templateMatchResult);
  
  // 4. 生成参考模板详细信息
  const templateReferenceText = buildTemplateReferenceText(templateMatchResult.templates);
  
  // 5. 构建超级增强提示词
  const superEnhancedPrompt = `${basePrompt}

# 🎯 智能产品构建系统 v2.0

**重要说明**：本系统已升级为基于参考模板的智能生成模式，大幅提升生成质量和设计一致性。

## 📊 第一步：产品构建指令分析

以下是基于PRD数据智能分析得出的产品构建指令，已将文档化需求转换为具体的产品功能描述：

${instructionsSummary}

${templateSuggestion}

${templateReferenceText}

---

## 🚀 第二步：构建要求强化

### 产品类型适配
基于分析，这是一个 **${buildInstructions.productType}** 类型的产品，请采用相应的界面模式和交互设计。

### 🎨 设计执行策略

**模板匹配类型**: ${templateMatchResult.matchType}
**匹配置信度**: ${Math.round(templateMatchResult.confidence * 100)}%

${templateMatchResult.matchType === 'exact' ? `
🎯 **精确匹配策略**：参考模板与产品需求高度匹配，请严格按照模板的设计系统和布局结构实现。
` : templateMatchResult.matchType === 'functional' ? `
🔧 **功能相似性策略**：参考模板在功能特征上与需求相似，请采用模板的交互模式并适配具体功能。
` : templateMatchResult.matchType === 'layout' ? `
📐 **布局适配策略**：根据产品复杂度选择了合适的布局类型，请保持模板的整体结构并调整内容组织。
` : templateMatchResult.matchType === 'hybrid' ? `
🔀 **多模板融合策略**：结合多个模板的优势，取各模板的最佳实践进行融合设计。
` : `
🌟 **通用最佳实践策略**：使用高质量通用模板，确保产品的设计质量和可用性。
`}

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

## 🎨 第三步：设计实施指南

### 颜色与样式
${templateMatchResult.templates.length > 0 ? `
- 请严格按照参考模板的配色方案实施
- 主色调：${templateMatchResult.templates[0].designSystem.colorPalette.primary}
- 辅助色调：${templateMatchResult.templates[0].designSystem.colorPalette.secondary}
- 保持与参考模板一致的视觉风格
` : `
- 采用现代、专业的配色方案
- 确保良好的对比度和可读性
- 使用Tailwind CSS的配色系统
`}

### 布局与结构
${templateMatchResult.templates.length > 0 ? `
- 布局类型：${templateMatchResult.templates[0].layoutType}
- 严格遵循参考模板的布局结构
- 保持模板的组件层次和空间关系
` : `
- 采用响应式设计
- 确保清晰的信息层次
- 优化用户操作流程
`}

### 交互与动效
${templateMatchResult.templates.length > 0 && templateMatchResult.templates[0].interactionPatterns ? `
- 交互模式：${JSON.stringify(templateMatchResult.templates[0].interactionPatterns)}
- 保持与参考模板一致的交互体验
` : `
- 提供直观的交互反馈
- 使用适度的动效增强体验
- 确保操作的一致性
`}

## ⚠️ 最终提醒

**绝对禁止**：
- 不要创建任何形式的PRD文档展示页面
- 不要展示用户画像卡片或竞品对比表格
- 不要生成文档阅读界面

**必须做到**：
- 构建一个真实的、可操作的${buildInstructions.productType}产品原型
- 用户可以实际体验核心功能
- 严格按照参考模板的设计系统实施
- 保持高质量的设计标准

**参考模板质量保证**：
- 所选模板评分：${templateMatchResult.templates.map(t => t.trustScore).join('、')}/10
- 匹配置信度：${Math.round(templateMatchResult.confidence * 100)}%
- 推荐理由：${templateMatchResult.reason}

现在请基于以上完整的分析、指令和模板参考，构建一个高质量的产品应用原型！
`;

  return superEnhancedPrompt;
}

// 主要的增强版HTML生成函数
export async function generateEnhancedHTMLFromPRD(
  prdData: PRDGenerationData,
  aiService: AIService,
  userQuery?: string
): Promise<EnhancedHTMLGenerationResult> {
  try {
    console.log('🔄 开始增强版PRD到HTML的转换流程...');
    
    // 1. 数据转换：PRD → 构建指令
    console.log('📊 第1步：转换PRD数据为构建指令');
    const buildInstructions = transformPRDToBuildInstructions(prdData);
    const instructionsSummary = buildInstructionsToText(buildInstructions);
    
    console.log('✅ 构建指令生成成功，产品类型:', buildInstructions.productType);

    // 2. 智能模板匹配
    console.log('🎯 第2步：执行智能模板匹配');
    const templateMatchResult = IntelligentTemplateMatcher.findBestMatch(prdData);
    
    console.log('✅ 模板匹配完成');
    console.log('🔍 匹配类型:', templateMatchResult.matchType);
    console.log('📊 匹配置信度:', Math.round(templateMatchResult.confidence * 100) + '%');
    console.log('📝 匹配原因:', templateMatchResult.reason);
    console.log('🎨 选中模板数量:', templateMatchResult.templates.length);
    
    if (templateMatchResult.templates.length > 0) {
      console.log('🎨 模板详情:', templateMatchResult.templates.map(t => 
        `${t.name} (${t.layoutType}, 评分:${t.trustScore})`
      ).join(', '));
    }

    // 3. 构建超级增强提示词
    console.log('🚀 第3步：构建超级增强提示词');
    const enhancedPrompt = buildSuperEnhancedPrompt(
      prdData,
      buildInstructions,
      templateMatchResult,
      userQuery
    );

    console.log('📝 提示词长度:', enhancedPrompt.length);
    console.log('🎯 关键要素已包含: 构建指令 + 模板匹配 + 设计系统');

    // 4. 调用AI生成HTML
    console.log('🤖 第4步：调用AI生成HTML原型');
    const aiResponse = await aiService.generateResponse(enhancedPrompt);

    // 5. 提取和验证HTML
    console.log('🔍 第5步：提取和验证HTML内容');
    const extractedHTML = extractHTMLFromResponse(aiResponse);
    
    if (!extractedHTML) {
      throw new Error('无法从AI响应中提取有效的HTML代码');
    }

    const validation = validateHTML(extractedHTML);
    if (!validation.isValid) {
      console.warn('⚠️ HTML验证发现问题:', validation.issues);
    }

    console.log('✅ 增强版HTML生成流程完成');
    console.log('📊 最终统计:');
    console.log('  - HTML长度:', extractedHTML.length);
    console.log('  - 模板匹配:', templateMatchResult.matchType);
    console.log('  - 置信度:', Math.round(templateMatchResult.confidence * 100) + '%');
    console.log('  - 验证状态:', validation.isValid ? '通过' : '有警告');

    return {
      success: true,
      htmlContent: extractedHTML,
      buildInstructions,
      instructionsSummary,
      templateMatchResult,
      error: undefined
    };

  } catch (error) {
    console.error('❌ 增强版HTML生成失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 从AI响应中提取HTML代码（复用原有函数）
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

// 验证生成的HTML内容（复用并增强）
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
  
  // 增强验证：检查是否应用了参考模板的设计特征
  const hasModernDesign = htmlContent.includes('flex') || 
                         htmlContent.includes('grid') || 
                         htmlContent.includes('bg-gradient');
  
  if (!hasModernDesign) {
    issues.push('⚠️ 建议：添加更多现代化的设计元素（flex、grid、渐变等）');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// 创建下载文件（复用原有函数）
export function createDownloadableHTML(htmlContent: string, filename: string = 'enhanced-prototype.html'): void {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// 创建预览URL（复用原有函数）
export function createPreviewURL(htmlContent: string): string {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
} 