import { ResearchTask } from "@/components/ui/research-plan";
import type { ResearchLangGraphStep } from "@/types/research";

// 为了简化，为 ResearchLangGraphStep 创建一个别名
type LangGraphStep = ResearchLangGraphStep;

// 将 LangGraph 步骤转换为 ResearchPlan 数据
export const convertLangGraphToResearchTasks = (steps: ResearchLangGraphStep[]): ResearchTask[] => {
  // 调试信息
  const currentExecutingStep = getCurrentExecutingStep(steps);
  console.log('🔄 转换 LangGraph 数据:', {
    totalSteps: steps.length,
    firstStep: steps[0],
    lastStep: steps[steps.length - 1],
    currentExecutingStep,
    stepProgression: {
      'research-planning': steps.filter(s => s.step?.includes('research-planning')).length,
      'information-gathering': steps.filter(s => s.step?.includes('information-gathering')).length,
      'content-enhancement': steps.filter(s => s.step?.includes('content-enhancement')).length,
      'deep-analysis': steps.filter(s => s.step?.includes('deep-analysis')).length,
      'report-generation': steps.filter(s => s.step?.includes('report-generation')).length
    }
  });
  
  // 按主要步骤分组
  const groupedSteps: { [key: string]: LangGraphStep[] } = {};
  const stepOrder = ['research-planning', 'information-gathering', 'content-enhancement', 'deep-analysis', 'report-generation'];
  
  // 初始化所有步骤组
  stepOrder.forEach(stepKey => {
    groupedSteps[stepKey] = [];
  });
  
  // 用于去重的 Set，基于标题和描述
  const seenSteps = new Set<string>();
  
  steps.forEach(step => {
    if (!step.step) return;
    let mainStep = step.step;
    
    // 更智能的步骤匹配，支持版本号格式如 "步骤 2.5: 内容增强 (V1.5)"
    const stepText = step.step.toLowerCase();
    const titleText = (step.title || '').toLowerCase();
    
    // 优先使用 step 字段进行直接匹配（这是最可靠的）
    if (stepText.includes('research-planning')) {
      mainStep = 'research-planning';
    } else if (stepText.includes('information-gathering')) {
      mainStep = 'information-gathering';
    } else if (stepText.includes('content-enhancement')) {
      mainStep = 'content-enhancement';
    } else if (stepText.includes('deep-analysis')) {
      mainStep = 'deep-analysis';
    } else if (stepText.includes('report-generation')) {
      mainStep = 'report-generation';
    }
    
    // 如果 step 字段匹配失败，再尝试 title 字段匹配
    if (mainStep === step.step) { // 说明没有匹配到，mainStep还是原值
      // 特殊处理：检查是否是步骤格式（如"步骤 2.5: 内容增强"）
      const stepNumberMatch = titleText.match(/步骤\s*(\d+)\.(\d+)\s*[:：]\s*(.+)/);
      if (stepNumberMatch) {
        const stepContent = stepNumberMatch[3]; // 获取步骤内容部分
        console.log('检测到步骤格式:', {
          fullTitle: step.title,
          stepNumber: `${stepNumberMatch[1]}.${stepNumberMatch[2]}`,
          stepContent: stepContent,
          originalStep: step.step
        });
        
        // 基于步骤内容进行匹配
        if (stepContent.includes('研究规划') || stepContent.includes('规划')) {
          mainStep = 'research-planning';
        } else if (stepContent.includes('信息搜集') || stepContent.includes('搜集')) {
          mainStep = 'information-gathering';
        } else if (stepContent.includes('内容增强') || stepContent.includes('增强')) {
          mainStep = 'content-enhancement';
        } else if (stepContent.includes('深度分析')) {
          mainStep = 'deep-analysis';
        } else if (stepContent.includes('报告生成') || stepContent.includes('报告')) {
          mainStep = 'report-generation';
        }
      } else {
        // 最后使用简单的 title 匹配
        if (titleText.includes('研究规划') || titleText.includes('规划')) {
          mainStep = 'research-planning';
        } else if (titleText.includes('信息搜集') || titleText.includes('搜集')) {
          mainStep = 'information-gathering';
        } else if (titleText.includes('内容增强') || titleText.includes('增强')) {
          mainStep = 'content-enhancement';
        } else if (titleText.includes('深度分析')) {
          mainStep = 'deep-analysis';
        } else if (titleText.includes('报告生成') || titleText.includes('报告')) {
          mainStep = 'report-generation';
        }
      }
    }
    
    // 创建去重的唯一标识
    const stepIdentifier = `${mainStep}-${step.title?.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌⚠️🔄]/g, '').trim() || ''}-${step.description?.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌]/g, '').trim() || ''}`;
    
    // 只添加未见过的步骤
    if (!seenSteps.has(stepIdentifier)) {
      seenSteps.add(stepIdentifier);
      groupedSteps[mainStep].push(step);
    }
  });

  // 转换为 ResearchTask 格式
  const tasks = stepOrder.map((stepKey, index) => {
    const stepGroup = groupedSteps[stepKey] || [];
    const status = getStepStatus(stepKey, stepGroup, steps);
    const title = getMainStepTitle(stepKey);
    
    // 🔥 关键调试：打印每个任务的生成信息
    console.log(`📋 生成任务 ${index + 1}: ${stepKey}`, {
      stepKey,
      title,
      status,
      stepGroupLength: stepGroup.length,
      isCurrentStep: currentExecutingStep === stepKey
    });
    
    return {
      id: (index + 1).toString(),
      title,
      status,
      priority: 'high' as const,
      level: 0,
      dependencies: index > 0 ? [(index).toString()] : [],
      subtasks: createSubtasks(stepKey, stepGroup, steps, index)
    };
  });
  
  console.log('🎯 最终生成的任务:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
  
  return tasks;
};

// 获取主步骤的友好名称
const getMainStepTitle = (key: string): string => {
  switch (key) {
    case 'research-planning': return '研究规划';
    case 'information-gathering': return '信息搜集 - 第1轮';
    case 'content-enhancement': return '内容增强 - 第1轮';
    case 'deep-analysis': return '深度分析 - 第1轮';
    case 'report-generation': return '最终分析与报告生成';
    default: return key;
  }
};

// 获取工具标签
const getTools = (stepKey: string): string[] => {
  switch (stepKey) {
    case 'research-planning': return ['research-planner', 'scope-analyzer', 'query-optimizer'];
    case 'information-gathering': return ['web-search', 'content-analyzer', 'relevance-scorer'];
    case 'content-enhancement': return ['content-extractor', 'deep-analyzer', 'quality-assessor'];
    case 'deep-analysis': return ['literature-analyzer', 'gap-identifier', 'decision-engine'];
    case 'report-generation': return ['synthesis-engine', 'pattern-finder', 'report-generator'];
    default: return [];
  }
};

// 判断步骤状态
const getStepStatus = (stepKey: string, stepGroup: LangGraphStep[], allSteps: LangGraphStep[]): 'completed' | 'in-progress' | 'pending' => {
  if (stepGroup.length === 0) return 'pending';
  
  // 检查是否有错误步骤
  const hasError = stepGroup.some(s => s.type === 'step_error');
  if (hasError) return 'pending';
  
  // 检查整个研究是否已经完成
  const hasReportCompleteStep = allSteps.some(s => 
    s.step === 'report-generation' && 
    s.type === 'step_complete' && 
    (s.title?.includes('研究报告完成') || s.title?.includes('报告完成') || s.title?.includes('报告已生成') || s.title?.includes('生成完成'))
  );
  
  // 获取当前正在执行的主步骤
  const currentExecutingStep = getCurrentExecutingStep(allSteps);
  
  // 调试信息
  if (stepKey === 'deep-analysis' || stepKey === 'report-generation') {
    console.log(`📊 计算 ${stepKey} 状态: currentStep=${currentExecutingStep}`);
  }
  
  // 如果整个研究已完成，所有步骤都是完成状态
  if (hasReportCompleteStep) {
    console.log(`✅ ${stepKey} 设为 completed (整个研究已完成)`);
    return 'completed';
  }
  
  // 检查子任务的状态分布
  const subtaskStatuses = stepGroup.map(step => getSubtaskStatus(step, stepKey, allSteps));
  const hasCompletedSubtasks = subtaskStatuses.some(status => status === 'completed');
  const hasInProgressSubtasks = subtaskStatuses.some(status => status === 'in-progress');
  
  // 如果是当前执行的步骤
  if (currentExecutingStep === stepKey) {
    console.log(`🎯 ${stepKey} 是当前执行步骤:`, {
      subtaskStatuses,
      hasCompletedSubtasks,
      hasInProgressSubtasks
    });
    
    if (hasInProgressSubtasks) {
      console.log(`🔄 ${stepKey} 设为 in-progress (有进行中的子任务)`);
      return 'in-progress';
    } else if (hasCompletedSubtasks && !hasInProgressSubtasks) {
      // 有完成的子任务但没有进行中的，检查是否所有都完成了
      const allCompleted = subtaskStatuses.every(status => status === 'completed');
      const status = allCompleted ? 'completed' : 'in-progress';
      console.log(`🔄 ${stepKey} 设为 ${status} (所有子任务完成: ${allCompleted})`);
      return status;
    } else {
      console.log(`🔄 ${stepKey} 设为 in-progress (默认当前步骤)`);
      return 'in-progress';
    }
  } else {
    // 不是当前执行的步骤
    const stepOrder = ['research-planning', 'information-gathering', 'content-enhancement', 'deep-analysis', 'report-generation'];
    const currentStepIndex = stepOrder.indexOf(currentExecutingStep);
    const thisStepIndex = stepOrder.indexOf(stepKey);
    
    if (currentStepIndex > thisStepIndex && thisStepIndex !== -1 && currentStepIndex !== -1) {
      // 当前步骤在这个步骤之后，所以这个步骤应该是完成的
      if (stepKey === 'deep-analysis' || stepKey === 'report-generation') {
        console.log(`✅ ${stepKey} -> completed (${currentExecutingStep} 在其之后)`);
      }
      return 'completed';
    } else if (currentStepIndex < thisStepIndex) {
      // 当前步骤在这个步骤之前，所以这个步骤是待处理的
      if (stepKey === 'deep-analysis' || stepKey === 'report-generation') {
        console.log(`⏳ ${stepKey} -> pending (${currentExecutingStep} 在其之前)`);
      }
      return 'pending';
    } else {
      // 找不到步骤顺序，使用完成状态判断
      const fallbackStatus = hasCompletedSubtasks ? 'completed' : 'pending';
      if (stepKey === 'deep-analysis' || stepKey === 'report-generation') {
        console.log(`🔄 ${stepKey} -> ${fallbackStatus} (回退逻辑)`);
      }
      return fallbackStatus;
    }
  }
};

// 获取当前正在执行的步骤
export const getCurrentExecutingStep = (steps: LangGraphStep[]): string => {
  if (steps.length === 0) return '';
  
  // 🔥 关键修复：直接从最新的步骤中获取currentStep，不再进行复杂的推理
  // 因为后端已经在发送正确的currentStep了
  
  // 从最新的步骤开始查找，寻找最近的currentStep
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i] as LangGraphStep & { currentStep?: string }; // 扩展类型以包含currentStep字段
    
    // 如果步骤中包含currentStep字段，直接使用它
    if (step.currentStep) {
      console.log('🎯 直接使用后端提供的currentStep:', {
        stepIndex: i,
        stepTitle: step.title,
        stepType: step.type,
        currentStep: step.currentStep,
        stepField: step.step
      });
      return step.currentStep;
    }
  }
  
  // 如果没有找到currentStep字段，回退到step字段
  const latestStep = steps[steps.length - 1];
  if (latestStep?.step) {
    console.log('🔄 回退使用最新步骤的step字段:', {
      stepTitle: latestStep.title,
      stepType: latestStep.type,
      step: latestStep.step
    });
    return latestStep.step;
  }
  
  console.log('⚠️ 未找到任何有效的步骤信息');
  return '';
};

