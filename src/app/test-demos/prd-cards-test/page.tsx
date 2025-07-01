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

  // 智能任务管理应用 PRD数据
  const taskManagerPRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个智能任务管理应用，帮助用户高效管理日常任务和项目，通过AI智能提醒和自动分类功能，提升工作效率。适合个人用户和小团队使用。',
      'c1_business_line': '生产力工具',
      'c1_product_manager': '张小明',
      'c1_frontend_dev': '李小华',
      'c1_backend_dev': '王小刚',
      'c1_data_analyst': '陈小美',
      'c2_requirement_goal': '帮助用户将工作效率提升30%，减少任务遗漏率至5%以下，提供直观易用的任务管理界面，支持团队协作功能',
      'c5_related_docs': 'https://taskmanager.example.com/api-docs, https://taskmanager.example.com/design-guide'
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
      },
      {
        version: '1.2',
        modifier: '王小刚',
        date: '2024-01-25',
        reason: '性能优化',
        content: '优化数据库查询和缓存机制'
      }
    ],
    userScenarios: [
      {
        userType: '职场白领',
        scenario: '每天需要管理多个项目和任务，经常在不同工具间切换，需要一个统一的任务管理平台',
        painPoint: '现有工具功能分散，操作复杂，容易遗漏重要任务，缺乏智能提醒机制'
      },
      {
        userType: '项目经理',
        scenario: '需要跟踪团队成员的任务进度，协调项目时间线，确保项目按时交付',
        painPoint: '缺乏统一的项目视图，难以实时了解项目状态，团队协作效率低下'
      },
      {
        userType: '自由职业者',
        scenario: '管理多个客户项目，需要精确的时间追踪和优先级管理',
        painPoint: '难以平衡不同客户的优先级，时间管理效率低，缺乏专业的项目管理工具'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '产品团队',
        date: '2024-01-01',
        content: '完成市场调研和用户访谈，确定核心需求'
      },
      {
        version: '0.5',
        author: '设计团队',
        date: '2024-01-10',
        content: '完成UI/UX设计稿，进行用户可用性测试'
      },
      {
        version: '0.8',
        author: '技术团队',
        date: '2024-01-12',
        content: '完成技术架构设计和原型开发'
      }
    ],
    competitors: [
      {
        name: 'Todoist',
        features: '任务管理、项目协作、自然语言处理、跨平台同步',
        advantages: '界面简洁、功能丰富、跨平台同步、社区活跃',
        disadvantages: '高级功能需要付费、缺乏时间追踪、团队功能相对简单',
        marketPosition: '市场领导者，全球用户超过2500万，年收入约1亿美元'
      },
      {
        name: 'Notion',
        features: '文档编辑、数据库、任务管理、团队协作、模板系统',
        advantages: '功能全面、自定义程度高、模板丰富、支持多种内容格式',
        disadvantages: '学习成本高、移动端体验一般、性能在大数据量时较慢',
        marketPosition: '快速增长的全能型工具，估值100亿美元，用户增长迅速'
      },
      {
        name: 'Asana',
        features: '项目管理、团队协作、时间线视图、目标跟踪',
        advantages: '项目管理功能强大、团队协作体验好、企业级功能完善',
        disadvantages: '个人用户功能相对简单、价格较高、界面复杂度高',
        marketPosition: '企业级项目管理工具的主要竞争者，上市公司'
      }
    ],
    requirementSolution: {
      sharedPrototype: '智能任务管理系统',
      requirements: [
        {
          name: '智能任务创建',
          priority: 'High',
          features: '自然语言输入、AI自动分类、智能标签建议、语音输入支持',
          businessLogic: '用户输入任务描述，AI分析内容自动分配分类和优先级，支持语音转文字',
          dataRequirements: '任务标题、描述、截止时间、分类、优先级、标签、创建时间',
          edgeCases: '网络断开时离线创建、语音输入识别错误处理、重复任务检测',
          painPoints: '传统工具需要手动填写多个字段，操作繁琐，分类不智能',
          modules: '任务管理模块、AI分析模块、语音识别模块',
          openIssues: 'AI分类准确性需要持续优化，语音识别在噪音环境下的准确性'
        },
        {
          name: '智能提醒系统',
          priority: 'High',
          features: '基于用户习惯的智能提醒、多渠道通知、自适应提醒频率',
          businessLogic: '分析用户完成任务的时间模式，在最佳时机发送提醒，支持邮件、短信、推送',
          dataRequirements: '用户行为数据、任务完成历史、偏好设置、设备信息',
          edgeCases: '用户时区变更、设备通知权限被拒绝、网络状况不佳',
          painPoints: '固定时间提醒经常被忽略，效果不佳，缺乏个性化',
          modules: '通知模块、数据分析模块、用户行为分析模块',
          openIssues: '如何平衡提醒频率和用户体验，避免过度打扰'
        },
        {
          name: '项目协作看板',
          priority: 'Middle',
          features: '可视化项目进度、团队成员分工、实时同步、评论系统',
          businessLogic: '采用看板模式展示项目状态，支持拖拽操作，实时更新团队动态',
          dataRequirements: '项目信息、任务状态、成员权限、操作日志、评论记录',
          edgeCases: '多人同时编辑冲突、网络同步失败、权限变更处理',
          painPoints: '团队协作缺乏透明度，进度难以追踪，沟通成本高',
          modules: '协作模块、同步模块、权限管理模块',
          openIssues: '实时协作的性能优化，冲突解决机制'
        }
      ]
    }
  };

  // 在线学习平台 PRD数据
  const learningPlatformPRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一个AI驱动的在线学习平台，为不同年龄段的学习者提供个性化的学习路径和智能辅导，支持多种学习方式和实时互动。',
      'c1_business_line': '在线教育',
      'c1_product_manager': '刘教育',
      'c1_frontend_dev': '前端小组',
      'c1_backend_dev': '后端团队',
      'c1_data_analyst': '数据分析师',
      'c2_requirement_goal': '提升学习效果50%，降低学习放弃率至20%以下，构建智能化、个性化的学习生态系统',
      'c5_related_docs': 'https://learning.example.com/pedagogy-docs, https://learning.example.com/ai-models'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '刘教育',
        date: '2024-02-01',
        reason: '平台初始化',
        content: '建立基础学习功能和用户系统'
      },
      {
        version: '1.5',
        modifier: 'AI团队',
        date: '2024-02-15',
        reason: '智能化升级',
        content: '集成AI推荐算法和个性化学习路径'
      }
    ],
    userScenarios: [
      {
        userType: '中学生',
        scenario: '课后需要巩固学习内容，希望有个性化的练习和即时反馈',
        painPoint: '传统教学进度固定，无法针对个人薄弱点进行强化，缺乏学习动机'
      },
      {
        userType: '职场人士',
        scenario: '利用碎片时间学习新技能，提升职业竞争力',
        painPoint: '时间有限，需要高效的学习路径，传统课程时间安排不灵活'
      },
      {
        userType: '终身学习者',
        scenario: '持续学习各种知识，保持好奇心和学习习惯',
        painPoint: '学习资源分散，质量参差不齐，缺乏系统性学习指导'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '教研团队',
        date: '2024-01-15',
        content: '完成教学理论研究和课程体系设计'
      },
      {
        version: '0.8',
        author: '技术团队',
        date: '2024-01-28',
        content: '完成AI推荐引擎和学习分析系统原型'
      }
    ],
    competitors: [
      {
        name: 'Khan Academy',
        features: '免费在线课程、个性化学习仪表盘、练习系统',
        advantages: '内容质量高、完全免费、覆盖面广',
        disadvantages: '缺乏实时互动、课程更新较慢、主要面向K-12教育',
        marketPosition: '非营利在线教育平台的领导者，全球用户1.2亿'
      },
      {
        name: 'Coursera',
        features: '大学课程、专业证书、学位项目',
        advantages: '与知名大学合作、证书含金量高、课程专业性强',
        disadvantages: '价格较高、课程难度偏高、缺乏个性化',
        marketPosition: '在线高等教育平台龙头，市值约30亿美元'
      }
    ],
    requirementSolution: {
      sharedPrototype: 'AI智能学习平台',
      requirements: [
        {
          name: '个性化学习路径',
          priority: 'High',
          features: 'AI推荐算法、学习能力评估、动态路径调整',
          businessLogic: '根据学习者的基础水平、学习目标和进度，动态生成最优学习路径',
          dataRequirements: '学习历史、能力评估结果、学习目标、时间安排',
          edgeCases: '学习者中途改变目标、学习能力评估不准确',
          painPoints: '一刀切的学习方式无法满足个体差异',
          modules: 'AI推荐模块、学习分析模块、内容管理模块',
          openIssues: '如何准确评估学习能力，路径调整的频率和策略'
        },
        {
          name: '智能辅导系统',
          priority: 'High',
          features: '24/7 AI助教、即时答疑、学习指导',
          businessLogic: '利用NLP技术理解学习者问题，提供个性化解答和学习建议',
          dataRequirements: '问题库、知识图谱、学习者提问历史',
          edgeCases: 'AI无法回答的复杂问题、多语言支持',
          painPoints: '传统学习缺乏即时反馈，问题无法及时解决',
          modules: 'NLP模块、知识库模块、对话系统',
          openIssues: 'AI理解准确性、复杂问题的处理策略'
        }
      ]
    }
  };

  // 智能健康管理应用 PRD数据
  const healthAppPRD: PRDGenerationData = {
    answers: {
      'c1_requirement_intro': '一款集成AI健康分析的智能健康管理应用，帮助用户监测健康状况、制定健康计划，并提供专业的健康建议和预警功能。',
      'c1_business_line': '健康医疗',
      'c1_product_manager': '王健康',
      'c1_frontend_dev': '移动端团队',
      'c1_backend_dev': '健康数据团队',
      'c1_data_analyst': '医疗数据专家',
      'c2_requirement_goal': '帮助用户提高健康意识，早期发现健康风险，提升整体健康水平20%，降低慢性病发病率',
      'c5_related_docs': 'https://health.example.com/medical-standards, https://health.example.com/privacy-policy'
    },
    changeRecords: [
      {
        version: '1.0',
        modifier: '王健康',
        date: '2024-03-01',
        reason: '产品立项',
        content: '确定健康监测核心功能和数据安全标准'
      }
    ],
    userScenarios: [
      {
        userType: '中老年人',
        scenario: '关注慢性病管理，需要定期监测血压、血糖等健康指标',
        painPoint: '缺乏专业指导，数据记录繁琐，无法及时发现异常'
      },
      {
        userType: '健身爱好者',
        scenario: '希望通过科学的方法优化运动效果和身体状况',
        painPoint: '缺乏个性化的运动和营养建议，无法准确评估运动效果'
      },
      {
        userType: '上班族',
        scenario: '工作压力大，作息不规律，希望改善亚健康状态',
        painPoint: '缺乏时间和专业知识进行健康管理，不知道如何改善生活方式'
      }
    ],
    iterationHistory: [
      {
        version: '0.1',
        author: '医疗顾问团',
        date: '2024-02-15',
        content: '完成医疗标准调研和合规性分析'
      }
    ],
    competitors: [
      {
        name: 'Apple Health',
        features: '健康数据整合、运动追踪、心率监测',
        advantages: '设备集成度高、数据准确、生态完整',
        disadvantages: '仅限苹果设备、缺乏专业医疗建议',
        marketPosition: 'iOS生态下的健康管理标准，用户基数庞大'
      },
      {
        name: '华为健康',
        features: '运动健康、睡眠监测、压力管理',
        advantages: '本土化程度高、硬件支持好、数据分析准确',
        disadvantages: '主要依赖华为设备、第三方集成有限',
        marketPosition: '国内Android健康管理应用的主要选择'
      }
    ],
    requirementSolution: {
      sharedPrototype: 'AI智能健康管家',
      requirements: [
        {
          name: '健康数据监测',
          priority: 'High',
          features: '多设备数据同步、实时监测、异常预警',
          businessLogic: '整合多种健康设备数据，建立个人健康档案，AI分析异常模式',
          dataRequirements: '生理指标数据、设备信息、历史健康记录',
          edgeCases: '设备故障、数据异常、隐私保护',
          painPoints: '健康数据分散，无法形成完整的健康画像',
          modules: '数据集成模块、监测模块、预警模块',
          openIssues: '医疗数据的准确性验证、隐私保护标准'
        },
        {
          name: 'AI健康建议',
          priority: 'High',
          features: '个性化健康方案、生活方式建议、风险评估',
          businessLogic: '基于个人健康数据和医学知识库，提供个性化的健康改善建议',
          dataRequirements: '健康数据、生活习惯、家族病史、环境因素',
          edgeCases: '医疗建议的责任界定、急症处理指引',
          painPoints: '缺乏专业的健康指导，不知道如何改善健康状况',
          modules: 'AI分析模块、知识库模块、建议生成模块',
          openIssues: 'AI建议的医疗责任、准确性保证'
        }
      ]
    }
  };

  // 将PRD数据转换为生成的文档
  const taskManagerDoc = generatePRDDocument(taskManagerPRD);
  const learningPlatformDoc = generatePRDDocument(learningPlatformPRD);
  const healthAppDoc = generatePRDDocument(healthAppPRD);

  const prdCards = [
    {
      id: 'task-manager',
      title: '智能任务管理系统',
      description: '您的任务管理PRD文档已生成完成',
      data: taskManagerPRD,
      document: taskManagerDoc,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'learning-platform',
      title: 'AI智能学习平台',
      description: '您的在线学习平台PRD文档已生成完成',
      data: learningPlatformPRD,
      document: learningPlatformDoc,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'health-app',
      title: 'AI智能健康管家',
      description: '您的健康管理应用PRD文档已生成完成',
      data: healthAppPRD,
      document: healthAppDoc,
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
            <p>• 每张卡片都包含完整的PRD数据，包括用户场景、竞品分析、需求解决方案等</p>
            <p>• 样式完全复刻PRD工具的原始卡片设计</p>
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