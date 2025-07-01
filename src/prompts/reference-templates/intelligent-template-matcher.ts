/**
 * 智能模板匹配器
 * 
 * 处理PRD与参考模板不匹配的情况，提供多层回退策略：
 * 1. 精确匹配 - 直接产品类型匹配
 * 2. 功能相似性匹配 - 基于功能特征匹配
 * 3. 布局类型匹配 - 基于界面复杂度匹配  
 * 4. 通用模板回退 - 使用最佳实践模板
 * 5. 混合策略 - 多模板融合
 */

import { SimpleTemplate, PRACTICAL_TEMPLATES } from './template-library-simplified';
import { PRDGenerationData } from '@/lib/prd-generator';

// ================== 产品类型映射 ==================

const PRODUCT_TYPE_MAPPING: Record<string, string[]> = {
  // 直接映射 - 我们有的模板
  'saas-tools': ['工具', '效率', '自动化', 'ai', '智能'],
  'data-analytics': ['数据', '分析', '报表', '仪表盘', '统计'],
  'project-management': ['项目', '管理', '协作', '任务', '团队'],
  'social-media': ['社交', '分享', '社区', '评论', '互动'],
  'ecommerce': ['电商', '购物', '商城', '商品', '交易'],
  
  // 扩展映射 - 可以复用现有模板的类型
  'education': ['教育', '学习', '课程', '培训', '知识'], // -> 可用 project-management 布局
  'finance': ['金融', '理财', '投资', '银行', '支付'], // -> 可用 data-analytics 布局
  'healthcare': ['医疗', '健康', '患者', '医生', '诊断'], // -> 可用 data-analytics 布局
  'gaming': ['游戏', '娱乐', '竞技', '排行榜'], // -> 可用 social-media 布局
  'news': ['新闻', '资讯', '媒体', '文章', '阅读'], // -> 可用 social-media 布局
  'travel': ['旅游', '酒店', '机票', '景点', '行程'], // -> 可用 ecommerce 布局
  'food': ['餐饮', '外卖', '菜单', '订餐', '美食'], // -> 可用 ecommerce 布局
  'real-estate': ['房产', '租房', '买房', '中介'], // -> 可用 ecommerce 布局
  'logistics': ['物流', '快递', '运输', '仓储'], // -> 可用 project-management 布局
  'hr': ['人力资源', '招聘', '员工', 'hr'], // -> 可用 project-management 布局
};

// ================== 功能特征分析 ==================

const FEATURE_PATTERNS: Record<string, {
  keywords: string[];
  suggestedTemplate: string;
  confidence: number;
}> = {
  'data-visualization': {
    keywords: ['图表', '统计', '报表', '可视化', '仪表盘', '数据分析'],
    suggestedTemplate: 'dashboard-analytics',
    confidence: 0.9
  },
  'content-management': {
    keywords: ['内容', '文章', '发布', '编辑', '管理'],
    suggestedTemplate: 'project-management-dashboard',
    confidence: 0.8
  },
  'social-interaction': {
    keywords: ['评论', '点赞', '分享', '关注', '社交', '互动'],
    suggestedTemplate: 'social-media-feed',
    confidence: 0.9
  },
  'ecommerce-shopping': {
    keywords: ['购买', '购物车', '商品', '支付', '订单'],
    suggestedTemplate: 'ecommerce-grid',
    confidence: 0.9
  },
  'user-dashboard': {
    keywords: ['个人中心', '用户资料', '设置', '账户'],
    suggestedTemplate: 'project-management-dashboard',
    confidence: 0.7
  }
};

// ================== 布局复杂度评估 ==================

interface LayoutComplexityScore {
  layoutType: SimpleTemplate['layoutType'];
  reason: string;
  confidence: number;
}

function analyzeLayoutComplexity(prd: PRDGenerationData): LayoutComplexityScore {
  const requirements = prd.requirementSolution.requirements;
  const scenarios = prd.userScenarios;
  
  // 计算功能复杂度
  const featureCount = requirements.length;
  const scenarioCount = scenarios.length;
  
  // 检查是否有数据展示需求
  const hasDataVisualization = requirements.some(req => 
    req.toLowerCase().includes('数据') ||
    req.toLowerCase().includes('统计') ||
    req.toLowerCase().includes('报表') ||
    req.toLowerCase().includes('图表')
  );
  
  // 检查是否有复杂导航需求
  const hasComplexNavigation = featureCount > 8 || scenarios.some(scenario =>
    scenario.userStory.includes('管理') ||
    scenario.userStory.includes('配置') ||
    scenario.userStory.includes('设置')
  );
  
  // 检查是否是简单展示页面
  const isSimpleDisplay = featureCount <= 4 && !hasDataVisualization && !hasComplexNavigation;
  
  if (hasDataVisualization && featureCount > 6) {
    return {
      layoutType: 'dashboard-grid',
      reason: '包含数据可视化和多功能模块，适合仪表盘布局',
      confidence: 0.9
    };
  }
  
  if (hasComplexNavigation || featureCount > 6) {
    return {
      layoutType: 'sidebar-main',
      reason: '功能复杂，需要侧边栏导航来组织内容',
      confidence: 0.8
    };
  }
  
  if (isSimpleDisplay) {
    return {
      layoutType: 'top-navigation',
      reason: '功能相对简单，顶部导航即可满足需求',
      confidence: 0.7
    };
  }
  
  // 默认中等复杂度
  return {
    layoutType: 'sidebar-main',
    reason: '中等复杂度产品，使用侧边栏布局',
    confidence: 0.6
  };
}