// 创建子任务
const createSubtasks = (stepKey: string, stepGroup: LangGraphStep[], allSteps: LangGraphStep[], index: number) => {
  const subtasks = [];
  
  // 如果有步骤数据，使用实际数据
  if (stepGroup.length > 0) {
    // 特殊处理信息搜集步骤，合并重复的搜索方向
    if (stepKey === 'information-gathering') {
      subtasks.push(...createOptimizedInformationGatheringSubtasks(stepGroup, allSteps, index));
    } else {
      subtasks.push(...stepGroup.map((step, subIndex) => ({
        id: `${index + 1}.${subIndex + 1}`,
        title: step.title.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌⚠️🔄]/g, '').trim(),
        description: step.description?.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌]/g, '').trim() || '',
        status: getSubtaskStatus(step, stepKey, allSteps),
        priority: 'high' as const,
        tools: getTools(stepKey)
      })));
    }
  } else {
    // 如果没有步骤数据，创建默认进行中子任务
    subtasks.push({
      id: `${index + 1}.1`,
      title: `正在执行${getMainStepTitle(stepKey)}`,
      description: `${getMainStepTitle(stepKey)}正在进行中`,
      status: 'in-progress' as const,
      priority: 'high' as const,
      tools: getTools(stepKey)
    });
  }
  
  // 如果是报告生成步骤且真正完成了，添加报告完成子任务
  if (stepKey === 'report-generation' && stepGroup.length > 0 && isReportGenerationCompleted(stepGroup)) {
    subtasks.push({
      id: 'report-generation-complete',
      title: '研究报告已生成',
      description: '完整的研究报告已经生成完成，包含详细的分析结果和参考资料',
      status: 'completed' as const,
      priority: 'high' as const,
      tools: ['report-generator', 'pdf-exporter', 'markdown-formatter']
    });
  }
  
  return subtasks;
};

