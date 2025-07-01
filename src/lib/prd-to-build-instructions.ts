import { PRDGenerationData } from './prd-generator';

/**
 * 产品愿景 - 核心价值主张
 */
export interface ProductVision {
  coreValue: string;           // 核心价值主张
  problemSolved: string;       // 解决的问题
  targetMarket: string;        // 目标市场
  differentiation: string;     // 差异化优势
}

/**
 * 用户画像 - 设计导向的用户信息
 */
export interface UserPersona {
  userType: string;           // 用户类型
  usageScenario: string;      // 使用场景
  painPoints: string[];       // 痛点列表
  goals: string[];            // 目标列表
  designImplications: string; // 设计启示
}

/**
 * 功能规格 - UI实现导向
 */
export interface FeatureSpec {
  featureName: string;        // 功能名称
  priority: 'high' | 'medium' | 'low'; // 优先级
  uiComponents: string[];     // 需要的UI组件
  interactions: string[];     // 交互需求
  userFlow: string;          // 用户流程
}

/**
 * 用户流程 - 核心任务流程
 */
export interface UserFlow {
  flowName: string;          // 流程名称
  steps: string[];           // 步骤列表
  pageNeeds: string[];       // 页面需求
}

/**
 * 设计规格 - 视觉和交互要求
 */
export interface DesignSpec {
  category: string;          // 设计类别
  requirements: string[];    // 具体要求
}

/**
 * 产品类型识别
 */
export type ProductType = 
  | 'saas-tool'           // SaaS工具类
  | 'social-platform'     // 社交平台
  | 'ecommerce'          // 电商平台
  | 'content-platform'   // 内容平台
  | 'dashboard'          // 仪表盘类
  | 'productivity-tool'  // 生产力工具
  | 'communication'      // 沟通协作
  | 'finance'           // 金融应用
  | 'health-fitness'    // 健康健身
  | 'education'         // 教育学习
  | 'other';            // 其他类型

/**
 * 构建指令 - 完整的产品构建蓝图
 */
export interface BuildInstructions {
  productVision: ProductVision;
  productType: ProductType;
  targetUsers: UserPersona[];
  keyFeatures: FeatureSpec[];
  userFlows: UserFlow[];
  designSpecs: DesignSpec[];
  buildingSummary: string;      // 构建摘要
}

/**
 * 智能产品类型推断 - 增强版
 */
function inferProductType(prd: PRDGenerationData): ProductType {
  const productName = prd.requirementSolution.sharedPrototype?.toLowerCase() || '';
  const description = prd.requirementSolution.sharedPrototype?.toLowerCase() || '';
  const features = prd.requirementSolution.requirements?.map(r => 
    `${r.name} ${r.features}`.toLowerCase()
  ).join(' ') || '';
  
  const allText = `${productName} ${description} ${features}`;
  
  // 加权关键词匹配逻辑
  const typeScores: Record<ProductType, number> = {
    'saas-tool': 0,
    'social-platform': 0,
    'ecommerce': 0,
    'content-platform': 0,
    'dashboard': 0,
    'productivity-tool': 0,
    'communication': 0,
    'finance': 0,
    'health-fitness': 0,
    'education': 0,
    'other': 0
  };
  
  // SaaS/工具类关键词
  const saasKeywords = ['任务', '项目', '管理', '系统', 'crm', 'erp', '工作流', 'workflow'];
  saasKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['saas-tool'] += 2;
  });
  
  // 社交平台关键词
  const socialKeywords = ['社交', '聊天', '分享', '社区', '朋友', '关注', '点赞', '评论', '动态'];
  socialKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['social-platform'] += 3;
  });
  
  // 电商关键词
  const ecommerceKeywords = ['购物', '电商', '商城', '支付', '订单', '商品', '购买', '库存', '店铺'];
  ecommerceKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['ecommerce'] += 3;
  });
  
  // 内容平台关键词
  const contentKeywords = ['内容', '文章', '视频', '媒体', '创作', '发布', '编辑', '博客'];
  contentKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['content-platform'] += 2;
  });
  
  // 仪表盘关键词
  const dashboardKeywords = ['数据', '分析', '报表', '统计', '图表', '监控', '指标', '可视化'];
  dashboardKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['dashboard'] += 3;
  });
  
  // 协作通讯关键词
  const commKeywords = ['协作', '团队', '会议', '通讯', '消息', '讨论', '共享'];
  commKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['communication'] += 2;
  });
  
  // 教育关键词
  const eduKeywords = ['学习', '教育', '课程', '培训', '考试', '知识', '教学'];
  eduKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['education'] += 3;
  });
  
  // 健康健身关键词
  const healthKeywords = ['健康', '运动', '健身', '医疗', '养生', '锻炼', '体重'];
  healthKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['health-fitness'] += 3;
  });
  
  // 金融关键词
  const financeKeywords = ['金融', '理财', '投资', '记账', '预算', '财务', '银行'];
  financeKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['finance'] += 3;
  });
  
  // 生产力工具关键词
  const productivityKeywords = ['效率', '工具', '自动化', '优化', '便捷', '快速'];
  productivityKeywords.forEach(keyword => {
    if (allText.includes(keyword)) typeScores['productivity-tool'] += 1;
  });
  
  // 找到得分最高的类型
  const maxScore = Math.max(...Object.values(typeScores));
  if (maxScore === 0) return 'saas-tool'; // 默认
  
  const topType = Object.entries(typeScores).find(([, score]) => score === maxScore)?.[0] as ProductType;
  return topType || 'saas-tool';
}