// ================== 智能匹配器主类 ==================

export interface TemplateMatchResult {
  matchType: 'exact' | 'functional' | 'layout' | 'generic' | 'hybrid';
  templates: SimpleTemplate[];
  confidence: number;
  reason: string;
  fallbackStrategy?: string;
}

export class IntelligentTemplateMatcher {
  
  /**
   * 主匹配方法 - 多层回退策略
   */
  static findBestMatch(prd: PRDGenerationData): TemplateMatchResult {
    // 1. 尝试精确匹配
    const exactMatch = this.exactMatch(prd);
    if (exactMatch.templates.length > 0) {
      return exactMatch;
    }
    
    // 2. 尝试功能相似性匹配
    const functionalMatch = this.functionalMatch(prd);
    if (functionalMatch.confidence > 0.7) {
      return functionalMatch;
    }
    
    // 3. 尝试布局类型匹配
    const layoutMatch = this.layoutMatch(prd);
    if (layoutMatch.confidence > 0.6) {
      return layoutMatch;
    }
    
    // 4. 混合策略 - 多模板融合
    const hybridMatch = this.hybridMatch(prd);
    if (hybridMatch.confidence > 0.5) {
      return hybridMatch;
    }
    
    // 5. 最终回退 - 通用最佳实践
    return this.genericFallback(prd);
  }
  
  /**
   * 1. 精确匹配 - 基于产品类型直接匹配
   */
  private static exactMatch(prd: PRDGenerationData): TemplateMatchResult {
    const productDescription = [
      prd.requirementSolution.sharedPrototype,
      ...prd.requirementSolution.requirements,
      ...prd.userScenarios.map(s => s.userStory)
    ].join(' ').toLowerCase();
    
    // 检查每个产品类型的关键词
    for (const [productType, keywords] of Object.entries(PRODUCT_TYPE_MAPPING)) {
      const matchCount = keywords.filter(keyword => 
        productDescription.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount >= 2) { // 至少匹配2个关键词
        const templates = PRACTICAL_TEMPLATES.filter(t => t.productType === productType);
        if (templates.length > 0) {
          return {
            matchType: 'exact',
            templates,
            confidence: Math.min(0.9, 0.6 + matchCount * 0.1),
            reason: `产品类型直接匹配：${productType}，匹配关键词：${matchCount}个`
          };
        }
      }
    }
    
    return {
      matchType: 'exact',
      templates: [],
      confidence: 0,
      reason: '未找到直接的产品类型匹配'
    };
  }
  
  /**
   * 2. 功能相似性匹配 - 基于功能特征匹配
   */
  private static functionalMatch(prd: PRDGenerationData): TemplateMatchResult {
    const allText = [
      prd.requirementSolution.sharedPrototype,
      ...prd.requirementSolution.requirements,
      ...prd.userScenarios.map(s => s.userStory)
    ].join(' ').toLowerCase();
    
    let bestMatch: { pattern: string; template: SimpleTemplate | null; confidence: number } = {
      pattern: '',
      template: null,
      confidence: 0
    };
    
    // 检查功能模式匹配
    for (const [patternName, pattern] of Object.entries(FEATURE_PATTERNS)) {
      const matchCount = pattern.keywords.filter(keyword => 
        allText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        const confidence = (matchCount / pattern.keywords.length) * pattern.confidence;
        if (confidence > bestMatch.confidence) {
          const template = PRACTICAL_TEMPLATES.find(t => t.id === pattern.suggestedTemplate);
          if (template) {
            bestMatch = {
              pattern: patternName,
              template,
              confidence
            };
          }
        }
      }
    }
    
    if (bestMatch.template) {
      return {
        matchType: 'functional',
        templates: [bestMatch.template],
        confidence: bestMatch.confidence,
        reason: `功能特征匹配：${bestMatch.pattern}，相似度：${Math.round(bestMatch.confidence * 100)}%`
      };
    }
    
    return {
      matchType: 'functional',
      templates: [],
      confidence: 0,
      reason: '未找到相似的功能特征'
    };
  }
  
