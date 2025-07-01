/**
 * 参考融合生成引擎 - Reference Fusion Engine
 * 
 * 这个模块负责将选定的参考模板与PRD数据进行智能融合，
 * 生成高质量的、基于参考的HTML原型生成提示词。
 */

import type { PRDGenerationData } from '../../types/prd-types';
import type { ReferenceTemplate, LayoutAnalysis, ComponentSpec, InteractionPattern } from '../reference-templates/template-library';
import type { MatchingResult } from '../reference-templates/template-matcher';

// ================== 融合策略接口 ==================

export interface FusionStrategy {
  primaryTemplate: ReferenceTemplate;
  secondaryTemplates: ReferenceTemplate[];
  fusionApproach: 'layout-focused' | 'component-focused' | 'interaction-focused' | 'hybrid';
  customizationLevel: 'minimal' | 'moderate' | 'extensive';
  priorityAspects: Array<'layout' | 'components' | 'interactions' | 'visual' | 'business'>;
}

export interface AdaptationPlan {
  layoutAdaptations: LayoutAdaptation[];
  componentCustomizations: ComponentCustomization[];
  interactionEnhancements: InteractionEnhancement[];
  visualAdjustments: VisualAdjustment[];
  businessLogicIntegration: BusinessLogicIntegration[];
}

export interface LayoutAdaptation {
  aspect: string;
  originalPattern: string;
  adaptedPattern: string;
  reasoning: string;
}

export interface ComponentCustomization {
  componentName: string;
  originalSpec: ComponentSpec;
  customizedSpec: ComponentSpec;
  prdRequirements: string[];
}

export interface InteractionEnhancement {
  interactionType: string;
  basePattern: InteractionPattern;
  enhancedPattern: InteractionPattern;
  prdSpecificNeeds: string[];
}

export interface VisualAdjustment {
  aspect: string;
  referenceStyle: string;
  adaptedStyle: string;
  brandingConsiderations: string[];
}

export interface BusinessLogicIntegration {
  businessArea: string;
  referenceLogic: string;
  prdRequirements: string;
  integrationStrategy: string;
}

export interface FusedPrompt {
  systemRole: string;
  referenceAnalysis: string;
  adaptationStrategy: string;
  technicalRequirements: string;
  qualityStandards: string;
  prdIntegration: string;
  outputInstructions: string;
}

// ================== 主融合引擎 ==================

export class ReferenceFusionEngine {
  /**
   * 主融合入口：生成基于参考的高质量提示词
   */
  generateFusedPrompt(
    prdData: PRDGenerationData,
    matchingResult: MatchingResult,
    customRequirements?: string
  ): FusedPrompt {
    const fusionStrategy = this.determineFusionStrategy(matchingResult);
    const adaptationPlan = this.createAdaptationPlan(prdData, fusionStrategy);
    
    return {
      systemRole: this.generateSystemRole(),
      referenceAnalysis: this.generateReferenceAnalysis(fusionStrategy),
      adaptationStrategy: this.generateAdaptationStrategy(adaptationPlan),
      technicalRequirements: this.generateTechnicalRequirements(fusionStrategy),
      qualityStandards: this.generateQualityStandards(fusionStrategy),
      prdIntegration: this.generatePRDIntegration(prdData, adaptationPlan),
      outputInstructions: this.generateOutputInstructions(customRequirements)
    };
  }

  /**
   * 确定融合策略
   */
  private determineFusionStrategy(matchingResult: MatchingResult): FusionStrategy {
    const primary = matchingResult.primaryRecommendation.template;
    const alternatives = matchingResult.alternativeRecommendations.map(alt => alt.template);
    
    // 根据匹配分数确定融合方式
    const primaryScore = matchingResult.primaryRecommendation.score;
    
    let fusionApproach: FusionStrategy['fusionApproach'] = 'hybrid';
    let customizationLevel: FusionStrategy['customizationLevel'] = 'moderate';
    let priorityAspects: FusionStrategy['priorityAspects'] = ['layout', 'components'];

    if (primaryScore.categoryMatch > 0.8) {
      fusionApproach = 'layout-focused';
      priorityAspects = ['layout', 'interactions'];
    } else if (primaryScore.functionalMatch > 0.8) {
      fusionApproach = 'component-focused';
      priorityAspects = ['components', 'business'];
    } else if (primaryScore.contextMatch > 0.8) {
      fusionApproach = 'interaction-focused';
      priorityAspects = ['interactions', 'visual'];
    }

    if (primaryScore.score > 0.9) {
      customizationLevel = 'minimal';
    } else if (primaryScore.score < 0.6) {
      customizationLevel = 'extensive';
    }

    return {
      primaryTemplate: primary,
      secondaryTemplates: alternatives.slice(0, 2),
      fusionApproach,
      customizationLevel,
      priorityAspects
    };
  }

