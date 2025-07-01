import { PRDGenerationData } from '@/lib/prd-generator';

// 智能任务管理应用模板
export const taskManagementTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '一个智能任务管理应用，帮助用户高效管理日常任务和项目，通过AI智能提醒和自动分类功能，提升工作效率。',
    'c1_business_line': '生产力工具',
    'c1_product_manager': '张小明',
    'c1_frontend_dev': '李小华',
    'c1_backend_dev': '王小刚',
    'c1_data_analyst': '陈小美',
    'c2_requirement_goal': '帮助用户将工作效率提升30%，减少任务遗漏率至5%以下，提供直观易用的任务管理界面',
    'c5_related_docs': 'https://example.com/api-docs, https://example.com/design-guide'
  },
  changeRecords: [
    {
      version: '1.0',
      modifier: '张小明',
      date: '2024-01-15',
      reason: '初始版本创建',
      content: '创建基础任务管理功能'
    },
    {
      version: '1.1',
      modifier: '李小华',
      date: '2024-01-20',
      reason: '增加AI功能',
      content: '添加智能分类和提醒功能'
    }
  ],
  userScenarios: [
    {
      userType: '职场白领',
      scenario: '每天需要管理多个项目和任务，经常在不同工具间切换',
      painPoint: '现有工具功能分散，操作复杂，容易遗漏重要任务'
    },
    {
      userType: '项目经理',
      scenario: '需要跟踪团队成员的任务进度，协调项目时间线',
      painPoint: '缺乏统一的项目视图，难以实时了解项目状态'
    },
    {
      userType: '自由职业者',
      scenario: '管理多个客户项目，需要精确的时间追踪',
      painPoint: '难以平衡不同客户的优先级，时间管理效率低'
    }
  ],
  iterationHistory: [
    {
      version: '0.1',
      author: '产品团队',
      date: '2024-01-01',
      content: '完成市场调研和用户访谈'
    },
    {
      version: '0.5',
      author: '设计团队',
      date: '2024-01-10',
      content: '完成UI/UX设计稿'
    }
  ],
  competitors: [
    {
      name: 'Todoist',
      features: '任务管理、项目协作、自然语言处理',
      advantages: '界面简洁、功能丰富、跨平台同步',
      disadvantages: '高级功能需要付费、缺乏时间追踪',
      marketPosition: '市场领导者，全球用户超过2500万'
    },
    {
      name: 'Notion',
      features: '文档编辑、数据库、任务管理、团队协作',
      advantages: '功能全面、自定义程度高、模板丰富',
      disadvantages: '学习成本高、移动端体验一般',
      marketPosition: '快速增长的全能型工具，估值100亿美元'
    },
    {
      name: 'Asana',
      features: '项目管理、团队协作、时间线视图',
      advantages: '项目管理功能强大、团队协作体验好',
      disadvantages: '个人用户功能相对简单、价格较高',
      marketPosition: '企业级项目管理工具的主要竞争者'
    }
  ],
  requirementSolution: {
    sharedPrototype: '智能任务管理系统 - 基于AI的高效任务管理平台',
    requirements: [
      {
        name: '智能任务创建',
        priority: 'High',
        features: '自然语言输入、AI自动分类、智能标签建议',
        businessLogic: '用户输入任务描述，AI分析内容自动分配分类和优先级',
        dataRequirements: '任务标题、描述、截止时间、分类、优先级、标签',
        edgeCases: '网络断开时离线创建、语音输入识别错误处理',
        painPoints: '传统工具需要手动填写多个字段，操作繁琐',
        modules: '任务管理模块、AI分析模块',
        openIssues: 'AI分类准确性需要持续优化'
      },
      {
        name: '智能提醒系统',
        priority: 'High',
        features: '基于用户习惯的智能提醒、多渠道通知',
        businessLogic: '分析用户完成任务的时间模式，在最佳时机发送提醒',
        dataRequirements: '用户行为数据、任务完成历史、偏好设置',
        edgeCases: '用户时区变更、设备通知权限被拒绝',
        painPoints: '固定时间提醒经常被忽略，效果不佳',
        modules: '通知模块、数据分析模块',
        openIssues: '如何平衡提醒频率和用户体验'
      },
      {
        name: '项目协作看板',
        priority: 'Middle',
        features: '可视化项目进度、团队成员分工、实时同步',
        businessLogic: '采用看板模式展示项目状态，支持拖拽操作',
        dataRequirements: '项目信息、任务状态、成员权限、操作日志',
        edgeCases: '多人同时编辑冲突、网络同步失败',
        painPoints: '团队协作缺乏透明度，进度难以追踪',
        modules: '协作模块、同步模块',
        openIssues: '实时协作的性能优化'
      }
    ]
  }
};

