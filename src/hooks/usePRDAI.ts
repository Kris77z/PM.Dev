import { useState } from 'react';
import { 
  UserScenario, 
  CompetitorItem, 
  ContentReview, 
  FeatureSuggestion, 
  EdgeCaseSuggestion,
  ChangeRecord,
  IterationHistory,
  RequirementSolution
} from '@/types/prd';

export function usePRDAI() {
  const [isAILoading, setIsAILoading] = useState<{ [key: string]: boolean }>({});
  const [reviewResult, setReviewResult] = useState<ContentReview | null>(null);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');

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

  // 统一的AI行为处理函数
  const handleAIAction = async (
    actionType: string, 
    questionId?: string, 
    context?: {
      answers: { [key: string]: string };
      userScenarios: UserScenario[];
      competitors: CompetitorItem[];
      changeRecords: ChangeRecord[];
      iterationHistory: IterationHistory[];
      requirementSolution: RequirementSolution;
      handleAnswerChange: (questionId: string, value: string) => void;
      handleUserScenarioAction: (action: string, data?: unknown) => void;
      handleCompetitorAction: (action: string, data?: unknown) => void;
      setUserScenarios: (scenarios: UserScenario[]) => void;
      setCompetitors: (competitors: CompetitorItem[]) => void;
      handleChangeRecordAction: (action: string, data?: unknown) => void;
      handleIterationHistoryAction: (action: string, data?: unknown) => void;
      handleRequirementSolutionAction: (action: string, data?: unknown) => void;
    }
  ): Promise<boolean> => {
    if (!context) return false;

    try {
      switch (actionType) {
        case 'expand-user-scenarios': {
          const requirementIntro = context.answers['c1_requirement_intro'];
          const scenarios = await expandUserScenarios(requirementIntro);
          // 直接更新用户场景状态
          context.setUserScenarios(scenarios);
          return true;
        }

        case 'generate-requirement-goal': {
          const requirementIntro = context.answers['c1_requirement_intro'];
          const businessLine = context.answers['c1_business_line'];
          const goal = await generateRequirementGoal(requirementIntro, businessLine, context.userScenarios);
          context.handleAnswerChange('c2_requirement_goal', goal);
          return true;
        }

        case 'competitor-analysis': {
          const requirementIntro = context.answers['c1_requirement_intro'];
          const businessLine = context.answers['c1_business_line'];
          const requirementGoal = context.answers['c2_requirement_goal'];
          const competitors = await analyzeCompetitors(requirementIntro, businessLine, requirementGoal);
          // 直接更新竞品状态
          context.setCompetitors(competitors);
          return true;
        }

        case 'suggest-features': {
          const requirement = context.answers['c1_requirement_intro'];
          const suggestion = await suggestFeatures(requirement, context.userScenarios);
          context.handleAnswerChange('c4_requirement_solution', suggestion);
          return true;
        }

        case 'suggest-business-logic': {
          const featureName = context.answers['c4_requirement_solution'];
          const requirement = context.answers['c1_requirement_intro'];
          const suggestion = await suggestBusinessLogic(featureName, requirement);
          context.handleAnswerChange('c4_requirement_solution', suggestion);
          return true;
        }

        case 'suggest-edge-cases': {
          const featureName = context.answers['c4_requirement_solution'];
          const businessLogic = context.answers['c4_requirement_solution'];
          const suggestion = await suggestEdgeCases(featureName, businessLogic);
          context.handleAnswerChange('c4_requirement_solution', suggestion);
          return true;
        }

        case 'review-content': {
          const review = await reviewContent(
            context.answers,
            context.changeRecords,
            context.userScenarios,
            context.iterationHistory,
            context.competitors,
            context.requirementSolution
          );
          setReviewResult(review);
          return true;
        }

        case 'generate-prd': {
          const prd = await generatePRD(
            context.answers,
            context.changeRecords,
            context.userScenarios,
            context.iterationHistory,
            context.competitors,
            context.requirementSolution
          );
          setGeneratedPRD(prd);
          return true;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error(`AI action ${actionType} failed:`, error);
      throw error;
    }
  };

  // AI功能 - 用户场景扩展
  const expandUserScenarios = async (requirementIntro: string): Promise<UserScenario[]> => {
    if (!requirementIntro) {
      throw new Error('请先填写需求介绍');
    }

    const result = await callAI('expand-user-scenarios', { requirementIntro });
    
    if (result.success && result.scenarios) {
      return result.scenarios;
    }
    throw new Error('用户场景扩展失败');
  };

  // AI功能 - 需求目标生成
  const generateRequirementGoal = async (
    requirementIntro: string,
    businessLine: string,
    userScenarios: UserScenario[]
  ): Promise<string> => {
    if (!requirementIntro) {
      throw new Error('请先填写需求介绍');
    }

    if (!userScenarios || userScenarios.length === 0 || !userScenarios[0].userType) {
      throw new Error('请先完成用户场景分析，再生成需求目标');
    }

    const result = await callAI('generate-requirement-goal', { 
      requirementIntro, 
      businessLine,
      userScenarios
    });
    
    if (result.success && result.goal) {
      return result.goal;
    }
    throw new Error('需求目标生成失败');
  };

  // AI功能 - 竞品分析
  const analyzeCompetitors = async (
    requirementIntro: string,
    businessLine: string,
    requirementGoal: string
  ): Promise<CompetitorItem[]> => {
    if (!requirementIntro) {
      throw new Error('请先填写需求介绍');
    }

    const result = await callAI('competitor-analysis', { 
      requirementIntro, 
      businessLine,
      requirementGoal
    });
    
    if (result.success) {
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
          // 如果JSON解析失败，抛出错误
          throw new Error('AI返回了竞品分析内容，但格式需要调整。请重新尝试分析。');
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
        return competitorData;
      } else {
        throw new Error('竞品分析请求成功，但AI返回的数据格式不正确。请重新尝试。');
      }
    }
    throw new Error('竞品分析失败');
  };

  // AI功能 - 内容审查
  const reviewContent = async (
    answers: { [key: string]: string },
    changeRecords: ChangeRecord[],
    userScenarios: UserScenario[],
    iterationHistory: IterationHistory[],
    competitors: CompetitorItem[],
    requirementSolution: RequirementSolution
  ): Promise<ContentReview> => {
    const result = await callAI('review-content', {
      answers,
      changeRecords,
      userScenarios,
      iterationHistory,
      competitors,
      requirementSolution
    });
    
    if (result.success && result.review) {
      return result.review;
    }
    throw new Error('内容审查失败');
  };

  // AI功能 - PRD生成
  const generatePRD = async (
    answers: { [key: string]: string },
    changeRecords: ChangeRecord[],
    userScenarios: UserScenario[],
    iterationHistory: IterationHistory[],
    competitors: CompetitorItem[],
    requirementSolution: RequirementSolution
  ): Promise<string> => {
    const result = await callAI('generate-prd', {
      answers,
      changeRecords,
      userScenarios,
      iterationHistory,
      competitors,
      requirementSolution
    });
    
    if (result.success && result.prd) {
      return result.prd;
    }
    throw new Error('PRD生成失败');
  };

  // AI功能 - 功能建议
  const suggestFeatures = async (
    requirement: string,
    userScenarios: UserScenario[],
    competitorAnalysis?: string
  ): Promise<string> => {
    if (!requirement) {
      throw new Error('请先填写需求描述');
    }

    const result = await callAI('suggest-features', { 
      requirement, 
      userScenarios,
      competitorAnalysis 
    });
    
    if (result.success && result.suggestions) {
      const suggestions = result.suggestions as FeatureSuggestion[];
      return suggestions.map((suggestion, index) => 
        `${index + 1}. **${suggestion.featureName}**\n   - 描述：${suggestion.description}\n   - 流程：${suggestion.workflow}\n   - 价值：${suggestion.value}`
      ).join('\n\n');
    }
    throw new Error('功能建议失败');
  };

  // AI功能 - 业务逻辑建议
  const suggestBusinessLogic = async (
    featureName: string,
    requirement: string
  ): Promise<string> => {
    if (!featureName) {
      throw new Error('请先填写需求或功能点描述');
    }

    const result = await callAI('suggest-business-logic', { 
      featureName, 
      requirement 
    });
    
    if (result.success && result.suggestion) {
      return result.suggestion;
    }
    throw new Error('业务逻辑建议失败');
  };

  // AI功能 - 边缘场景建议
  const suggestEdgeCases = async (
    featureName: string,
    businessLogic?: string
  ): Promise<string> => {
    if (!featureName) {
      throw new Error('请先填写需求或功能点描述');
    }

    const result = await callAI('suggest-edge-cases', { 
      featureName, 
      businessLogic 
    });
    
    if (result.success && result.suggestions) {
      const suggestions = result.suggestions as EdgeCaseSuggestion[];
      return suggestions.map((suggestion, index) => 
        `${index + 1}. **${suggestion.category}：${suggestion.scenario}**\n   - 问题：${suggestion.issue}\n   - 解决方案：${suggestion.solution}`
      ).join('\n\n');
    }
    throw new Error('边缘场景建议失败');
  };

  return {
    isAILoading,
    handleAIAction,
    reviewResult,
    generatedPRD,
    expandUserScenarios,
    generateRequirementGoal,
    analyzeCompetitors,
    reviewContent,
    generatePRD,
    suggestFeatures,
    suggestBusinessLogic,
    suggestEdgeCases
  };
} 