/**
 * 提取产品愿景
 */
function extractProductVision(prd: PRDGenerationData): ProductVision {
  const solution = prd.requirementSolution;
  
  // 从用户场景中提取主要痛点
  const mainPainPoints = prd.userScenarios?.map(s => s.painPoint).join('，') || '效率和便利性问题';
  
  // 从竞品分析中提取差异化优势
  const competitorFeatures = prd.competitors?.map(c => c.advantages).join('，') || '';
  const differentiation = competitorFeatures ? 
    `融合并超越现有解决方案的优势：${competitorFeatures}` : 
    '通过AI技术和用户体验优化提供更好的解决方案';
    
  return {
    coreValue: solution.sharedPrototype || '提供高效便捷的解决方案',
    problemSolved: mainPainPoints,
    targetMarket: prd.userScenarios?.map(s => s.userType).join('、') || '目标用户群体',
    differentiation
  };
}

/**
 * 转换用户场景为设计导向的用户画像
 */
function convertScenariosToPersonas(userScenarios: Array<{
  userType?: string;
  scenario?: string;
  painPoint?: string;
}>): UserPersona[] {
  return userScenarios?.map(scenario => {
    const painPoints = scenario.painPoint ? [scenario.painPoint] : [];
    const goals = scenario.scenario ? [scenario.scenario] : [];
    
    // 基于用户类型和场景推断设计启示
    let designImplications = '';
    if (scenario.userType?.includes('忙碌') || scenario.scenario?.includes('快速')) {
      designImplications = '需要简洁高效的界面，快速操作路径，减少认知负担';
    } else if (scenario.userType?.includes('团队') || scenario.scenario?.includes('协作')) {
      designImplications = '需要协作功能强调，实时状态展示，多人交互设计';
    } else if (scenario.userType?.includes('新手') || scenario.scenario?.includes('学习')) {
      designImplications = '需要清晰的引导流程，帮助文档，渐进式功能披露';
    } else {
      designImplications = '需要直观易用的界面，符合用户直觉的交互设计';
    }
    
    return {
      userType: scenario.userType || '目标用户',
      usageScenario: scenario.scenario || '日常使用场景',
      painPoints,
      goals,
      designImplications
    };
  }) || [];
}

/**
 * 转换需求为功能规格
 */