// 为信息搜集步骤创建优化的子任务显示
const createOptimizedInformationGatheringSubtasks = (stepGroup: LangGraphStep[], allSteps: LangGraphStep[], index: number) => {
  const subtasks = [];
  
  // 获取当前执行步骤，判断信息搜集是否已经完成
  const currentExecutingStep = getCurrentExecutingStep(allSteps);
  const isInformationGatheringCompleted = currentExecutingStep !== 'information-gathering';
  
  // 按状态分组：发现优质资源、正在深度搜索、资料搜集完成
  const discoverySteps = stepGroup.filter(step => 
    step.title?.includes('发现优质资源') || 
    step.title?.includes('找到') ||
    step.type === 'step_complete'
  );
  
  const searchingSteps = stepGroup.filter(step => 
    step.title?.includes('正在深度搜索') || 
    step.title?.includes('搜索方向') ||
    step.type === 'step_progress' || 
    step.type === 'step_start'
  );
  
  const completionSteps = stepGroup.filter(step => 
    step.title?.includes('资料搜集完成') || 
    step.title?.includes('完成')
  );
  
  // 创建合并的子任务
  if (discoverySteps.length > 0) {
    const totalResources = discoverySteps.reduce((sum, step) => {
      const match = step.title?.match(/(\d+)\s*条资料/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
    
    // 只有找到资料时才显示发现优质资源，避免显示"0条资料"
    if (totalResources > 0) {
      subtasks.push({
        id: `${index + 1}.1`,
        title: `发现优质资源`,
        description: `在多个搜索方向中找到 ${totalResources} 条相关资料`,
        status: 'completed' as const,
        priority: 'high' as const,
        tools: getTools('information-gathering')
      });
    }
  }
  
  // 如果信息搜集已经完成（后端进入下一阶段），不显示进行中状态
  if (searchingSteps.length > 0 && !isInformationGatheringCompleted) {
    const currentSearchDirection = searchingSteps[searchingSteps.length - 1];
    const directionMatch = currentSearchDirection.title?.match(/搜索方向\s*(\d+)\/(\d+)/);
    
    subtasks.push({
      id: `${index + 1}.2`,
      title: `正在深度搜索`,
      description: directionMatch 
        ? `搜索方向 ${directionMatch[1]}/${directionMatch[2]}` 
        : '正在执行多方向深度搜索',
      status: 'in-progress' as const,
      priority: 'high' as const,
      tools: getTools('information-gathering')
    });
  }
  
  // 如果信息搜集已经完成，或者有明确的完成步骤，显示完成状态
  if (completionSteps.length > 0 || isInformationGatheringCompleted) {
    subtasks.push({
      id: `${index + 1}.3`,
      title: `资料搜集完成`,
      description: `已完成所有搜索方向的资料收集`,
      status: 'completed' as const,
      priority: 'high' as const,
      tools: getTools('information-gathering')
    });
  }
  
  // 如果没有明确的分类，回退到原始逻辑但限制数量
  if (subtasks.length === 0) {
    const limitedSteps = stepGroup.slice(0, 3); // 最多显示3个
    subtasks.push(...limitedSteps.map((step, subIndex) => ({
      id: `${index + 1}.${subIndex + 1}`,
      title: step.title.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌⚠️🔄]/g, '').trim(),
      description: step.description?.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌]/g, '').trim() || '',
      status: getSubtaskStatus(step, 'information-gathering', allSteps),
      priority: 'high' as const,
      tools: getTools('information-gathering')
    })));
  }
  
  return subtasks;
};