  /**
   * 创建适配计划
   */
  private createAdaptationPlan(prdData: PRDGenerationData, strategy: FusionStrategy): AdaptationPlan {
    return {
      layoutAdaptations: this.planLayoutAdaptations(prdData, strategy),
      componentCustomizations: this.planComponentCustomizations(prdData, strategy),
      interactionEnhancements: this.planInteractionEnhancements(prdData, strategy),
      visualAdjustments: this.planVisualAdjustments(prdData, strategy),
      businessLogicIntegration: this.planBusinessLogicIntegration(prdData, strategy)
    };
  }

  /**
   * 规划布局适配
   */
  private planLayoutAdaptations(prdData: PRDGenerationData, strategy: FusionStrategy): LayoutAdaptation[] {
    const adaptations: LayoutAdaptation[] = [];
    const layout = strategy.primaryTemplate.layoutStructure;

    // 根据PRD功能需求调整布局
    if (prdData.requirementSolution?.requirements) {
      const requirements = prdData.requirementSolution.requirements.toLowerCase();
      
      if (requirements.includes('仪表盘') || requirements.includes('数据分析')) {
        adaptations.push({
          aspect: '数据展示区域',
          originalPattern: layout.contentOrganization,
          adaptedPattern: '增加专门的数据可视化区域，支持图表和关键指标展示',
          reasoning: 'PRD要求数据分析功能，需要突出数据展示'
        });
      }

      if (requirements.includes('管理') || requirements.includes('列表')) {
        adaptations.push({
          aspect: '列表管理布局',
          originalPattern: layout.structure,
          adaptedPattern: '优化列表视图布局，支持批量操作和筛选功能',
          reasoning: 'PRD强调管理功能，需要高效的列表操作界面'
        });
      }
    }

    return adaptations;
  }

  /**
   * 规划组件定制
   */
  private planComponentCustomizations(prdData: PRDGenerationData, strategy: FusionStrategy): ComponentCustomization[] {
    const customizations: ComponentCustomization[] = [];
    const baseComponents = strategy.primaryTemplate.componentLibrary;

    // 根据用户场景定制组件
    if (prdData.userScenarios) {
      prdData.userScenarios.forEach(scenario => {
        baseComponents.forEach(component => {
          if (scenario.scenario && scenario.scenario.toLowerCase().includes(component.type.toLowerCase())) {
            customizations.push({
              componentName: component.name,
              originalSpec: component,
              customizedSpec: {
                ...component,
                description: `${component.description}，针对${scenario.userType}的${scenario.scenario}场景优化`,
                useCase: scenario.scenario,
                implementation: `${component.implementation}，增加针对${scenario.painPoint}的解决方案`
              },
              prdRequirements: [scenario.scenario, scenario.painPoint || '']
            });
          }
        });
      });
    }

    return customizations;
  }

  /**
   * 规划交互增强
   */
  private planInteractionEnhancements(prdData: PRDGenerationData, strategy: FusionStrategy): InteractionEnhancement[] {
    const enhancements: InteractionEnhancement[] = [];
    const baseInteractions = strategy.primaryTemplate.interactionPatterns;

    // 根据痛点优化交互
    if (prdData.userScenarios) {
      prdData.userScenarios.forEach(scenario => {
        if (scenario.painPoint) {
          baseInteractions.forEach(interaction => {
            enhancements.push({
              interactionType: interaction.name,
              basePattern: interaction,
              enhancedPattern: {
                ...interaction,
                behavior: `${interaction.behavior}，特别优化以解决${scenario.painPoint}`,
                feedback: `${interaction.feedback}，提供明确的痛点解决反馈`,
                bestPractice: `${interaction.bestPractice}，针对${scenario.userType}的使用习惯优化`
              },
              prdSpecificNeeds: [scenario.painPoint]
            });
          });
        }
      });
    }

    return enhancements;
  }