// 在线学习平台模板
export const learningPlatformTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '一个智能在线学习平台，通过AI个性化推荐课程内容，提供沉浸式学习体验，帮助用户快速掌握新技能。',
    'c1_business_line': '在线教育',
    'c1_product_manager': '王教育',
    'c1_frontend_dev': '李前端',
    'c1_backend_dev': '张后端',
    'c1_data_analyst': '陈数据',
    'c2_requirement_goal': '提升用户学习完成率至80%，平均学习时长增加50%，构建个性化学习路径',
    'c5_related_docs': 'https://example.com/edu-api, https://example.com/learning-analytics'
  },
  changeRecords: [
    {
      version: '1.0',
      modifier: '王教育',
      date: '2024-02-01',
      reason: '教育产品初版',
      content: '基础课程播放和用户管理功能'
    },
    {
      version: '1.2',
      modifier: '李前端',
      date: '2024-02-15',
      reason: '用户体验优化',
      content: '增加交互式学习组件和进度追踪'
    }
  ],
  userScenarios: [
    {
      userType: '在校学生',
      scenario: '需要补充课堂知识，准备考试和提升技能',
      painPoint: '课程内容与实际需求不匹配，学习进度难以把控'
    },
    {
      userType: '职场人士',
      scenario: '利用碎片时间学习新技能，提升职业竞争力',
      painPoint: '时间有限，需要高效的学习路径和实用的课程内容'
    },
    {
      userType: '教育工作者',
      scenario: '创建和分享课程内容，与学生互动交流',
      painPoint: '缺乏有效的教学工具和学生学习数据分析'
    }
  ],
  iterationHistory: [
    {
      version: '0.1',
      author: '教育团队',
      date: '2024-01-15',
      content: '完成教育市场调研和用户画像分析'
    },
    {
      version: '0.8',
      author: '技术团队',
      date: '2024-01-25',
      content: '完成核心学习引擎开发'
    }
  ],
  competitors: [
    {
      name: 'Coursera',
      features: '大学课程、专业证书、在线学位',
      advantages: '顶级大学合作、权威认证、课程质量高',
      disadvantages: '价格偏高、中文课程相对较少',
      marketPosition: '全球领先的在线学习平台，用户超过1亿'
    },
    {
      name: '腾讯课堂',
      features: '职业技能培训、直播授课、社群学习',
      advantages: '本土化程度高、技能类课程丰富、社交功能强',
      disadvantages: '课程质量参差不齐、缺乏系统性学习路径',
      marketPosition: '中国市场主要玩家，注册用户超过4亿'
    },
    {
      name: 'Khan Academy',
      features: 'K-12教育、练习系统、进度追踪',
      advantages: '完全免费、个性化学习、优秀的可视化',
      disadvantages: '主要针对基础教育、缺乏职业技能课程',
      marketPosition: '非营利性教育平台，全球影响力巨大'
    }
  ],
  requirementSolution: {
    sharedPrototype: '智能学习平台 - AI驱动的个性化在线教育系统',
    requirements: [
      {
        name: 'AI个性化推荐',
        priority: 'High',
        features: '学习路径推荐、内容个性化、难度自适应',
        businessLogic: '基于用户学习行为和能力评估，动态调整学习内容和难度',
        dataRequirements: '用户学习历史、能力评估、偏好设置、课程标签',
        edgeCases: '新用户冷启动、跨领域学习、学习兴趣变化',
        painPoints: '千篇一律的课程安排，学习效率低下',
        modules: '推荐引擎、用户画像、课程管理',
        openIssues: '推荐算法的准确性和多样性平衡'
      },
      {
        name: '互动学习体验',
        priority: 'High',
        features: '实时问答、编程练习、虚拟实验室',
        businessLogic: '通过多种互动形式提升学习参与度和知识吸收率',
        dataRequirements: '交互数据、学习成果、实时反馈',
        edgeCases: '网络延迟、设备兼容性、并发用户过多',
        painPoints: '被动学习，缺乏实践机会',
        modules: '互动组件、实验环境、评估系统',
        openIssues: '复杂实验环境的性能优化'
      },
      {
        name: '学习社区',
        priority: 'Middle',
        features: '学习小组、讨论论坛、同伴互助',
        businessLogic: '构建学习者社区，促进知识分享和协作学习',
        dataRequirements: '用户关系、讨论内容、互动记录',
        edgeCases: '内容审核、恶意用户、隐私保护',
        painPoints: '孤立学习，缺乏交流和激励',
        modules: '社交系统、内容管理、社区治理',
        openIssues: '社区活跃度的长期维持'
      }
    ]
  }
};