// 判断子任务状态
const getSubtaskStatus = (step: LangGraphStep, stepKey: string, allSteps: LangGraphStep[]): 'completed' | 'in-progress' | 'pending' => {
  // 检查整个研究是否已经完成
  const hasReportCompleteStep = allSteps.some(s => 
    s.step === 'report-generation' && 
    s.type === 'step_complete' && 
    (s.title?.includes('研究报告完成') || s.title?.includes('报告完成') || s.title?.includes('报告已生成') || s.title?.includes('生成完成'))
  );
  
  if (hasReportCompleteStep) {
    return 'completed';
  }
  
  const currentExecutingStep = getCurrentExecutingStep(allSteps);
  
  // 如果不是当前执行的步骤组，所有子任务都显示为已完成
  if (currentExecutingStep !== stepKey) {
    return 'completed';
  }
  
  // 如果是当前执行的步骤组，按子任务类型判断
  if (step.type === 'step_complete') return 'completed';
  if (step.type === 'step_progress') return 'in-progress';
  if (step.type === 'step_error') return 'pending';
  
  // 根据标题关键词判断状态
  if (step.title?.includes('完成') || step.title?.includes('成功')) return 'completed';
  if (step.title?.includes('正在') || step.title?.includes('进行中')) return 'in-progress';
  
  // 对于step_start类型，仔细判断是否应该显示为进行中
  if (step.type === 'step_start') {
    if (step.title?.includes('正在') || step.title?.includes('进行中')) {
      return 'in-progress';
    }
    // 其他step_start类型的步骤显示为待处理
    return 'pending';
  }
  
  // 默认情况下，当前步骤组的未明确完成的子任务显示为待处理
  return 'pending';
};

// 判断报告生成是否已完成
const isReportGenerationCompleted = (stepGroup: LangGraphStep[]): boolean => {
  return stepGroup.some(s => 
    s.title?.includes('研究报告完成') ||
    s.title?.includes('报告完成') || 
    s.title?.includes('报告已生成') || 
    s.title?.includes('生成完成') ||
    (s.title?.includes('完成') && s.description?.includes('报告'))
  ) || stepGroup.some(s => s.type === 'step_complete' && s.step?.includes('report-generation'));
}; 