function transformRequirementsToSpecs(requirementSolution: { requirements?: Array<{ name?: string; features?: string }> }): FeatureSpec[] {
  return requirementSolution.requirements?.map((req) => {
    // 基于功能名称推断UI组件需求
    const featureName = req.name || '';
    const features = req.features || '';
    const uiComponents: string[] = [];
    const interactions: string[] = [];
    
    // 智能推断UI组件
    if (featureName.includes('管理') || features.includes('列表')) {
      uiComponents.push('数据表格', '搜索框', '筛选器', '操作按钮');
      interactions.push('排序', '筛选', '批量操作', '详情查看');
    }
    if (featureName.includes('创建') || featureName.includes('添加') || features.includes('表单')) {
      uiComponents.push('表单组件', '输入框', '下拉选择', '提交按钮');
      interactions.push('表单验证', '自动保存', '提交反馈');
    }
    if (featureName.includes('分析') || featureName.includes('统计') || features.includes('数据')) {
      uiComponents.push('图表组件', '仪表盘', '数据卡片', '筛选控件');
      interactions.push('数据钻取', '时间范围选择', '图表交互');
    }
    if (featureName.includes('协作') || featureName.includes('分享')) {
      uiComponents.push('用户头像', '权限设置', '共享链接', '评论区域');
      interactions.push('权限管理', '实时协作', '消息通知');
    }
    
    // 默认基础组件
    if (uiComponents.length === 0) {
      uiComponents.push('卡片组件', '按钮', '图标');
      interactions.push('点击操作', '状态切换');
    }
    
    // 构建用户流程描述
    const userFlow = `用户通过${uiComponents.join('、')}来完成${featureName}功能`;
    
    return {
      featureName: featureName,
      priority: 'high' as const, // 所有PRD中的需求都认为是高优先级
      uiComponents,
      interactions,
      userFlow
    };
  }) || [];
}

/**
 * 生成用户流程
 */
function generateUserFlows(userScenarios: Array<{ userType?: string; scenario?: string; painPoint?: string }>): UserFlow[] {
  const flows: UserFlow[] = [];
  
  // 主要用户流程
  flows.push({
    flowName: '核心功能使用流程',
    steps: [
      '用户登录或注册',
      '浏览主界面，了解功能布局',
      '使用主要功能完成任务',
      '查看结果或保存工作',
      '需要时进行设置或配置'
    ],
    pageNeeds: [
      '登录注册页面',
      '主界面/仪表盘',
      '功能操作页面',
      '结果展示页面',
      '设置配置页面'
    ]
  });
  
  // 基于用户场景的特定流程
  userScenarios?.forEach(scenario => {
    if (scenario.scenario) {
      flows.push({
        flowName: `${scenario.userType}的使用流程`,
        steps: [
          `${scenario.userType}面临${scenario.painPoint}`,
          '打开应用寻找解决方案',
          '使用相应功能解决问题',
          '查看处理结果',
          '完成任务或继续其他操作'
        ],
        pageNeeds: [
          '问题识别界面',
          '功能导航界面',
          '操作执行界面',
          '结果反馈界面'
        ]
      });
    }
  });
  
  return flows;
}

/**
 * 行业最佳实践模板库
 */
interface BestPracticeTemplate {
  type: ProductType;
  coreComponents: string[];
  essentialFeatures: string[];
  uxPatterns: string[];
  technicalRequirements: string[];
}

