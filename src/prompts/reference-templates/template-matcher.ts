/**
 * 智能模板匹配器 - Intelligent Template Matcher
 * 
 * 这个模块负责分析PRD数据，并智能匹配最适合的参考模板，
 * 实现从产品需求到参考模板的精准映射。
 */

import type { PRDGenerationData } from '../../types/prd-types';
import type { ReferenceTemplate, ProductType, IndustryType } from './template-library';
import { templateLibrary, PRODUCT_TYPES, INDUSTRY_TYPES } from './template-library';

// ================== 核心匹配接口 ==================

export interface MatchingScore {
  templateId: string;
  score: number;
  reasoning: string[];
  categoryMatch: number;    // 产品类型匹配度 (0-1)
  industryMatch: number;    // 行业匹配度 (0-1)
  functionalMatch: number;  // 功能匹配度 (0-1)
  contextMatch: number;     // 上下文匹配度 (0-1)
}

export interface PRDAnalysisResult {
  detectedProductType: ProductType;
  detectedIndustry: IndustryType;
  extractedKeywords: string[];
  coreFunctions: string[];
  targetUserContext: string[];
  businessModel: string;
  confidence: number;      // 分析置信度 (0-1)
}

export interface MatchingResult {
  prdAnalysis: PRDAnalysisResult;
  primaryRecommendation: {
    template: ReferenceTemplate;
    score: MatchingScore;
    reasonsToChoose: string[];
  };
  alternativeRecommendations: Array<{
    template: ReferenceTemplate;
    score: MatchingScore;
    reasonsToChoose: string[];
  }>;
  fusionOpportunities: Array<{
    primaryTemplate: ReferenceTemplate;
    secondaryTemplate: ReferenceTemplate;
    fusionStrategy: string;
    expectedBenefits: string[];
  }>;
}

// ================== PRD分析引擎 ==================

export class PRDAnalyzer {
  /**
   * 主要分析入口：全面分析PRD数据
   */
  analyzePRD(prdData: PRDGenerationData): PRDAnalysisResult {
    const productType = this.extractProductType(prdData);
    const industry = this.detectIndustryContext(prdData);
    const keywords = this.extractKeywords(prdData);
    const functions = this.identifyCoreFunctions(prdData);
    const userContext = this.analyzeTargetUsers(prdData);
    const businessModel = this.identifyBusinessModel(prdData);
    
    // 计算分析置信度
    const confidence = this.calculateAnalysisConfidence({
      productType,
      industry,
      keywords,
      functions
    });

    return {
      detectedProductType: productType,
      detectedIndustry: industry,
      extractedKeywords: keywords,
      coreFunctions: functions,
      targetUserContext: userContext,
      businessModel,
      confidence
    };
  }

  /**
   * 产品类型识别
   */
  extractProductType(prdData: PRDGenerationData): ProductType {
    const text = this.getPRDText(prdData);
    const scores = PRODUCT_TYPES.map(type => ({
      type,
      score: this.calculateKeywordMatch(text, type.keywords)
    }));

    // 加权评分：产品名称和核心功能权重更高
    scores.forEach(item => {
      const titleMatch = this.calculateKeywordMatch(
        prdData.requirementSolution?.name || '', 
        item.type.keywords
      );
      const featureMatch = this.calculateKeywordMatch(
        this.extractFeatureText(prdData),
        item.type.keywords
      );
      
      item.score = item.score * 0.4 + titleMatch * 0.3 + featureMatch * 0.3;
    });

    return scores.sort((a, b) => b.score - a.score)[0].type;
  }

  /**
   * 行业场景识别
   */
  detectIndustryContext(prdData: PRDGenerationData): IndustryType {
    const text = this.getPRDText(prdData);
    const scores = INDUSTRY_TYPES.map(industry => ({
      industry,
      score: this.calculateKeywordMatch(text, industry.characteristics)
    }));

    // 竞争对手分析可以提供行业线索
    const competitorText = this.extractCompetitorText(prdData);
    scores.forEach(item => {
      const competitorMatch = this.calculateKeywordMatch(
        competitorText,
        item.industry.characteristics
      );
      item.score = item.score * 0.7 + competitorMatch * 0.3;
    });

    return scores.sort((a, b) => b.score - a.score)[0].industry;
  }

