import { useState } from 'react';
import { 
  ChangeRecord, 
  UserScenario, 
  IterationHistory, 
  CompetitorItem,
  RequirementItem,
  RequirementSolution,
  ContentReview
} from '@/types/prd';

type WorkflowStage = 'welcome' | 'guiding' | 'ai-review' | 'prd-generation' | 'completed';
type ViewMode = 'single' | 'overview';

export function usePRDState() {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [contentReview, setContentReview] = useState<ContentReview | null>(null);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  
  // 工作流状态
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('welcome');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  
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

  // 答案更新
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

  // Action handlers for components
  const handleChangeRecordAction = (action: 'add' | 'remove' | 'update', index?: number, field?: keyof ChangeRecord, value?: string) => {
    switch (action) {
      case 'add':
        addChangeRecord();
        break;
      case 'remove':
        if (index !== undefined) removeChangeRecord(index);
        break;
      case 'update':
        if (index !== undefined && field && value !== undefined) updateChangeRecord(index, field, value);
        break;
    }
  };

  const handleUserScenarioAction = (action: 'add' | 'remove' | 'update' | 'replace', index?: number, field?: keyof UserScenario, value?: string | UserScenario[]) => {
    switch (action) {
      case 'add':
        addUserScenario();
        break;
      case 'remove':
        if (index !== undefined) removeUserScenario(index);
        break;
      case 'update':
        if (index !== undefined && field && typeof value === 'string') updateUserScenario(index, field, value);
        break;
      case 'replace':
        if (Array.isArray(value)) setUserScenarios(value);
        break;
    }
  };

  const handleIterationHistoryAction = (action: 'add' | 'remove' | 'update', index?: number, field?: keyof IterationHistory, value?: string) => {
    switch (action) {
      case 'add':
        addIterationHistory();
        break;
      case 'remove':
        if (index !== undefined) removeIterationHistory(index);
        break;
      case 'update':
        if (index !== undefined && field && value !== undefined) updateIterationHistory(index, field, value);
        break;
    }
  };

  const handleCompetitorAction = (action: 'add' | 'remove' | 'update' | 'replace', index?: number, field?: keyof CompetitorItem, value?: string | CompetitorItem[]) => {
    switch (action) {
      case 'add':
        addCompetitor();
        break;
      case 'remove':
        if (index !== undefined) removeCompetitor(index);
        break;
      case 'update':
        if (index !== undefined && field && typeof value === 'string') updateCompetitor(index, field, value);
        break;
      case 'replace':
        if (Array.isArray(value)) setCompetitors(value);
        break;
    }
  };

  const handleRequirementSolutionAction = (action: 'add' | 'remove' | 'update' | 'updatePrototype', index?: number, field?: string, value?: string) => {
    switch (action) {
      case 'add':
        addRequirement();
        break;
      case 'remove':
        if (index !== undefined) removeRequirement(index);
        break;
      case 'update':
        if (index !== undefined && field && value !== undefined) {
          updateRequirement(index, field as keyof RequirementItem, value);
        }
        break;
      case 'updatePrototype':
        if (value !== undefined) updateSharedPrototype(value);
        break;
    }
  };

  // 重置所有状态
  const resetAllState = () => {
    setAnswers({});
    setContentReview(null);
    setGeneratedPRD('');
    setWorkflowStage('welcome');
    setCurrentChapterIndex(0);
    setViewMode('single');
    setChangeRecords([{ version: '0.1', modifier: '@xxx', content: '', reason: '', date: new Date().toISOString().split('T')[0] }]);
    setUserScenarios([{ userType: '', scenario: '', painPoint: '' }]);
    setIterationHistory([{ version: '0.1', date: new Date().toISOString().split('T')[0], content: '', author: '@xxx' }]);
    setCompetitors([{ name: '', features: '', advantages: '', disadvantages: '', marketPosition: '' }]);
    setRequirementSolution({
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
  };

  return {
    // 状态
    answers,
    changeRecords,
    userScenarios,
    iterationHistory,
    competitors,
    requirementSolution,
    contentReview,
    generatedPRD,
    
    // 工作流状态
    workflowStage,
    setWorkflowStage,
    currentChapterIndex,
    setCurrentChapterIndex,
    viewMode,
    setViewMode,
    
    // 状态更新函数
    handleAnswerChange,
    setContentReview,
    setGeneratedPRD,
    setUserScenarios,
    setCompetitors,
    
    // 变更记录管理
    addChangeRecord,
    removeChangeRecord,
    updateChangeRecord,
    
    // 用户场景管理
    addUserScenario,
    removeUserScenario,
    updateUserScenario,
    
    // 迭代历史管理
    addIterationHistory,
    removeIterationHistory,
    updateIterationHistory,
    
    // 竞品管理
    addCompetitor,
    removeCompetitor,
    updateCompetitor,
    
    // 需求方案管理
    addRequirement,
    removeRequirement,
    updateRequirement,
    updateSharedPrototype,
    
    // Action handlers
    handleChangeRecordAction,
    handleUserScenarioAction,
    handleIterationHistoryAction,
    handleCompetitorAction,
    handleRequirementSolutionAction,
    
    // 重置
    resetAllState
  };
} 