// 电商平台模板
export const ecommerceTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '新一代智能电商平台，融合AR试用、AI导购和社交购物功能，为用户提供沉浸式购物体验。',
    'c1_business_line': '电子商务',
    'c1_product_manager': '刘商务',
    'c1_frontend_dev': '赵前端',
    'c1_backend_dev': '钱后端',
    'c1_data_analyst': '孙分析',
    'c2_requirement_goal': '提升用户购买转化率至15%，平均客单价增长25%，构建差异化购物体验',
    'c5_related_docs': 'https://example.com/payment-api, https://example.com/logistics-guide'
  },
  changeRecords: [
    {
      version: '1.0',
      modifier: '刘商务',
      date: '2024-03-01',
      reason: '电商平台基础版本',
      content: '商品展示、购物车、支付功能'
    },
    {
      version: '1.3',
      modifier: '赵前端',
      date: '2024-03-18',
      reason: '增强用户体验',
      content: 'AR试用功能和个性化推荐'
    }
  ],
  userScenarios: [
    {
      userType: '时尚爱好者',
      scenario: '追求潮流商品，重视商品展示效果和社交分享',
      painPoint: '无法真实感受商品质感，购买决策困难'
    },
    {
      userType: '家庭主妇',
      scenario: '注重性价比，需要快速找到实用的家居用品',
      painPoint: '商品信息不够详细，比价过程繁琐'
    },
    {
      userType: '数码发烧友',
      scenario: '关注最新科技产品，需要专业的产品评测和对比',
      painPoint: '缺乏专业导购，难以获得深度产品信息'
    }
  ],
  iterationHistory: [
    {
      version: '0.1',
      author: '商务团队',
      date: '2024-02-15',
      content: '完成电商市场分析和竞品调研'
    },
    {
      version: '0.7',
      author: '技术团队',
      date: '2024-02-28',
      content: '完成核心交易系统开发'
    }
  ],
  competitors: [
    {
      name: '淘宝',
      features: 'C2C交易、直播带货、社区互动',
      advantages: '商品丰富、价格优势、社交属性强',
      disadvantages: '商品质量参差不齐、假货问题',
      marketPosition: '中国最大的电商平台，月活用户超过8亿'
    },
    {
      name: '京东',
      features: 'B2C交易、物流配送、金融服务',
      advantages: '商品品质保证、物流速度快、服务完善',
      disadvantages: '价格相对较高、商品种类相对较少',
      marketPosition: '中国第二大电商平台，以品质和服务著称'
    },
    {
      name: 'Amazon',
      features: '全球购、云服务、Prime会员',
      advantages: '全球化布局、技术实力强、生态完善',
      disadvantages: '本土化程度低、物流成本高',
      marketPosition: '全球最大的电商平台，技术创新引领者'
    }
  ],
  requirementSolution: {
    sharedPrototype: '智能电商平台 - AR+AI驱动的新零售体验',
    requirements: [
      {
        name: 'AR虚拟试用',
        priority: 'High',
        features: 'AR试穿试戴、3D商品展示、虚拟场景搭配',
        businessLogic: '通过AR技术让用户在购买前真实体验商品效果',
        dataRequirements: '3D商品模型、用户面部/身体数据、场景模板',
        edgeCases: '设备兼容性、光线条件、模型精度',
        painPoints: '无法提前体验商品效果，退换货率高',
        modules: 'AR引擎、3D渲染、图像识别',
        openIssues: 'AR技术在低端设备上的性能优化'
      },
      {
        name: 'AI智能导购',
        priority: 'High',
        features: '个性化推荐、智能客服、购买决策辅助',
        businessLogic: '基于用户行为和偏好提供个性化的购物建议',
        dataRequirements: '用户画像、商品属性、交易历史、浏览行为',
        edgeCases: '新用户推荐、季节性商品、库存变化',
        painPoints: '商品选择困难，缺乏专业导购建议',
        modules: '推荐算法、对话系统、决策引擎',
        openIssues: '推荐多样性与商业收益的平衡'
      },
      {
        name: '社交购物',
        priority: 'Middle',
        features: '好友推荐、拼团购买、购物分享',
        businessLogic: '通过社交网络的影响力促进商品传播和销售',
        dataRequirements: '社交关系、分享数据、群体偏好',
        edgeCases: '隐私保护、恶意营销、虚假评价',
        painPoints: '购物决策孤立，缺乏社交互动',
        modules: '社交系统、分享机制、群组管理',
        openIssues: '社交功能与购物体验的融合度'
      }
    ]
  }
};