  /**
   * 3. 布局类型匹配 - 基于界面复杂度匹配
   */
  private static layoutMatch(prd: PRDGenerationData): TemplateMatchResult {
    const complexityAnalysis = analyzeLayoutComplexity(prd);
    const matchingTemplates = PRACTICAL_TEMPLATES.filter(
      t => t.layoutType === complexityAnalysis.layoutType
    );
    
    if (matchingTemplates.length > 0) {
      // 选择评分最高的模板
      const bestTemplate = matchingTemplates.reduce((best, current) => 
        current.trustScore > best.trustScore ? current : best
      );
      
      return {
        matchType: 'layout',
        templates: [bestTemplate],
        confidence: complexityAnalysis.confidence,
        reason: `布局类型匹配：${complexityAnalysis.layoutType}。${complexityAnalysis.reason}`
      };
    }
    
    return {
      matchType: 'layout',
      templates: [],
      confidence: 0,
      reason: '未找到匹配的布局类型模板'
    };
  }
  
  /**
   * 4. 混合策略 - 多模板融合
   */
  private static hybridMatch(prd: PRDGenerationData): TemplateMatchResult {
    const complexityAnalysis = analyzeLayoutComplexity(prd);
    
    // 获取布局类型匹配的模板
    const layoutTemplates = PRACTICAL_TEMPLATES.filter(
      t => t.layoutType === complexityAnalysis.layoutType
    );
    
    // 获取高质量通用模板作为补充
    const highQualityTemplates = PRACTICAL_TEMPLATES
      .filter(t => t.trustScore >= 8)
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, 2);
    
    // 合并去重
    const uniqueTemplates = [
      ...layoutTemplates,
      ...highQualityTemplates.filter(t => !layoutTemplates.some(lt => lt.id === t.id))
    ].slice(0, 3); // 最多3个模板
    
    if (uniqueTemplates.length > 0) {
      return {
        matchType: 'hybrid',
        templates: uniqueTemplates,
        confidence: 0.6,
        reason: `混合策略：使用${uniqueTemplates.length}个模板融合，包含${complexityAnalysis.layoutType}布局和高质量模板`,
        fallbackStrategy: 'multi-template-fusion'
      };
    }
    
    return {
      matchType: 'hybrid',
      templates: [],
      confidence: 0,
      reason: '混合策略失败'
    };
  }
  
  /**
   * 5. 通用回退 - 最佳实践模板
   */
  private static genericFallback(prd: PRDGenerationData): TemplateMatchResult {
    // 选择评分最高的通用模板
    const bestTemplate = PRACTICAL_TEMPLATES
      .sort((a, b) => b.trustScore - a.trustScore)[0];
    
    return {
      matchType: 'generic',
      templates: [bestTemplate],
      confidence: 0.4,
      reason: `使用最佳实践模板：${bestTemplate.name}（评分：${bestTemplate.trustScore}），适用于各类产品的通用布局`,
      fallbackStrategy: 'best-practice-template'
    };
  }
  
  /**
   * 获取匹配建议文本 - 用于提示词生成
   */
  static getMatchingSuggestionText(matchResult: TemplateMatchResult): string {
    const { matchType, templates, confidence, reason, fallbackStrategy } = matchResult;
    
    let suggestionText = `\n\n## 🎯 参考模板匹配结果\n\n`;
    
    suggestionText += `**匹配类型**: ${this.getMatchTypeDescription(matchType)}\n`;
    suggestionText += `**匹配度**: ${Math.round(confidence * 100)}%\n`;
    suggestionText += `**分析**: ${reason}\n\n`;
    
    if (templates.length === 1) {
      const template = templates[0];
      suggestionText += `**参考模板**: ${template.name}\n`;
      suggestionText += `**布局类型**: ${template.layoutType}\n`;
      suggestionText += `**设计风格**: ${template.tags.join(', ')}\n\n`;
      
      if (matchType === 'generic' || matchType === 'layout') {
        suggestionText += `⚠️ **重要提示**: 由于没有找到完全匹配的模板，请重点关注以下适配要求：\n`;
        suggestionText += `1. 保留参考模板的整体布局结构和交互模式\n`;
        suggestionText += `2. 根据PRD的具体需求调整内容组织方式\n`;
        suggestionText += `3. 适配产品特定的功能模块和用户场景\n`;
        suggestionText += `4. 保持设计的一致性和可用性\n\n`;
      }
    } else if (templates.length > 1) {
      suggestionText += `**融合模板** (${templates.length}个):\n`;
      templates.forEach((template, index) => {
        suggestionText += `${index + 1}. ${template.name} (${template.layoutType})\n`;
      });
      suggestionText += `\n💡 **融合策略**: 结合多个模板的优势，取各模板的最佳实践进行融合设计。\n\n`;
    }
    
    if (fallbackStrategy) {
      suggestionText += `**回退策略**: ${fallbackStrategy}\n\n`;
    }
    
    return suggestionText;
  }
  
  private static getMatchTypeDescription(matchType: string): string {
    const descriptions = {
      'exact': '🎯 精确匹配',
      'functional': '🔧 功能相似性匹配',
      'layout': '📐 布局类型匹配',
      'hybrid': '🔀 混合策略匹配',
      'generic': '🌟 通用最佳实践'
    };
    return descriptions[matchType] || matchType;
  }
}

// ================== 导出 ==================

export default IntelligentTemplateMatcher; 