  /**
   * 核心功能识别
   */
  identifyCoreFunctions(prdData: PRDGenerationData): string[] {
    const functions: string[] = [];
    
    // 从需求解决方案中提取功能
    if (prdData.requirementSolution?.requirements) {
      functions.push(...this.extractFunctionKeywords(prdData.requirementSolution.requirements));
    }

    // 从用户场景中提取行为模式
    if (prdData.userScenarios) {
      prdData.userScenarios.forEach(scenario => {
        if (scenario.scenario) {
          functions.push(...this.extractActionKeywords(scenario.scenario));
        }
      });
    }

    // 去重并返回最重要的功能
    return [...new Set(functions)].slice(0, 10);
  }

  /**
   * 目标用户分析
   */
  analyzeTargetUsers(prdData: PRDGenerationData): string[] {
    const userContext: string[] = [];

    if (prdData.userScenarios) {
      prdData.userScenarios.forEach(scenario => {
        if (scenario.userType) {
          userContext.push(scenario.userType);
        }
        if (scenario.painPoint) {
          userContext.push(...this.extractContextKeywords(scenario.painPoint));
        }
      });
    }

    return [...new Set(userContext)];
  }

  /**
   * 商业模式识别
   */
  identifyBusinessModel(prdData: PRDGenerationData): string {
    const text = this.getPRDText(prdData);
    
    const businessModels = {
      'SaaS订阅': ['订阅', '月费', '年费', '企业版', '团队版'],
      '电商交易': ['购买', '支付', '订单', '商品', '卖家'],
      '广告变现': ['广告', '推广', '流量', '曝光', 'CPM'],
      '内容付费': ['付费', '会员', '订阅', '内容', '创作者'],
      '平台抽成': ['佣金', '抽成', '交易', '撮合', '中介']
    };

    for (const [model, keywords] of Object.entries(businessModels)) {
      if (this.calculateKeywordMatch(text, keywords) > 0.3) {
        return model;
      }
    }

    return '待确定';
  }

  // ================== 辅助方法 ==================

  private getPRDText(prdData: PRDGenerationData): string {
    return [
      prdData.requirementSolution?.name || '',
      prdData.requirementSolution?.requirements || '',
      prdData.requirementSolution?.keyBenefits || '',
      prdData.userScenarios?.map(s => `${s.scenario} ${s.painPoint}`).join(' ') || '',
      prdData.competitors?.map(c => c.analysis).join(' ') || ''
    ].join(' ').toLowerCase();
  }

  private extractFeatureText(prdData: PRDGenerationData): string {
    return prdData.requirementSolution?.requirements || '';
  }

  private extractCompetitorText(prdData: PRDGenerationData): string {
    return prdData.competitors?.map(c => `${c.name} ${c.analysis}`).join(' ') || '';
  }

  private calculateKeywordMatch(text: string, keywords: string[]): number {
    if (!text || keywords.length === 0) return 0;
    
    const matches = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return matches.length / keywords.length;
  }

  private extractFunctionKeywords(requirements: string): string[] {
    const functionPatterns = [
      /管理|创建|编辑|删除|查看|搜索|筛选|排序/g,
      /登录|注册|权限|角色|用户/g,
      /发布|分享|评论|点赞|关注/g,
      /支付|订单|购买|销售|交易/g,
      /分析|统计|报告|图表|数据/g
    ];

    const functions: string[] = [];
    functionPatterns.forEach(pattern => {
      const matches = requirements.match(pattern);
      if (matches) functions.push(...matches);
    });

    return functions;
  }

  private extractActionKeywords(scenario: string): string[] {
    const actionPatterns = /需要|想要|希望|要求|期望|能够|可以|应该/g;
    const matches = scenario.match(actionPatterns);
    return matches || [];
  }

  private extractContextKeywords(painPoint: string): string[] {
    const contextPatterns = /工作|生活|学习|购物|社交|健康|理财|娱乐/g;
    const matches = painPoint.match(contextPatterns);
    return matches || [];
  }