const BEST_PRACTICE_TEMPLATES: Record<ProductType, BestPracticeTemplate> = {
  'saas-tool': {
    type: 'saas-tool',
    coreComponents: ['侧边栏导航', '主工作区', '数据表格', '搜索筛选', '设置面板'],
    essentialFeatures: ['用户权限管理', '数据导入导出', '批量操作', '操作历史', '通知系统'],
    uxPatterns: ['面包屑导航', '操作确认弹窗', '批量选择', '快捷键支持', '拖拽排序'],
    technicalRequirements: ['响应式布局', '数据分页', '实时搜索', '操作撤销', '自动保存']
  },
  'social-platform': {
    type: 'social-platform',
    coreComponents: ['顶部导航', '内容流', '用户头像', '互动按钮', '评论区域'],
    essentialFeatures: ['内容发布', '点赞评论', '用户关注', '消息通知', '内容分享'],
    uxPatterns: ['无限滚动', '下拉刷新', '点赞动画', '表情选择器', '图片预览'],
    technicalRequirements: ['图片压缩上传', '实时消息推送', '内容懒加载', '敏感词过滤', '缓存策略']
  },
  'ecommerce': {
    type: 'ecommerce',
    coreComponents: ['商品展示', '购物车', '筛选器', '支付界面', '订单管理'],
    essentialFeatures: ['商品搜索', '购物车管理', '订单追踪', '支付处理', '评价系统'],
    uxPatterns: ['商品轮播', '规格选择', '价格计算', '库存提示', '推荐算法'],
    technicalRequirements: ['支付安全', '库存同步', '物流接口', '优惠计算', '订单状态机']
  },
  'dashboard': {
    type: 'dashboard',
    coreComponents: ['关键指标卡片', '图表组件', '筛选控件', '导出按钮', '刷新机制'],
    essentialFeatures: ['数据可视化', '时间范围选择', '报表导出', '数据钻取', '告警通知'],
    uxPatterns: ['图表交互', '数据联动', '工具提示', '全屏查看', '自定义配置'],
    technicalRequirements: ['数据聚合', '实时更新', '图表库集成', '数据缓存', '权限控制']
  },
  'content-platform': {
    type: 'content-platform',
    coreComponents: ['编辑器', '内容列表', '分类标签', '搜索框', '发布按钮'],
    essentialFeatures: ['富文本编辑', '媒体管理', '内容分类', '发布调度', 'SEO优化'],
    uxPatterns: ['自动保存', '版本控制', '协作编辑', '内容预览', '标签管理'],
    technicalRequirements: ['富文本处理', '文件存储', 'CDN集成', '搜索引擎', '版本管理']
  },
  'education': {
    type: 'education',
    coreComponents: ['课程列表', '视频播放器', '练习题', '进度追踪', '证书系统'],
    essentialFeatures: ['课程管理', '学习进度', '作业提交', '成绩查看', '讨论区'],
    uxPatterns: ['进度条', '知识点导航', '互动练习', '学习路径', '成就系统'],
    technicalRequirements: ['视频流媒体', '学习分析', '防作弊机制', '移动适配', '离线支持']
  },
  'health-fitness': {
    type: 'health-fitness',
    coreComponents: ['数据仪表盘', '目标设置', '记录输入', '图表展示', '提醒通知'],
    essentialFeatures: ['健康记录', '目标跟踪', '数据分析', '提醒设置', '专家建议'],
    uxPatterns: ['快速记录', '数据可视化', '趋势分析', '激励机制', '分享功能'],
    technicalRequirements: ['设备集成', '数据同步', '隐私保护', '算法推荐', '离线记录']
  },
  'finance': {
    type: 'finance',
    coreComponents: ['账户概览', '交易记录', '预算管理', '图表分析', '安全设置'],
    essentialFeatures: ['收支记录', '分类管理', '预算控制', '财务报表', '安全认证'],
    uxPatterns: ['快速记账', '智能分类', '预算警告', '数据加密', '双重验证'],
    technicalRequirements: ['数据加密', '备份恢复', '银行API', '风控系统', '合规审计']
  },
  'communication': {
    type: 'communication',
    coreComponents: ['消息列表', '聊天界面', '联系人', '文件传输', '视频通话'],
    essentialFeatures: ['即时消息', '群组聊天', '文件分享', '语音通话', '状态管理'],
    uxPatterns: ['消息气泡', '输入状态', '已读回执', '表情包', '消息搜索'],
    technicalRequirements: ['实时通信', '消息加密', '文件存储', '推送通知', '离线消息']
  },
  'productivity-tool': {
    type: 'productivity-tool',
    coreComponents: ['工具栏', '工作区', '快捷操作', '设置面板', '帮助系统'],
    essentialFeatures: ['效率工具', '自动化流程', '快捷键', '模板系统', '数据同步'],
    uxPatterns: ['工具提示', '快捷操作', '批量处理', '模板应用', '自动完成'],
    technicalRequirements: ['性能优化', '跨平台', '插件系统', '数据备份', 'API集成']
  },
  'other': {
    type: 'other',
    coreComponents: ['主导航', '内容区域', '操作按钮', '状态显示', '帮助信息'],
    essentialFeatures: ['基础功能', '用户界面', '数据管理', '系统设置', '用户帮助'],
    uxPatterns: ['标准导航', '表单交互', '列表展示', '状态反馈', '错误处理'],
    technicalRequirements: ['基础架构', '数据存储', '用户认证', '错误处理', '性能监控']
  }
};