  /**
   * 规划视觉调整
   */
  private planVisualAdjustments(prdData: PRDGenerationData, strategy: FusionStrategy): VisualAdjustment[] {
    const adjustments: VisualAdjustment[] = [];
    const baseVisual = strategy.primaryTemplate.visualStyle;

    // 根据产品定位调整视觉风格
    const productName = prdData.requirementSolution?.name || '';
    const isB2B = prdData.userScenarios?.some(s => 
      s.userType?.includes('企业') || s.userType?.includes('团队')
    );

    if (isB2B) {
      adjustments.push({
        aspect: '整体色调',
        referenceStyle: baseVisual.colorScheme,
        adaptedStyle: '采用更专业的商务色调，增强信任感和专业感',
        brandingConsiderations: ['B2B用户期望', '专业可信度', '企业级视觉规范']
      });
    }

    return adjustments;
  }

  /**
   * 规划业务逻辑集成
   */
  private planBusinessLogicIntegration(prdData: PRDGenerationData, strategy: FusionStrategy): BusinessLogicIntegration[] {
    const integrations: BusinessLogicIntegration[] = [];
    const baseLogic = strategy.primaryTemplate.businessLogic;

    // 将PRD业务需求映射到参考模板的业务逻辑
    if (prdData.requirementSolution?.requirements) {
      baseLogic.forEach(logic => {
        integrations.push({
          businessArea: logic.scenario,
          referenceLogic: logic.implementation,
          prdRequirements: prdData.requirementSolution?.requirements || '',
          integrationStrategy: `在${logic.scenario}基础上，融入PRD的具体业务需求，确保功能完整性和业务流程的合理性`
        });
      });
    }

    return integrations;
  }

  // ================== 提示词生成方法 ==================

  private generateSystemRole(): string {
    return `你是AI产品原型专家，专门基于优秀产品参考来生成高质量的HTML原型。

你的核心能力：
🎯 深度理解参考模板的设计精髓和最佳实践
🔧 智能融合多个参考模板的优势特性
📊 将PRD需求精准映射到具体的界面设计
⚡ 生成完整可用的HTML+CSS+JavaScript代码

你的工作原则：
✅ 参考优先：以优秀产品为设计基础，避免凭空想象
✅ PRD导向：确保生成结果准确体现PRD的核心需求
✅ 质量至上：每个细节都要达到生产级别的质量标准
✅ 用户中心：始终从目标用户的角度思考界面设计`;
  }

  private generateReferenceAnalysis(strategy: FusionStrategy): string {
    const primary = strategy.primaryTemplate;
    const secondaries = strategy.secondaryTemplates;

    return `## 参考模板深度分析

### 主要参考：${primary.name}
**产品类型**：${primary.category.name} - ${primary.category.description}
**行业背景**：${primary.industry.name} - ${primary.industry.description}
**核心优势**：
${this.formatTemplateStrengths(primary)}

**布局特点**：
- 结构组织：${primary.layoutStructure.structure}
- 导航模式：${primary.layoutStructure.navigationPattern}
- 内容安排：${primary.layoutStructure.contentOrganization}
- 响应式策略：${primary.layoutStructure.responsiveStrategy}

**关键组件**：
${primary.componentLibrary.slice(0, 5).map(comp => 
  `- ${comp.name}：${comp.description}`
).join('\n')}

**交互模式**：
${primary.interactionPatterns.slice(0, 3).map(pattern => 
  `- ${pattern.name}：${pattern.behavior}`
).join('\n')}

${secondaries.length > 0 ? `
### 辅助参考：
${secondaries.map(template => `
**${template.name}** (${template.category.name})
- 借鉴重点：${this.getSecondaryFocusPoints(template)}
- 融合价值：${this.getSecondaryValue(template)}
`).join('')}` : ''}

### 参考融合策略：${this.getFusionApproachDescription(strategy.fusionApproach)}`;
  }