// 健康管理应用模板
export const healthManagementTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '智能健康管理应用，集成可穿戴设备数据，提供个性化健康建议和疾病预防方案，助力用户科学管理健康。',
    'c1_business_line': '医疗健康',
    'c1_product_manager': '李健康',
    'c1_frontend_dev': '周界面',
    'c1_backend_dev': '吴服务',
    'c1_data_analyst': '郑数据',
    'c2_requirement_goal': '帮助用户建立健康生活习惯，早期发现健康风险，提升整体健康水平15%',
    'c5_related_docs': 'https://example.com/health-api, https://example.com/medical-guidelines'
  },
  changeRecords: [
    {
      version: '1.0',
      modifier: '李健康',
      date: '2024-04-01',
      reason: '健康应用初版发布',
      content: '基础健康数据记录和分析功能'
    },
    {
      version: '1.1',
      modifier: '周界面',
      date: '2024-04-10',
      reason: '增强用户体验',
      content: '可视化健康报告和智能提醒'
    }
  ],
  userScenarios: [
    {
      userType: '中年白领',
      scenario: '工作压力大，关注心血管健康，需要健康风险评估',
      painPoint: '缺乏专业健康指导，不知道如何预防疾病'
    },
    {
      userType: '健身爱好者',
      scenario: '定期运动，希望优化训练计划和营养搭配',
      painPoint: '数据分散在不同设备，缺乏综合分析'
    },
    {
      userType: '慢性病患者',
      scenario: '需要长期监测健康指标，遵循医嘱管理病情',
      painPoint: '数据记录繁琐，难以坚持长期监测'
    }
  ],
  iterationHistory: [
    {
      version: '0.1',
      author: '医疗团队',
      date: '2024-03-15',
      content: '完成健康管理需求调研和医疗法规研究'
    },
    {
      version: '0.6',
      author: '算法团队',
      date: '2024-03-25',
      content: '完成健康风险评估模型开发'
    }
  ],
  competitors: [
    {
      name: 'Apple Health',
      features: '健康数据整合、医疗记录、紧急SOS',
      advantages: '生态系统完整、数据安全性高、医疗机构合作',
      disadvantages: '仅限iOS平台、个性化建议相对简单',
      marketPosition: '移动健康管理的领导者，深度集成Apple生态'
    },
    {
      name: '薄荷健康',
      features: '饮食记录、运动追踪、社区互动',
      advantages: '本土化程度高、用户基数大、内容丰富',
      disadvantages: '功能相对基础、缺乏深度医疗服务',
      marketPosition: '中国主流健康管理应用，用户超过2亿'
    },
    {
      name: 'Fitbit',
      features: '运动追踪、睡眠监测、心率监控',
      advantages: '硬件设备优秀、数据准确性高、续航能力强',
      disadvantages: '软件生态相对薄弱、缺乏医疗级功能',
      marketPosition: '可穿戴设备市场的重要玩家'
    }
  ],
  requirementSolution: {
    sharedPrototype: '智能健康管家 - AI驱动的个人健康管理系统',
    requirements: [
      {
        name: '健康数据整合',
        priority: 'High',
        features: '多设备数据同步、健康档案管理、数据可视化',
        businessLogic: '整合各类健康设备和应用的数据，形成完整的健康画像',
        dataRequirements: '生理指标、运动数据、饮食记录、睡眠质量',
        edgeCases: '设备连接失败、数据异常、隐私保护',
        painPoints: '健康数据分散，无法形成整体视图',
        modules: '数据采集、设备管理、隐私保护',
        openIssues: '不同设备数据标准的统一'
      },
      {
        name: '智能健康评估',
        priority: 'High',
        features: 'AI健康分析、风险预警、个性化建议',
        businessLogic: '基于健康数据和医学知识库，提供专业的健康评估',
        dataRequirements: '历史健康数据、医学知识库、用户基本信息',
        edgeCases: '数据不完整、异常值处理、医疗免责',
        painPoints: '缺乏专业健康指导，无法及时发现健康风险',
        modules: 'AI分析引擎、知识库、预警系统',
        openIssues: 'AI建议的医疗准确性和法律责任'
      },
      {
        name: '健康计划管理',
        priority: 'Middle',
        features: '目标设定、计划制定、进度追踪',
        businessLogic: '帮助用户制定和执行个性化的健康改善计划',
        dataRequirements: '健康目标、执行计划、完成进度',
        edgeCases: '目标调整、计划中断、动机维持',
        painPoints: '健康计划难以坚持，缺乏有效监督',
        modules: '目标管理、计划引擎、激励系统',
        openIssues: '如何提升用户的长期依从性'
      }
    ]
  }
};