  private calculateAnalysisConfidence(analysis: {
    productType: ProductType;
    industry: IndustryType;
    keywords: string[];
    functions: string[];
  }): number {
    let confidence = 0.5; // 基础置信度

    // 关键词数量影响置信度
    if (analysis.keywords.length >= 5) confidence += 0.2;
    if (analysis.functions.length >= 3) confidence += 0.2;
    
    // 产品类型匹配度影响置信度
    if (analysis.productType.keywords.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}

// ================== 模板匹配引擎 ==================

export class TemplateMatcher {
  private analyzer = new PRDAnalyzer();

  /**
   * 主要匹配入口：找到最适合的参考模板
   */
  findBestMatches(prdData: PRDGenerationData): MatchingResult {
    const prdAnalysis = this.analyzer.analyzePRD(prdData);
    const allTemplates = templateLibrary.getAllTemplates();
    
    // 计算每个模板的匹配分数
    const scores = allTemplates.map(template => ({
      template,
      score: this.calculateTemplateScore(prdAnalysis, template)
    }));

    // 排序并选择最佳匹配
    scores.sort((a, b) => b.score.score - a.score.score);

    const primaryRecommendation = scores[0] ? {
      template: scores[0].template,
      score: scores[0].score,
      reasonsToChoose: this.generateRecommendationReasons(scores[0].score)
    } : null;

    const alternativeRecommendations = scores.slice(1, 4).map(item => ({
      template: item.template,
      score: item.score,
      reasonsToChoose: this.generateRecommendationReasons(item.score)
    }));

    const fusionOpportunities = this.identifyFusionOpportunities(scores.slice(0, 5));

    return {
      prdAnalysis,
      primaryRecommendation: primaryRecommendation!,
      alternativeRecommendations,
      fusionOpportunities
    };
  }

  /**
   * 计算模板匹配分数
   */
  calculateTemplateScore(prdAnalysis: PRDAnalysisResult, template: ReferenceTemplate): MatchingScore {
    const categoryMatch = this.calculateCategoryMatch(prdAnalysis.detectedProductType, template.category);
    const industryMatch = this.calculateIndustryMatch(prdAnalysis.detectedIndustry, template.industry);
    const functionalMatch = this.calculateFunctionalMatch(prdAnalysis.coreFunctions, template);
    const contextMatch = this.calculateContextMatch(prdAnalysis.targetUserContext, template);

    // 加权计算总分
    const totalScore = (
      categoryMatch * 0.3 +
      industryMatch * 0.25 +
      functionalMatch * 0.3 +
      contextMatch * 0.15
    );

    const reasoning = this.generateMatchingReasoning({
      categoryMatch,
      industryMatch,
      functionalMatch,
      contextMatch
    });

    return {
      templateId: template.id,
      score: totalScore,
      reasoning,
      categoryMatch,
      industryMatch,
      functionalMatch,
      contextMatch
    };
  }

  /**
   * 产品类型匹配度计算
   */
  private calculateCategoryMatch(prdType: ProductType, templateType: ProductType): number {
    if (prdType.id === templateType.id) return 1.0;
    
    // 计算关键词重叠度
    const overlap = prdType.keywords.filter(keyword => 
      templateType.keywords.includes(keyword)
    ).length;
    
    return overlap / Math.max(prdType.keywords.length, templateType.keywords.length);
  }

  /**
   * 行业匹配度计算
   */
  private calculateIndustryMatch(prdIndustry: IndustryType, templateIndustry: IndustryType): number {
    if (prdIndustry.id === templateIndustry.id) return 1.0;
    
    // 计算特征重叠度
    const overlap = prdIndustry.characteristics.filter(char => 
      templateIndustry.characteristics.includes(char)
    ).length;
    
    return overlap / Math.max(prdIndustry.characteristics.length, templateIndustry.characteristics.length);
  }

  /**
   * 功能匹配度计算
   */
  private calculateFunctionalMatch(prdFunctions: string[], template: ReferenceTemplate): number {
    const templateFeatures = [
      ...template.componentLibrary.map(c => c.name),
      ...template.businessLogic.flatMap(b => b.keyFeatures),
      ...template.tags
    ].map(f => f.toLowerCase());

    const matches = prdFunctions.filter(func => 
      templateFeatures.some(feature => 
        feature.includes(func.toLowerCase()) || func.toLowerCase().includes(feature)
      )
    );

    return prdFunctions.length > 0 ? matches.length / prdFunctions.length : 0;
  }

  /**
   * 上下文匹配度计算
   */
  private calculateContextMatch(userContext: string[], template: ReferenceTemplate): number {
    const templateContext = [
      template.description,
      ...template.businessLogic.map(b => b.userJourney),
      ...template.tags
    ].join(' ').toLowerCase();

    const matches = userContext.filter(context => 
      templateContext.includes(context.toLowerCase())
    );

    return userContext.length > 0 ? matches.length / userContext.length : 0.5;
  }

  /**
   * 生成匹配推理说明
   */
  private generateMatchingReasoning(scores: {
    categoryMatch: number;
    industryMatch: number;
    functionalMatch: number;
    contextMatch: number;
  }): string[] {
    const reasoning: string[] = [];

    if (scores.categoryMatch > 0.8) {
      reasoning.push('产品类型高度匹配，适用的设计模式相似');
    } else if (scores.categoryMatch > 0.5) {
      reasoning.push('产品类型部分匹配，可借鉴核心设计理念');
    }

    if (scores.industryMatch > 0.8) {
      reasoning.push('行业背景完全匹配，可直接应用行业最佳实践');
    } else if (scores.industryMatch > 0.5) {
      reasoning.push('行业特征相近，可适应性应用相关经验');
    }

    if (scores.functionalMatch > 0.7) {
      reasoning.push('核心功能高度重合，可复用大部分交互模式');
    } else if (scores.functionalMatch > 0.4) {
      reasoning.push('功能有部分重叠，可借鉴关键交互设计');
    }

    if (scores.contextMatch > 0.6) {
      reasoning.push('用户场景匹配，用户体验设计可直接参考');
    }

    return reasoning;
  }

  /**
   * 生成推荐理由
   */
  private generateRecommendationReasons(score: MatchingScore): string[] {
    const reasons: string[] = [];

    if (score.categoryMatch > 0.7) {
      reasons.push('产品类型匹配度高，设计模式成熟可靠');
    }

    if (score.functionalMatch > 0.6) {
      reasons.push('核心功能覆盖度高，可快速适配业务需求');
    }

    if (score.industryMatch > 0.7) {
      reasons.push('行业经验丰富，符合专业标准和用户习惯');
    }

    if (score.score > 0.8) {
      reasons.push('综合匹配度优秀，是理想的参考模板');
    } else if (score.score > 0.6) {
      reasons.push('匹配度良好，可作为主要参考方向');
    }

    return reasons;
  }

  /**
   * 识别融合机会
   */
  private identifyFusionOpportunities(topMatches: Array<{template: ReferenceTemplate; score: MatchingScore}>): Array<{
    primaryTemplate: ReferenceTemplate;
    secondaryTemplate: ReferenceTemplate;
    fusionStrategy: string;
    expectedBenefits: string[];
  }> {
    const opportunities = [];

    for (let i = 0; i < Math.min(topMatches.length, 3); i++) {
      for (let j = i + 1; j < Math.min(topMatches.length, 3); j++) {
        const primary = topMatches[i].template;
        const secondary = topMatches[j].template;

        if (primary.category.id !== secondary.category.id || 
            primary.industry.id !== secondary.industry.id) {
          
          const strategy = this.generateFusionStrategy(primary, secondary);
          const benefits = this.generateFusionBenefits(primary, secondary);

          opportunities.push({
            primaryTemplate: primary,
            secondaryTemplate: secondary,
            fusionStrategy: strategy,
            expectedBenefits: benefits
          });
        }
      }
    }

    return opportunities.slice(0, 2); // 返回最多2个融合建议
  }

  /**
   * 生成融合策略
   */
  private generateFusionStrategy(primary: ReferenceTemplate, secondary: ReferenceTemplate): string {
    return `以${primary.name}为主体架构，融合${secondary.name}的优秀特性，特别是${secondary.category.name}领域的专业设计模式`;
  }

  /**
   * 生成融合收益
   */
  private generateFusionBenefits(primary: ReferenceTemplate, secondary: ReferenceTemplate): string[] {
    return [
      `结合${primary.category.name}的成熟模式`,
      `增强${secondary.category.name}的专业特性`,
      '创造更丰富的用户体验',
      '提升产品的竞争差异化'
    ];
  }
}

// ================== 导出实例 ==================

export const templateMatcher = new TemplateMatcher();
export const prdAnalyzer = new PRDAnalyzer(); 