  private generateAdaptationStrategy(plan: AdaptationPlan): string {
    return `## PRD适配策略

### 布局适配优化
${plan.layoutAdaptations.map(adaptation => `
**${adaptation.aspect}**
- 参考模式：${adaptation.originalPattern}
- 适配方案：${adaptation.adaptedPattern}
- 优化理由：${adaptation.reasoning}
`).join('')}

### 组件定制策略
${plan.componentCustomizations.slice(0, 3).map(custom => `
**${custom.componentName}定制**
- 原有规格：${custom.originalSpec.description}
- 定制方案：${custom.customizedSpec.description}
- PRD要求：${custom.prdRequirements.join('、')}
`).join('')}

### 交互体验增强
${plan.interactionEnhancements.slice(0, 3).map(enhancement => `
**${enhancement.interactionType}增强**
- 基础模式：${enhancement.basePattern.behavior}
- 增强方案：${enhancement.enhancedPattern.behavior}
- 针对需求：${enhancement.prdSpecificNeeds.join('、')}
`).join('')}

### 业务逻辑融合
${plan.businessLogicIntegration.slice(0, 2).map(integration => `
**${integration.businessArea}**
- 参考逻辑：${integration.referenceLogic}
- 融合策略：${integration.integrationStrategy}
`).join('')}`;
  }

  private generateTechnicalRequirements(strategy: FusionStrategy): string {
    const primary = strategy.primaryTemplate;
    
    return `## 技术实现要求

### 架构标准
- **单文件HTML**：完整的自包含HTML文件，包含CSS和JavaScript
- **CDN依赖**：使用Tailwind CSS CDN和必要的图标库
- **响应式设计**：${primary.layoutStructure.responsiveStrategy}
- **浏览器兼容**：支持现代浏览器，优雅降级

### 代码质量标准
- **HTML语义化**：使用正确的HTML5语义标签
- **CSS现代化**：使用Tailwind CSS类，语义化颜色变量
- **JavaScript模块化**：清晰的功能模块划分
- **性能优化**：图片懒加载、合理的DOM结构

### 视觉设计要求
- **色彩系统**：${primary.visualStyle.colorScheme}
- **字体层级**：${primary.visualStyle.typography}
- **间距规范**：${primary.visualStyle.spacing}
- **图标风格**：${primary.visualStyle.iconStyle}

### 交互功能要求
- **零占位符**：所有按钮和表单都必须有真实功能
- **状态管理**：使用localStorage进行数据持久化
- **错误处理**：完整的错误处理和用户反馈
- **加载状态**：合适的加载动画和状态提示`;
  }

  private generateQualityStandards(strategy: FusionStrategy): string {
    return `## 质量保障标准

### 参考一致性检查
- ✅ 布局结构体现参考模板的成熟设计
- ✅ 交互模式继承参考模板的优秀体验
- ✅ 视觉风格保持参考模板的专业水准
- ✅ 功能组织遵循参考模板的逻辑架构

### PRD契合度验证
- ✅ 核心功能100%覆盖PRD需求
- ✅ 用户场景在界面中得到充分体现
- ✅ 痛点解决方案在交互中清晰可见
- ✅ 目标用户的使用习惯得到考虑

### 功能完整性标准
- ✅ 所有按钮都有对应的功能实现
- ✅ 表单验证和提交流程完整
- ✅ 数据的增删改查操作可用
- ✅ 搜索、筛选、排序功能正常
- ✅ 模态框、下拉菜单等交互组件完整

### 用户体验质量
- ✅ 首次使用的直观性和易用性
- ✅ 常用功能的便捷性和效率
- ✅ 错误状态的友好性和指导性
- ✅ 加载过程的反馈性和流畅性
- ✅ 整体视觉的一致性和专业性`;
  }