// 社交媒体应用模板
export const socialMediaTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '下一代社交媒体平台，专注内容创作者经济，通过AI辅助创作和区块链激励机制，重新定义社交互动。',
    'c1_business_line': '社交网络',
    'c1_product_manager': '陈社交',
    'c1_frontend_dev': '林交互',
    'c1_backend_dev': '黄架构',
    'c1_data_analyst': '邓洞察',
    'c2_requirement_goal': '吸引100万活跃创作者，日活用户达到500万，建立可持续的创作者经济生态',
    'c5_related_docs': 'https://example.com/creator-api, https://example.com/blockchain-docs'
  },
  changeRecords: [
    {
      version: '1.0',
      modifier: '陈社交',
      date: '2024-05-01',
      reason: '社交平台MVP版本',
      content: '基础社交功能和内容发布'
    },
    {
      version: '1.2',
      modifier: '林交互',
      date: '2024-05-15',
      reason: '创作者功能增强',
      content: 'AI创作辅助和收益分成系统'
    }
  ],
  userScenarios: [
    {
      userType: '内容创作者',
      scenario: '创作原创内容，希望获得更多曝光和收益',
      painPoint: '平台算法不透明，收益分配不公平'
    },
    {
      userType: '社交达人',
      scenario: '喜欢分享生活，与朋友保持联系',
      painPoint: '内容被商业信息淹没，真实社交体验下降'
    },
    {
      userType: '企业营销',
      scenario: '通过社交平台推广品牌，触达目标用户',
      painPoint: '获客成本高，转化效果难以衡量'
    }
  ],
  iterationHistory: [
    {
      version: '0.1',
      author: '产品团队',
      date: '2024-04-15',
      content: '完成社交媒体趋势分析和用户需求调研'
    },
    {
      version: '0.8',
      author: '技术团队',
      date: '2024-04-28',
      content: '完成去中心化架构设计'
    }
  ],
  competitors: [
    {
      name: '抖音/TikTok',
      features: '短视频、算法推荐、直播带货',
      advantages: '算法精准、内容丰富、商业化成熟',
      disadvantages: '同质化严重、创作者分成比例低',
      marketPosition: '全球短视频领导者，日活用户超过10亿'
    },
    {
      name: '小红书',
      features: '生活分享、购物种草、社区互动',
      advantages: '用户粘性高、消费转化率好、内容质量高',
      disadvantages: '用户群体相对单一、国际化程度低',
      marketPosition: '生活方式社区的代表，月活用户超过2亿'
    },
    {
      name: 'Instagram',
      features: '图片分享、Stories、Reels短视频',
      advantages: '全球用户基础、品牌影响力强、功能创新快',
      disadvantages: 'Meta生态依赖、隐私争议、算法争议',
      marketPosition: 'Meta旗下主要社交产品，月活用户超过20亿'
    }
  ],
  requirementSolution: {
    sharedPrototype: '创作者社交平台 - 区块链+AI驱动的新型社交生态',
    requirements: [
      {
        name: 'AI创作助手',
        priority: 'High',
        features: '智能配乐、文案生成、视觉效果、趋势预测',
        businessLogic: '通过AI技术降低创作门槛，提升内容质量和创作效率',
        dataRequirements: '创作素材库、用户创作历史、流行趋势数据',
        edgeCases: 'AI生成内容版权、创意雷同、技术故障',
        painPoints: '创作门槛高，缺乏专业工具和灵感',
        modules: 'AI引擎、素材库、编辑器',
        openIssues: 'AI创作与人类创意的平衡点'
      },
      {
        name: '区块链激励',
        priority: 'High',
        features: '代币奖励、NFT创作、去中心化治理',
        businessLogic: '通过区块链技术实现透明的价值分配和社区治理',
        dataRequirements: '用户贡献数据、代币流通记录、治理投票',
        edgeCases: '代币价格波动、监管合规、技术安全',
        painPoints: '传统平台收益分配不透明，创作者缺乏话语权',
        modules: '区块链系统、智能合约、钱包集成',
        openIssues: '代币经济模型的可持续性'
      },
      {
        name: '智能内容分发',
        priority: 'Middle',
        features: '个性化推荐、多元化算法、创作者扶持',
        businessLogic: '平衡用户兴趣、内容多样性和创作者发展的智能分发机制',
        dataRequirements: '用户行为、内容特征、创作者数据',
        edgeCases: '算法偏见、信息茧房、恶意刷量',
        painPoints: '算法黑盒，优质内容难以获得应有曝光',
        modules: '推荐系统、内容审核、分发策略',
        openIssues: '算法透明度与商业机密的平衡'
      }
    ]
  }
};

