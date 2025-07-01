/**
 * 增强版PRD提示词生成器 - Enhanced PRD Prompt Generator
 * 
 * 集成参考模板系统，生成基于优秀产品参考的高质量提示词，
 * 实现从零生成到参考生成的革命性升级。
 */

import type { PRDGenerationData } from '../types/prd-types';
import { templateMatcher } from './reference-templates/template-matcher';
import { referenceFusionEngine } from './reference-fusion/fusion-engine';

// ================== 增强生成接口 ==================

export interface EnhancedPromptOptions {
  customRequirements?: string;
  preferredTemplates?: string[];
  fusionMode?: 'conservative' | 'balanced' | 'innovative';
  qualityLevel?: 'standard' | 'high' | 'production';
}

export interface EnhancedPromptResult {
  finalPrompt: string;
  usedReferences: string[];
  fusionStrategy: string;
  qualityLevel: string;
  estimatedScore: number;
  generationMetadata: {
    analysisConfidence: number;
    templateMatchScore: number;
    fusionComplexity: string;
    expectedStrengths: string[];
  };
}

// ================== 主生成器类 ==================

export class EnhancedPRDPromptGenerator {
  /**
   * 主生成入口：生成基于参考模板的增强提示词
   */
  async generateEnhancedPrompt(
    prdData: PRDGenerationData,
    options: EnhancedPromptOptions = {}
  ): Promise<EnhancedPromptResult> {
    // Step 1: 智能分析PRD并匹配参考模板
    const matchingResult = templateMatcher.findBestMatches(prdData);
    
    // Step 2: 检查是否有可用的参考模板
    if (!matchingResult.primaryRecommendation) {
      return this.generateFallbackPrompt(prdData, options);
    }

    // Step 3: 生成融合提示词
    const fusedPrompt = referenceFusionEngine.generateFusedPrompt(
      prdData,
      matchingResult,
      options.customRequirements
    );

    // Step 4: 组装最终提示词
    const finalPrompt = this.assembleFinalPrompt(fusedPrompt, options);

    // Step 5: 生成元数据
    const metadata = this.generateMetadata(matchingResult, fusedPrompt);

    return {
      finalPrompt,
      usedReferences: this.extractUsedReferences(matchingResult),
      fusionStrategy: this.describeFusionStrategy(matchingResult),
      qualityLevel: options.qualityLevel || 'high',
      estimatedScore: this.estimateGenerationScore(matchingResult, options),
      generationMetadata: metadata
    };
  }

  /**
   * 组装最终的完整提示词
   */
  private assembleFinalPrompt(
    fusedPrompt: any,
    options: EnhancedPromptOptions
  ): string {
    const qualityEnhancement = this.getQualityEnhancement(options.qualityLevel);
    const fusionModeInstructions = this.getFusionModeInstructions(options.fusionMode);

    return `${fusedPrompt.systemRole}

${fusedPrompt.referenceAnalysis}

${fusedPrompt.adaptationStrategy}

${fusedPrompt.technicalRequirements}

${qualityEnhancement}

${fusionModeInstructions}

${fusedPrompt.qualityStandards}

${fusedPrompt.prdIntegration}

${fusedPrompt.outputInstructions}`;
  }

  /**
   * 备用方案：当没有匹配的参考模板时
   */
  private generateFallbackPrompt(
    prdData: PRDGenerationData,
    options: EnhancedPromptOptions
  ): EnhancedPromptResult {
    const fallbackPrompt = this.generateBasicPrompt(prdData, options);
    
    return {
      finalPrompt: fallbackPrompt,
      usedReferences: [],
      fusionStrategy: 'fallback-mode',
      qualityLevel: 'standard',
      estimatedScore: 65,
      generationMetadata: {
        analysisConfidence: 0.3,
        templateMatchScore: 0,
        fusionComplexity: 'none',
        expectedStrengths: ['基础功能实现', 'PRD需求覆盖']
      }
    };
  }

  /**
   * 生成基础提示词（备用方案）
   */
  private generateBasicPrompt(
    prdData: PRDGenerationData,
    options: EnhancedPromptOptions
  ): string {
    return `你是AI产品原型专家，专门将PRD转化为高质量的HTML原型。

## 产品需求理解

### 产品基本信息
**产品名称**：${prdData.requirementSolution?.name || ''}
**核心需求**：${prdData.requirementSolution?.requirements || ''}
**关键收益**：${prdData.requirementSolution?.keyBenefits || ''}

### 用户场景分析
${prdData.userScenarios?.map((scenario, index) => `
**场景${index + 1}**：${scenario.userType}
- 使用场景：${scenario.scenario}
- 核心痛点：${scenario.painPoint}
`).join('') || ''}

### 竞争分析
${prdData.competitors?.map(competitor => `
**${competitor.name}**：${competitor.analysis}
`).join('') || ''}

## 生成要求

### 技术标准
- 生成完整的HTML+CSS+JavaScript单文件
- 使用Tailwind CSS CDN进行样式设计
- 确保响应式设计和现代化界面
- 所有交互功能必须可用

### 质量要求
- 禁止任何占位符或TODO注释
- 使用真实的模拟数据
- 实现完整的CRUD操作
- 提供良好的用户体验

${options.customRequirements ? `
### 特殊要求
${options.customRequirements}
` : ''}

请生成完整的HTML代码：`;
  }