  private generatePRDIntegration(prdData: PRDGenerationData, plan: AdaptationPlan): string {
    return `## PRD需求深度融合

### 产品核心价值
**产品名称**：${prdData.requirementSolution?.name || '待定义'}
**核心需求**：${prdData.requirementSolution?.requirements || ''}
**关键收益**：${prdData.requirementSolution?.keyBenefits || ''}

### 目标用户场景
${prdData.userScenarios?.map((scenario, index) => `
**场景${index + 1}：${scenario.userType}**
- 使用场景：${scenario.scenario}
- 核心痛点：${scenario.painPoint}
- 界面体现：需要在界面中突出解决这个痛点的功能入口和操作流程
`).join('') || ''}

### 竞争优势体现
${prdData.competitors?.map(competitor => `
**vs ${competitor.name}**
- 对比分析：${competitor.analysis}
- 差异化设计：在界面设计中体现相对于${competitor.name}的优势特性
`).join('') || ''}

### 功能优先级映射
根据PRD分析，功能实现的优先级顺序：
1. **核心功能**：${this.extractCoreFunctions(prdData)}
2. **重要功能**：${this.extractImportantFunctions(prdData)}
3. **辅助功能**：${this.extractSupportFunctions(prdData)}

每个功能都需要在界面中有明确的入口和完整的操作流程。`;
  }

  private generateOutputInstructions(customRequirements?: string): string {
    return `## 生成执行指令

### 思考过程（必须执行）
在开始编码前，请按以下步骤思考：

1. **参考理解**：深度分析主要参考模板的设计精髓
2. **需求映射**：将PRD需求映射到具体的界面元素
3. **融合策略**：确定如何融合参考模板和PRD需求
4. **架构规划**：设计页面结构和组件组织
5. **实现路径**：规划代码实现的具体步骤

### 代码生成要求
- **完整性**：生成完整的、可直接运行的HTML文件
- **真实性**：使用真实的、有意义的模拟数据
- **交互性**：确保所有交互元素都有实际功能
- **专业性**：代码质量达到生产级别标准
- **创新性**：在参考基础上体现PRD的独特价值

### 验证清单
生成完成后，请确认：
- [ ] 体现了主要参考模板的设计优势
- [ ] 覆盖了PRD的所有核心需求
- [ ] 所有交互功能都可正常使用
- [ ] 界面在不同设备上显示正常
- [ ] 代码结构清晰，注释充分

${customRequirements ? `
### 用户特殊要求
${customRequirements}
` : ''}

### 输出格式
请直接输出完整的HTML代码，用markdown代码块包裹：

\`\`\`html
<!-- 完整的HTML代码 -->
\`\`\``;
  }

  // ================== 辅助方法 ==================

  private formatTemplateStrengths(template: ReferenceTemplate): string {
    const strengths = [];
    
    if (template.qualityScore > 80) strengths.push('设计质量优秀');
    if (template.componentLibrary.length > 5) strengths.push('组件库丰富');
    if (template.interactionPatterns.length > 3) strengths.push('交互模式成熟');
    if (template.businessLogic.length > 2) strengths.push('业务逻辑完整');
    
    return strengths.map(s => `- ${s}`).join('\n');
  }

  private getSecondaryFocusPoints(template: ReferenceTemplate): string {
    return template.tags.slice(0, 3).join('、');
  }

  private getSecondaryValue(template: ReferenceTemplate): string {
    return `补充${template.category.name}领域的专业设计模式`;
  }

  private getFusionApproachDescription(approach: FusionStrategy['fusionApproach']): string {
    const descriptions = {
      'layout-focused': '以布局结构为主导的融合方式，重点保持参考模板的成熟布局逻辑',
      'component-focused': '以组件功能为核心的融合方式，重点复用参考模板的优秀组件',
      'interaction-focused': '以交互模式为重点的融合方式，重点学习参考模板的交互设计',
      'hybrid': '综合性融合方式，平衡考虑布局、组件、交互等各个方面'
    };
    
    return descriptions[approach];
  }

  private extractCoreFunctions(prdData: PRDGenerationData): string {
    const requirements = prdData.requirementSolution?.requirements || '';
    const corePatterns = ['管理', '创建', '查看', '编辑', '删除', '搜索'];
    const found = corePatterns.filter(pattern => requirements.includes(pattern));
    return found.slice(0, 3).join('、') || '数据管理';
  }

  private extractImportantFunctions(prdData: PRDGenerationData): string {
    return '用户权限、数据导出、通知提醒';
  }

  private extractSupportFunctions(prdData: PRDGenerationData): string {
    return '帮助文档、设置配置、统计分析';
  }
}

// ================== 导出实例 ==================

export const referenceFusionEngine = new ReferenceFusionEngine(); 