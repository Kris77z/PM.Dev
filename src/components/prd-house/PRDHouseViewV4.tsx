'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Download, Plus, X, Loader2, CheckCircle } from 'lucide-react';
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
import { 
  Stepper, 
  StepperItem, 
  StepperTrigger, 
  StepperIndicator, 
  StepperSeparator 
} from '@/components/ui/stepper';


// --- 定义新工作流和数据结构 ---

type WorkflowStage = 'welcome' | 'guiding' | 'ai-review' | 'prd-generation' | 'completed';

// 视图模式：单个卡片展示 or 概览模式（显示所有卡片）
type ViewMode = 'single' | 'overview';

interface Question {
  id: string;
  text: string;
  placeholder?: string;
  hint?: string;
  isOptional?: boolean;
  type?: 'text' | 'select' | 'input' | 'section_header' | 'dynamic-user-scenarios' | 'dynamic-iteration-history' | 'ai-competitor' | 'priority-select' | 'dynamic-requirement-solution';
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

interface CompetitorItem {
  name: string;
  features: string;
  advantages: string;
  disadvantages: string;
  marketPosition: string;
}

interface RequirementItem {
  name: string;
  features: string;
  businessLogic: string;
  dataRequirements: string;
  edgeCases: string;
  painPoints: string;
  modules: string;
  priority: 'High' | 'Middle' | 'Low';
  openIssues: string;
}

interface RequirementSolution {
  sharedPrototype: string;
  requirements: RequirementItem[];
}

interface ContentReview {
  score: number;
  isReadyForGeneration: boolean;
  issues?: Array<{
    level: 'error' | 'warning' | 'info';
    field: string;
    message: string;
    suggestion: string;
  }>;
  summary: string;
  recommendations?: string[];
}

interface FeatureSuggestion {
  featureName: string;
  description: string;
  workflow: string;
  value: string;
}

interface EdgeCaseSuggestion {
  category: string;
  scenario: string;
  issue: string;
  solution: string;
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
        isRequired: true,
        hasAI: true,
        aiPrompt: 'generate-requirement-goal'
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
    description: '详细的方案设计和实现规划，支持拆解为多个小需求',
    questions: [
      { 
        id: 'c4_requirement_solution', 
        text: '需求方案', 
        placeholder: '需求方案将通过动态添加功能管理，支持拆解为多个小需求',
        gridColumn: 'col-span-2',
        type: 'dynamic-requirement-solution'
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
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  
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
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([
    { name: '', features: '', advantages: '', disadvantages: '', marketPosition: '' }
  ]);
  
  // AI相关状态
  const [isAILoading, setIsAILoading] = useState<{ [key: string]: boolean }>({});
  const [contentReview, setContentReview] = useState<ContentReview | null>(null);

  // 需求方案状态
  const [requirementSolution, setRequirementSolution] = useState<RequirementSolution>({
    sharedPrototype: '',
    requirements: [{
      name: '',
      features: '',
      businessLogic: '',
      dataRequirements: '',
      edgeCases: '',
      painPoints: '',
      modules: '',
      priority: 'High',
      openIssues: ''
    }]
  });

  const { handleSubmit, isLoading } = useCompletion({
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

  // AI功能实现
  const handleAIUserScenarioExpansion = async () => {
    const requirementIntro = answers['c1_requirement_intro'];
    
    if (!requirementIntro) {
      alert('请先填写需求介绍');
      return;
    }

    setIsAILoading(prev => ({ ...prev, 'expand-user-scenarios': true }));
    
    try {
      const response = await fetch('/api/ai-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: 'expand-user-scenarios',
          data: {
            requirementIntro
          }
        })
      });

      if (!response.ok) throw new Error('AI请求失败');
      
      const result = await response.json();
      if (result.success && result.scenarios) {
        // 替换现有的用户场景
        setUserScenarios(result.scenarios);
        alert(`成功扩展了 ${result.scenarios.length} 个用户场景！`);
      }
    } catch (error) {
      console.error('AI用户场景扩展失败:', error);
      alert('AI扩展失败，请稍后重试');
    } finally {
      setIsAILoading(prev => ({ ...prev, 'expand-user-scenarios': false }));
    }
  };
  
  // 竞品管理功能
  const addCompetitor = () => {
    setCompetitors(prev => [...prev, { name: '', features: '', advantages: '', disadvantages: '', marketPosition: '' }]);
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index: number, field: keyof CompetitorItem, value: string) => {
    setCompetitors(prev => 
      prev.map((competitor, i) => 
        i === index ? { ...competitor, [field]: value } : competitor
      )
    );
  };

  // AI竞品分析功能
  const handleAICompetitorAnalysis = async () => {
    const requirementIntro = answers['c1_requirement_intro'];
    const businessLine = answers['c1_business_line'];
    const requirementGoal = answers['c2_requirement_goal'];
    
    if (!requirementIntro) {
      alert('请先填写需求介绍');
      return;
    }

    try {
      // 优先使用支持网络搜索的模型进行竞品分析
      const result = await callAI('competitor-analysis', { 
        requirementIntro, 
        businessLine,
        requirementGoal
      });
      
      if (result.success) {
        // 处理返回的竞品数据
        let competitorData: CompetitorItem[] = [];
        
        // 尝试解析不同格式的返回数据
        if (result.competitors && Array.isArray(result.competitors)) {
          competitorData = result.competitors;
        } else if (result.analysis) {
          try {
            // 移除可能的代码块标记
            let cleanedAnalysis = result.analysis.trim();
            cleanedAnalysis = cleanedAnalysis.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            cleanedAnalysis = cleanedAnalysis.replace(/^```\s*/, '').replace(/\s*```$/, '');
            
            // 尝试解析JSON格式的分析结果
            const parsed = JSON.parse(cleanedAnalysis);
            if (Array.isArray(parsed)) {
              competitorData = parsed;
            } else if (parsed.competitors && Array.isArray(parsed.competitors)) {
              competitorData = parsed.competitors;
            }
                     } catch {
             // 如果JSON解析失败，尝试从文本中提取信息
             const textData = result.analysis;
             if (textData && textData.length > 50) {
               // 给用户提示，但不创建假数据
               alert('AI返回了竞品分析内容，但格式需要调整。请重新尝试分析。');
               return;
             }
           }
        }
        
        // 确保数据格式正确
        competitorData = competitorData.map(item => ({
          name: item.name || '',
          features: item.features || '',
          advantages: item.advantages || '',
          disadvantages: item.disadvantages || '',
          marketPosition: item.marketPosition || ''
        }));
        
        if (competitorData.length > 0) {
          setCompetitors(competitorData);
          alert(`竞品分析生成成功！已找到 ${competitorData.length} 个竞品`);
        } else {
          alert('竞品分析请求成功，但AI返回的数据格式不正确。请重新尝试。');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 针对网络错误给出更友好的提示
      if (errorMessage.includes('ECONNRESET') || errorMessage.includes('网络') || errorMessage.includes('超时')) {
        alert('竞品分析失败：网络连接异常，请检查网络连接后重试。如果问题持续存在，可能是AI服务暂时不可用。');
      } else if (errorMessage.includes('429') || errorMessage.includes('限流')) {
        alert('竞品分析失败：请求过于频繁，请稍后再试。');
             } else {
         alert('竞品分析失败：' + errorMessage);
       }
     }
   };

  const generatePRD = (e: React.FormEvent<HTMLFormElement>) => {
    setWorkflowStage('prd-generation');
    // 使用 aihooks 的 handleSubmit
    handleSubmit(e);
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
    // 概览模式：显示所有卡片
    if (viewMode === 'overview') {
      return (
        <div className="w-full space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">选择要修改的部分</h2>
            <p className="text-gray-600 mt-2">点击任意卡片进入编辑模式</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {chapters.slice(0, 3).map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => handleSelectChapter(index)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium group-hover:bg-orange-200">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">{chapter.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{chapter.description}</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">已完成</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {chapters.slice(3).map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => handleSelectChapter(index + 3)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium group-hover:bg-orange-200">
                    {index + 4}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">{chapter.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{chapter.description}</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">已完成</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              onClick={handleContentReview}
              disabled={isAILoading['review-content']}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAILoading['review-content'] ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              重新进行AI审查
            </Button>
          </div>
        </div>
      );
    }

    // 单个卡片模式
    const currentChapter = chapters[currentChapterIndex];
    const isLastChapter = currentChapterIndex === chapters.length - 1;
    const isComplete = isCurrentChapterComplete();
    
    // 渲染问题输入组件
    const renderQuestionInput = (question: Question) => {
      // 统一样式类名
      const inputClassName = "border-gray-300";
      const textareaClassName = "border-gray-300";

      // 业务线选择
      if (question.type === 'select') {
        return (
          <div>
            <Label className="block text-md font-medium text-gray-700 mb-2">
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
            <Label className="block text-md font-medium text-gray-700 mb-2">
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
            <div className="flex items-center justify-between mb-2">
              <Label className="text-md font-medium text-gray-700">变更记录</Label>
              <button
                onClick={addChangeRecord}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加记录
              </button>
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
            <div className="flex items-center justify-between mb-2">
              <Label className="text-md font-medium text-gray-700">用户使用场景</Label>
              <div className="flex gap-1">
                <button
                  onClick={handleAIUserScenarioExpansion}
                  disabled={isAILoading['expand-user-scenarios']}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
                >
                  {isAILoading['expand-user-scenarios'] ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  AI扩展
                </button>
                <button
                  onClick={addUserScenario}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加用户
                </button>
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
            <div className="flex items-center justify-between mb-2">
              <Label className="text-md font-medium text-gray-700">功能迭代历史</Label>
              <button
                onClick={addIterationHistory}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加记录
              </button>
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
            <div className="flex items-center justify-between mb-2">
              <Label className="text-md font-medium text-gray-700">
                {question.text} {question.isRequired && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAICompetitorAnalysis()}
                  disabled={isAILoading['competitor-analysis']}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
                >
                  {isAILoading['competitor-analysis'] ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  AI找竞品
                </button>
                <button
                  onClick={addCompetitor}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加竞品
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">竞品 {index + 1}</h4>
                    {competitors.length > 1 && (
                      <Button
                        onClick={() => removeCompetitor(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">产品名称 *</Label>
                    <Input
                      value={competitor.name}
                      onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                      placeholder="如：微信支付、支付宝、雪球App"
                      className={inputClassName}
                    />
                  </div>
                  
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">核心功能</Label>
                      <Textarea
                        value={competitor.features}
                        onChange={(e) => updateCompetitor(index, 'features', e.target.value)}
                        placeholder="核心功能特点、用户界面特色、技术方案..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">优势</Label>
                        <Textarea
                          value={competitor.advantages}
                          onChange={(e) => updateCompetitor(index, 'advantages', e.target.value)}
                          placeholder="功能亮点、用户体验优势..."
                          rows={2}
                          className={textareaClassName}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">不足</Label>
                        <Textarea
                          value={competitor.disadvantages}
                          onChange={(e) => updateCompetitor(index, 'disadvantages', e.target.value)}
                          placeholder="功能缺陷、用户痛点..."
                          rows={2}
                          className={textareaClassName}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">市场地位</Label>
                      <Input
                        value={competitor.marketPosition}
                        onChange={(e) => updateCompetitor(index, 'marketPosition', e.target.value)}
                        placeholder="如：市场领导者、细分市场第一..."
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 动态需求方案组件
      if (question.type === 'dynamic-requirement-solution') {
        return (
          <div>
            {/* 共享的界面原型 */}
            <div className="mb-4">
              <Label className="text-xs font-medium text-gray-600 mb-1 block">
                界面原型 <span className="text-xs text-gray-500">(整个需求方案共用)</span>
              </Label>
              <Input
                value={requirementSolution.sharedPrototype}
                onChange={(e) => updateSharedPrototype(e.target.value)}
                placeholder="Figma链接：https://www.figma.com/..."
                className={inputClassName}
              />
            </div>

            {/* 需求列表 */}
            <div className="flex items-center justify-between mb-2">
              <Label className="text-md font-medium text-gray-700">需求列表</Label>
              <button
                onClick={addRequirement}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center whitespace-nowrap"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加需求
              </button>
            </div>
            
            <div className="space-y-4">
              {requirementSolution.requirements.map((req, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">需求 {index + 1}</h4>
                    {requirementSolution.requirements.length > 1 && (
                      <Button
                        onClick={() => removeRequirement(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* 需求名称和优先级 */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">需求名称 *</Label>
                      <Input
                        value={req.name}
                        onChange={(e) => updateRequirement(index, 'name', e.target.value)}
                        placeholder="如：智能交易助手、社交交流平台"
                        className={inputClassName}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">优先级 *</Label>
                      <div className="flex gap-4">
                        {(['High', 'Middle', 'Low'] as const).map((priority) => (
                          <label key={priority} className="flex items-center space-x-1 cursor-pointer">
                            <Checkbox 
                              checked={req.priority === priority}
                              onCheckedChange={() => updateRequirement(index, 'priority', priority)}
                              className="border-gray-400"
                            />
                            <span className="text-sm">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 功能点和业务逻辑 */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">功能点/流程 *</Label>
                      <Textarea
                        value={req.features}
                        onChange={(e) => updateRequirement(index, 'features', e.target.value)}
                        placeholder="主要功能点和操作流程..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">业务逻辑/规则说明</Label>
                      <Textarea
                        value={req.businessLogic}
                        onChange={(e) => updateRequirement(index, 'businessLogic', e.target.value)}
                        placeholder="详细的业务规则和逻辑说明..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                  </div>

                  {/* 数据需求和边缘处理 */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">数据需求/校验</Label>
                      <Textarea
                        value={req.dataRequirements}
                        onChange={(e) => updateRequirement(index, 'dataRequirements', e.target.value)}
                        placeholder="数据结构、校验规则、存储要求等..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">特殊状态/边缘处理</Label>
                      <Textarea
                        value={req.edgeCases}
                        onChange={(e) => updateRequirement(index, 'edgeCases', e.target.value)}
                        placeholder="异常情况、边缘场景的处理方案..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                  </div>

                  {/* 解决痛点和对应模块 */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">解决用户痛点 *</Label>
                      <Textarea
                        value={req.painPoints}
                        onChange={(e) => updateRequirement(index, 'painPoints', e.target.value)}
                        placeholder="说明此需求如何解决用户的具体痛点..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">对应模块</Label>
                      <Textarea
                        value={req.modules}
                        onChange={(e) => updateRequirement(index, 'modules', e.target.value)}
                        placeholder="涉及的系统模块、组件等..."
                        rows={2}
                        className={textareaClassName}
                      />
                    </div>
                  </div>

                  {/* 开放问题 */}
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">开放问题/待定决策</Label>
                    <Textarea
                      value={req.openIssues}
                      onChange={(e) => updateRequirement(index, 'openIssues', e.target.value)}
                      placeholder="尚未确定的问题、需要进一步讨论的决策点..."
                      rows={2}
                      className={textareaClassName}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Input类型
      if (question.type === 'input') {
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-md font-medium text-gray-700">
                {question.text} 
                {question.isRequired && <span className="text-red-500">*</span>}
                {question.isOptional && <span className="text-gray-400">(可选)</span>}
              </Label>
              {question.hasAI && (
                <button
                  onClick={() => {
                    if (question.aiPrompt === 'suggest-features') {
                      handleAIFeatureSuggestion(question.id);
                    } else if (question.aiPrompt === 'suggest-business-logic') {
                      handleAIBusinessLogicSuggestion(question.id);
                    } else if (question.aiPrompt === 'suggest-edge-cases') {
                      handleAIEdgeCasesSuggestion(question.id);
                    }
                  }}
                  disabled={isAILoading[question.aiPrompt || '']}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
                >
                  {isAILoading[question.aiPrompt || ''] ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  AI建议
                </button>
              )}
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
          <div className="flex items-center justify-between mb-2">
            <Label className="text-md font-medium text-gray-700">
              {question.text} 
              {question.isRequired && <span className="text-red-500">*</span>}
              {question.isOptional && <span className="text-gray-400">(可选)</span>}
            </Label>
            {question.hasAI && (
              <button
                onClick={() => {
                  if (question.aiPrompt === 'generate-requirement-goal') {
                    handleAIRequirementGoalGeneration(question.id);
                  } else if (question.aiPrompt === 'suggest-features') {
                    handleAIFeatureSuggestion(question.id);
                  } else if (question.aiPrompt === 'suggest-business-logic') {
                    handleAIBusinessLogicSuggestion(question.id);
                  } else if (question.aiPrompt === 'suggest-edge-cases') {
                    handleAIEdgeCasesSuggestion(question.id);
                  }
                }}
                disabled={isAILoading[question.aiPrompt || '']}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 disabled:opacity-50 flex items-center whitespace-nowrap"
              >
                {isAILoading[question.aiPrompt || ''] ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                {question.aiPrompt === 'generate-requirement-goal' ? 'AI扩展' : 'AI建议'}
              </button>
            )}
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
            defaultExpanded={currentChapterIndex !== 0}
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
                      <div className="flex-1 mx-4 flex justify-end gap-3">
                        {contentReview ? (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => setWorkflowStage('ai-review')}
                              variant="outline" 
                              className={`px-6 py-2 ${
                                contentReview.score >= 80 
                                  ? "border-green-300 text-green-600 hover:bg-green-50" 
                                  : "border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              查看审查结果
                            </Button>
                            <Button 
                              onClick={handleContentReview}
                              disabled={Object.values(isAILoading).some(Boolean)}
                              variant="outline" 
                              className="px-6 py-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              {isAILoading['review-content'] ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                              )}
                              重新审查
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={handleContentReview}
                            disabled={Object.values(isAILoading).some(Boolean)}
                            variant="outline" 
                            className="px-6 py-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                          >
                            {isAILoading['review-content'] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            AI内容审查
                          </Button>
                        )}
                        
                        <form onSubmit={generatePRD} className="flex-shrink-0">
                          <Button
                            type="submit"
                            disabled={isLoading || !isComplete}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                生成文档中...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                AI生成PRD
                              </>
                            )}
                          </Button>
                        </form>
                      </div>
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
  
  // AI审查结果视图
  const renderAIReviewView = () => (
    <div className="w-full flex justify-center">
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">AI内容审查结果</h2>
                  <p className="text-sm text-gray-500">查看详细的评分和改进建议</p>
                </div>
              </div>
            </ExpandableCardHeader>
          </ExpandableTrigger>
          
          <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
            <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="pt-4 pb-2">
                {contentReview && (
                  <div className="space-y-6 pr-2">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-lg font-medium">内容评分</span>
                      <span className={`text-3xl font-bold ${
                        contentReview.score >= 80 ? 'text-green-600' : 
                        contentReview.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {contentReview.score}/100
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">总体评价</h3>
                      <p className="text-gray-600 leading-relaxed">{contentReview.summary}</p>
                    </div>
                    
                    {contentReview.issues && contentReview.issues.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">问题清单</h3>
                        <div className="space-y-3">
                          {contentReview.issues.map((issue, index) => (
                            <div key={index} className={`border-l-4 pl-4 py-3 rounded-r-lg ${
                              issue.level === 'error' ? 'bg-red-50 border-red-400' :
                              issue.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                              'bg-blue-50 border-blue-400'
                            }`}>
                              <div className="font-medium text-gray-900">{issue.message}</div>
                              <div className="text-sm text-gray-600 mt-1">{issue.suggestion}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {contentReview.recommendations && contentReview.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">改进建议</h3>
                        <ul className="space-y-2">
                          {contentReview.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className="text-gray-600">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ExpandableCardContent>
            
            <ExpandableCardFooter>
              <div className="flex items-center justify-between w-full pt-4">
                <Button 
                  onClick={handleBackToModify}
                  variant="outline"
                  className="border-gray-300"
                >
                  返回修改
                </Button>
                <Button 
                  onClick={handleGeneratePRD}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  生成PRD
                </Button>
              </div>
            </ExpandableCardFooter>
          </ExpandableContent>
        </ExpandableCard>
      </Expandable>
    </div>
  );

  // PRD生成中视图
  const renderPRDGenerationView = () => (
    <div className="w-full flex justify-center">
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">AI正在生成PRD文档</h2>
                  <p className="text-sm text-gray-500">正在根据您的输入生成专业的产品需求文档</p>
                </div>
              </div>
            </ExpandableCardHeader>
          </ExpandableTrigger>
          
          <ExpandableContent preset="fade">
            <ExpandableCardContent>
              <div className="pt-4 pb-2">
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-3 text-blue-600 mb-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-lg font-medium">正在生成中，请稍候...</span>
                  </div>
                  <p className="text-gray-500">AI正在基于您的输入生成专业的产品需求文档</p>
                </div>
              </div>
            </ExpandableCardContent>
          </ExpandableContent>
        </ExpandableCard>
      </Expandable>
    </div>
  );
  
  // 完成的PRD视图
  const renderCompletedPRDView = () => (
    <div className="w-full flex justify-center">
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">生成的PRD文档</h2>
                  <p className="text-sm text-gray-500">您的产品需求文档已生成完成</p>
                </div>
              </div>
            </ExpandableCardHeader>
          </ExpandableTrigger>

          <ExpandableContent preset="fade" stagger staggerChildren={0.1}>
            <ExpandableCardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="pt-4 pb-2">
                <div className="space-y-4 pr-2">
                  <div className="prose max-w-none bg-gray-50 p-6 rounded-lg border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800">
                      {generatedPRD}
                    </pre>
                  </div>
                </div>
              </div>
            </ExpandableCardContent>

            <ExpandableCardFooter>
              <div className="flex items-center justify-between w-full pt-4">
                <div className="flex space-x-2">
                  <Button 
                    onClick={copyGeneratedPRD}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <Button 
                    onClick={downloadGeneratedPRD}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </Button>
                </div>
                <Button 
                  onClick={() => {
                    setWorkflowStage('welcome');
                    setCurrentChapterIndex(0);
                    setViewMode('single');
                    setAnswers({});
                    setContentReview(null);
                    setGeneratedPRD('');
                    setShowStartScreen(true);
                    setShowWelcome(false);
                    setShowChapters(false);
                  }}
                  variant="outline"
                  className="border-gray-300"
                >
                  重新开始
                </Button>
              </div>
            </ExpandableCardFooter>
          </ExpandableContent>
        </ExpandableCard>
      </Expandable>
    </div>
  );

  // AI功能调用统一函数
  const callAI = async (functionName: string, data: Record<string, unknown>) => {
    setIsAILoading(prev => ({ ...prev, [functionName]: true }));
    
    try {
      const response = await fetch('/api/ai-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionName,
          data,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || '请求失败');
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsAILoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  // 需求目标生成
  const handleAIRequirementGoalGeneration = async (questionId: string) => {
    const requirementIntro = answers['c1_requirement_intro'];
    const businessLine = answers['c1_business_line'];
    
    if (!requirementIntro) {
      alert('请先填写需求介绍');
      return;
    }

    if (!userScenarios || userScenarios.length === 0 || !userScenarios[0].userType) {
      alert('请先完成用户场景分析，再生成需求目标');
      return;
    }

    try {
      const result = await callAI('generate-requirement-goal', { 
        requirementIntro, 
        businessLine,
        userScenarios
      });
      
      if (result.success && result.goal) {
        handleAnswerChange(questionId, result.goal);
        alert('需求目标生成成功！');
      }
    } catch (error) {
       alert('需求目标生成失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 功能建议
  const handleAIFeatureSuggestion = async (questionId: string) => {
    const requirement = answers['c4_requirement'];
    const competitorAnalysis = answers['c3_competitor_analysis'];
    
    if (!requirement) {
      alert('请先填写需求描述');
      return;
    }

    try {
      const result = await callAI('suggest-features', { 
        requirement, 
        userScenarios,
        competitorAnalysis 
      });
      
      if (result.success && result.suggestions) {
        // 修复类型错误
        const suggestions = result.suggestions as FeatureSuggestion[];
        const suggestionsText = suggestions.map((suggestion, index) => 
          `${index + 1}. **${suggestion.featureName}**\n   - 描述：${suggestion.description}\n   - 流程：${suggestion.workflow}\n   - 价值：${suggestion.value}`
        ).join('\n\n');
       
        handleAnswerChange(questionId, suggestionsText);
        alert('AI功能建议生成成功！');
      }
    } catch (error) {
      alert('功能建议失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 业务逻辑建议
  const handleAIBusinessLogicSuggestion = async (questionId: string) => {
    const featureName = answers['c4_requirement'] || answers['c4_features'];
    const requirement = answers['c1_requirement_intro'];
    
    if (!featureName) {
      alert('请先填写需求或功能点描述');
      return;
    }

    try {
      const result = await callAI('suggest-business-logic', { 
        featureName, 
        requirement 
      });
      
      if (result.success && result.suggestion) {
        handleAnswerChange(questionId, result.suggestion);
        alert('AI业务逻辑建议生成成功！');
      }
    } catch (error) {
      alert('业务逻辑建议失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 边缘场景建议
  const handleAIEdgeCasesSuggestion = async (questionId: string) => {
    const featureName = answers['c4_requirement'] || answers['c4_features'];
    const businessLogic = answers['c4_business_logic'];
    
    if (!featureName) {
      alert('请先填写需求或功能点描述');
      return;
    }

    try {
      const result = await callAI('suggest-edge-cases', { 
        featureName, 
        businessLogic 
      });
      
      if (result.success && result.suggestions) {
        // 修复类型错误
        const suggestions = result.suggestions as EdgeCaseSuggestion[];
        const suggestionsText = suggestions.map((suggestion, index) => 
          `${index + 1}. **${suggestion.category}：${suggestion.scenario}**\n   - 问题：${suggestion.issue}\n   - 解决方案：${suggestion.solution}`
        ).join('\n\n');
       
        handleAnswerChange(questionId, suggestionsText);
        alert('AI边缘场景建议生成成功！');
      }
    } catch (error) {
      alert('边缘场景建议失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 内容审查
  const handleContentReview = async () => {
    try {
      const result = await callAI('review-content', {
        answers,
        changeRecords,
        userScenarios,
        iterationHistory,
        competitors,
        requirementSolution
      });
      
      if (result.success && result.review) {
        setContentReview(result.review);
        setWorkflowStage('ai-review');
      }
    } catch (error) {
      alert('内容审查失败：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 返回修改 - 显示所有卡片概览
  const handleBackToModify = () => {
    setViewMode('overview');
    setWorkflowStage('guiding');
  };

  // 生成PRD
  const handleGeneratePRD = async () => {
    setWorkflowStage('prd-generation');
    try {
      const result = await callAI('generate-prd', {
        answers,
        changeRecords,
        userScenarios,
        iterationHistory,
        competitors,
        requirementSolution
      });
      
      if (result.success && result.prd) {
        setGeneratedPRD(result.prd);
        setWorkflowStage('completed');
      }
    } catch (error) {
      alert('PRD生成失败：' + (error instanceof Error ? error.message : String(error)));
      setWorkflowStage('ai-review'); // 返回审查页面
    }
  };

  // 选择卡片进入单个编辑模式
  const handleSelectChapter = (chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    setViewMode('single');
  };

  // 复制PRD
  const copyGeneratedPRD = () => {
    navigator.clipboard.writeText(generatedPRD);
    alert('PRD已复制到剪贴板');
  };

  // 下载PRD
  const downloadGeneratedPRD = () => {
    const blob = new Blob([generatedPRD], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PRD.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 需求方案管理函数
  const addRequirement = () => {
    setRequirementSolution(prev => ({
      ...prev,
      requirements: [...prev.requirements, { 
        name: '', 
        features: '', 
        businessLogic: '', 
        dataRequirements: '', 
        edgeCases: '', 
        painPoints: '', 
        modules: '', 
        priority: 'High', 
        openIssues: '' 
      }]
    }));
  };

  const removeRequirement = (index: number) => {
    if (requirementSolution.requirements.length > 1) {
      setRequirementSolution(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRequirement = (index: number, field: keyof RequirementItem, value: string) => {
    setRequirementSolution(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const updateSharedPrototype = (value: string) => {
    setRequirementSolution(prev => ({
      ...prev,
      sharedPrototype: value
    }));
  };

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
        {workflowStage === 'ai-review' && renderAIReviewView()}
        {workflowStage === 'prd-generation' && renderPRDGenerationView()}
        {workflowStage === 'completed' && renderCompletedPRDView()}

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