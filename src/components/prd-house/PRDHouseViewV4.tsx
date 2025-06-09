'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download, Plus, X } from 'lucide-react';
import { Typewriter } from '@/components/ui/typewriter';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  type?: 'text' | 'select' | 'input' | 'section_header' | 'dynamic-user-scenarios' | 'dynamic-iteration-history' | 'ai-competitor' | 'priority-select';
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

// 动态记录数据结构
interface ChangeRecord {
  version: string;
  modifier: string;
  content: string;
  reason: string;
  date: string;
}

interface UserScenario {
  userType: string;
  scenario: string;
  painPoint: string;
}

interface IterationHistory {
  version: string;
  date: string;
  content: string;
  author: string;
}

// 基于 internal prd.md 的模板结构
const prdTemplate: PrdChapter[] = [
  // 1. 需求介绍
  {
    id: 'c1',
    title: '需求介绍',
    description: '明确本次迭代的基本信息和历史背景',
    questions: [
      { 
        id: 'c1_business_line', 
        text: '所属业务线', 
        placeholder: '', 
        type: 'select',
        options: ['AiCoin PC', 'AiCoin APP', 'AiCoin Web'],
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c1_pm', 
        text: '需求负责人', 
        placeholder: '@张三', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_frontend', 
        text: '前端', 
        placeholder: '@李四', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_backend', 
        text: '后端', 
        placeholder: '@王五', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_data', 
        text: '数据', 
        placeholder: '@赵六', 
        type: 'input',
        gridColumn: 'col-span-1',
        isRequired: true
      },
      { 
        id: 'c1_requirement_intro', 
        text: '需求介绍', 
        placeholder: '请详细描述本次迭代的需求背景、目标和预期效果...',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c1_change_records', 
        text: '变更记录', 
        placeholder: '变更记录将通过动态添加功能管理',
        gridColumn: 'col-span-2'
      }
    ]
  },
  
  // 2. 需求分析
  {
    id: 'c2',
    title: '需求分析',
    description: '深入探究需求的背景、用户价值和目标',
    questions: [
      { 
        id: 'c2_user_scenarios', 
        text: '用户使用场景', 
        placeholder: '用户场景将通过动态添加功能管理，包含用户类型、使用场景、痛点分析',
        gridColumn: 'col-span-2',
        type: 'dynamic-user-scenarios'
      },
      { 
        id: 'c2_requirement_goal', 
        text: '需求目标', 
        placeholder: '基于上述用户场景，明确我们要针对哪类用户，解决什么痛点，通过什么方式解决，达到什么效果...',
        gridColumn: 'col-span-2',
        isRequired: true
      }
    ]
  },
  
  // 3. 竞品分析
  {
    id: 'c3',
    title: '竞品分析',
    description: '分析市场上的竞争者，借鉴其优缺点',
    questions: [
      { 
        id: 'c3_competitor_analysis', 
        text: '竞品分析', 
        placeholder: '点击AI找竞品按钮，让AI为您分析相关竞品的功能特点、优劣势和改进建议...',
        gridColumn: 'col-span-2',
        hasAI: true,
        type: 'ai-competitor'
      }
    ]
  },
  
  // 4. 需求方案
  {
    id: 'c4',
    title: '需求方案',
    description: '详细的方案设计和实现规划',
    questions: [
      { 
        id: 'c4_requirement', 
        text: '需求', 
        placeholder: '简要描述核心需求',
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c4_features', 
        text: '功能点/流程', 
        placeholder: '主要功能点和操作流程',
        type: 'input',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c4_business_logic', 
        text: '业务逻辑/规则说明', 
        placeholder: '详细的业务规则和逻辑说明...',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_data_requirements', 
        text: '数据需求/校验', 
        placeholder: '数据结构、校验规则、存储要求等...',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_edge_cases', 
        text: '特殊状态/边缘处理', 
        placeholder: '异常情况、边缘场景的处理方案...',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_pain_points', 
        text: '解决用户痛点', 
        placeholder: '说明此方案如何解决用户的具体痛点...',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c4_modules', 
        text: '对应模块', 
        placeholder: '涉及的系统模块、组件等...',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_priority', 
        text: '优先级', 
        placeholder: '',
        type: 'priority-select',
        gridColumn: 'col-span-2',
        isRequired: true
      },
      { 
        id: 'c4_prototype', 
        text: '界面原型', 
        placeholder: 'Figma链接：https://www.figma.com/...',
        type: 'input',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c4_open_issues', 
        text: '开放问题/待定决策', 
        placeholder: '尚未确定的问题、需要进一步讨论的决策点...',
        gridColumn: 'col-span-2'
      }
    ]
  },
  
  // 5. 其余事项
  {
    id: 'c5',
    title: '其余事项',
    description: '相关文档和历史记录',
    questions: [
      { 
        id: 'c5_other_docs', 
        text: '其余文档链接', 
        placeholder: '相关报告、设计文档等链接...',
        type: 'input',
        gridColumn: 'col-span-2'
      },
      { 
        id: 'c5_iteration_history', 
        text: '功能迭代历史', 
        placeholder: '功能迭代历史将通过动态添加功能管理，包含版本、负责人、发布日期、迭代内容',
        gridColumn: 'col-span-2',
        type: 'dynamic-iteration-history'
      }
    ]
  }
];

