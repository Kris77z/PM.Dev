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

interface CompetitorItem {
  name: string;
  features: string;
  advantages: string;
  disadvantages: string;
  marketPosition: string;
}

interface IterationHistory {
  version: string;
  date: string;
  content: string;
  author: string;
}

// AI建议相关类型
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

interface RequirementItem {
  name: string;                    // 需求名称
  features: string;               // 功能点/流程
  businessLogic: string;          // 业务逻辑/规则说明  
  dataRequirements: string;       // 数据需求/校验
  edgeCases: string;             // 特殊状态/边缘处理
  painPoints: string;            // 解决用户痛点
  modules: string;               // 对应模块
  priority: 'High' | 'Middle' | 'Low'; // 优先级
  openIssues: string;            // 开放问题/待定决策
}

interface RequirementSolution {
  sharedPrototype: string;        // 共享的界面原型（整个需求方案共用）
  requirements: RequirementItem[]; // 具体的需求项目列表
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
        type: 'ai-competitor',
        isRequired: true
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
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([
    { name: '', features: '', advantages: '', disadvantages: '', marketPosition: '' }
  ]);
  const [requirementSolution, setRequirementSolution] = useState<RequirementSolution>({
    sharedPrototype: '',
    requirements: [
      { name: '', features: '', businessLogic: '', dataRequirements: '', edgeCases: '', painPoints: '', modules: '', priority: 'High', openIssues: '' }
    ]
  });

  // AI功能状态
  const [isAILoading, setIsAILoading] = useState<Record<string, boolean>>({});
  const [contentReview, setContentReview] = useState<{
    score: number;
    isReadyForGeneration: boolean;
    issues: Array<{
      level: string;
      field: string;
      message: string;
      suggestion: string;
    }>;
    summary: string;
    recommendations: string[];
  } | null>(null);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  
  // 调试状态
  const [debugLogs, setDebugLogs] = useState<Array<{
    timestamp: string;
    level: 'info' | 'error' | 'warning';
    function: string;
    message: string;
    details?: unknown;
  }>>([]);

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

  // 竞品管理函数
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