// === 测试模板：AI SaaS工具 ===
export const aiSaasLandingTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '一个AI驱动的智能客服SaaS工具，帮助企业快速部署聊天机器人，提升客户服务效率和用户满意度。',
    'c1_business_line': 'SaaS工具',
    'c1_product_manager': '刘产品',
    'c1_frontend_dev': '周前端',
    'c1_backend_dev': '吴后端',
    'c1_data_analyst': '郑数据',
    'c2_requirement_goal': '帮助中小企业快速部署AI客服，降低人工成本50%，提升客户响应速度至秒级',
    'c5_related_docs': 'https://ai-saas.com/docs'
  },
  changeRecords: [
    { version: '1.0', modifier: '刘产品', date: '2024-03-01', reason: 'SaaS产品初版', content: 'AI客服核心功能' }
  ],
  userScenarios: [
    {
      userType: '中小企业主',
      scenario: '需要快速部署客服系统，减少人工客服成本',
      painPoint: '招聘客服成本高，响应速度慢，服务质量不稳定'
    },
    {
      userType: '企业运营',
      scenario: '管理客服工作流程，分析客户服务数据',
      painPoint: '缺乏统一的客服管理工具和数据分析能力'
    }
  ],
  iterationHistory: [
    { version: '0.1', author: 'SaaS团队', date: '2024-02-15', content: '完成市场调研' }
  ],
  competitors: [
    {
      name: '智齿客服',
      features: 'AI机器人、工单系统、知识库',
      advantages: '本土化好、功能成熟',
      disadvantages: '价格较高、定制化程度低',
      marketPosition: '国内客服SaaS领先者'
    }
  ],
  requirementSolution: {
    sharedPrototype: 'AI智能客服SaaS平台 - 一站式客服自动化解决方案',
    requirements: [
      {
        name: 'AI对话引擎',
        priority: 'High',
        features: '智能对话、意图识别、自动回复、人工转接',
        businessLogic: '基于NLP技术理解用户问题，自动匹配最佳回复',
        dataRequirements: '对话历史、知识库、用户画像',
        edgeCases: '复杂问题自动转人工、敏感词过滤',
        painPoints: '传统客服响应慢、成本高、质量不稳定',
        modules: 'AI引擎模块、对话管理模块',
        openIssues: 'AI理解准确性持续优化'
      },
      {
        name: 'SaaS管理后台',
        priority: 'High',
        features: '数据仪表盘、用户管理、配置管理、效果分析',
        businessLogic: '提供可视化管理界面，支持多租户配置',
        dataRequirements: '租户数据、配置信息、统计数据',
        edgeCases: '大并发访问、数据权限隔离',
        painPoints: '缺乏统一管理工具和数据分析',
        modules: '管理后台、统计分析模块',
        openIssues: '多租户数据隔离安全性'
      }
    ]
  }
};