export default function PRDHouseViewV4() {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('welcome');
  const [chapters] = useState<PrdChapter[]>(prdTemplate);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  // 动态记录状态
  const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([
    { version: '0.1', modifier: '@xxx', content: '', reason: '', date: new Date().toISOString().split('T')[0] }
  ]);
  const [userScenarios, setUserScenarios] = useState<UserScenario[]>([
    { userType: '', scenario: '', painPoint: '' }
  ]);
  const [iterationHistory, setIterationHistory] = useState<IterationHistory[]>([
    { version: '0.1', date: new Date().toISOString().split('T')[0], content: '', author: '@xxx' }
  ]);
  
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
    "听说你又要写 PRD 了",
    "没事哒没事哒",
    "时间差不多咯..."
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

  // 变更记录管理
  const addChangeRecord = () => {
    setChangeRecords(prev => [...prev, { 
      version: `0.${prev.length + 1}`, 
      modifier: '@xxx', 
      content: '', 
      reason: '', 
      date: new Date().toISOString().split('T')[0] 
    }]);
  };

  const removeChangeRecord = (index: number) => {
    if (changeRecords.length > 1) {
      setChangeRecords(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateChangeRecord = (index: number, field: keyof ChangeRecord, value: string) => {
    setChangeRecords(prev => 
      prev.map((record, i) => 
        i === index ? { ...record, [field]: value } : record
      )
    );
  };

  // 用户场景管理
  const addUserScenario = () => {
    setUserScenarios(prev => [...prev, { userType: '', scenario: '', painPoint: '' }]);
  };

  const removeUserScenario = (index: number) => {
    if (userScenarios.length > 1) {
      setUserScenarios(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateUserScenario = (index: number, field: keyof UserScenario, value: string) => {
    setUserScenarios(prev => 
      prev.map((scenario, i) => 
        i === index ? { ...scenario, [field]: value } : scenario
      )
    );
  };

  // 功能迭代历史管理
  const addIterationHistory = () => {
    setIterationHistory(prev => [...prev, { 
      version: `0.${prev.length + 1}`, 
      date: new Date().toISOString().split('T')[0], 
      content: '', 
      author: '@xxx' 
    }]);
  };

  const removeIterationHistory = (index: number) => {
    if (iterationHistory.length > 1) {
      setIterationHistory(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateIterationHistory = (index: number, field: keyof IterationHistory, value: string) => {
    setIterationHistory(prev => 
      prev.map((history, i) => 
        i === index ? { ...history, [field]: value } : history
      )
    );
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
      // 如果是可选的或者没有标记为必填，跳过检查
      if (q.isOptional || !q.isRequired) return true;
      
      // 对于特殊的动态组件，有默认值的话就认为已填写
      if (q.id === 'c1_change_records' || q.id === 'c5_iteration_history') return true;
      if (q.type === 'dynamic-user-scenarios') return true;
      
      const answer = answers[q.id] || '';
      return answer.trim() !== '';
    });
  };

  // 渲染章节卡片
  const renderChapterCards = () => {
    const currentChapter = chapters[currentChapterIndex];
    const isLastChapter = currentChapterIndex === chapters.length - 1;
    const isComplete = isCurrentChapterComplete();
    
    // 统一样式类名 - 去掉蓝色边框
    const inputClassName = "border-gray-300";
    const textareaClassName = "border-gray-300";

    const renderQuestionInput = (question: Question) => {
      // 业务线选择
      if (question.type === 'select') {
        return (
          <div>
            <Label className="block text-md font-medium text-gray-700 mb-3">
              {question.text} {question.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex flex-wrap gap-6">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <Checkbox 
                    id={`${question.id}-${option}`}
                    checked={answers[question.id] === option}
                    onCheckedChange={() => handleAnswerChange(question.id, option)}
                    className="border-gray-400"
                  />
                  <span className="text-base">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      }

      // 优先级选择
      if (question.type === 'priority-select') {
        return (
          <div>
            <Label className="block text-md font-medium text-gray-700 mb-3">
              {question.text} {question.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex flex-wrap gap-6">
              {['High', 'Middle', 'Low'].map((priority) => (
                <label key={priority} className="flex items-center space-x-3 cursor-pointer">
                  <Checkbox 
                    checked={answers[question.id] === priority}
                    onCheckedChange={() => handleAnswerChange(question.id, priority)}
                    className="border-gray-400"
                  />
                  <span className="text-base">{priority}</span>
                </label>
              ))}
            </div>
          </div>
        );
      }

      // 变更记录动态组件
      if (question.id === 'c1_change_records') {
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-md font-medium text-gray-700">变更记录</Label>
              <Button
                onClick={addChangeRecord}
                size="sm"
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                添加记录
              </Button>
            </div>
            
            <div className="space-y-4">
              {changeRecords.map((record, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">变更记录 #{index + 1}</h4>
                    {changeRecords.length > 1 && (
                      <Button
                        onClick={() => removeChangeRecord(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">版本</Label>
                      <Input
                        value={record.version}
                        onChange={(e) => updateChangeRecord(index, 'version', e.target.value)}
                        placeholder="0.1"
                        className={`${inputClassName} text-sm`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">修订人</Label>
                      <Input
                        value={record.modifier}
                        onChange={(e) => updateChangeRecord(index, 'modifier', e.target.value)}
                        placeholder="@xxx"
                        className={`${inputClassName} text-sm`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">修订日期</Label>
                      <Input
                        value={record.date}
                        onChange={(e) => updateChangeRecord(index, 'date', e.target.value)}
                        placeholder="2025-06-08"
                        className={`${inputClassName} text-sm`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">修订原因</Label>
                      <Input
                        value={record.reason}
                        onChange={(e) => updateChangeRecord(index, 'reason', e.target.value)}
                        placeholder="功能优化"
                        className={`${inputClassName} text-sm`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600 mb-1 block">修订内容</Label>
                      <Textarea
                        value={record.content}
                        onChange={(e) => updateChangeRecord(index, 'content', e.target.value)}
                        rows={2}
                        placeholder="描述本次修订的具体内容..."
                        className={`${textareaClassName} text-sm`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 用户场景动态组件
      if (question.type === 'dynamic-user-scenarios') {
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-md font-medium text-gray-700">用户使用场景</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {/* AI扩展功能 */}}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI扩展
                </Button>
                <Button
                  onClick={addUserScenario}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加用户
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {userScenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">用户场景 #{index + 1}</h4>
                    {userScenarios.length > 1 && (
                      <Button
                        onClick={() => removeUserScenario(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">用户类型</Label>
                      <Input
                        value={scenario.userType}
                        onChange={(e) => updateUserScenario(index, 'userType', e.target.value)}
                        placeholder="如：新用户、活跃用户、企业用户..."
                        className={`${inputClassName} text-sm`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">使用场景</Label>
                      <Textarea
                        value={scenario.scenario}
                        onChange={(e) => updateUserScenario(index, 'scenario', e.target.value)}
                        rows={2}
                        placeholder="详细描述用户在什么情况下会使用这个功能..."
                        className={`${textareaClassName} text-sm`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">痛点分析</Label>
                      <Textarea
                        value={scenario.painPoint}
                        onChange={(e) => updateUserScenario(index, 'painPoint', e.target.value)}
                        rows={2}
                        placeholder="用户在当前情况下遇到的问题和困难..."
                        className={`${textareaClassName} text-sm`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 功能迭代历史动态组件
      if (question.type === 'dynamic-iteration-history') {
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-md font-medium text-gray-700">功能迭代历史</Label>
              <Button
                onClick={addIterationHistory}
                size="sm"
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                添加记录
              </Button>
            </div>
            
            <div className="space-y-4">
              {iterationHistory.map((history, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">迭代记录 #{index + 1}</h4>
                    {iterationHistory.length > 1 && (
                      <Button
                        onClick={() => removeIterationHistory(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">版本</Label>
                        <Input
                          value={history.version}
                          onChange={(e) => updateIterationHistory(index, 'version', e.target.value)}
                          placeholder="v1.0"
                          className={`${inputClassName} text-sm`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">负责人</Label>
                        <Input
                          value={history.author}
                          onChange={(e) => updateIterationHistory(index, 'author', e.target.value)}
                          placeholder="@xxx"
                          className={`${inputClassName} text-sm`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">发布日期</Label>
                        <Input
                          value={history.date}
                          onChange={(e) => updateIterationHistory(index, 'date', e.target.value)}
                          placeholder="2025-06-08"
                          className={`${inputClassName} text-sm`}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">迭代内容</Label>
                      <Textarea
                        value={history.content}
                        onChange={(e) => updateIterationHistory(index, 'content', e.target.value)}
                        rows={2}
                        placeholder="描述本次迭代的主要功能和改进..."
                        className={`${textareaClassName} text-sm`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // AI竞品分析
      if (question.type === 'ai-competitor') {
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-md font-medium text-gray-700">竞品分析</Label>
              <Button
                onClick={() => {/* AI找竞品功能 */}}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI找竞品
              </Button>
            </div>
            
            <Textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={8}
              className={textareaClassName}
            />
          </div>
        );
      }

      // Input类型
      if (question.type === 'input') {
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-md font-medium text-gray-700">
                {question.text} 
                {question.isRequired && <span className="text-red-500">*</span>}
                {question.isOptional && <span className="text-gray-400">(可选)</span>}
              </Label>
            </div>
            
            <Input
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className={inputClassName}
            />
          </div>
        );
      }

      // 默认为textarea
      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-md font-medium text-gray-700">
              {question.text} 
              {question.isRequired && <span className="text-red-500">*</span>}
              {question.isOptional && <span className="text-gray-400">(可选)</span>}
            </Label>
          </div>
          
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={textareaClassName}
          />
          
          {question.hint && (
            <p className="text-xs text-gray-500 mt-1">{question.hint}</p>
          )}
        </div>
      );
    };
    
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
                <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="pt-4 pb-2">
                    <div className="grid grid-cols-2 gap-6 pr-2">
                      {currentChapter.questions.map(question => (
                        <div key={question.id} className={question.gridColumn || 'col-span-1'}>
                          {renderQuestionInput(question)}
                        </div>
                      ))}
                    </div>
                  </div>
                </ExpandableCardContent>
                
                <ExpandableCardFooter>
                  <div className="flex items-center justify-between w-full pt-4">
                    <Button variant="outline" className="border-gray-300" onClick={handlePreviousChapter} disabled={currentChapterIndex === 0 || isLoading}>
                      上一步
                    </Button>
                    {isLastChapter ? (
                      <form onSubmit={generatePRD} className="flex-1 ml-4">
                        <Button
                          type="submit"
                          disabled={isLoading || !isComplete}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              生成文档中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI 生成完整文档
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleNextChapter} disabled={isLoading || !isComplete}>
                        下一步
                      </Button>
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
              <h1 className="text-6xl font-normal text-black">PRD GAME START</h1>
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

          /* 自定义滚动条样式 */
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