  // 添加调试日志
  const addDebugLog = (level: 'info' | 'error' | 'warning', functionName: string, message: string, details?: unknown) => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      function: functionName,
      message,
      details: details ? {
        ...details,
        timestamp: new Date().toISOString(),
        functionCall: functionName,
        userAgent: navigator.userAgent,
        url: window.location.href
      } : undefined
    };
    setDebugLogs(prev => [...prev, newLog]);
    console.log(`[${level.toUpperCase()}] ${functionName}: ${message}`, details);
  };

  // AI功能调用统一函数
  const callAI = async (functionName: string, data: Record<string, unknown>) => {
    setIsAILoading(prev => ({ ...prev, [functionName]: true }));
    addDebugLog('info', functionName, '开始调用AI功能', { data });
    
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

      addDebugLog('info', functionName, `API响应状态: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog('error', functionName, 'API返回错误', { status: response.status, body: errorText });
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || '请求失败');
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      addDebugLog('info', functionName, 'AI功能调用成功', { success: result.success });
      return result;
    } catch (error) {
      addDebugLog('error', functionName, 'AI功能调用异常', { error: error instanceof Error ? error.message : String(error) });
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

     // AI功能 - 需求目标生成
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

   // AI功能 - 竞品分析
   const handleAICompetitorAnalysis = async () => {
     const requirementIntro = answers['c1_requirement_intro'];
     const businessLine = answers['c1_business_line'];
     const requirementGoal = answers['c2_requirement_goal'];
     
     if (!requirementIntro) {
       alert('请先填写需求介绍');
       return;
     }

     try {
       addDebugLog('info', 'handleAICompetitorAnalysis', '开始竞品分析', { requirementIntro, businessLine, requirementGoal });
       
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
               addDebugLog('info', 'handleAICompetitorAnalysis', 'AI分析总结', parsed.summary || '');
             }
           } catch (e) {
             addDebugLog('warning', 'handleAICompetitorAnalysis', 'JSON解析失败，尝试提取竞品信息', { 
               error: e instanceof Error ? e.message : String(e),
               rawData: result.analysis 
             });
             
             // 如果JSON解析失败，尝试从文本中提取信息
             const textData = result.analysis;
             if (textData && textData.length > 50) {
               // 给用户提示，但不创建假数据
               alert('AI返回了竞品分析内容，但格式需要调整。请查看调试日志获取详细信息，或重新尝试分析。');
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
           addDebugLog('info', 'handleAICompetitorAnalysis', `竞品分析成功，找到 ${competitorData.length} 个竞品`, competitorData);
           alert(`竞品分析生成成功！已找到 ${competitorData.length} 个竞品`);
         } else {
           addDebugLog('warning', 'handleAICompetitorAnalysis', '竞品分析返回数据为空或格式不正确', result);
           alert('竞品分析请求成功，但AI返回的数据格式不正确。请查看调试日志了解详情，然后重新尝试。');
         }
       }
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : String(error);
       addDebugLog('error', 'handleAICompetitorAnalysis', '竞品分析失败', { error: errorMessage });
       
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

   // AI功能 - 功能建议
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
          // 将建议格式化为文本
          const suggestionsText = (result.suggestions as FeatureSuggestion[]).map((suggestion, index) => 
            `${index + 1}. **${suggestion.featureName}**\n   - 描述：${suggestion.description}\n   - 流程：${suggestion.workflow}\n   - 价值：${suggestion.value}`
          ).join('\n\n');
         
         handleAnswerChange(questionId, suggestionsText);
         alert('AI功能建议生成成功！');
       }
     } catch (error) {
       alert('功能建议失败：' + (error instanceof Error ? error.message : String(error)));
     }
   };

   // AI功能 - 业务逻辑建议
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

   // AI功能 - 边缘场景建议
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
          // 将建议格式化为文本
          const suggestionsText = (result.suggestions as EdgeCaseSuggestion[]).map((suggestion, index) => 
            `${index + 1}. **${suggestion.category}：${suggestion.scenario}**\n   - 问题：${suggestion.issue}\n   - 解决方案：${suggestion.solution}`
          ).join('\n\n');
         
         handleAnswerChange(questionId, suggestionsText);
         alert('AI边缘场景建议生成成功！');
       }
     } catch (error) {
       alert('边缘场景建议失败：' + (error instanceof Error ? error.message : String(error)));
     }
   };

   // 测试工具函数
   const fillTestData = (dataType: string = 'ai-trading') => {
     const testDataSets = {
       'ai-trading': {
         data: {
           'c1_business_line': 'AiCoin APP',
           'c1_pm': '@张三',
           'c1_frontend': '@李四',
           'c1_backend': '@王五',
           'c1_data': '@赵六',
           'c1_requirement_intro': '为AiCoin APP添加智能交易助手功能，通过AI分析市场数据和用户行为，为用户提供个性化的交易建议和风险提示。该功能将集成机器学习算法，实时分析市场趋势，帮助用户做出更明智的投资决策，同时降低投资风险。',
           'c2_requirement_goal': '通过AI智能分析，帮助新手用户降低交易风险，为专业用户提供更深入的市场洞察，最终提升平台用户的交易成功率和用户粘性。',
           'c4_requirement': '智能交易助手',
           'c4_features': '市场分析、风险评估、交易建议推送、止损预警',
           'c4_business_logic': '基于用户历史交易数据和市场实时数据，使用机器学习模型生成个性化交易建议，支持多种风险偏好设置',
           'c4_data_requirements': '用户交易历史、实时市场数据、风险偏好设置、资产配置信息',
           'c4_edge_cases': '网络中断、数据延迟、市场异常波动、第三方数据源故障等情况的处理',
           'c4_pain_points': '解决新手用户投资决策困难、风险控制不当、错失最佳交易时机的问题',
           'c4_modules': '交易模块、数据分析模块、推送通知模块、风险管理模块',
           'c4_priority': 'High',
           'c4_prototype': 'https://www.figma.com/ai-trading-prototype',
           'c4_open_issues': '机器学习模型的准确性验证、合规性审查、数据隐私保护',
           'c5_other_docs': 'https://docs.example.com/ai-trading-specification'
         },
         scenarios: [
           {
             userType: '加密货币新手用户',
             scenario: '首次进入加密货币市场，对市场波动性和投资风险缺乏了解，希望获得专业指导',
             painPoint: '不知道何时买入卖出，容易因为恐慌或贪婪做出错误决策，导致投资损失'
           },
           {
             userType: '经验丰富的交易者',
             scenario: '需要处理多个交易对，希望获得更深入的市场分析和趋势预测',
             painPoint: '手动分析大量数据耗时费力，可能错过最佳交易时机'
           },
           {
             userType: '机构投资者',
             scenario: '管理大额资金，需要专业的风险控制和量化分析工具',
             painPoint: '缺乏实时风险监控，难以在市场剧烈波动时快速调整策略'
           }
         ],
         records: [
           {
             version: '0.1',
             modifier: '@张三',
             content: '初始需求规划，确定核心功能架构',
             reason: '项目启动',
             date: '2025-01-01'
           }
         ]
       },
       
       'social-platform': {
         data: {
           'c1_business_line': 'AiCoin APP',
           'c1_pm': '@社交产品经理',
           'c1_frontend': '@前端工程师',
           'c1_backend': '@后端工程师',
           'c1_data': '@数据工程师',
           'c1_requirement_intro': '为AiCoin APP添加社交交流功能，用户可以分享交易心得、跟随优秀交易者、建立投资群组，通过社区互动提升投资水平和用户粘性。',
           'c2_requirement_goal': '构建活跃的投资者社区，通过社交功能增加用户留存，促进知识分享，提升平台的用户参与度和品牌影响力。',
           'c4_requirement': '社交交流平台',
           'c4_features': '动态发布、用户关注、群组聊天、交易分享、专家认证',
           'c4_business_logic': '用户可以发布投资动态，关注其他用户，加入兴趣群组，分享交易记录，通过社交互动建立投资人脉',
           'c4_data_requirements': '用户资料、社交关系、动态内容、群组信息、交易分享数据',
           'c4_edge_cases': '内容审核、垃圾信息过滤、用户隐私保护、群组管理异常等情况的处理',
           'c4_pain_points': '解决用户投资孤单、缺乏交流、无法获得优质投资建议的问题',
           'c4_modules': '社交模块、内容模块、通讯模块、推荐模块',
           'c4_priority': 'Middle',
           'c4_prototype': 'https://www.figma.com/social-platform-prototype',
           'c4_open_issues': '内容审核策略、用户隐私政策、反垃圾信息机制',
           'c5_other_docs': 'https://docs.example.com/social-specification'
         },
         scenarios: [
           {
             userType: '投资新手',
             scenario: '希望学习投资知识，寻找经验丰富的投资者进行交流学习',
             painPoint: '缺乏投资经验，不知道从哪里获得可靠的投资建议和指导'
           },
           {
             userType: '资深投资者',
             scenario: '愿意分享投资经验，建立个人品牌，吸引粉丝关注',
             painPoint: '缺乏合适的平台展示投资能力，难以建立影响力和获得认可'
           }
         ],
         records: [
           {
             version: '0.1',
             modifier: '@社交产品经理',
             content: '社交功能初期规划',
             reason: '用户需求调研',
             date: '2025-01-02'
           }
         ]
       },
       
       'education-system': {
         data: {
           'c1_business_line': 'AiCoin Web',
           'c1_pm': '@教育产品经理',
           'c1_frontend': '@前端开发',
           'c1_backend': '@后端开发',
           'c1_data': '@数据分析师',
           'c1_requirement_intro': '为AiCoin平台添加在线教育模块，提供系统性的投资理财课程，从基础知识到高级策略，帮助用户提升投资能力，降低投资风险。',
           'c2_requirement_goal': '通过系统性的教育培训，提升用户投资水平，减少因知识不足导致的投资损失，增加用户对平台的信任和依赖。',
           'c4_requirement': '在线投资教育系统',
           'c4_features': '课程体系、视频学习、在线测试、学习进度、证书认证',
           'c4_business_logic': '用户根据自身水平选择合适课程，通过视频学习和练习测试，逐步提升投资知识和技能',
           'c4_data_requirements': '课程内容、用户学习记录、测试成绩、证书信息、学习路径数据',
           'c4_edge_cases': '网络中断影响学习、课程内容过时、用户学习进度异常、证书系统故障等情况的处理',
           'c4_pain_points': '解决用户投资知识匮乏、学习资源分散、缺乏系统性指导的问题',
           'c4_modules': '课程模块、学习模块、测试模块、证书模块',
           'c4_priority': 'Low',
           'c4_prototype': 'https://www.figma.com/education-prototype',
           'c4_open_issues': '课程内容版权、讲师资质认证、学习效果评估',
           'c5_other_docs': 'https://docs.example.com/education-specification'
         },
         scenarios: [
           {
             userType: '投资零基础用户',
             scenario: '对投资完全陌生，希望从基础开始系统学习投资知识',
             painPoint: '不知道从何开始学习，网上信息杂乱且质量参差不齐'
           },
           {
             userType: '有一定经验的投资者',
             scenario: '希望学习更高级的投资策略和技巧，提升投资收益',
             painPoint: '基础知识已掌握，但缺乏进阶学习资源和系统指导'
           }
         ],
         records: [
           {
             version: '0.1',
             modifier: '@教育产品经理',
             content: '教育模块需求分析和课程体系设计',
             reason: '用户教育需求强烈',
             date: '2025-01-03'
           }
         ]
       }
     };
     
     const selectedData = testDataSets[dataType];
     if (!selectedData) {
       alert('未找到对应的测试数据！');
       return;
     }
     
     setAnswers(selectedData.data);
     setUserScenarios(selectedData.scenarios);
     setChangeRecords(selectedData.records);
     
     // 填充需求方案数据（支持多个小需求拆解）
     if (dataType === 'ai-trading') {
       setRequirementSolution({
         sharedPrototype: 'https://www.figma.com/ai-trading-prototype',
         requirements: [
           {
             name: '智能市场分析',
             features: '实时行情分析、技术指标计算、趋势预测、市场情绪分析',
             businessLogic: '基于历史数据和实时行情，运用技术分析和情绪分析模型，为用户提供市场趋势判断',
             dataRequirements: '实时行情数据、历史价格数据、交易量数据、市场新闻数据',
             edgeCases: '数据源异常、行情延迟、极端市场波动时的分析失准',
             painPoints: '解决用户无法准确判断市场趋势、错过投资机会的问题',
             modules: '数据分析模块、图表展示模块、预警模块',
             priority: 'High',
             openIssues: '分析模型的准确性验证、多数据源整合、实时性保障'
           },
           {
             name: '个性化风险评估',
             features: '用户风险画像、投资组合分析、风险度量、预警提醒',
             businessLogic: '根据用户投资历史和风险偏好，动态评估当前投资组合风险，提供个性化风险控制建议',
             dataRequirements: '用户投资历史、风险偏好设置、资产配置信息、市场波动数据',
             edgeCases: '用户行为突变、市场黑天鹅事件、极端风险场景处理',
             painPoints: '解决用户无法准确评估投资风险、风险控制不当的问题',
             modules: '风险模型模块、用户画像模块、预警系统',
             priority: 'High',
             openIssues: '风险模型校准、用户行为建模、预警阈值设定'
           },
           {
             name: '智能交易建议',
             features: '买卖时机提醒、仓位建议、止损止盈设置、策略推荐',
             businessLogic: '结合市场分析和风险评估结果，为用户提供具体的交易操作建议和策略指导',
             dataRequirements: '分析结果数据、用户资金状况、交易偏好、历史策略效果',
             edgeCases: '建议冲突、策略失效、用户资金不足、市场突发事件',
             painPoints: '解决用户缺乏专业交易策略、操作时机把握不准的问题',
             modules: '策略引擎、建议生成模块、通知推送模块',
             priority: 'Middle',
             openIssues: '策略有效性验证、建议个性化程度、推送时机优化'
           }
         ]
       });
     } else if (dataType === 'social-platform') {
       setRequirementSolution({
         sharedPrototype: 'https://www.figma.com/social-platform-prototype',
         requirements: [
           {
             name: '投资动态社区',
             features: '动态发布、图文分享、话题讨论、点赞评论、内容推荐',
             businessLogic: '用户可以发布投资心得、市场观点、交易记录，其他用户可以互动讨论，系统智能推荐相关内容',
             dataRequirements: '用户动态内容、互动数据、推荐算法数据、用户兴趣标签',
             edgeCases: '违规内容处理、恶意刷屏、垃圾信息过滤、网络谣言控制',
             painPoints: '解决用户缺乏投资交流平台、信息获取渠道单一的问题',
             modules: '内容发布模块、推荐算法模块、互动系统、审核模块',
             priority: 'High',
             openIssues: '内容审核标准、推荐算法优化、用户隐私保护'
           },
           {
             name: '专业用户认证',
             features: '身份认证、专业标识、影响力评分、内容权重、认证流程',
             businessLogic: '对具备专业投资背景的用户进行认证，提升其内容权重和影响力，为普通用户提供可信参考',
             dataRequirements: '用户资质信息、投资业绩数据、认证材料、影响力指标',
             edgeCases: '虚假认证、资质变更、认证失效、争议处理',
             painPoints: '解决用户难以辨别专业投资建议、信息质量参差不齐的问题',
             modules: '认证系统、资质审核模块、权重计算模块',
             priority: 'Middle',
             openIssues: '认证标准制定、审核流程优化、持续监控机制'
           },
           {
             name: '群组交流功能',
             features: '兴趣群组、群聊功能、文件分享、活动组织、群管理',
             businessLogic: '用户可以创建或加入投资兴趣群组，进行深度交流讨论，分享资料和组织活动',
             dataRequirements: '群组信息、聊天记录、文件数据、用户权限、活动数据',
             edgeCases: '群组管理混乱、恶意用户捣乱、敏感信息泄露、群组解散',
             painPoints: '解决深度交流需求、志同道合用户难以聚集的问题',
             modules: '群组管理模块、即时通讯模块、文件管理模块',
             priority: 'Low',
             openIssues: '群组规模限制、管理权限设定、内容监管机制'
           }
         ]
       });
     } else if (dataType === 'education-system') {
       setRequirementSolution({
         sharedPrototype: 'https://www.figma.com/education-prototype',
         requirements: [
           {
             name: '分级课程体系',
             features: '课程分级、学习路径、课程推荐、前置要求、难度标识',
             businessLogic: '根据用户水平和兴趣，提供从入门到高级的分层课程体系，智能推荐合适的学习路径',
             dataRequirements: '课程内容数据、用户学习记录、能力评估数据、推荐算法数据',
             edgeCases: '课程内容过时、推荐不准确、学习路径断层、用户水平误判',
             painPoints: '解决用户不知道从何学起、学习路径不清晰的问题',
             modules: '课程管理模块、推荐引擎、用户画像模块',
             priority: 'High',
             openIssues: '课程分级标准、推荐算法优化、内容更新机制'
           },
           {
             name: '互动学习功能',
             features: '在线测试、模拟交易、学习笔记、讨论区、作业提交',
             businessLogic: '提供多样化的学习互动方式，通过测试和实践加深理解，支持学员间的交流讨论',
             dataRequirements: '测试题库、模拟交易数据、笔记内容、讨论数据、作业记录',
             edgeCases: '作弊行为、系统故障影响测试、模拟数据不准确、讨论秩序混乱',
             painPoints: '解决学习枯燥、缺乏实践机会、学习效果难以验证的问题',
             modules: '测试系统、模拟交易模块、社区讨论模块、笔记系统',
             priority: 'Middle',
             openIssues: '防作弊机制、模拟环境真实性、社区管理规则'
           },
           {
             name: '学习成果认证',
             features: '学习进度跟踪、成绩管理、证书颁发、能力评估、学习报告',
             businessLogic: '跟踪用户学习进度，评估学习成果，为达标用户颁发认证证书，提供详细的学习分析报告',
             dataRequirements: '学习进度数据、考试成绩、证书信息、能力模型数据',
             edgeCases: '证书系统故障、成绩计算错误、认证标准争议、数据丢失',
             painPoints: '解决学习成果无法量化、缺乏权威认证的问题',
             modules: '进度跟踪模块、评估系统、证书管理模块、报告生成器',
             priority: 'Low',
             openIssues: '证书权威性建立、评估标准制定、数据安全保障'
           }
         ]
       });
     }
     
     alert(`${dataType === 'ai-trading' ? 'AI交易助手' : dataType === 'social-platform' ? '社交平台' : '在线教育'}测试数据填充完成！`);
   };

   const clearAllData = () => {
     if (confirm('确定要清空所有数据吗？此操作不可撤销。')) {
       setAnswers({});
       setUserScenarios([{ userType: '', scenario: '', painPoint: '' }]);
       setChangeRecords([{ version: '0.1', modifier: '@xxx', content: '', reason: '', date: new Date().toISOString().split('T')[0] }]);
       setIterationHistory([{ version: '0.1', date: new Date().toISOString().split('T')[0], content: '', author: '@xxx' }]);
                setCompetitors([{ name: '', features: '', advantages: '', disadvantages: '', marketPosition: '' }]);
       setRequirementSolution({
         sharedPrototype: '',
         requirements: [
           { name: '', features: '', businessLogic: '', dataRequirements: '', edgeCases: '', painPoints: '', modules: '', priority: 'High', openIssues: '' }
         ]
       });
       setContentReview(null);
       setGeneratedPRD('');
       alert('所有数据已清空！');
     }
   };

   const runQuickAITest = async () => {
     if (!answers['c1_requirement_intro']) {
       alert('请先填充测试数据，然后再运行AI测试！');
       return;
     }

     try {
       alert('开始运行AI功能快速测试...');
       
       // 1. 测试用户场景扩展
       console.log('测试用户场景扩展...');
       await handleAIUserScenarioExpansion();
       
       // 等待1秒
       await new Promise(resolve => setTimeout(resolve, 1000));
       
       // 2. 测试竞品分析
       console.log('测试竞品分析...');
       await handleAICompetitorAnalysis();
       
       // 等待1秒
       await new Promise(resolve => setTimeout(resolve, 1000));
       
       // 3. 测试内容审查
       console.log('测试内容审查...');
       await handleContentReview();
       
       alert('AI功能快速测试完成！请查看各个功能的输出结果。');
       
     } catch (error) {
       alert('AI测试过程中出现错误：' + (error instanceof Error ? error.message : String(error)));
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
              {question.aiPrompt === 'generate-requirement-goal' ? 'AI目标' : 'AI建议'}
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
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">PRD AI功能集成</h1>
          <p className="text-gray-600 mt-1">智能PRD编写助手：AI扩展用户场景、竞品分析、内容审查和PRD生成</p>
          
          {/* 快速测试工具栏 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">快速测试工具</h3>
                <p className="text-xs text-gray-500">一键填充测试数据，快速验证AI功能</p>
              </div>
              
              <div className="flex gap-2">
                <div className="flex gap-1">
                  <Button
                    onClick={() => fillTestData('ai-trading')}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI交易助手
                  </Button>
                  <Button
                    onClick={() => fillTestData('social-platform')}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    社交平台
                  </Button>
                  <Button
                    onClick={() => fillTestData('education-system')}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    在线教育
                  </Button>
                </div>
                
                <Button
                  onClick={clearAllData}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  清空所有数据
                </Button>
                
                <Button
                  onClick={runQuickAITest}
                  size="sm"
                  disabled={Object.values(isAILoading).some(loading => loading)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {Object.values(isAILoading).some(loading => loading) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  快速AI测试
                </Button>
              </div>
            </div>
          </div>
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
                  {contentReview.issues.map((issue, index: number) => (
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

      {/* 调试日志显示 */}
      {debugLogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">调试日志</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setDebugLogs([])}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  清空日志
                </Button>
                <Button
                  onClick={() => {
                    const logText = debugLogs.map(log => 
                      `[${log.timestamp}] ${log.level.toUpperCase()} ${log.function}: ${log.message}\n${log.details ? JSON.stringify(log.details, null, 2) : ''}`
                    ).join('\n\n');
                    navigator.clipboard.writeText(logText);
                  }}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制日志
                </Button>
              </div>
            </div>
            <div className="text-sm bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {debugLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded border-l-4 ${
                      log.level === 'error' ? 'bg-red-50 border-red-400 text-red-800' :
                      log.level === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                      'bg-blue-50 border-blue-400 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">[{log.timestamp}] {log.function}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.level === 'error' ? 'bg-red-200 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1">{log.message}</div>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs opacity-70">详细信息</summary>
                        <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
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