// === 测试模板：社交网络平台 ===
export const socialNetworkTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '一个专注年轻人的社交媒体平台，通过短视频、动态分享、社群互动等功能，打造新一代社交体验。',
    'c1_business_line': '社交媒体',
    'c1_product_manager': '李社交',
    'c1_frontend_dev': '王前端',
    'c1_backend_dev': '张后端',
    'c1_data_analyst': '刘数据',
    'c2_requirement_goal': '月活用户达到1000万，用户日均使用时长超过2小时，建立活跃的社交生态',
    'c5_related_docs': 'https://social-app.com/docs'
  },
  changeRecords: [
    { version: '1.0', modifier: '李社交', date: '2024-03-10', reason: '社交产品初版', content: '基础社交功能' }
  ],
  userScenarios: [
    {
      userType: 'Z世代用户',
      scenario: '分享生活动态、观看有趣内容、与朋友互动',
      painPoint: '现有平台内容同质化严重，缺乏真实的社交连接'
    },
    {
      userType: '内容创作者',
      scenario: '发布原创内容、与粉丝互动、获得创作收益',
      painPoint: '平台算法不透明，创作者收益分配不公平'
    }
  ],
  iterationHistory: [
    { version: '0.1', author: '社交团队', date: '2024-02-20', content: '完成用户调研' }
  ],
  competitors: [
    {
      name: '抖音',
      features: '短视频、直播、电商、社交',
      advantages: '算法精准、内容丰富、用户粘性强',
      disadvantages: '内容同质化、创作门槛提高',
      marketPosition: '短视频社交领域绝对领导者'
    }
  ],
  requirementSolution: {
    sharedPrototype: '新世代社交媒体平台 - 真实连接，有趣分享',
    requirements: [
      {
        name: '动态信息流',
        priority: 'High',
        features: '个性化推荐、多媒体发布、互动评论、分享转发',
        businessLogic: '基于用户兴趣和社交关系智能推荐内容',
        dataRequirements: '用户动态、互动数据、兴趣标签、社交关系',
        edgeCases: '内容审核、恶意刷量、网络异常',
        painPoints: '传统社交平台算法黑盒、内容同质化',
        modules: '内容模块、推荐算法、互动模块',
        openIssues: '推荐算法的个性化与多样性平衡'
      },
      {
        name: '社交互动系统',
        priority: 'High',
        features: '点赞评论、私信聊天、关注粉丝、社群功能',
        businessLogic: '构建多层次社交关系网络，促进用户互动',
        dataRequirements: '社交关系、聊天记录、群组信息、互动行为',
        edgeCases: '骚扰举报、隐私保护、群组管理',
        painPoints: '社交平台缺乏深度连接和真实互动',
        modules: '社交模块、通讯模块、群组模块',
        openIssues: '如何平衡开放性和隐私保护'
      }
    ]
  }
};

// === 测试模板：医疗诊断系统（无匹配模板） ===
export const medicalDiagnosisTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '一个基于AI的智能医疗诊断辅助系统，帮助医生快速分析患者症状，提供诊断建议和治疗方案推荐。',
    'c1_business_line': '医疗科技',
    'c1_product_manager': '陈医疗',
    'c1_frontend_dev': '刘前端',
    'c1_backend_dev': '许后端',
    'c1_data_analyst': '马数据',
    'c2_requirement_goal': '提升诊断准确率至95%，缩短诊断时间50%，降低误诊率至2%以下',
    'c5_related_docs': 'https://medical-ai.com/docs'
  },
  changeRecords: [
    { version: '1.0', modifier: '陈医疗', date: '2024-03-05', reason: '医疗AI产品初版', content: '诊断辅助核心算法' }
  ],
  userScenarios: [
    {
      userType: '主治医生',
      scenario: '诊断复杂病例，需要AI辅助分析症状和检查结果',
      painPoint: '复杂病例诊断耗时长，容易遗漏重要信息'
    },
    {
      userType: '基层医生',
      scenario: '处理常见疾病，需要专业知识补充和诊断建议',
      painPoint: '医疗资源有限，缺乏专科医生支持'
    }
  ],
  iterationHistory: [
    { version: '0.1', author: '医疗团队', date: '2024-02-10', content: '完成医疗数据收集和算法训练' }
  ],
  competitors: [
    {
      name: 'IBM Watson Health',
      features: 'AI诊断、药物发现、健康管理',
      advantages: '技术领先、数据丰富、研发实力强',
      disadvantages: '成本高昂、本土化不足',
      marketPosition: '全球医疗AI技术领导者'
    }
  ],
  requirementSolution: {
    sharedPrototype: '智能医疗诊断系统 - AI赋能精准医疗',
    requirements: [
      {
        name: '症状分析引擎',
        priority: 'High',
        features: '症状录入、智能分析、疾病筛查、风险评估',
        businessLogic: '基于医学知识图谱分析患者症状，输出可能疾病清单',
        dataRequirements: '患者症状、病史、检查结果、医学知识库',
        edgeCases: '罕见病识别、多重疾病、症状模糊',
        painPoints: '医生诊断依赖经验，容易遗漏或误判',
        modules: 'AI诊断模块、知识库模块',
        openIssues: '算法准确性和可解释性平衡'
      },
      {
        name: '诊断报告系统',
        priority: 'High',
        features: '报告生成、数据可视化、历史追踪、统计分析',
        businessLogic: '生成结构化诊断报告，提供可视化数据分析',
        dataRequirements: '诊断数据、报告模板、统计指标',
        edgeCases: '数据隐私保护、报告格式兼容性',
        painPoints: '手工录入报告效率低，数据分析能力弱',
        modules: '报告模块、数据分析模块',
        openIssues: '医疗数据标准化和隐私保护'
      }
    ]
  }
};