/**
 * 生成设计规格
 */
function generateDesignSpecs(productType: ProductType, userPersonas: UserPersona[]): DesignSpec[] {
  const specs: DesignSpec[] = [
    {
      category: '整体视觉风格',
      requirements: [
        '现代简洁的设计语言',
        '一致的颜色系统和字体层级',
        '支持明暗两种主题模式',
        '品牌色彩的合理运用'
      ]
    },
    {
      category: '响应式设计',
      requirements: [
        '移动端优先的响应式布局',
        '适配桌面、平板、手机三种设备',
        '触控友好的交互设计',
        '合理的信息密度控制'
      ]
    },
    {
      category: '无障碍访问',
      requirements: [
        '所有交互元素可键盘访问',
        '适当的颜色对比度',
        '语义化的HTML结构',
        '屏幕阅读器支持'
      ]
    }
  ];
  
  // 基于产品类型添加特定设计要求
  switch (productType) {
    case 'saas-tool':
      specs.push({
        category: 'SaaS工具特定要求',
        requirements: [
          '清晰的导航结构',
          '高效的数据展示',
          '快速的操作反馈',
          '专业的商务风格'
        ]
      });
      break;
    case 'social-platform':
      specs.push({
        category: '社交平台特定要求',
        requirements: [
          '友好的社交元素设计',
          '内容流的优雅展示',
          '互动功能的突出设计',
          '个性化的用户体验'
        ]
      });
      break;
    case 'ecommerce':
      specs.push({
        category: '电商平台特定要求',
        requirements: [
          '商品展示的视觉吸引力',
          '清晰的购买流程设计',
          '信任感的建立',
          '转化导向的界面设计'
        ]
      });
      break;
  }
  
  // 基于用户画像添加特定要求
  const hasBusinessUsers = userPersonas.some(p => 
    p.userType.includes('企业') || p.userType.includes('商务') || p.userType.includes('团队')
  );
  if (hasBusinessUsers) {
    specs.push({
      category: '企业级用户要求',
      requirements: [
        '专业可信的视觉设计',
        '数据安全的视觉暗示',
        '高效的批量操作设计',
        '权限控制的清晰展示'
      ]
    });
  }
  
  return specs;
}

/**
 * 生成构建摘要
 */
function generateBuildingSummary(
  productVision: ProductVision,
  productType: ProductType,
  keyFeatures: FeatureSpec[]
): string {
  const featureNames = keyFeatures.map(f => f.featureName).join('、');
  
  return `
构建一个${productType === 'saas-tool' ? 'SaaS工具类' : 
         productType === 'social-platform' ? '社交平台类' :
         productType === 'ecommerce' ? '电商平台类' :
         productType === 'dashboard' ? '数据仪表盘类' :
         '应用类'}产品原型。

核心价值：${productVision.coreValue}

主要功能模块：${featureNames}

构建重点：
1. 解决用户痛点：${productVision.problemSolved}
2. 体现差异化优势：${productVision.differentiation}
3. 提供完整的用户交互体验
4. 确保界面专业且易用

这不是一个文档展示页面，而是一个真正的产品应用原型，用户可以通过它体验产品的核心功能和价值。
`.trim();
}

/**
 * 融合最佳实践增强功能规格
 */
function enhanceWithBestPractices(features: FeatureSpec[], template: BestPracticeTemplate): FeatureSpec[] {
  // 为现有功能增加最佳实践组件
  const enhancedFeatures = features.map(feature => ({
    ...feature,
    uiComponents: [...new Set([...feature.uiComponents, ...template.coreComponents])],
    interactions: [...new Set([...feature.interactions, ...template.uxPatterns])]
  }));
  
  // 添加行业标准功能（如果PRD中没有）
  const existingFeatureNames = features.map(f => f.featureName.toLowerCase());
  
  template.essentialFeatures.forEach(essentialFeature => {
    const exists = existingFeatureNames.some(name => 
      name.includes(essentialFeature.toLowerCase()) || 
      essentialFeature.toLowerCase().includes(name)
    );
    
    if (!exists) {
      enhancedFeatures.push({
        featureName: essentialFeature,
        priority: 'medium' as const,
        uiComponents: template.coreComponents.slice(0, 3), // 取前3个核心组件
        interactions: template.uxPatterns.slice(0, 3), // 取前3个交互模式
        userFlow: `用户通过${template.coreComponents[0]}访问${essentialFeature}功能`
      });
    }
  });
  
  return enhancedFeatures;
}

