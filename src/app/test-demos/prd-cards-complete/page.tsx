'use client';

import { useState } from 'react';
import { FileText, Sparkles, Copy, Plus, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// 复用PRD模板数据结构
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

// PRD模板
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
        type: 'ai-competitor',
        isRequired: true
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

export default function PRDCardsCompletePage() {
  const [chapters] = useState<PrdChapter[]>(prdTemplate);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  
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

  // AI功能状态
  const [isAILoading, setIsAILoading] = useState<Record<string, boolean>>({});
  const [contentReview, setContentReview] = useState<any>(null);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');

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

  // 检查章节是否完成
  const isChapterComplete = (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    return chapter.questions.every(q => {
      // 如果是可选的或者没有标记为必填，跳过检查
      if (q.isOptional || !q.isRequired) return true;
      
      // 对于特殊的动态组件，有默认值的话就认为已填写
      if (q.id === 'c1_change_records' || q.id === 'c5_iteration_history') return true;
      if (q.type === 'dynamic-user-scenarios') return true;
      
      const answer = answers[q.id] || '';
      return answer.trim() !== '';
    });
  };

  // AI功能调用统一函数
  const callAI = async (functionName: string, data: any) => {
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
        const error = await response.json();
        throw new Error(error.error || '请求失败');
      }

      return await response.json();
    } catch (error) {
      console.error(`AI功能调用失败 (${functionName}):`, error);
      throw error;
    } finally {
      setIsAILoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  // AI功能 - 用户场景扩展
  const handleAIUserScenarioExpansion = async () => {
    const requirementIntro = answers['c1_requirement_intro'];
    
    if (!requirementIntro) {
      alert('请先填写需求介绍');
      return;
    }

    try {
      const result = await callAI('expand-user-scenarios', { requirementIntro });
      
      if (result.success && result.scenarios) {
        // 替换现有的用户场景
        setUserScenarios(result.scenarios);
        alert(`成功扩展了 ${result.scenarios.length} 个用户场景！`);
      }
         } catch (error) {
       alert('用户场景扩展失败：' + (error instanceof Error ? error.message : String(error)));
     }
  };

     // AI功能 - 竞品分析
   const handleAICompetitorAnalysis = async (questionId: string) => {
     const requirementIntro = answers['c1_requirement_intro'];
     const businessLine = answers['c1_business_line'];
     
     if (!requirementIntro) {
       alert('请先填写需求介绍');
       return;
     }

     try {
       // 优先使用支持网络搜索的模型进行竞品分析
       const result = await callAI('competitor-analysis', { 
         requirementIntro, 
         businessLine 
       });
       
       if (result.success && result.analysis) {
         handleAnswerChange(questionId, result.analysis);
         alert('竞品分析生成成功！已使用内置网络搜索获取最新信息');
       }
     } catch (error) {
        alert('竞品分析失败：' + (error instanceof Error ? error.message : String(error)));
     }
   };

   // AI功能 - 内容审查
   const handleContentReview = async () => {
     try {
       const result = await callAI('review-content', {
         answers,
         changeRecords,
         userScenarios,
         iterationHistory
       });
       
       if (result.success && result.review) {
         setContentReview(result.review);
         alert(`内容审查完成！评分: ${result.review.score}/100`);
       }
     } catch (error) {
       alert('内容审查失败：' + (error instanceof Error ? error.message : String(error)));
     }
   };

   // AI功能 - PRD生成
   const handlePRDGeneration = async () => {
     // 先检查内容审查
     if (!contentReview) {
       alert('请先进行内容审查');
       return;
     }

     if (!contentReview.isReadyForGeneration) {
       const proceed = confirm('内容审查建议先完善内容再生成PRD，是否继续？');
       if (!proceed) return;
     }

     try {
       const result = await callAI('generate-prd', {
         answers,
         changeRecords,
         userScenarios,
         iterationHistory
       });
       
       if (result.success && result.prd) {
         setGeneratedPRD(result.prd);
         alert('PRD生成成功！');
       }
     } catch (error) {
       alert('PRD生成失败：' + (error instanceof Error ? error.message : String(error)));
     }
   };

  // 渲染问题输入组件
  const renderQuestionInput = (question: Question) => {
    // 统一样式类名
    const inputClassName = "border-gray-300";
    const textareaClassName = "border-gray-300";

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
                onClick={handleAIUserScenarioExpansion}
                size="sm"
                disabled={isAILoading['expand-user-scenarios']}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAILoading['expand-user-scenarios'] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
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
            <Label className="text-md font-medium text-gray-700">
              {question.text} {question.isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Button
              onClick={() => handleAICompetitorAnalysis(question.id)}
              size="sm"
              disabled={isAILoading['competitor-analysis']}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isAILoading['competitor-analysis'] ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI找竞品
            </Button>
          </div>
          
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={12}
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
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">PRD AI功能集成</h1>
          <p className="text-gray-600 mt-1">智能PRD编写助手：AI扩展用户场景、竞品分析、内容审查和PRD生成</p>
        </div>
      </div>
      
      {/* 内容审查结果显示 */}
      {contentReview && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center">
                {contentReview.isReadyForGeneration ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                内容审查结果
              </h3>
              <span className={`text-lg font-bold ${
                contentReview.score >= 80 ? 'text-green-600' : 
                contentReview.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {contentReview.score}/100
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{contentReview.summary}</p>
            
            {contentReview.issues && contentReview.issues.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium mb-2">问题清单：</h4>
                <div className="space-y-2">
                  {contentReview.issues.map((issue: any, index: number) => (
                    <div key={index} className={`p-2 rounded ${
                      issue.level === 'error' ? 'bg-red-50 border-red-200' :
                      issue.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    } border`}>
                      <div className="font-medium text-sm">{issue.message}</div>
                      <div className="text-xs text-gray-600 mt-1">{issue.suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {contentReview.recommendations && contentReview.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">改进建议：</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {contentReview.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 生成的PRD显示 */}
      {generatedPRD && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">生成的PRD文档</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedPRD)}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制PRD
                </Button>
                <Button
                  onClick={() => {
                    const blob = new Blob([generatedPRD], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'PRD.md';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  下载PRD
                </Button>
              </div>
            </div>
            <div className="text-sm bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{generatedPRD}</pre>
            </div>
          </div>
        </div>
      )}
      
      {/* 所有卡片展示 */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chapters.map((chapter, index) => {
            const isComplete = isChapterComplete(index);
            
            return (
              <div key={chapter.id} className="bg-white rounded-lg shadow-sm border">
                {/* 卡片头部 */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        isComplete ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">{chapter.title}</h2>
                      <p className="text-sm text-gray-500">{chapter.description}</p>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isComplete 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {isComplete ? '已完成' : '未完成'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 卡片内容 */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  <div className="space-y-6">
                    {chapter.questions.map(question => (
                      <div key={question.id}>
                        {renderQuestionInput(question)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 全局操作区域 */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">AI助手操作</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                onClick={handleContentReview}
                disabled={isAILoading['review-content']}
                variant="outline" 
                className="border-gray-300"
              >
                {isAILoading['review-content'] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                AI审查内容
              </Button>
              
              <Button
                onClick={handlePRDGeneration}
                disabled={isAILoading['generate-prd']}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAILoading['generate-prd'] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI生成完整PRD
              </Button>
              
              <Button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify({ answers, changeRecords, userScenarios, iterationHistory }, null, 2))}
                variant="outline" 
                className="border-gray-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                导出数据
              </Button>
            </div>
            
            {contentReview && !contentReview.isReadyForGeneration && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  建议先完善内容后再生成PRD，以获得更好的文档质量。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 