  /**
   * 获取质量增强指令
   */
  private getQualityEnhancement(qualityLevel?: string): string {
    const enhancements = {
      'standard': `
## 标准质量要求
- 基础功能完整实现
- 界面美观整洁
- 基本交互体验`,
      
      'high': `
## 高质量标准
- 所有功能深度实现，考虑边界情况
- 界面设计专业美观，细节完善
- 交互体验流畅自然，符合用户习惯
- 代码结构清晰，性能优化良好`,
      
      'production': `
## 生产级质量标准
- 功能实现接近真实产品水准
- 界面设计达到商业产品级别
- 交互体验无缝流畅，错误处理完善
- 代码质量符合生产环境要求
- 性能优化、安全考虑、无障碍支持全面`
    };

    return enhancements[qualityLevel || 'high'];
  }

  /**
   * 获取融合模式指令
   */
  private getFusionModeInstructions(fusionMode?: string): string {
    const instructions = {
      'conservative': `
## 保守融合模式
- 严格遵循参考模板的设计模式
- 最小化创新改动，确保稳定性
- 重点保持参考模板的成熟特性`,
      
      'balanced': `
## 平衡融合模式
- 保持参考模板的核心优势
- 适度融入PRD的独特需求
- 在稳定性和创新性间找到平衡`,
      
      'innovative': `
## 创新融合模式
- 基于参考模板进行大胆创新
- 深度融合PRD的独特价值
- 追求差异化的用户体验`
    };

    return instructions[fusionMode || 'balanced'];
  }

  /**
   * 提取使用的参考模板
   */
  private extractUsedReferences(matchingResult: any): string[] {
    const references = [matchingResult.primaryRecommendation.template.name];
    
    if (matchingResult.alternativeRecommendations?.length > 0) {
      references.push(
        ...matchingResult.alternativeRecommendations
          .slice(0, 2)
          .map((alt: any) => alt.template.name)
      );
    }

    return references;
  }

  /**
   * 描述融合策略
   */
  private describeFusionStrategy(matchingResult: any): string {
    const primary = matchingResult.primaryRecommendation.template;
    const score = matchingResult.primaryRecommendation.score;

    if (score.score > 0.8) {
      return `高度匹配：以${primary.name}为主要参考，直接应用其成熟设计模式`;
    } else if (score.score > 0.6) {
      return `适度融合：基于${primary.name}的核心架构，融合其他参考的优势特性`;
    } else {
      return `创新融合：参考${primary.name}的设计理念，大幅定制以适应PRD需求`;
    }
  }

  /**
   * 估算生成质量分数
   */
  private estimateGenerationScore(
    matchingResult: any,
    options: EnhancedPromptOptions
  ): number {
    let baseScore = matchingResult.primaryRecommendation.score.score * 100;
    
    // 质量等级加成
    const qualityBonus = {
      'standard': 0,
      'high': 10,
      'production': 20
    };
    baseScore += qualityBonus[options.qualityLevel || 'high'];

    // 融合模式影响
    const fusionBonus = {
      'conservative': 5,
      'balanced': 10,
      'innovative': 15
    };
    baseScore += fusionBonus[options.fusionMode || 'balanced'];

    return Math.min(Math.round(baseScore), 100);
  }

  /**
   * 生成详细元数据
   */
  private generateMetadata(matchingResult: any, fusedPrompt: any): any {
    const primaryScore = matchingResult.primaryRecommendation.score;
    
    return {
      analysisConfidence: matchingResult.prdAnalysis.confidence,
      templateMatchScore: primaryScore.score,
      fusionComplexity: this.assessFusionComplexity(primaryScore),
      expectedStrengths: this.predictStrengths(primaryScore, fusedPrompt)
    };
  }

  /**
   * 评估融合复杂度
   */
  private assessFusionComplexity(score: any): string {
    if (score.score > 0.8) return 'low';
    if (score.score > 0.6) return 'medium';
    return 'high';
  }

  /**
   * 预测生成结果的优势
   */
  private predictStrengths(score: any, fusedPrompt: any): string[] {
    const strengths: string[] = [];

    if (score.categoryMatch > 0.8) {
      strengths.push('产品类型高度匹配，设计模式成熟');
    }

    if (score.functionalMatch > 0.7) {
      strengths.push('功能覆盖度高，交互体验优秀');
    }

    if (score.industryMatch > 0.7) {
      strengths.push('行业特性突出，专业度高');
    }

    if (score.contextMatch > 0.6) {
      strengths.push('用户场景匹配，体验针对性强');
    }

    return strengths.length > 0 ? strengths : ['基础功能完整', '界面设计合理'];
  }
}

// ================== 导出实例和快捷方法 ==================

export const enhancedPRDPromptGenerator = new EnhancedPRDPromptGenerator();

/**
 * 快捷方法：生成增强提示词
 */
export async function generateEnhancedPrompt(
  prdData: PRDGenerationData,
  customRequirements?: string
): Promise<string> {
  const result = await enhancedPRDPromptGenerator.generateEnhancedPrompt(
    prdData,
    { customRequirements, qualityLevel: 'high', fusionMode: 'balanced' }
  );
  
  return result.finalPrompt;
}

/**
 * 快捷方法：生成带元数据的完整结果
 */
export async function generateEnhancedPromptWithMetadata(
  prdData: PRDGenerationData,
  options: EnhancedPromptOptions = {}
): Promise<EnhancedPromptResult> {
  return enhancedPRDPromptGenerator.generateEnhancedPrompt(prdData, options);
} 