/**
 * 生成增强的设计规格（融合最佳实践）
 */
function generateEnhancedDesignSpecs(
  productType: ProductType, 
  userPersonas: UserPersona[], 
  template: BestPracticeTemplate
): DesignSpec[] {
  const specs = generateDesignSpecs(productType, userPersonas);
  
  // 添加技术要求规格
  specs.push({
    category: '技术实现要求',
    requirements: template.technicalRequirements
  });
  
  // 添加核心组件规格
  specs.push({
    category: '核心组件要求',
    requirements: template.coreComponents.map(comp => `必须实现${comp}组件`)
  });
  
  // 添加UX模式规格
  specs.push({
    category: 'UX交互模式',
    requirements: template.uxPatterns.map(pattern => `实现${pattern}交互模式`)
  });
  
  return specs;
}

/**
 * 主转换函数：将PRD数据转换为构建指令（增强版）
 */
export function transformPRDToBuildInstructions(prd: PRDGenerationData): BuildInstructions {
  // 1. 推断产品类型
  const productType = inferProductType(prd);
  
  // 2. 获取最佳实践模板
  const bestPracticeTemplate = BEST_PRACTICE_TEMPLATES[productType];
  
  // 3. 提取产品愿景
  const productVision = extractProductVision(prd);
  
  // 4. 转换用户场景为设计导向的用户画像
  const targetUsers = convertScenariosToPersonas(prd.userScenarios || []);
  
  // 5. 转换需求为功能规格（融合最佳实践）
  const keyFeatures = enhanceWithBestPractices(
    transformRequirementsToSpecs(prd.requirementSolution),
    bestPracticeTemplate
  );
  
  // 6. 生成用户流程
  const userFlows = generateUserFlows(prd.userScenarios || []);
  
  // 7. 生成设计规格（融合最佳实践）
  const designSpecs = generateEnhancedDesignSpecs(productType, targetUsers, bestPracticeTemplate);
  
  // 8. 生成构建摘要
  const buildingSummary = generateBuildingSummary(productVision, productType, keyFeatures);
  
  return {
    productVision,
    productType,
    targetUsers,
    keyFeatures,
    userFlows,
    designSpecs,
    buildingSummary
  };
}

/**
 * 导出构建指令为可读的文本格式
 */
export function buildInstructionsToText(instructions: BuildInstructions): string {
  return `
# 产品构建指令

## 产品愿景
- 核心价值：${instructions.productVision.coreValue}
- 解决问题：${instructions.productVision.problemSolved}
- 目标市场：${instructions.productVision.targetMarket}
- 差异化优势：${instructions.productVision.differentiation}

## 产品类型
${instructions.productType}

## 目标用户
${instructions.targetUsers.map(user => `
### ${user.userType}
- 使用场景：${user.usageScenario}
- 主要痛点：${user.painPoints.join('、')}
- 目标：${user.goals.join('、')}
- 设计启示：${user.designImplications}
`).join('')}

## 核心功能
${instructions.keyFeatures.map(feature => `
### ${feature.featureName} (${feature.priority}优先级)
- UI组件：${feature.uiComponents.join('、')}
- 交互需求：${feature.interactions.join('、')}
- 用户流程：${feature.userFlow}
`).join('')}

## 用户流程
${instructions.userFlows.map(flow => `
### ${flow.flowName}
步骤：${flow.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
页面需求：${flow.pageNeeds.join('、')}
`).join('')}

## 设计规格
${instructions.designSpecs.map(spec => `
### ${spec.category}
${spec.requirements.map(req => `- ${req}`).join('\n')}
`).join('')}

## 构建摘要
${instructions.buildingSummary}
`.trim();
} 