// === 测试模板：区块链钱包（无匹配模板） ===
export const blockchainWalletTemplate: PRDGenerationData = {
  answers: {
    'c1_requirement_intro': '一个安全易用的多链数字货币钱包，支持主流加密货币存储、转账、交易，提供DeFi协议集成和NFT管理功能。',
    'c1_business_line': '区块链金融',
    'c1_product_manager': '赵区块',
    'c1_frontend_dev': '孙前端',
    'c1_backend_dev': '钱后端',
    'c1_data_analyst': '周数据',
    'c2_requirement_goal': '成为用户首选的数字资产管理工具，日活用户50万，资产管理规模达到10亿美元',
    'c5_related_docs': 'https://crypto-wallet.com/docs'
  },
  changeRecords: [
    { version: '1.0', modifier: '赵区块', date: '2024-03-15', reason: '区块链钱包初版', content: '基础钱包功能' }
  ],
  userScenarios: [
    {
      userType: '加密货币投资者',
      scenario: '管理多种数字资产，进行转账和交易操作',
      painPoint: '现有钱包安全性不足，操作复杂，支持币种有限'
    },
    {
      userType: 'DeFi用户',
      scenario: '参与去中心化金融协议，进行流动性挖矿和借贷',
      painPoint: '需要在多个应用间切换，Gas费用管理困难'
    }
  ],
  iterationHistory: [
    { version: '0.1', author: '区块链团队', date: '2024-02-25', content: '完成技术架构设计' }
  ],
  competitors: [
    {
      name: 'MetaMask',
      features: '以太坊钱包、DApp浏览器、代币管理',
      advantages: '生态集成度高、用户基数大、开发者友好',
      disadvantages: '仅支持以太坊生态、移动端体验一般',
      marketPosition: '以太坊生态主流钱包，月活超过3000万'
    }
  ],
  requirementSolution: {
    sharedPrototype: '多链数字钱包 - 安全便捷的Web3入口',
    requirements: [
      {
        name: '多链资产管理',
        priority: 'High',
        features: '多区块链支持、资产余额查询、转账收款、交易记录',
        businessLogic: '统一管理不同区块链上的数字资产，提供安全转账功能',
        dataRequirements: '私钥、助记词、交易记录、资产余额、区块链数据',
        edgeCases: '网络拥堵、Gas费波动、交易失败处理',
        painPoints: '需要多个钱包管理不同链上资产，操作繁琐',
        modules: '钱包核心模块、区块链接口模块',
        openIssues: '跨链桥接安全性和性能优化'
      },
      {
        name: 'DeFi协议集成',
        priority: 'Middle',
        features: '去中心化交易、流动性挖矿、借贷协议、收益农场',
        businessLogic: '集成主流DeFi协议，提供一站式DeFi服务',
        dataRequirements: '协议接口、收益数据、流动性池信息、价格预言机',
        edgeCases: '智能合约风险、无常损失、协议升级',
        painPoints: 'DeFi操作复杂，需要在多个平台间切换',
        modules: 'DeFi集成模块、风险控制模块',
        openIssues: '智能合约安全审计和风险评估'
      }
    ]
  }
};

// 导出所有模板
export const PRD_TEMPLATES = {
  'task-management': {
    name: '智能任务管理应用',
    description: '提升工作效率的AI任务管理工具',
    data: taskManagementTemplate
  },
  'learning-platform': {
    name: '在线学习平台',
    description: '个性化AI学习平台',
    data: learningPlatformTemplate
  },
  'ecommerce': {
    name: '智能电商平台',
    description: 'AR+AI的新零售体验',
    data: ecommerceTemplate
  },
  'health-management': {
    name: '健康管理应用',
    description: '智能健康数据分析平台',
    data: healthManagementTemplate
  },
  'social-media': {
    name: '创作者社交平台',
    description: '区块链+AI的新型社交生态',
    data: socialMediaTemplate
  },
  // === 新增测试案例 ===
  'ai-saas-landing': {
    name: 'AI客服SaaS工具',
    description: '智能客服自动化解决方案',
    data: aiSaasLandingTemplate
  },
  'social-network': {
    name: '年轻人社交平台',
    description: '新世代社交媒体应用',
    data: socialNetworkTemplate
  },
  'medical-diagnosis': {
    name: '医疗诊断系统',
    description: 'AI辅助医疗诊断平台',
    data: medicalDiagnosisTemplate
  },
  'blockchain-wallet': {
    name: '区块链数字钱包',
    description: '多链数字资产管理工具',
    data: blockchainWalletTemplate
  }
} as const;

export type TemplateKey = keyof typeof PRD_TEMPLATES; 