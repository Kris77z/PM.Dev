/**
 * PRD质量分析器 - Phase G.1
 * 智能分析PRD数据质量并提供补全建议
 */

import { PRDGenerationData } from '@/lib/prd-generator';

// PRD质量评估结果
export interface PRDQualityAssessment {
  overallScore: number; // 总体评分 0-100
  contentCompleteness: number; // 内容完整性 0-100
  functionalClarity: number; // 功能清晰度 0-100
  businessValue: number; // 商业价值明确性 0-100
  competitorAnalysis: number; // 竞争分析深度 0-100
  technicalConsideration: number; // 技术考量完整性 0-100
  qualityLevel: 'excellent' | 'good' | 'average' | 'poor';
  issues: QualityIssue[];
  suggestions: QualityImprovement[];
}

// 质量问题
export interface QualityIssue {
  category: 'content' | 'functional' | 'business' | 'competitor' | 'technical';
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

// 质量改进建议
export interface QualityImprovement {
  type: 'user_scenarios' | 'functional_requirements' | 'business_value' | 'competitor_analysis' | 'technical_specs';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  enhancedContent: string;
}

// PRD增强结果
export interface EnhancedPRDData extends PRDGenerationData {
  enhancementLog: {
    originalQuality: PRDQualityAssessment;
    appliedEnhancements: QualityImprovement[];
    finalQuality: PRDQualityAssessment;
    enhancementSummary: string;
  };
  enhancedUserScenarios?: Array<{
    original: string;
    enhanced: string;
    additions: string[];
  }>;
  enhancedRequirements?: Array<{
    original: string;
    enhanced: string;
    technicalSpecs: string[];
    interactionDetails: string[];
  }>;
  suggestedFeatures?: Array<{
    category: string;
    feature: string;
    rationale: string;
    implementation: string;
  }>;
  industryBestPractices?: Array<{
    practice: string;
    description: string;
    implementation: string;
  }>;
}

/**
 * PRD质量分析器
 */
export class PRDQualityAnalyzer {
  
  /**
   * 分析PRD数据质量
   */
  static analyzePRDQuality(prdData: PRDGenerationData): PRDQualityAssessment {
    const contentScore = this.evaluateContentCompleteness(prdData);
    const functionalScore = this.evaluateFunctionalClarity(prdData);
    const businessScore = this.evaluateBusinessValue(prdData);
    const competitorScore = this.evaluateCompetitorAnalysis(prdData);
    const technicalScore = this.evaluateTechnicalConsideration(prdData);
    
    const overallScore = Math.round(
      (contentScore * 0.25 + functionalScore * 0.25 + businessScore * 0.2 + 
       competitorScore * 0.15 + technicalScore * 0.15)
    );
    
    const qualityLevel = this.getQualityLevel(overallScore);
    const issues = this.identifyQualityIssues(prdData, {
      contentScore, functionalScore, businessScore, competitorScore, technicalScore
    });
    const suggestions = this.generateImprovementSuggestions(prdData, issues);
    
    return {
      overallScore,
      contentCompleteness: contentScore,
      functionalClarity: functionalScore,
      businessValue: businessScore,
      competitorAnalysis: competitorScore,
      technicalConsideration: technicalScore,
      qualityLevel,
      issues,
      suggestions
    };
  }
  
