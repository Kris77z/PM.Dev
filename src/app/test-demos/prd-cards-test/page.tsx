'use client';

import React, { useState } from 'react';
import { FileText, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableContent, 
  ExpandableCardHeader,
  ExpandableCardContent, 
  ExpandableCardFooter,
  ExpandableTrigger 
} from "@/components/ui/expandable";
import { AlertSuccess } from '@/components/ui/alert';
import { PRDDocumentDisplay } from '@/components/prd-house/PRDDocumentDisplay';
import { PRDGenerationData } from '@/lib/prd-generator';
import { generatePRDDocument } from '@/lib/prd-generator';
import { useRouter } from 'next/navigation';

export default function PRDCardsTestPage() {
  const router = useRouter();
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertState({ type, message });
    setTimeout(() => setAlertState({ type: null, message: '' }), 3000);
  };

  // 企业级任务管理平台 PRD数据
  const taskManagerPRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个面向中大型企业的全功能任务管理平台，集成项目管理、团队协作、资源调度、进度跟踪等功能。通过AI智能分析和自动化工作流，帮助企业提升项目交付效率，实现精细化管理。支持敏捷开发、瀑布模型等多种项目管理方法论。',
      'c1_business_line': 'B2B企业服务',
      'c1_product_manager': '张项目',
      'c1_frontend_dev': '前端架构团队',
      'c1_backend_dev': '云原生开发团队',
      'c1_data_analyst': '企业数据分析师',
      'c2_requirement_goal': '帮助企业项目交付效率提升40%，减少项目延期率至10%以下，实现100%项目可视化追踪，支持1000+用户并发协作，降低企业管理成本25%',
      'c5_related_docs': 'https://enterprise-pm.com/api-docs, https://enterprise-pm.com/integration-guide, https://enterprise-pm.com/security-standards'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '张项目',
        date: '2024-01-15',
        reason: '企业版产品立项',
        content: '建立企业级架构基础，支持大规模团队协作'
      },
      {
        version: '1.5',
        modifier: 'AI团队',
        date: '2024-02-01',
        reason: '智能化升级',
        content: '集成AI项目风险预测和智能资源分配算法'
      },
      {
        version: '2.0',
        modifier: '企业解决方案团队',
        date: '2024-02-20',
        reason: '企业级功能扩展',
        content: '增加企业级安全认证、多租户支持、API开放平台'
      },
      {
        version: '2.1',
        modifier: '性能优化团队',
        date: '2024-03-05',
        reason: '性能优化',
        content: '优化大数据量处理，支持10万级任务并发管理'
      }
    ],
    userScenarios: [
      {
        userType: '项目总监',
        scenario: '需要统筹管理公司所有项目，实时掌握项目进度、资源分配和风险状况，向高层汇报项目整体情况',
        painPoint: '项目信息分散在各个系统中，缺乏统一的项目总览视图，难以快速识别高风险项目，汇报准备工作繁重'
      },
      {
        userType: '敏捷教练',
        scenario: '指导多个敏捷团队实施Scrum方法论，需要跟踪Sprint进度、团队速度和交付质量',
        painPoint: '现有工具无法很好支持敏捷实践，缺乏燃尽图、速度图表等关键指标，团队协作效率难以量化'
      },
      {
        userType: '产品经理',
        scenario: '管理产品路线图，协调研发、设计、测试等多个团队，确保产品按计划发布',
        painPoint: '跨团队协作困难，需求变更影响难以评估，缺乏产品级的进度可视化'
      },
      {
        userType: '技术负责人',
        scenario: '负责技术团队的任务分配和技术债务管理，需要平衡新功能开发和系统维护',
        painPoint: '技术任务优先级难以量化，团队工作负载不均衡，技术债务缺乏系统性管理'
      },
      {
        userType: '企业CTO',
        scenario: '从技术战略角度监控所有项目的技术风险和资源投入，确保技术投资回报率',
        painPoint: '缺乏技术项目的投资回报分析，无法准确评估技术团队效能，技术决策缺乏数据支撑'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '企业调研团队',
        date: '2023-12-01',
        content: '深度调研50+企业客户需求，形成企业级需求分析报告'
      },
      {
        version: '0.3',
        author: '架构设计团队',
        date: '2023-12-15',
        content: '完成微服务架构设计，支持弹性扩容和多租户隔离'
      },
      {
        version: '0.5',
        author: '安全团队',
        date: '2024-01-01',
        content: '完成企业级安全标准设计，通过SOC2认证预审'
      },
      {
        version: '0.8',
        author: '集成团队',
        date: '2024-01-10',
        content: '完成主流企业系统集成方案，支持SSO和API集成'
      }
    ],
    competitors: [
      {
        name: 'Jira',
        features: '敏捷项目管理、问题跟踪、工作流自定义、企业级集成',
        advantages: '敏捷支持强大、自定义能力强、生态丰富、市场占有率高',
        disadvantages: '学习成本高、界面复杂、价格昂贵、移动端体验差',
        marketPosition: '企业级项目管理工具市场领导者，Atlassian年收入超过30亿美元，全球10万+企业用户'
      },
      {
        name: 'Monday.com',
        features: '可视化项目管理、团队协作、自动化工作流、多视图展示',
        advantages: '界面友好、上手简单、视觉化程度高、模板丰富',
        disadvantages: '企业级功能相对薄弱、自定义深度有限、大数据量性能一般',
        marketPosition: '快速增长的项目管理平台，上市公司，年收入约6亿美元，中小企业用户为主'
      },
      {
        name: 'Azure DevOps',
        features: '完整DevOps工具链、代码管理、CI/CD、项目管理',
        advantages: '工具链完整、与微软生态集成好、技术团队友好、安全性高',
        disadvantages: '主要面向技术团队、非技术用户门槛高、依赖微软生态',
        marketPosition: '微软云服务重要组成部分，技术驱动企业的首选，与GitHub形成生态闭环'
      },
      {
        name: '企业微信项目管理',
        features: '轻量级项目管理、团队沟通、文档协作、移动办公',
        advantages: '集成企业微信生态、移动端体验好、部署简单、成本低',
        disadvantages: '功能相对简单、缺乏高级项目管理功能、数据分析能力弱',
        marketPosition: '腾讯企业服务生态重要组成，中国市场本土化优势明显，中小企业普及率高'
      }
    ],
    requirementSolution: {
      sharedPrototype: '企业级任务管理平台',
      requirements: [
        {
          name: '多维度项目仪表盘',
          priority: 'High',
          features: '实时项目状态总览、风险预警系统、资源利用率分析、进度燃尽图、团队效能指标、自定义KPI看板',
          businessLogic: '基于项目数据构建多维度分析视图，支持钻取分析，提供项目健康度评分和风险预警，管理层可快速了解项目整体状况',
          dataRequirements: '项目基础信息、任务执行数据、资源分配记录、时间跟踪数据、成本数据、质量指标、团队绩效数据',
          edgeCases: '大数据量加载性能优化、实时数据同步延迟、多时区项目数据展示、权限控制下的数据可见性',
          painPoints: '管理层无法快速了解项目真实状况，缺乏预警机制，决策依赖人工汇报，信息传递有延迟',
          modules: '数据可视化模块、实时计算引擎、预警系统、权限控制模块、报表生成器',
          openIssues: '如何平衡实时性和性能，大规模数据的可视化优化策略，预警阈值的智能调整机制'
        },
        {
          name: 'AI智能项目助手',
          priority: 'High',
          features: '项目风险预测、智能资源调度、自动进度更新、异常检测、优化建议生成、智能排期',
          businessLogic: '利用机器学习分析历史项目数据，预测项目风险和延期概率，自动优化资源分配，提供项目优化建议',
          dataRequirements: '历史项目数据、团队能力模型、任务复杂度评估、资源约束条件、外部依赖关系、市场环境因素',
          edgeCases: 'AI预测准确性验证、数据不足情况下的降级策略、人工干预机制、模型解释性',
          painPoints: '项目规划依赖经验判断、风险识别滞后、资源分配不合理、缺乏数据驱动决策',
          modules: 'AI预测引擎、资源优化算法、数据挖掘模块、推荐系统、模型训练平台',
          openIssues: 'AI建议的可解释性、模型持续优化策略、个性化推荐的准确性提升'
        },
        {
          name: '企业级集成中心',
          priority: 'High',
          features: 'SSO单点登录、API开放平台、第三方系统集成、数据同步、权限映射、审计日志',
          businessLogic: '提供标准化API接口，支持与企业现有系统无缝集成，实现数据流转和权限统一管理',
          dataRequirements: '企业组织架构、用户权限体系、第三方系统接口规范、数据映射关系、集成配置信息',
          edgeCases: '网络不稳定时的数据同步、权限变更的实时同步、集成系统故障的容错处理、数据一致性保证',
          painPoints: '系统孤岛现象严重、数据重复录入、权限管理复杂、集成成本高',
          modules: '集成网关、权限同步器、数据转换器、监控中心、配置管理器',
          openIssues: '复杂企业环境的适配性、数据安全传输保障、集成性能优化'
        },
        {
          name: '敏捷开发支持套件',
          priority: 'Middle',
          features: 'Scrum/Kanban看板、Sprint管理、燃尽图、速度图表、回顾会议工具、用户故事地图',
          businessLogic: '完整支持敏捷开发流程，提供Sprint规划、执行、回顾全周期管理，自动生成敏捷度量指标',
          dataRequirements: 'Sprint计划数据、用户故事信息、任务估算、团队速度历史、缺陷统计、交付质量指标',
          edgeCases: 'Sprint中途需求变更、团队成员变动、跨团队依赖处理、节假日影响的调整',
          painPoints: '敏捷实践工具支持不完整、度量指标计算复杂、团队协作效率难以量化',
          modules: '敏捷看板引擎、度量计算器、会议工具、估算工具、报告生成器',
          openIssues: '敏捷度量标准的个性化配置、跨团队敏捷实践的协调机制'
        },
        {
          name: '企业级安全与合规',
          priority: 'High',
          features: '细粒度权限控制、数据加密、审计追踪、合规报告、备份恢复、安全认证',
          businessLogic: '提供企业级安全保障，支持多层级权限控制，完整的操作审计，满足各种合规要求',
          dataRequirements: '用户权限矩阵、操作日志、敏感数据分类、合规检查清单、安全配置参数',
          edgeCases: '权限继承冲突、大量审计日志的性能影响、安全策略更新的全局生效、紧急访问授权',
          painPoints: '企业数据安全要求严格、合规检查复杂、权限管理繁琐、审计工作量大',
          modules: '权限管理引擎、加密服务、审计系统、合规检查器、安全监控中心',
          openIssues: '权限体系的灵活性与安全性平衡、审计数据的长期存储策略、合规标准的持续更新适配'
        }
      ]
    }
  };

  // 跨境电商平台 PRD数据
  const ecommercePRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个面向全球市场的跨境电商平台，集成多语言、多币种、多支付方式的全球化购物体验。通过AI智能推荐、供应链管理、物流追踪等功能，为商家提供一站式跨境销售解决方案，为消费者提供安全便捷的全球购物体验。支持B2C、B2B、C2C多种交易模式。',
      'c1_business_line': '跨境电商',
      'c1_product_manager': '李全球',
      'c1_frontend_dev': '国际化前端团队',
      'c1_backend_dev': '分布式系统团队',
      'c1_data_analyst': '电商数据专家',
      'c2_requirement_goal': '帮助商家拓展全球市场，实现销售额增长200%，降低跨境交易成本30%，提供99.9%平台可用性，支持100+国家地区服务，建立全球化供应链网络',
      'c5_related_docs': 'https://global-commerce.com/api-docs, https://global-commerce.com/seller-guide, https://global-commerce.com/compliance-standards, https://global-commerce.com/payment-integration'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '李全球',
        date: '2024-01-01',
        reason: '平台创立',
        content: '建立基础电商功能和多语言支持体系'
      },
      {
        version: '1.5',
        modifier: '支付团队',
        date: '2024-01-20',
        reason: '支付系统升级',
        content: '集成全球主流支付方式，支持50+币种实时汇率转换'
      },
      {
        version: '2.0',
        modifier: '物流团队',
        date: '2024-02-10',
        reason: '物流体系建设',
        content: '建立全球仓储网络，实现智能物流调度和全程追踪'
      },
      {
        version: '2.3',
        modifier: 'AI算法团队',
        date: '2024-02-25',
        reason: '智能化升级',
        content: '上线AI商品推荐、智能客服、动态定价系统'
      },
      {
        version: '2.5',
        modifier: '合规团队',
        date: '2024-03-15',
        reason: '合规体系完善',
        content: '完善各国税务、海关、数据保护等合规要求'
      }
    ],
    userScenarios: [
      {
        userType: '跨境卖家',
        scenario: '中小型制造商希望直接面向海外消费者销售产品，减少中间环节，提高利润率',
        painPoint: '缺乏海外市场经验、语言障碍、支付结算复杂、物流成本高、合规要求繁琐、客服时差问题'
      },
      {
        userType: '海外消费者',
        scenario: '欧美消费者希望购买优质的亚洲产品，享受更具性价比的购物体验',
        painPoint: '语言沟通困难、支付安全担忧、物流时间长、售后服务不便、退换货复杂、产品质量难以保证'
      },
      {
        userType: '品牌方',
        scenario: '知名品牌希望通过电商平台拓展全球市场，建立海外品牌影响力',
        painPoint: '品牌保护困难、渠道管控复杂、价格体系混乱、假冒产品泛滥、市场数据缺乏'
      },
      {
        userType: '供应链服务商',
        scenario: '物流、仓储、支付等服务商希望接入平台，为商家提供专业服务',
        painPoint: '系统对接复杂、服务标准不统一、数据共享困难、结算周期长'
      },
      {
        userType: '平台运营方',
        scenario: '需要平衡买卖双方利益，确保平台健康发展，提升交易规模和用户满意度',
        painPoint: '多国法律法规复杂、汇率波动风险、质量争议处理、恶意竞争、数据安全合规'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '市场调研团队',
        date: '2023-11-01',
        content: '完成全球跨境电商市场分析，确定目标市场和核心功能'
      },
      {
        version: '0.3',
        author: '技术架构团队',
        date: '2023-11-20',
        content: '完成分布式架构设计，支持全球部署和高并发访问'
      },
      {
        version: '0.5',
        author: '国际化团队',
        date: '2023-12-01',
        content: '完成多语言本地化方案和文化适配策略'
      },
      {
        version: '0.7',
        author: '合规团队',
        date: '2023-12-15',
        content: '完成主要目标市场的法律合规性分析和实施方案'
      }
    ],
    competitors: [
      {
        name: 'Amazon',
        features: '全球物流网络、FBA服务、Prime会员、云计算服务',
        advantages: '全球最大电商平台、物流基础设施完善、技术实力强、资金雄厚',
        disadvantages: '竞争激烈、佣金较高、规则复杂、中小卖家生存困难',
        marketPosition: '全球电商巨头，年GMV超过4000亿美元，覆盖200+国家和地区'
      },
      {
        name: 'eBay',
        features: '拍卖模式、全球买家保护、PayPal集成、中小卖家友好',
        advantages: '历史悠久、拍卖模式独特、中小卖家准入门槛低、全球覆盖广',
        disadvantages: '增长放缓、竞争力下降、年轻用户流失、移动端体验一般',
        marketPosition: '老牌跨境电商平台，年GMV约1000亿美元，在二手商品和收藏品领域优势明显'
      },
      {
        name: 'AliExpress',
        features: '中国制造、小额批发、买家保护、多语言支持',
        advantages: '产品价格优势、供应链资源丰富、阿里巴巴生态支撑、新兴市场强势',
        disadvantages: '产品质量参差不齐、物流时间长、客服体验一般、品牌影响力有限',
        marketPosition: '全球最大B2C跨境电商平台之一，覆盖220+国家，年活跃买家1.5亿+'
      },
      {
        name: 'Shopify',
        features: '独立站建站、应用生态、支付解决方案、营销工具',
        advantages: '技术门槛低、自主品牌建设、生态丰富、订阅制模式稳定',
        disadvantages: '需要自主引流、营销成本高、技术支持有限、依赖第三方服务',
        marketPosition: '全球领先的电商SaaS平台，服务170万+商家，年GMV超过1750亿美元'
      }
    ],
    requirementSolution: {
      sharedPrototype: '全球跨境电商平台',
      requirements: [
        {
          name: '全球化商品展示系统',
          priority: 'High',
          features: '多语言商品详情、智能翻译、本地化价格显示、多币种支付、文化适配展示、AR/VR商品预览',
          businessLogic: '根据用户地理位置和语言偏好，自动展示本地化的商品信息，支持实时汇率转换和税费计算',
          dataRequirements: '商品基础信息、多语言描述、价格体系、库存数据、地区限制、税率信息、汇率数据',
          edgeCases: '汇率大幅波动、地区法律限制、翻译准确性、文化敏感性、技术标准差异',
          painPoints: '语言障碍导致理解困难、价格不透明、文化差异导致误解、商品信息不完整',
          modules: '商品管理系统、多语言引擎、价格计算器、本地化适配器、内容管理系统',
          openIssues: '机器翻译质量保证、动态定价策略、文化适配标准化、AR/VR技术成本控制'
        },
        {
          name: 'AI智能推荐引擎',
          priority: 'High',
          features: '个性化商品推荐、跨文化偏好分析、动态定价建议、库存优化、趋势预测、智能搜索',
          businessLogic: '基于用户行为、地域文化、季节性等多维度数据，提供个性化推荐和智能定价策略',
          dataRequirements: '用户行为数据、商品属性、市场趋势、竞品价格、文化偏好、季节性因素',
          edgeCases: '数据稀疏性、冷启动问题、隐私保护、算法偏见、跨文化理解偏差',
          painPoints: '商品发现困难、价格竞争激烈、库存周转慢、用户体验千篇一律',
          modules: '推荐算法引擎、数据挖掘平台、定价策略系统、搜索优化器、A/B测试框架',
          openIssues: '跨文化推荐准确性、实时性能优化、隐私保护合规、算法透明度'
        },
        {
          name: '全球物流与供应链管理',
          priority: 'High',
          features: '智能仓储分配、全程物流追踪、关税计算、保险服务、退换货管理、供应商管理',
          businessLogic: '建立全球仓储网络，智能分配库存，优化物流路径，提供端到端的物流解决方案',
          dataRequirements: '仓储数据、物流商信息、关税税率、保险费率、运输时效、成本数据',
          edgeCases: '天气延误、海关扣留、仓储爆仓、物流商倒闭、汇率波动影响成本',
          painPoints: '物流成本高、时效不可控、清关复杂、库存周转困难、售后服务滞后',
          modules: '仓储管理系统、物流调度引擎、追踪系统、关税计算器、供应商平台',
          openIssues: '全球仓网布局优化、物流成本控制、清关效率提升、逆向物流处理'
        },
        {
          name: '多支付与金融服务',
          priority: 'High',
          features: '多币种支付、汇率保护、分期付款、供应链金融、风险控制、合规结算',
          businessLogic: '支持全球主流支付方式，提供汇率保护和金融增值服务，确保资金安全和合规',
          dataRequirements: '支付渠道信息、汇率数据、信用评估、风险模型、合规要求、结算数据',
          edgeCases: '支付渠道故障、汇率剧烈波动、欺诈交易、监管政策变化、跨境资金管制',
          painPoints: '支付成功率低、汇率风险大、资金周转慢、风控误伤、合规成本高',
          modules: '支付网关、风控引擎、汇率管理系统、金融服务平台、合规监控系统',
          openIssues: '支付成功率优化、实时风控准确性、汇率对冲策略、监管适应性'
        },
        {
          name: '智能客服与争议解决',
          priority: 'Middle',
          features: '多语言智能客服、实时翻译、争议仲裁、评价管理、知识库、人工客服协作',
          businessLogic: '提供24/7多语言客服支持，智能处理常见问题，公正高效处理交易争议',
          dataRequirements: '客服对话记录、知识库内容、争议案例、用户反馈、处理时效、满意度数据',
          edgeCases: '语言理解偏差、文化冲突、复杂争议、恶意投诉、高峰期响应、时区覆盖',
          painPoints: '客服响应慢、语言沟通困难、争议处理不公、问题解决率低',
          modules: 'NLP对话引擎、实时翻译系统、争议仲裁平台、知识管理系统、工单系统',
          openIssues: '多语言理解准确性、争议处理公正性、客服效率提升、成本控制平衡'
        }
      ]
    }
  };

  // 产品落地页 PRD数据
  const landingPagePRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个高转化率的产品营销落地页生成平台，为企业和创业者提供专业的营销页面设计和优化服务。通过AI驱动的内容生成、A/B测试、用户行为分析等功能，帮助客户快速创建能够有效转化的营销页面，最大化营销投资回报率。',
      'c1_business_line': '数字营销',
      'c1_product_manager': '张营销',
      'c1_frontend_dev': '营销技术团队',
      'c1_backend_dev': '数据分析团队',
      'c1_data_analyst': '转化优化专家',
      'c2_requirement_goal': '帮助客户提升落地页转化率300%，降低获客成本50%，缩短页面制作时间至1小时内，支持无代码快速搭建，实现营销ROI最大化',
      'c5_related_docs': 'https://landing-pro.com/api-docs, https://landing-pro.com/design-guide, https://landing-pro.com/conversion-best-practices, https://landing-pro.com/analytics-integration'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '张营销',
        date: '2024-01-05',
        reason: '平台创建',
        content: '建立基础落地页编辑器和模板系统'
      },
      {
        version: '1.3',
        modifier: 'AI内容团队',
        date: '2024-01-25',
        reason: 'AI功能集成',
        content: '集成AI文案生成和智能优化建议系统'
      },
      {
        version: '1.8',
        modifier: '数据分析团队',
        date: '2024-02-15',
        reason: '分析系统升级',
        content: '完善用户行为分析和A/B测试功能'
      },
      {
        version: '2.0',
        modifier: '营销自动化团队',
        date: '2024-03-01',
        reason: '营销自动化',
        content: '增加营销自动化工作流和客户关系管理功能'
      },
      {
        version: '2.2',
        modifier: '集成团队',
        date: '2024-03-20',
        reason: '第三方集成',
        content: '支持主流营销工具和CRM系统集成'
      }
    ],
    userScenarios: [
      {
        userType: '数字营销经理',
        scenario: '需要为新产品快速创建高转化的营销落地页，配合广告投放活动使用',
        painPoint: '依赖设计师和开发资源，制作周期长，成本高，缺乏数据驱动的优化方法'
      },
      {
        userType: '初创企业创始人',
        scenario: '预算有限，需要自主创建专业的产品介绍页面来获取早期用户和投资人关注',
        painPoint: '缺乏设计和技术能力，外包成本高，不了解营销页面的最佳实践'
      },
      {
        userType: '电商运营',
        scenario: '需要为不同产品和促销活动创建专门的营销页面，提升销售转化',
        painPoint: '页面制作效率低，难以快速响应市场变化，缺乏有效的转化率优化工具'
      },
      {
        userType: '营销代理公司',
        scenario: '为多个客户提供落地页设计和优化服务，需要提升服务效率和效果',
        painPoint: '人力成本高，标准化程度低，难以规模化服务，客户效果难以保证'
      },
      {
        userType: 'SaaS产品经理',
        scenario: '需要为产品的不同功能和用户群体创建针对性的营销页面',
        painPoint: '缺乏营销专业知识，难以制作有说服力的页面，不知道如何优化转化率'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '市场调研团队',
        date: '2023-12-01',
        content: '完成落地页市场调研和竞品分析，确定核心功能定位'
      },
      {
        version: '0.3',
        author: '设计团队',
        date: '2023-12-15',
        content: '完成视觉设计系统和模板库设计'
      },
      {
        version: '0.5',
        author: '技术团队',
        date: '2024-01-01',
        content: '完成可视化编辑器和页面生成引擎开发'
      },
      {
        version: '0.7',
        author: '内容团队',
        date: '2024-01-05',
        content: '建立营销文案库和最佳实践指南'
      }
    ],
    competitors: [
      {
        name: 'Unbounce',
        features: '拖拽式编辑器、A/B测试、表单构建、分析工具',
        advantages: '专业落地页工具、模板丰富、优化功能强、市场认知度高',
        disadvantages: '价格较高、学习成本中等、定制化程度有限',
        marketPosition: '落地页建设工具的市场领导者，服务15000+企业，转化率平均提升30%'
      },
      {
        name: 'Leadpages',
        features: '模板库、集成功能、分析工具、移动优化',
        advantages: '易用性好、集成生态丰富、移动端优化、价格合理',
        disadvantages: '设计灵活性有限、高级功能需要付费、客服响应一般',
        marketPosition: '中小企业友好的落地页工具，40000+用户，专注于简单易用'
      },
      {
        name: 'Instapage',
        features: '企业级编辑器、个性化功能、协作工具、AMP支持',
        advantages: '企业级功能完善、个性化程度高、性能优秀、团队协作好',
        disadvantages: '价格昂贵、主要面向大企业、中小客户门槛高',
        marketPosition: '企业级落地页解决方案领导者，财富500强企业的首选'
      },
      {
        name: 'ClickFunnels',
        features: '销售漏斗、电商功能、邮件营销、会员系统',
        advantages: '全套营销解决方案、社区活跃、教育资源丰富、一站式服务',
        disadvantages: '功能复杂、价格高、学习曲线陡峭、不适合简单需求',
        marketPosition: '营销漏斗工具的知名品牌，100000+用户，年收入超过1亿美元'
      }
    ],
    requirementSolution: {
      sharedPrototype: '智能落地页生成平台',
      requirements: [
        {
          name: 'AI驱动的智能页面生成器',
          priority: 'High',
          features: '智能文案生成、自动布局优化、图片智能配色、转化要素建议、行业模板推荐、品牌一致性检查',
          businessLogic: '基于用户输入的产品信息和目标受众，AI自动生成高转化的页面内容和布局，提供专业的营销建议',
          dataRequirements: '产品信息、目标受众、行业类别、品牌元素、竞品数据、转化目标、预算信息',
          edgeCases: '产品信息不完整、目标受众模糊、品牌元素缺失、特殊行业要求、多语言需求',
          painPoints: '缺乏营销专业知识、文案写作困难、设计能力不足、不了解转化要素',
          modules: 'AI文案引擎、布局算法、图像处理、模板系统、品牌管理器',
          openIssues: 'AI生成内容的质量控制、行业特殊性的处理、品牌一致性的自动化保证'
        },
        {
          name: '可视化拖拽编辑器',
          priority: 'High',
          features: '所见即所得编辑、组件化设计、响应式布局、实时预览、版本管理、团队协作',
          businessLogic: '提供直观的可视化编辑界面，支持零代码创建专业落地页，自动适配多种设备',
          dataRequirements: '页面结构、组件配置、样式设置、媒体资源、设备适配、用户权限',
          edgeCases: '复杂布局处理、性能优化、浏览器兼容性、大文件上传、并发编辑冲突',
          painPoints: '技术门槛高、设计不专业、多设备适配困难、团队协作效率低',
          modules: '编辑器引擎、组件库、布局系统、媒体管理、协作系统',
          openIssues: '编辑器性能优化、复杂交互的实现、团队协作的冲突解决'
        },
        {
          name: '智能A/B测试与优化系统',
          priority: 'High',
          features: '自动A/B测试、多变量测试、智能流量分配、统计显著性检测、优化建议、胜出版本推荐',
          businessLogic: '自动创建页面变体进行测试，智能分析测试结果，提供数据驱动的优化建议',
          dataRequirements: '访问数据、转化数据、用户行为、测试配置、统计结果、置信度参数',
          edgeCases: '流量不足、季节性影响、外部因素干扰、测试周期过长、多个测试冲突',
          painPoints: '不懂统计学、测试设计困难、结果解读复杂、优化方向不明确',
          modules: '测试引擎、统计分析、流量分配、结果可视化、建议生成器',
          openIssues: '小样本测试的准确性、外部因素的控制、自动化决策的可靠性'
        },
        {
          name: '深度用户行为分析',
          priority: 'Middle',
          features: '热力图分析、用户录屏、转化漏斗、事件追踪、用户画像、行为预测',
          businessLogic: '全面追踪用户在页面上的行为，分析转化路径和流失点，提供改进建议',
          dataRequirements: '点击数据、滚动数据、表单交互、停留时间、访问路径、设备信息、地理位置',
          edgeCases: '隐私保护合规、数据量过大、实时性要求、跨设备追踪、广告拦截器影响',
          painPoints: '用户行为不透明、流失原因不明、优化缺乏依据、数据分析复杂',
          modules: '行为追踪、数据分析、可视化系统、隐私管理、预测模型',
          openIssues: '隐私保护与数据收集的平衡、大数据处理性能、跨设备用户识别'
        },
        {
          name: '营销自动化与集成中心',
          priority: 'Middle',
          features: '邮件营销自动化、CRM集成、广告平台对接、潜客管理、营销流程设计、ROI分析',
          businessLogic: '将落地页与营销生态系统连接，实现从获客到转化的全流程自动化管理',
          dataRequirements: '客户数据、营销活动、转化记录、成本数据、渠道来源、生命周期价值',
          edgeCases: '系统集成失败、数据同步延迟、API限制、权限配置错误、重复数据处理',
          painPoints: '营销工具孤立、数据无法打通、手工操作繁琐、ROI难以计算',
          modules: '集成网关、自动化引擎、数据同步、流程设计器、分析报表',
          openIssues: '第三方系统的稳定性依赖、数据一致性保证、复杂营销流程的设计'
        }
      ]
    }
  };

  // 数据分析APP PRD数据
  const dataAnalysisAppPRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个面向企业和数据分析师的智能数据分析应用，提供从数据接入、清洗、分析到可视化的全流程解决方案。通过AI驱动的自动化分析、自然语言查询、智能洞察发现等功能，让非技术人员也能轻松进行专业的数据分析，实现数据驱动决策。',
      'c1_business_line': '企业数据服务',
      'c1_product_manager': '王数据',
      'c1_frontend_dev': '数据可视化团队',
      'c1_backend_dev': '大数据处理团队',
      'c1_data_analyst': '数据科学专家',
      'c2_requirement_goal': '降低数据分析门槛80%，提升分析效率500%，支持PB级数据处理，实现秒级查询响应，让每个业务人员都能成为数据分析师，推动企业数字化转型',
      'c5_related_docs': 'https://data-insights.com/api-docs, https://data-insights.com/data-sources, https://data-insights.com/ml-models, https://data-insights.com/security-guide'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '王数据',
        date: '2024-01-10',
        reason: '产品立项',
        content: '建立基础数据分析框架和可视化引擎'
      },
      {
        version: '1.4',
        modifier: 'AI算法团队',
        date: '2024-02-01',
        reason: 'AI能力集成',
        content: '集成自然语言查询和智能洞察发现功能'
      },
      {
        version: '1.8',
        modifier: '大数据团队',
        date: '2024-02-25',
        reason: '性能升级',
        content: '优化大数据处理能力，支持实时流式分析'
      },
      {
        version: '2.2',
        modifier: '机器学习团队',
        date: '2024-03-15',
        reason: 'ML平台集成',
        content: '集成AutoML平台，支持无代码机器学习建模'
      },
      {
        version: '2.5',
        modifier: '企业服务团队',
        date: '2024-04-01',
        reason: '企业级功能',
        content: '增加数据治理、权限管理、审计追踪等企业级功能'
      }
    ],
    userScenarios: [
      {
        userType: '业务分析师',
        scenario: '需要定期分析销售数据、用户行为、市场趋势，为业务决策提供数据支撑',
        painPoint: '依赖IT部门提取数据、SQL技能有限、图表制作繁琐、分析深度不够、报告制作耗时'
      },
      {
        userType: '产品经理',
        scenario: '需要分析产品使用数据、用户反馈、功能效果，优化产品设计和运营策略',
        painPoint: '数据分散在各个系统、分析工具复杂、缺乏统一视图、洞察发现困难、决策缺乏数据依据'
      },
      {
        userType: '营销总监',
        scenario: '需要分析营销活动效果、客户画像、渠道ROI，制定精准营销策略',
        painPoint: '多渠道数据整合困难、归因分析复杂、实时监控缺失、竞品分析数据不足'
      },
      {
        userType: '数据科学家',
        scenario: '需要快速探索数据、建立机器学习模型、发现业务洞察，提升分析效率',
        painPoint: '数据准备工作繁重、工具切换频繁、模型部署复杂、业务理解不够深入'
      },
      {
        userType: '企业高管',
        scenario: '需要实时监控关键业务指标、了解企业整体运营状况、支持战略决策',
        painPoint: '信息传递层级多、数据更新不及时、缺乏预警机制、决策依赖经验判断'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '需求调研团队',
        date: '2023-12-01',
        content: '完成企业数据分析需求调研和技术可行性分析'
      },
      {
        version: '0.3',
        author: '架构设计团队',
        date: '2023-12-20',
        content: '完成分布式数据处理架构和实时计算引擎设计'
      },
      {
        version: '0.6',
        author: '算法团队',
        date: '2024-01-05',
        content: '完成AI分析算法和自然语言处理模型开发'
      },
      {
        version: '0.8',
        author: '可视化团队',
        date: '2024-01-08',
        content: '完成交互式可视化组件库和仪表盘框架'
      }
    ],
    competitors: [
      {
        name: 'Tableau',
        features: '强大的可视化、丰富的图表类型、数据连接器、企业级部署',
        advantages: '可视化能力极强、易用性好、生态成熟、市场认知度高',
        disadvantages: '价格昂贵、学习成本高、大数据性能一般、移动端体验差',
        marketPosition: '数据可视化领域的领导者，Salesforce收购，服务全球100000+企业'
      },
      {
        name: 'Power BI',
        features: '微软生态集成、自助式分析、云端协作、AI洞察',
        advantages: '与微软生态深度集成、价格优势、AI功能强、部署简单',
        disadvantages: '主要依赖微软生态、复杂分析能力有限、自定义程度一般',
        marketPosition: '微软商业智能解决方案，全球用户500万+，企业级市场快速增长'
      },
      {
        name: 'Looker',
        features: '现代BI平台、LookML建模、嵌入式分析、云原生架构',
        advantages: '技术架构先进、建模能力强、嵌入式支持好、开发者友好',
        disadvantages: '学习门槛高、主要面向技术团队、市场普及度相对较低',
        marketPosition: 'Google收购的现代BI平台，技术驱动企业的首选，年收入约2亿美元'
      },
      {
        name: 'DataV',
        features: '阿里云数据可视化、大屏展示、实时数据、模板丰富',
        advantages: '大屏展示效果好、阿里云生态集成、价格合理、本土化服务',
        disadvantages: '主要面向展示、分析功能相对简单、依赖阿里云生态',
        marketPosition: '阿里云数据可视化产品，中国市场大屏展示领域的主要选择'
      }
    ],
    requirementSolution: {
      sharedPrototype: '智能数据分析平台',
      requirements: [
        {
          name: '自然语言数据查询引擎',
          priority: 'High',
          features: '语音输入、智能语义理解、SQL自动生成、查询优化、结果解释、多轮对话',
          businessLogic: '用户用自然语言描述分析需求，AI自动理解意图并生成对应的查询语句，返回可视化结果',
          dataRequirements: '数据字典、表结构、字段含义、业务术语、查询历史、用户偏好',
          edgeCases: '模糊查询需求、复杂关联分析、多表联查、数据权限限制、查询性能优化',
          painPoints: '学习SQL门槛高、查询语法复杂、不知道数据结构、分析思路不清晰',
          modules: 'NLP理解引擎、SQL生成器、查询优化器、结果解释器、对话管理',
          openIssues: '复杂查询的准确性、多表关联的自动推断、查询性能的平衡'
        },
        {
          name: 'AI智能洞察发现系统',
          priority: 'High',
          features: '异常检测、趋势预测、相关性分析、因果推断、假设验证、洞察推荐',
          businessLogic: '自动分析数据中的模式和异常，发现隐藏的商业洞察，提供可操作的建议',
          dataRequirements: '历史数据、实时数据、外部数据、业务背景、行业基准、统计模型',
          edgeCases: '数据质量问题、虚假相关性、季节性干扰、外部因素影响、小样本偏差',
          painPoints: '不知道从哪里开始分析、发现不了深层规律、分析结果缺乏业务价值',
          modules: '异常检测算法、机器学习模型、统计分析、模式识别、洞察生成器',
          openIssues: '洞察的准确性验证、业务价值的量化、推荐优先级的排序'
        },
        {
          name: '实时大数据处理引擎',
          priority: 'High',
          features: '流式数据处理、分布式计算、内存计算、查询缓存、负载均衡、弹性扩容',
          businessLogic: '支持PB级数据的实时处理和分析，确保复杂查询的秒级响应',
          dataRequirements: '多源数据流、历史数据、计算资源、存储配置、网络带宽、用户并发',
          edgeCases: '数据倾斜、热点数据、网络延迟、节点故障、存储瓶颈、并发冲突',
          painPoints: '大数据查询慢、系统经常卡顿、高并发下性能下降、资源成本高',
          modules: '流处理引擎、分布式存储、计算调度器、缓存系统、监控告警',
          openIssues: '实时性与一致性的平衡、资源使用的优化、故障恢复的策略'
        },
        {
          name: '智能可视化生成器',
          priority: 'High',
          features: '自动图表推荐、交互式可视化、自定义样式、响应式设计、动画效果、导出分享',
          businessLogic: '根据数据特征和分析目标，自动推荐最适合的可视化类型，支持高度定制',
          dataRequirements: '数据类型、数据分布、字段含义、业务场景、用户偏好、设备信息',
          edgeCases: '高维数据展示、大数据量渲染、色彩搭配、多语言支持、无障碍访问',
          painPoints: '不知道选择什么图表、可视化效果不专业、交互体验差、移动端适配问题',
          modules: '图表引擎、布局算法、交互控制器、样式管理器、渲染优化器',
          openIssues: '图表推荐的准确性、复杂可视化的性能优化、美观性的自动化保证'
        },
        {
          name: 'AutoML机器学习平台',
          priority: 'Middle',
          features: '自动特征工程、模型选择、超参调优、模型评估、部署上线、效果监控',
          businessLogic: '降低机器学习门槛，自动化建模流程，让业务人员也能构建预测模型',
          dataRequirements: '训练数据、验证数据、特征定义、目标变量、评估指标、业务约束',
          edgeCases: '数据不平衡、特征缺失、过拟合问题、模型漂移、解释性要求、在线更新',
          painPoints: '机器学习门槛高、模型效果不佳、部署困难、维护成本高',
          modules: '特征工程器、模型库、调参引擎、评估系统、部署平台',
          openIssues: '自动化程度与控制度的平衡、模型解释性的提供、持续学习的实现'
        }
      ]
    }
  };

  // 将PRD数据转换为生成的文档
  const taskManagerDoc = generatePRDDocument(taskManagerPRD);
  const ecommerceDoc = generatePRDDocument(ecommercePRD);
  const landingPageDoc = generatePRDDocument(landingPagePRD);
  const dataAnalysisAppDoc = generatePRDDocument(dataAnalysisAppPRD);

  const prdCards = [
    {
      id: 'task-manager',
      title: '企业级任务管理平台',
      description: '您的企业级任务管理平台PRD文档已生成完成',
      data: taskManagerPRD,
      document: taskManagerDoc,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'ecommerce',
      title: '全球跨境电商平台',
      description: '您的跨境电商平台PRD文档已生成完成',
      data: ecommercePRD,
      document: ecommerceDoc,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'landing-page',
      title: '智能落地页生成平台',
      description: '您的产品落地页PRD文档已生成完成',
      data: landingPagePRD,
      document: landingPageDoc,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'data-analysis',
      title: '智能数据分析平台',
      description: '您的数据分析APP PRD文档已生成完成',
      data: dataAnalysisAppPRD,
      document: dataAnalysisAppDoc,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const handlePrototypeGeneration = (prdData: PRDGenerationData, cardTitle: string) => {
    try {
      // 保存PRD数据到sessionStorage
      sessionStorage.setItem('prdData', JSON.stringify(prdData));
      
      // 跳转到原型生成页面
      router.push('/ask-anything?view=prototype-house');
      
      showAlert('success', `${cardTitle}的数据已保存，正在跳转到原型生成页面...`);
    } catch (error) {
      console.error('保存PRD数据失败:', error);
      showAlert('error', '数据保存失败，请重试');
    }
  };

  const downloadPRD = (doc: string, filename: string) => {
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showAlert('success', 'PRD文档下载成功');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Alert 提示 */}
      {alertState.type && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="pointer-events-auto animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <AlertSuccess>{alertState.message}</AlertSuccess>
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="w-full max-w-6xl mx-auto py-12 flex flex-col items-center justify-center">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal text-black mb-4">PRD文档卡片测试</h1>
          <p className="text-gray-600">测试多张PRD文档卡片的展示和原型生成功能</p>
        </div>

        {/* PRD卡片网格 */}
        <div className="w-full space-y-8">
          {prdCards.map((card) => (
            <div key={card.id} className="w-full flex justify-center animate-card-appear">
              <Expandable 
                expandDirection="both"
                expandBehavior="push"
                defaultExpanded={true}
              >
                <ExpandableCard 
                  collapsedSize={{ width: 480, height: 140 }} 
                  expandedSize={{ width: 800, height: undefined }} 
                  className="mx-auto"
                  hoverToExpand={false}
                >
                  <ExpandableTrigger>
                    <ExpandableCardHeader className="py-6 cursor-pointer h-full">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${card.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <FileText className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
                          <p className="text-sm text-gray-500">{card.description}</p>
                        </div>
                      </div>
                    </ExpandableCardHeader>
                  </ExpandableTrigger>
                  
                  <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
                    <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <div className="pt-4 pb-2">
                        <div className="pr-2">
                          <PRDDocumentDisplay 
                            content={card.document}
                            onCopy={() => showAlert('success', 'PRD已复制到剪贴板')}
                            onDownload={() => downloadPRD(card.document, card.title)}
                          />
                        </div>
                      </div>
                    </ExpandableCardContent>
                    
                    <ExpandableCardFooter>
                      <div className="flex items-center justify-center w-full pt-4 gap-3">
                        <Button 
                          variant="outline" 
                          className="border-gray-300" 
                          onClick={() => downloadPRD(card.document, card.title)}
                        >
                          下载文档
                        </Button>
                        <Button 
                          onClick={() => handlePrototypeGeneration(card.data, card.title)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          生成原型
                        </Button>
                      </div>
                    </ExpandableCardFooter>
                  </ExpandableContent>
                </ExpandableCard>
              </Expandable>
            </div>
          ))}
        </div>

        {/* 使用说明 */}
        <div className="mt-16 max-w-2xl text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 点击任意卡片可展开查看完整的PRD文档内容</p>
                         <p>• 点击&quot;生成原型&quot;按钮将保存PRD数据并跳转到原型生成页面</p>
            <p>• 涵盖四大类产品：任务管理平台、电商平台、落地页、数据分析APP</p>
            <p>• 每张卡片都包含详细的PRD数据，包括用户场景、竞品分析、需求解决方案等</p>
            <p>• 可以用于测试原型生成功能的效果和质量</p>
          </div>
        </div>
      </div>

      {/* 自定义样式 */}
      <style>{`
        @keyframes card-appear {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-appear {
          animation: card-appear 0.6s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
} 