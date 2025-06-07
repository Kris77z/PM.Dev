'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download } from 'lucide-react';
import { Typewriter } from '@/components/ui/typewriter';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableCardHeader, 
  ExpandableCardContent,
  ExpandableContent,
  ExpandableTrigger,
  ExpandableCardFooter
} from '@/components/ui/expandable';
import { useCompletion } from 'ai/react';
import { MarkdownPreview } from '@/components/ui/markdown-preview';
import { 
  Stepper, 
  StepperItem, 
  StepperTrigger, 
  StepperIndicator, 
  StepperSeparator 
} from '@/components/ui/stepper';

// --- 定义新工作流和数据结构 ---

type WorkflowStage = 'welcome' | 'guiding' | 'generating' | 'completed';

interface Question {
  id: string;
  text: string;
  placeholder?: string;
  hint?: string;
  isOptional?: boolean;
  type?: 'text' | 'select' | 'input' | 'section_header';
  options?: string[];
  gridColumn?: string;
  isRequired?: boolean;
  hasAI?: boolean;
  aiPrompt?: string;
  isAIGenerated?: boolean;
}

interface PrdChapter {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

// 基于 internal prd.md 的模板结构
const prdTemplate: PrdChapter[] = [
  {
    id: 'c1',
    title: '需求介绍',
    description: '明确本次迭代的基本信息和历史背景。',
    questions: [
      { id: 'c1_business', text: '所属业务线', placeholder: '', type: 'select', options: ['AiCoin PC', 'AiCoin APP', 'AiCoin Web'] },
      { id: 'c1_pm', text: '需求负责人', placeholder: '@张三', type: 'input' },
      { id: 'c1_frontend', text: '前端负责人', placeholder: '@李四', type: 'input' },
      { id: 'c1_backend', text: '后端负责人', placeholder: '@王五', type: 'input' },
      { id: 'c1_data', text: '数据负责人', placeholder: '@赵六', type: 'input' },
      { id: 'c1_test', text: '测试负责人', placeholder: '@孙七', type: 'input' },
      { id: 'c1_design', text: '设计负责人', placeholder: '@周八', type: 'input' },
      { id: 'c1_brief', text: '需求简述', placeholder: '用一句话描述本次迭代的核心目标，例如：为解决新用户注册流程复杂的问题，上线手机号一键登录功能', type: 'input' },
      { id: 'c1_history', text: '变更记录', placeholder: '版本：0.1\n修订人：@xxx\n修订内容：\n修订原因：\n日期：' }
    ]
  },
  {
    id: 'c2',
    title: '需求分析',
    description: '深入探究需求的背景、用户价值和目标。',
    questions: [
      // 用户使用场景分析 - 采用结构化布局
      { 
        id: 'c2_user_scenarios_section', 
        text: '用户使用场景分析', 
        placeholder: '', 
        type: 'section_header'
      },
      { 
        id: 'c2_user_type_1', 
        text: '用户类型1', 
        placeholder: '例如：新手用户', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c2_scenario_1', 
        text: '使用场景1', 
        placeholder: '例如：第一次使用该功能', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c2_pain_point_1', 
        text: '具体痛点1', 
        placeholder: '例如：不知道从哪里开始使用，功能入口分散', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c2_user_type_2', 
        text: '用户类型2', 
        placeholder: '例如：普通用户', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c2_scenario_2', 
        text: '使用场景2', 
        placeholder: '例如：日常使用推荐参数', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c2_pain_point_2', 
        text: '具体痛点2', 
        placeholder: '例如：推荐参数不合理，效果不理想', 
        type: 'input',
        gridColumn: 'col-span-2',
        isOptional: true 
      },
      
      // 需求目标设定 - 添加AI协作功能
      { 
        id: 'c2_goals_section', 
        text: '需求目标设定', 
        placeholder: '', 
        type: 'section_header'
      },
      { 
        id: 'c2_goal_brief', 
        text: '核心目标描述', 
        placeholder: '例如：提升新用户使用成功率，减少操作复杂度', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true,
        hasAI: true,
        aiPrompt: '基于这个核心目标，生成详细的主要目标、次要目标和可量化指标'
      },
      { 
        id: 'c2_goal_primary', 
        text: '主要目标', 
        placeholder: '例如：提升新用户首次使用成功率至80%', 
        type: 'input',
        gridColumn: 'col-span-1',
        isAIGenerated: true
      },
      { 
        id: 'c2_goal_secondary', 
        text: '次要目标', 
        placeholder: '例如：降低用户操作步骤从5步减少到3步', 
        type: 'input',
        gridColumn: 'col-span-1',
        isAIGenerated: true
      },
      { 
        id: 'c2_goal_metrics', 
        text: '可量化指标', 
        placeholder: '例如：提升功能使用率15%，降低客服咨询量20%', 
        type: 'input',
        gridColumn: 'col-span-2',
        isAIGenerated: true
      }
    ]
  },
  {
    id: 'c3',
    title: '竞品分析',
    description: '分析市场上的竞争者，借鉴其优缺点。',
    questions: [
      // 竞品对比分析 - 结构化布局
      { 
        id: 'c3_competitor_analysis_section', 
        text: '竞品对比分析', 
        placeholder: '', 
        type: 'section_header'
      },
      { 
        id: 'c3_competitor_1_name', 
        text: '竞品1名称', 
        placeholder: '例如：微信', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c3_competitor_1_feature', 
        text: '竞品1核心特性', 
        placeholder: '例如：一键转发、多群同步、消息撤回', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c3_competitor_1_ux', 
        text: '竞品1用户体验', 
        placeholder: '例如：操作简单直观，但功能入口较深', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c3_competitor_2_name', 
        text: '竞品2名称', 
        placeholder: '例如：钉钉', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c3_competitor_2_feature', 
        text: '竞品2核心特性', 
        placeholder: '例如：审批流程、已读回执、群公告', 
        type: 'input',
        gridColumn: 'col-span-1',
        isOptional: true 
      },
      { 
        id: 'c3_competitor_2_ux', 
        text: '竞品2用户体验', 
        placeholder: '例如：功能丰富但学习成本较高', 
        type: 'input',
        gridColumn: 'col-span-2',
        isOptional: true 
      },
      
      // SWOT分析 - 添加AI协作功能
      { 
        id: 'c3_swot_section', 
        text: 'SWOT 分析', 
        placeholder: '', 
        type: 'section_header'
      },
      { 
        id: 'c3_swot_brief', 
        text: '分析背景', 
        placeholder: '例如：在即时通讯领域，我们需要分析自身相对竞品的优劣势', 
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true,
        hasAI: true,
        aiPrompt: '基于这个分析背景，生成详细的SWOT分析内容'
      },
      { 
        id: 'c3_our_strength', 
        text: '我们的优势(S)', 
        placeholder: '例如：技术领先、用户基础大、品牌知名度高', 
        type: 'input',
        gridColumn: 'col-span-1',
        isAIGenerated: true
      },
      { 
        id: 'c3_our_weakness', 
        text: '我们的劣势(W)', 
        placeholder: '例如：功能相对简单、缺乏差异化特性', 
        type: 'input',
        gridColumn: 'col-span-1',
        isAIGenerated: true
      },
      { 
        id: 'c3_opportunities', 
        text: '市场机会(O)', 
        placeholder: '例如：用户对隐私保护需求增加、新兴市场待开发', 
        type: 'input',
        gridColumn: 'col-span-1',
        isAIGenerated: true
      },
      { 
        id: 'c3_threats', 
        text: '潜在威胁(T)', 
        placeholder: '例如：竞品快速迭代、新入局者技术颠覆', 
        type: 'input',
        gridColumn: 'col-span-1',
        isAIGenerated: true
      },
      { 
        id: 'c3_improvement_suggestions', 
        text: '改进建议', 
        placeholder: '基于以上分析，提出我们产品的具体优化建议和差异化机会...',
        gridColumn: 'col-span-2'
      }
    ]
  },
  {
    id: 'c4',
    title: '需求方案',
    description: '具体描述为实现需求所设计的功能和逻辑。',
    questions: [
      { 
        id: 'c4_overview', 
        text: '需求概览', 
        placeholder: '设立优先级标准：High（紧急）、Middle（一般）、Low（灵活）\n\n对应2.2需求目标，简要说明是个设计或逻辑想法如何解决痛点或达成目标的\n\n不涉及到规则和数据需求的对应部分可省略\n\n需求 | 功能点/流程 | 业务逻辑/规则说明 | 数据需求/校验 | 特殊状态/边缘处理 | 组件库使用 | 解决用户痛点 | 对应模块 | 优先级\n...' 
      },
      { 
        id: 'c4_figma_link', 
        text: 'Figma原型链接', 
        placeholder: 'https://figma.com/file/...', 
        type: 'input' 
      },
      { 
        id: 'c4_prototype_desc', 
        text: '原型说明', 
        placeholder: '简要描述界面流程和关键交互，或贴入关键界面截图说明' 
      },
      { 
        id: 'c4_acceptance', 
        text: '验收情况', 
        placeholder: '根据当前需求必须完成的功能和用户体验方面的验收要求\n\n需求分给相关人员并发流程化JAD人员需要同步填写验收标准，由产品经理一步完成PRD文档中，时间是其他\n\n相应验收标准下方提取与验收标准力为公式。基线、优化，用以判断bug是否当前版本一定要修复\n\n等级验收进度说明：\n\n必过 | 核心业务流程 | 具体验收标准 | 验收方法/工具 | 验收责任通过\n基线 | 基础功能可用性 | 具体标准 | 方法 | 责任人\n优化 | 体验增项 | 具体标准 | 方法 | 责任人' 
      },
      { 
        id: 'c4_open_issues', 
        text: '开放问题/待定决策', 
        placeholder: '用于记录讨论中尚未明确，需要后续跟进或已做出但需要记录的重要决策点' 
      }
    ]
  },
  {
    id: 'c5',
    title: '其余事项',
    description: '相关文档和迭代历史记录。',
    questions: [
      { 
        id: 'c5_competitor_report', 
        text: '竞品清单链接', 
        placeholder: 'https://docs.google.com/spreadsheets/...', 
        type: 'input',
        isOptional: true 
      },
      { 
        id: 'c5_data_report', 
        text: '数据分析报告链接', 
        placeholder: 'https://analytics.example.com/...', 
        type: 'input',
        isOptional: true 
      },
      { 
        id: 'c5_user_research', 
        text: '用户调研报告链接', 
        placeholder: 'https://user-research.example.com/...', 
        type: 'input',
        isOptional: true 
      },
      { 
        id: 'c5_other_docs', 
        text: '其他相关文档', 
        placeholder: '其他需要说明的文档链接或描述...',
        isOptional: true 
      },
      { 
        id: 'c5_history', 
        text: '功能迭代历史', 
        placeholder: '版本号 | 需求文档 | 主要变更/优化内容 | 负责PM | 日期\nV1.0 | | 首次上线核心网格交易功能 | | 2025.04.21\n...' 
      }
    ]
  }
];

export default function PRDHouseViewV4() {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('welcome');
  const [chapters] = useState<PrdChapter[]>(prdTemplate);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  const { completion, handleSubmit, isLoading } = useCompletion({
    api: '/api/generate-prd',
    onFinish: () => {
      setWorkflowStage('completed');
    }
  });

  // UI 流程控制
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [startFadeOut, setStartFadeOut] = useState(false);

  const welcomeTexts = [
    "你好！我是你的专属产品顾问 🌟",
    "我们将依据团队标准模板，撰写一份迭代PRD",
    "让我们开始吧..."
  ];

  // 监听typewriter动画完成
  useEffect(() => {
    if (workflowStage === 'welcome' && showWelcome) {
      const totalTime = welcomeTexts.join('').length * 80 + welcomeTexts.length * 2000 + 1000;
      
      const fadeOutTimer = setTimeout(() => {
        setStartFadeOut(true);
        setTimeout(() => {
          handleWelcomeComplete();
        }, 500); 
      }, totalTime - 500);
      
      return () => {
        clearTimeout(fadeOutTimer);
      };
    }
  }, [workflowStage, showWelcome]);

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
    }
  };

  const handleStartClick = () => {
    setShowStartScreen(false);
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setWorkflowStage('guiding');
    setShowChapters(true);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const generatePRD = (e: React.FormEvent<HTMLFormElement>) => {
    setWorkflowStage('generating');
    // 使用 aihooks 的 handleSubmit
    handleSubmit(e, {
      body: { answers, chapters }
    });
  };

  // 重新开始
  const restart = () => {
    setWorkflowStage('welcome');
    setAnswers({});
    setShowStartScreen(true);
    setShowWelcome(false);
    setShowChapters(false);
    setStartFadeOut(false);
    setCurrentChapterIndex(0);
  };
  
  // 复制PRD内容
  const copyPRD = () => {
    navigator.clipboard.writeText(completion).then(() => {
      console.log('PRD copied to clipboard');
      // 可以加一个 toast 提示
    });
  };

  // 下载PRD文件
  const downloadPRD = () => {
    const blob = new Blob([completion], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD-功能迭代.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 检查当前章节是否完成
  const isCurrentChapterComplete = () => {
    const currentChapter = chapters[currentChapterIndex];
    return currentChapter.questions.every(q => {
      if (q.isOptional) return true;
      const answer = answers[q.id] || '';
      return answer.trim() !== '';
    });
  };

  // 渲染章节卡片
  const renderChapterCards = () => {
    const currentChapter = chapters[currentChapterIndex];
    const isLastChapter = currentChapterIndex === chapters.length - 1;
    const isComplete = isCurrentChapterComplete();
    
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center animate-card-appear" style={{ minHeight: '80vh' }}>
        {/* 步骤指示器 */}
        <div className="mb-12 w-full max-w-2xl space-y-3">
          <Stepper value={currentChapterIndex + 1} className="w-full">
            {chapters.map((chapter, index) => (
              <StepperItem 
                key={chapter.id} 
                step={index + 1}
                completed={index < currentChapterIndex || (index === currentChapterIndex && isComplete)}
                className="flex-1"
              >
                <StepperTrigger 
                  className="w-full flex-col items-start gap-2" 
                  asChild 
                  disabled={index > currentChapterIndex}
                >
                  <StepperIndicator asChild className="h-2 w-full rounded-none bg-gray-200 data-[state=completed]:bg-orange-500 data-[state=active]:bg-orange-500">
                    <span className="sr-only">{index + 1}</span>
                  </StepperIndicator>
                </StepperTrigger>
                {index < chapters.length - 1 && <StepperSeparator className="data-[state=completed]:bg-orange-500"/>}
              </StepperItem>
            ))}
          </Stepper>
          <div className="text-sm font-medium tabular-nums text-muted-foreground text-center">
            步骤 {currentChapterIndex + 1} / {chapters.length}
          </div>
        </div>
      
        <div className="w-full flex justify-center">
          <Expandable 
            key={currentChapter.id} 
            expandDirection="both"
            expandBehavior="push"
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
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">{currentChapter.title}</h2>
                      <p className="text-sm text-gray-500">{currentChapter.description}</p>
                    </div>
                  </div>
                </ExpandableCardHeader>
              </ExpandableTrigger>
              
              <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
                <ExpandableCardContent>
                  <div className="space-y-4 pt-4">
                    {currentChapter.questions.map(q => (
                      <div key={q.id}>
                        <Label className="block text-md font-medium text-gray-700 mb-2">
                          {q.text}
                          {q.isOptional && <span className="text-sm font-normal text-gray-500 ml-1">(选填)</span>}
                          {!q.isOptional && <span className="text-red-500 ml-1">*</span>}
                        </Label>
{q.type === 'select' && q.options ? (
                          <div className="flex flex-wrap gap-6">
                            {q.options.map((option) => (
                              <Label key={option} className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox 
                                  id={`option-${q.id}-${option}`}
                                  checked={answers[q.id] === option}
                                  onCheckedChange={() => handleAnswerChange(q.id, option)}
                                  className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                />
                                <span className="text-base">{option}</span>
                              </Label>
                            ))}
                          </div>
                        ) : q.type === 'input' ? (
                          <Input
                            type="text"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="focus:ring-orange-500/20 focus-visible:border-orange-500"
                            placeholder={q.placeholder}
                            disabled={isLoading}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <textarea
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            rows={q.id.includes('logic') ? 8 : 4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 resize-y"
                            placeholder={q.placeholder}
                            disabled={isLoading}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                          />
                        )}
                        {q.hint && <p className="text-sm text-gray-500 mt-2">{q.hint}</p>}
                      </div>
                    ))}
                  </div>
                </ExpandableCardContent>
                
                <ExpandableCardFooter>
                  <div className="flex items-center gap-6 w-full pt-4">
                    <button
                      onClick={handlePreviousChapter}
                      disabled={currentChapterIndex === 0 || isLoading}
                      className="py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一步
                    </button>

                    {isLastChapter ? (
                      <form onSubmit={generatePRD} className="flex-1">
                        <button
                          type="submit"
                          disabled={isLoading || !isComplete}
                          className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              生成文档中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              AI 生成完整文档
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={handleNextChapter}
                        disabled={isLoading || !isComplete}
                        className="flex-1 py-2 px-4 bg-orange-500 text-white font-semibold rounded-md shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        下一步
                      </button>
                    )}
                  </div>
                </ExpandableCardFooter>
              </ExpandableContent>
            </ExpandableCard>
          </Expandable>
        </div>
      </div>
    );
  };
  
  const renderGeneratingView = () => (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-4">AI 正在为您生成PRD...</h2>
        <p className="text-gray-600 text-center mb-8">请稍候，我们将您的想法转化为专业的文档。</p>
        <MarkdownPreview content={completion} />
      </div>
    </div>
  );
  
  const renderCompletedView = () => (
     <div className="w-full max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">您的产品需求文档已生成！</h2>
              <p className="text-sm text-gray-600 mt-1">您可以复制内容或直接下载Markdown文件。</p>
            </div>
            <div className="flex gap-2">
                <button
                  onClick={copyPRD}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors duration-200"
                >
                  <Copy className="h-5 w-5" />
                  复制
                </button>
                <button
                  onClick={downloadPRD}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 transition-colors duration-200"
                >
                  <Download className="h-5 w-5" />
                  下载
                </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <MarkdownPreview content={completion} />
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={restart}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            撰写新PRD
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl mx-auto">
        
        {workflowStage === 'welcome' && showStartScreen && (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="text-center space-y-12 max-w-2xl">
              <h1 className="text-6xl font-normal text-black">又来写 PRD 啦？</h1>
              <div className="flex justify-center">
                <button
                  onClick={handleStartClick}
                  className="btn-class-name"
                >
                  <div className="back"></div>
                  <div className="front"></div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {workflowStage === 'welcome' && showWelcome && (
          <div className="flex flex-col items-center justify-center h-screen">
            <div className={`text-center space-y-8 max-w-md ${startFadeOut ? 'animate-typewriter-fade' : ''}`}>
              <div className="text-2xl text-gray-800 min-h-[3rem] flex items-center justify-center">
                <Typewriter
                  text={welcomeTexts}
                  speed={80}
                  waitTime={1500}
                  loop={false}
                  className="text-center"
                  showCursor={true}
                  cursorChar="✨"
                />
              </div>
            </div>
          </div>
        )}
        
        {workflowStage === 'guiding' && showChapters && renderChapterCards()}
        {workflowStage === 'generating' && renderGeneratingView()}
        {workflowStage === 'completed' && renderCompletedView()}

        {/* Custom animations */}
        <style jsx>{`
          @keyframes typewriter-fade-out {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.95); }
          }
          .animate-typewriter-fade {
            animation: typewriter-fade-out 0.5s ease-out forwards;  
          }
          
          @keyframes card-appear {
            0% { opacity: 0; transform: translateY(30px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-card-appear {
            animation: card-appear 0.6s ease-out forwards;
          }
          
          .btn-class-name {
            --primary: 249, 115, 22;
            --secondary: 234, 88, 12;
            width: 60px;
            height: 50px;
            border: none;
            outline: none;
            cursor: pointer;
            user-select: none;
            touch-action: manipulation;
            outline: 8px solid rgb(var(--primary), .2);
            border-radius: 50%;
            position: relative;
            transition: .3s;
          }

          .btn-class-name .back {
            background: rgb(var(--secondary));
            border-radius: 50%;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }

          .btn-class-name .front {
            background: linear-gradient(135deg, rgba(var(--primary), .8) 0%, rgba(var(--primary)) 50%, rgba(var(--primary), .9) 100%);
            box-shadow: 0 4px 12px rgba(var(--secondary), .3);
            border-radius: 50%;
            position: absolute;
            border: 1px solid rgba(var(--secondary), .3);
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transform: translateY(-10%);
            transition: all .2s ease;
          }

          .btn-class-name:active .front {
            transform: translateY(-2%);
            box-shadow: 0 2px 6px rgba(var(--secondary), .2);
          }

          .btn-class-name:hover {
            outline: 8px solid rgb(var(--primary), .4);
          }

          .btn-class-name:hover .front {
            transform: translateY(-12%);
            box-shadow: 0 6px 16px rgba(var(--secondary), .4);
          }
        `}</style>
      </div>
    </div>
  );
} 