  /**
   * 评估内容完整性
   */
  private static evaluateContentCompleteness(prdData: PRDGenerationData): number {
    let score = 0;
    
    // 用户场景评估 (最高50分)
    if (prdData.userScenarios?.length > 0) {
      const scenarioQuality = prdData.userScenarios.reduce((acc, scenario) => {
        let scenarioScore = 0;
        if (scenario.scenario?.length > 50) scenarioScore += 8; // 描述详细
        if (scenario.painPoint?.length > 30) scenarioScore += 8; // 痛点明确
        if (scenario.userType?.length > 10) scenarioScore += 4; // 用户类型具体
        return acc + Math.min(scenarioScore, 20);
      }, 0);
      score += Math.min(scenarioQuality, 50);
    }
    
    // 产品描述评估 (最高50分)
    if (prdData.requirementSolution?.sharedPrototype?.length > 100) {
      score += 50;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * 评估功能清晰度
   */
  private static evaluateFunctionalClarity(prdData: PRDGenerationData): number {
    let score = 0;
    
    // 功能需求评估 (最高70分)
    if (prdData.requirementSolution?.requirements?.length > 0) {
      const reqQuality = prdData.requirementSolution.requirements.reduce((acc, req) => {
        let reqScore = 0;
        if (req.features?.length > 20) reqScore += 6; // 描述具体
        if (req.name?.includes('用户') || req.name?.includes('管理') || req.name?.includes('支持')) reqScore += 4; // 用户导向
        if (req.features?.match(/\d+/)) reqScore += 2; // 包含量化指标
        return acc + Math.min(reqScore, 12);
      }, 0);
      score += Math.min(reqQuality, 70);
    }
    
    // 产品类型明确性 (最高30分)
    if (prdData.requirementSolution?.sharedPrototype) {
      score += 30;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * 评估商业价值明确性
   */
  private static evaluateBusinessValue(prdData: PRDGenerationData): number {
    let score = 0;
    
    // 目标用户明确性 (最高40分)
    if (prdData.userScenarios?.length > 0) {
      score += 20;
      // 用户痛点分析质量
      const painPointsQuality = prdData.userScenarios.filter(s => 
        s.painPoint && s.painPoint.length > 20
      ).length;
      score += Math.min(painPointsQuality * 8, 20);
    }
    
    // 产品价值主张 (最高40分)
    if (prdData.requirementSolution?.sharedPrototype?.includes('解决') || 
        prdData.requirementSolution?.sharedPrototype?.includes('提升') ||
        prdData.requirementSolution?.sharedPrototype?.includes('帮助')) {
      score += 25;
    }
    
    // 需求具体性 (最高20分)
    if (prdData.requirementSolution?.requirements?.length >= 3) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * 评估竞争分析深度
   */
  private static evaluateCompetitorAnalysis(prdData: PRDGenerationData): number {
    let score = 0;
    
    if (prdData.competitors?.length > 0) {
      score += 30; // 基础分
      
      // 竞品分析深度
      const detailedAnalysis = prdData.competitors.filter(comp => 
        comp.advantages?.length > 20 || comp.disadvantages?.length > 20
      ).length;
      score += Math.min(detailedAnalysis * 20, 50);
      
      // 差异化分析
      if (prdData.competitors.some(comp => 
          comp.advantages?.includes('差异') || comp.disadvantages?.includes('缺乏'))) {
        score += 20;
      }
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * 评估技术考量完整性
   */
  private static evaluateTechnicalConsideration(prdData: PRDGenerationData): number {
    let score = 40; // 基础分
    
    // 功能复杂度评估
    if (prdData.requirementSolution?.requirements?.length >= 5) {
      score += 20;
    }
    
    // 用户场景复杂度
    if (prdData.userScenarios?.length >= 3) {
      score += 20;
    }
    
    // 产品类型技术复杂度
    const technicalKeywords = ['数据', '分析', '同步', '实时', '智能', 'API'];
    if (prdData.requirementSolution?.sharedPrototype && 
        technicalKeywords.some(keyword => 
          prdData.requirementSolution.sharedPrototype.includes(keyword))) {
      score += 20;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * 获取质量等级
   */
  private static getQualityLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  }
  
  /**
   * 识别质量问题
   */
  private static identifyQualityIssues(
    prdData: PRDGenerationData, 
    scores: Record<string, number>
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    if (scores.contentScore < 70) {
      issues.push({
        category: 'content',
        severity: 'high',
        description: '用户场景描述不够详细',
        suggestion: '需要补充具体的用户画像、使用场景和痛点分析'
      });
    }
    
    if (scores.functionalScore < 70) {
      issues.push({
        category: 'functional',
        severity: 'high',
        description: '功能需求不够具体',
        suggestion: '将抽象功能分解为具体的用户操作和技术实现'
      });
    }
    
    if (scores.businessScore < 60) {
      issues.push({
        category: 'business',
        severity: 'medium',
        description: '商业价值不够明确',
        suggestion: '需要明确产品解决的核心问题和为用户创造的价值'
      });
    }
    
    if (scores.competitorScore < 50) {
      issues.push({
        category: 'competitor',
        severity: 'medium',
        description: '竞争分析不够深入',
        suggestion: '需要补充竞品的具体优缺点和差异化分析'
      });
    }
    
    if (scores.technicalScore < 60) {
      issues.push({
        category: 'technical',
        severity: 'low',
        description: '技术考量不够完整',
        suggestion: '需要考虑数据存储、性能优化、安全性等技术要求'
      });
    }
    
    return issues;
  }
  
  /**
   * 生成改进建议
   */
  private static generateImprovementSuggestions(
    prdData: PRDGenerationData, 
    issues: QualityIssue[]
  ): QualityImprovement[] {
    const suggestions: QualityImprovement[] = [];
    
    // 基于质量问题生成具体建议
    for (const issue of issues) {
      switch (issue.category) {
        case 'content':
          suggestions.push({
            type: 'user_scenarios',
            priority: 'high',
            title: '用户场景深化',
            description: '将基础用户描述扩展为详细的用户画像和使用场景',
            enhancedContent: this.generateUserScenarioEnhancement()
          });
          break;
          
        case 'functional':
          suggestions.push({
            type: 'functional_requirements',
            priority: 'high',
            title: '功能需求具体化',
            description: '将抽象功能转化为具体的用户操作和技术实现',
            enhancedContent: this.generateFunctionalEnhancement()
          });
          break;
          
        case 'business':
          suggestions.push({
            type: 'business_value',
            priority: 'medium',
            title: '商业价值明确化',
            description: '补充产品的核心价值主张和用户收益',
            enhancedContent: this.generateBusinessValueEnhancement()
          });
          break;
          
        case 'technical':
          suggestions.push({
            type: 'technical_specs',
            priority: 'low',
            title: '技术规格补充',
            description: '添加技术实现的关键考虑因素',
            enhancedContent: this.generateTechnicalEnhancement()
          });
          break;
      }
    }
    
    return suggestions;
  }
  
  /**
   * 生成用户场景增强建议
   */
  private static generateUserScenarioEnhancement(): string {
    return `
## 增强的用户场景建议

### 目标用户画像
- **主要用户群体**：具体的年龄、职业、技能水平
- **使用背景**：工作环境、设备偏好、时间分布
- **技术能力**：对类似产品的熟悉程度

### 详细使用场景
- **典型使用时间**：一天中的什么时候使用
- **使用环境**：办公室、家中、移动场景
- **使用频率**：每日、每周还是偶尔使用

### 核心痛点分析
- **当前解决方案**：用户现在如何解决这个问题
- **痛点量化**：浪费多少时间、造成什么损失
- **期望效果**：解决后能带来什么具体改善
    `;
  }
  
  /**
   * 生成功能需求增强建议
   */
  private static generateFunctionalEnhancement(): string {
    return `
## 功能需求具体化建议

### 核心功能分解
- **用户操作步骤**：用户如何使用这个功能
- **系统响应**：系统如何反馈用户操作
- **数据流转**：数据如何输入、处理、输出
- **异常处理**：出错时如何处理

### 交互细节设计
- **界面元素**：需要什么按钮、表单、列表
- **操作反馈**：加载状态、成功/错误提示
- **键盘快捷键**：提升效率的快捷操作
- **响应式适配**：移动端的交互优化
    `;
  }
  
  /**
   * 生成商业价值增强建议
   */
  private static generateBusinessValueEnhancement(): string {
    return `
## 商业价值明确化建议

### 核心价值主张
- **解决什么问题**：用户最迫切需要解决的核心问题
- **创造什么价值**：为用户节省时间、降低成本、提升效率
- **差异化优势**：相比现有解决方案的独特价值

### 用户收益量化
- **效率提升**：具体能提升多少效率
- **成本节约**：能为用户节省多少成本
- **体验改善**：如何让用户感觉更好用
    `;
  }
  
  /**
   * 生成技术增强建议
   */
  private static generateTechnicalEnhancement(): string {
    return `
## 技术实现规格建议

### 数据存储方案
- **本地存储**：使用localStorage还是IndexedDB
- **云端同步**：是否需要服务器端存储
- **离线支持**：离线时如何工作

### 性能要求
- **加载速度**：首次加载时间要求
- **响应时间**：用户操作的响应时间
- **数据量处理**：支持多少数据量

### 安全考虑
- **数据加密**：敏感数据的加密处理
- **用户隐私**：用户数据的隐私保护
- **安全防护**：XSS、CSRF等安全防护
    `;
  }
}

/**
 * PRD智能增强器
 */
export class PRDIntelligentEnhancer {
  
  /**
   * 智能增强PRD数据
   */
  static async enhancePRDData(
    prdData: PRDGenerationData,
    qualityAssessment: PRDQualityAssessment
  ): Promise<EnhancedPRDData> {
    
    const enhancedData: EnhancedPRDData = {
      ...prdData,
      enhancementLog: {
        originalQuality: qualityAssessment,
        appliedEnhancements: [],
        finalQuality: qualityAssessment, // 将在增强后重新评估
        enhancementSummary: ''
      }
    };
    
    // 如果质量评分过低，进行智能增强
    if (qualityAssessment.overallScore < 70) {
      
      // 增强用户场景
      if (qualityAssessment.contentCompleteness < 70) {
        enhancedData.enhancedUserScenarios = this.enhanceUserScenarios(prdData);
        enhancedData.enhancementLog.appliedEnhancements.push({
          type: 'user_scenarios',
          priority: 'high',
          title: '用户场景深化',
          description: '补充了详细的用户画像、使用场景和痛点分析',
          enhancedContent: '已为每个用户场景添加了具体的背景信息和详细痛点分析'
        });
      }
      
      // 增强功能需求
      if (qualityAssessment.functionalClarity < 70) {
        enhancedData.enhancedRequirements = this.enhanceFunctionalRequirements(prdData);
        enhancedData.enhancementLog.appliedEnhancements.push({
          type: 'functional_requirements',
          priority: 'high',
          title: '功能需求具体化',
          description: '将抽象功能转化为具体的技术实现和交互设计',
          enhancedContent: '已为每个功能添加了详细的技术规格和交互流程'
        });
      }
      
             // 添加建议功能
       enhancedData.suggestedFeatures = this.suggestAdditionalFeatures();
      enhancedData.enhancementLog.appliedEnhancements.push({
        type: 'functional_requirements',
        priority: 'medium',
        title: '创新功能建议',
        description: '基于产品类型和行业最佳实践，建议了额外的有价值功能',
        enhancedContent: `建议了${enhancedData.suggestedFeatures.length}个创新功能`
      });
      
      // 添加行业最佳实践
      enhancedData.industryBestPractices = this.addIndustryBestPractices();
      enhancedData.enhancementLog.appliedEnhancements.push({
        type: 'technical_specs',
        priority: 'medium',
        title: '行业最佳实践融入',
        description: '融入了行业标准的功能和技术实现方案',
        enhancedContent: `添加了${enhancedData.industryBestPractices.length}项行业最佳实践`
      });
    }
    
    // 重新评估增强后的质量
    enhancedData.enhancementLog.finalQuality = PRDQualityAnalyzer.analyzePRDQuality(enhancedData);
    
    // 生成增强总结
    enhancedData.enhancementLog.enhancementSummary = this.generateEnhancementSummary(enhancedData);
    
    return enhancedData;
  }
  
  /**
   * 增强用户场景
   */
  private static enhanceUserScenarios(prdData: PRDGenerationData) {
    return prdData.userScenarios?.map(scenario => ({
      original: scenario.scenario,
      enhanced: this.expandUserScenario(scenario.scenario, scenario.userType, scenario.painPoint),
      additions: [
        '补充了具体的用户背景信息',
        '详细描述了使用环境和时机',
        '量化了痛点的影响程度',
        '明确了期望的解决效果'
      ]
    })) || [];
  }
  
  /**
   * 扩展用户场景
   */
  private static expandUserScenario(scenario: string, userType: string, painPoint: string): string {
    return `
### 详细用户场景

**用户画像**: ${userType}（具体年龄段、职业背景、技术水平）

**使用场景**: ${scenario}
- 使用时间：工作日的特定时段
- 使用环境：办公室/家中/移动场景
- 使用频率：每日/每周的使用模式
- 设备偏好：主要使用设备类型

**核心痛点**: ${painPoint}
- 当前解决方案的不足
- 造成的具体损失（时间、效率、成本）
- 痛点的紧急程度和影响范围
- 用户对解决方案的期望程度

**期望价值**:
- 节省时间：具体能节省多少时间
- 提升效率：效率提升的具体表现
- 改善体验：用户体验的具体改进
- 降低成本：成本节约的具体方面
    `;
  }
  
  /**
   * 增强功能需求
   */
  private static enhanceFunctionalRequirements(prdData: PRDGenerationData) {
    return prdData.requirementSolution?.requirements?.map(req => ({
      original: req.name,
      enhanced: this.expandFunctionalRequirement(req.name, req.features),
      technicalSpecs: [
        '数据存储和管理方案',
        '用户界面和交互设计',
        '性能优化和响应速度',
        '错误处理和用户反馈'
      ],
      interactionDetails: [
        '用户操作的具体步骤',
        '系统响应和状态反馈',
        '键盘快捷键支持',
        '移动端交互优化'
      ]
    })) || [];
  }
  
  /**
   * 扩展功能需求
   */
  private static expandFunctionalRequirement(name: string, features: string): string {
    return `
### 详细功能规格: ${name}

**功能描述**: ${features}

**用户操作流程**:
1. 用户触发操作的入口点
2. 必要的数据输入和验证
3. 系统处理和响应过程
4. 结果展示和后续操作

**技术实现要求**:
- 数据结构：需要存储和处理的数据类型
- 接口设计：前后端数据交互规范
- 性能要求：响应时间和并发支持
- 安全考虑：数据验证和权限控制

**交互设计**:
- 界面布局：页面结构和元素排列
- 操作反馈：加载状态和结果提示
- 错误处理：异常情况的用户友好提示
- 可访问性：键盘导航和屏幕阅读器支持
    `;
  }
  
     /**
    * 建议额外功能
    */
   private static suggestAdditionalFeatures() {
    return [
      {
        category: '用户体验',
        feature: '键盘快捷键支持',
        rationale: '提升高频用户的操作效率',
        implementation: '为常用操作配置快捷键，显示快捷键提示'
      },
      {
        category: '数据管理',
        feature: '数据导入导出',
        rationale: '方便用户迁移和备份数据',
        implementation: '支持JSON/CSV格式的数据导入导出功能'
      },
      {
        category: '协作功能',
        feature: '分享和协作',
        rationale: '支持团队协作使用',
        implementation: '生成分享链接，支持只读/编辑权限控制'
      },
      {
        category: '智能化',
        feature: '智能推荐和提示',
        rationale: '基于用户行为提供个性化建议',
        implementation: '分析用户使用模式，提供智能化的操作建议'
      }
    ];
  }
  
  /**
   * 添加行业最佳实践
   */
  private static addIndustryBestPractices() {
    return [
      {
        practice: '响应式设计',
        description: '确保在所有设备上都有良好的用户体验',
        implementation: '使用CSS Grid和Flexbox实现自适应布局，优化移动端交互'
      },
      {
        practice: '无障碍访问',
        description: '支持残障用户使用',
        implementation: '添加ARIA标签，支持键盘导航，确保颜色对比度符合标准'
      },
      {
        practice: '性能优化',
        description: '确保应用加载和运行速度',
        implementation: '懒加载、代码分割、图片压缩、缓存策略'
      },
      {
        practice: '数据安全',
        description: '保护用户数据安全和隐私',
        implementation: '数据加密、XSS/CSRF防护、用户权限控制'
      },
      {
        practice: '用户反馈',
        description: '及时收集和响应用户反馈',
        implementation: '错误提示、成功反馈、操作确认、帮助文档'
      }
    ];
  }
  
  /**
   * 生成增强总结
   */
  private static generateEnhancementSummary(enhancedData: EnhancedPRDData): string {
    const { originalQuality, finalQuality, appliedEnhancements } = enhancedData.enhancementLog;
    
    return `
## PRD质量增强总结

**原始质量评分**: ${originalQuality.overallScore}/100 (${originalQuality.qualityLevel})
**增强后评分**: ${finalQuality.overallScore}/100 (${finalQuality.qualityLevel})
**提升幅度**: +${finalQuality.overallScore - originalQuality.overallScore}分

**应用的增强措施** (${appliedEnhancements.length}项):
${appliedEnhancements.map(enhancement => 
  `- ${enhancement.title}: ${enhancement.description}`
).join('\n')}

**增强效果**:
- 内容完整性: ${originalQuality.contentCompleteness} → ${finalQuality.contentCompleteness} (+${finalQuality.contentCompleteness - originalQuality.contentCompleteness})
- 功能清晰度: ${originalQuality.functionalClarity} → ${finalQuality.functionalClarity} (+${finalQuality.functionalClarity - originalQuality.functionalClarity})
- 商业价值: ${originalQuality.businessValue} → ${finalQuality.businessValue} (+${finalQuality.businessValue - originalQuality.businessValue})

通过AI智能增强，您的PRD已经达到${finalQuality.qualityLevel}水平，可以生成高质量的原型！
    `;
  }
} 