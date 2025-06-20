'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Brain, Loader2, CheckCircle, AlertCircle, BarChart3, RefreshCw, Play, Square, Zap, Target, Layers, Sparkles, Settings, /* GitCompare, */ Activity, Cpu, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
// import { Input } from "@/components/ui/input";

// V2 LangGraph 执行状态类型
interface V2LangGraphStep {
  type: 'step_start' | 'step_complete' | 'step_error';
  step: string;
  task_id?: string;
  task_name?: string;
  cycle?: number;
  title: string;
  description: string;
  details?: string[];
  timestamp?: Date;
  quality_score?: number;
  enhancement_type?: string;
}

// V2 任务信息
interface V2Task {
  id: string;
  name: string;
  type: string;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  cycles_completed: number;
  max_cycles: number;
  quality_score?: number;
}

// V2 研究会话状态
interface V2ResearchSession {
  id: string;
  query: string;
  research_mode: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  complexity_score?: number;
  total_tasks: number;
  completed_tasks: number;
  current_step?: string;
  tasks: V2Task[];
  steps: V2LangGraphStep[];
  finalReport?: string;
  error?: string;
}

// 性能指标接口
interface PerformanceMetrics {
  apiCallCount: number;
  executionTime: number;
  memoryUsage: number;
  errorRate: number;
  parallelSearchCount: number;
  enhancementCount: number;
  lastUpdateTime: Date;
}

// 高级配置接口
interface AdvancedConfig {
  enableParallelSearch: boolean;
  enableContentEnhancement: boolean;
  maxConcurrentQueries: number;
  qualityThreshold: number;
  retryAttempts: number;
  enhancementMaxUrls: number;
}

// 性能监控组件
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PerformanceMonitor: React.FC<{ session: V2ResearchSession | null }> = ({ session }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiCallCount: 0,
    executionTime: 0,
    memoryUsage: 0,
    errorRate: 0,
    parallelSearchCount: 0,
    enhancementCount: 0,
    lastUpdateTime: new Date()
  });
  
  useEffect(() => {
    if (session) {
      // 计算性能指标
      const executionTime = session.endTime && session.startTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
        : session.startTime 
        ? (Date.now() - session.startTime.getTime()) / 1000
        : 0;
      
      const apiCallCount = session.steps.filter(step => 
        ['query_generation', 'web_search', 'reflection', 'report_generation'].includes(step.step)
      ).length;
      
      const parallelSearchCount = session.steps.filter(step => 
        step.details?.some(detail => detail.includes('并行搜索'))
      ).length;
      
      const enhancementCount = session.steps.filter(step => 
        step.enhancement_type || step.details?.some(detail => detail.includes('Firecrawl'))
      ).length;
      
      const errorSteps = session.steps.filter(step => step.type === 'step_error').length;
      const errorRate = session.steps.length > 0 ? (errorSteps / session.steps.length) * 100 : 0;
      
      setMetrics({
        apiCallCount,
        executionTime,
        memoryUsage: Math.random() * 100 + 50, // 模拟内存使用
        errorRate,
        parallelSearchCount,
        enhancementCount,
        lastUpdateTime: new Date()
      });
    }
  }, [session]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          V2性能监控
        </CardTitle>
        <CardDescription>实时跟踪并行处理和内容增强效果</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.apiCallCount}</div>
            <div className="text-sm text-blue-500 flex items-center justify-center gap-1">
              <Cpu className="w-3 h-3" />
              API调用
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.executionTime.toFixed(1)}s</div>
            <div className="text-sm text-green-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              执行时间
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{metrics.memoryUsage.toFixed(1)}MB</div>
            <div className="text-sm text-purple-500 flex items-center justify-center gap-1">
              <BarChart3 className="w-3 h-3" />
              内存使用
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{metrics.errorRate.toFixed(1)}%</div>
            <div className="text-sm text-orange-500">错误率</div>
          </div>
          <div className="text-center p-3 bg-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">{metrics.parallelSearchCount}</div>
            <div className="text-sm text-cyan-500">并行搜索</div>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{metrics.enhancementCount}</div>
            <div className="text-sm text-pink-500">内容增强</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          最后更新: {metrics.lastUpdateTime.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

// 高级配置面板组件
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdvancedConfigPanel: React.FC<{
  config: AdvancedConfig;
  onConfigChange: (config: AdvancedConfig) => void;
  disabled: boolean;
}> = ({ config, onConfigChange, disabled }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          V2高级配置
        </CardTitle>
        <CardDescription>调整并行处理和内容增强参数</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">启用并行搜索</label>
          <Switch
            checked={config.enableParallelSearch}
            onCheckedChange={(checked) => onConfigChange({...config, enableParallelSearch: checked})}
            disabled={disabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">启用内容增强</label>
          <Switch
            checked={config.enableContentEnhancement}
            onCheckedChange={(checked) => onConfigChange({...config, enableContentEnhancement: checked})}
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            并发查询数: {config.maxConcurrentQueries}
          </label>
          <Slider
            value={[config.maxConcurrentQueries]}
            onValueChange={([value]) => onConfigChange({...config, maxConcurrentQueries: value})}
            max={10}
            min={1}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            质量阈值: {config.qualityThreshold.toFixed(1)}
          </label>
          <Slider
            value={[config.qualityThreshold]}
            onValueChange={([value]) => onConfigChange({...config, qualityThreshold: value})}
            max={1}
            min={0}
            step={0.1}
            disabled={disabled}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            重试次数: {config.retryAttempts}
          </label>
          <Slider
            value={[config.retryAttempts]}
            onValueChange={([value]) => onConfigChange({...config, retryAttempts: value})}
            max={5}
            min={1}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            增强URL数: {config.enhancementMaxUrls}
          </label>
          <Slider
            value={[config.enhancementMaxUrls]}
            onValueChange={([value]) => onConfigChange({...config, enhancementMaxUrls: value})}
            max={10}
            min={1}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// V2 预定义测试场景
const V2_TEST_SCENARIOS = [
  {
    id: 'quick',
    title: '快速研究模式',
    description: '智能单任务快速分析，AI自动优化搜索策略',
    query: '人工智能在教育领域的最新应用趋势',
    mode: 'quick',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'balanced',
    title: '平衡研究模式',
    description: '多任务协调执行，平衡深度与广度',
    query: '量子计算技术在金融科技领域的应用前景与挑战分析',
    mode: 'balanced',
    icon: <Target className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'deep',
    title: '深度研究模式',
    description: '多维度深入分析，内容增强与质量优化',
    query: '区块链技术在供应链管理中的实际应用案例、技术架构和效果评估',
    mode: 'deep',
    icon: <Layers className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'comprehensive',
    title: '全面研究模式',
    description: '最大化任务分解，全方位内容增强',
    query: '人工智能大模型在医疗诊断、药物研发、个性化治疗中的应用现状、技术挑战、监管政策和未来发展趋势',
    mode: 'comprehensive',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-700'
  }
];

// 研究模式选项
const RESEARCH_MODES = [
  { value: 'quick', label: '快速模式', description: '单任务快速分析' },
  { value: 'balanced', label: '平衡模式', description: '多任务协调执行' },
  { value: 'deep', label: '深度模式', description: '深入分析与增强' },
  { value: 'comprehensive', label: '全面模式', description: '最大化分解与优化' }
];

export default function LangGraphV2TestPage() {
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState<V2ResearchSession | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('balanced');
  const [sessions, setSessions] = useState<V2ResearchSession[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 新增：高级配置状态
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
    enableParallelSearch: true,
    enableContentEnhancement: true,
    maxConcurrentQueries: 3,
    qualityThreshold: 0.7,
    retryAttempts: 3,
    enhancementMaxUrls: 5
  });

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.steps]);

  // 启动V2研究任务 - 增强版
  const startV2Research = async (query: string, mode: string = 'balanced') => {
    if (!query.trim()) return;

    const newSession: V2ResearchSession = {
      id: Date.now().toString(),
      query: query.trim(),
      research_mode: mode,
      status: 'running',
      startTime: new Date(),
      total_tasks: 0,
      completed_tasks: 0,
      tasks: [],
      steps: [],
    };

    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);

    try {
      // 调用Backend的V2统一研究API，包含高级配置
      const response = await fetch('http://localhost:8000/unified-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim(),
          version: "v2",
          mode: mode,
          // 传递高级配置
          config: {
            enable_parallel_search: advancedConfig.enableParallelSearch,
            enable_content_enhancement: advancedConfig.enableContentEnhancement,
            max_concurrent_queries: advancedConfig.maxConcurrentQueries,
            quality_threshold: advancedConfig.qualityThreshold,
            retry_attempts: advancedConfig.retryAttempts,
            enhancement_max_urls: advancedConfig.enhancementMaxUrls
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              
              // 处理不同类型的V2事件
              if (data.step === 'complete') {
                // 研究完成
                setCurrentSession(prev => prev ? {
                  ...prev,
                  status: 'completed',
                  endTime: new Date(),
                  finalReport: data.report || data.data?.report || "",
                  completed_tasks: data.completed_tasks || data.data?.completed_tasks || prev.completed_tasks
                } : null);
              } else if (data.step === 'error') {
                // 发生错误
                setCurrentSession(prev => prev ? {
                  ...prev,
                  status: 'error',
                  endTime: new Date(),
                  error: data.details
                } : null);
              } else {
                // 更新执行步骤
                const state = data.state || {};
                
                // 更新任务信息
                if (state.tasks) {
                  const tasks: V2Task[] = state.tasks.map((task: {
                    id?: string;
                    name: string;
                    type: string;
                    priority?: number;
                    status?: string;
                    cycles_completed?: number;
                    max_cycles?: number;
                    quality_score?: number;
                  }) => ({
                    id: task.id || task.name,
                    name: task.name,
                    type: task.type,
                    priority: task.priority || 1,
                    status: task.status || 'pending',
                    cycles_completed: task.cycles_completed || 0,
                    max_cycles: task.max_cycles || 3,
                    quality_score: task.quality_score
                  }));
                  
                  setCurrentSession(prev => prev ? {
                    ...prev,
                    tasks: tasks,
                    total_tasks: tasks.length,
                    completed_tasks: tasks.filter(t => t.status === 'completed').length,
                    complexity_score: state.complexity_score
                  } : null);
                }

                // 生成友好的步骤标题
                const getV2StepTitle = (stepName: string, taskName?: string, cycle?: number) => {
                  const taskPrefix = taskName ? `[${taskName}] ` : '';
                  const cyclePrefix = cycle ? `第${cycle}轮 - ` : '';
                  
                  switch (stepName) {
                    case 'planning': return '🧠 智能规划 - 分析查询复杂度';
                    case 'task_coordination': return '🎯 任务协调 - 分解执行策略';
                    case 'query_generation': return `${taskPrefix}${cyclePrefix}生成搜索查询`;
                    case 'web_search': return `${taskPrefix}${cyclePrefix}${advancedConfig.enableParallelSearch ? '并行' : ''}网络搜索`;
                    case 'reflection': return `${taskPrefix}${cyclePrefix}反思和分析`;
                    case 'content_enhancement': return `${taskPrefix}Firecrawl内容增强 - 质量优化`;
                    case 'report_generation': return '📄 生成综合报告';
                    default: return `${taskPrefix}${stepName}`;
                  }
                };

                const stepInfo: V2LangGraphStep = {
                  type: 'step_complete',
                  step: data.step,
                  task_id: state.current_task?.id,
                  task_name: state.current_task?.name,
                  cycle: state.current_task?.cycles_completed,
                  title: getV2StepTitle(data.step, state.current_task?.name, state.current_task?.cycles_completed),
                  description: data.details,
                  details: [
                    ...(state.complexity_score ? [`复杂度评分: ${state.complexity_score}/10`] : []),
                    ...(state.search_queries || []).map((q: string, i: number) => `查询${i+1}: ${q}`),
                    ...(state.search_results_count > 0 ? [`找到 ${state.search_results_count} 条搜索结果`] : []),
                    ...(state.critique ? [`反思内容: ${state.critique.substring(0, 100)}...`] : []),
                    ...(state.quality_assessment ? [`质量评估: ${JSON.stringify(state.quality_assessment)}`] : []),
                    ...(state.enhancement_decision ? [`增强决策: ${state.enhancement_decision.type} - ${state.enhancement_decision.reasoning?.substring(0, 100)}...`] : []),
                    ...(advancedConfig.enableParallelSearch ? ['🚀 并行搜索已启用'] : []),
                    ...(advancedConfig.enableContentEnhancement ? ['🔥 Firecrawl增强已启用'] : [])
                  ].filter(Boolean),
                  timestamp: new Date(),
                  quality_score: state.current_task?.quality_score,
                  enhancement_type: state.enhancement_decision?.type
                };

                setCurrentSession(prev => prev ? {
                  ...prev,
                  current_step: data.step,
                  steps: [...prev.steps, stepInfo]
                } : null);
              }
            } catch (error) {
              console.warn('解析V2 SSE数据失败:', jsonStr, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('V2研究请求失败:', error);
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'error',
        endTime: new Date(),
        error: error instanceof Error ? error.message : '未知错误'
      } : null);
    }
  };

  // 停止研究
  const stopResearch = () => {
    setCurrentSession(prev => prev ? {
      ...prev,
      status: 'error',
      endTime: new Date(),
      error: '用户手动停止'
    } : null);
  };

  // 清空会话历史
  const clearSessions = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  // 获取状态图标
  const getStatusIcon = (status: V2ResearchSession['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  // 获取步骤图标
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'planning': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'task_coordination': return <Target className="w-4 h-4 text-blue-500" />;
      case 'query_generation': return <Search className="w-4 h-4 text-green-500" />;
      case 'web_search': return <Search className="w-4 h-4 text-blue-500" />;
      case 'reflection': return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'content_enhancement': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'report_generation': return <BarChart3 className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  // 获取任务状态颜色
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/test-demos')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回测试首页
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                LangGraph V2 高级测试实验室
                <Badge variant="secondary" className="text-sm">
                  多任务智能协调
                </Badge>
              </h1>
              <p className="text-gray-600">测试智能规划、多任务协调、内容增强和质量优化的高级AI代理架构</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSessions}
              disabled={sessions.length === 0}
            >
              清空历史
            </Button>
            {currentSession?.status === 'running' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopResearch}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                停止
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：控制面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* V2快速测试场景 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">V2 智能测试场景</CardTitle>
              <CardDescription>体验多任务协调、智能规划和内容增强的强大功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {V2_TEST_SCENARIOS.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => startV2Research(scenario.query, scenario.mode)}
                  disabled={currentSession?.status === 'running'}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", scenario.color)}>
                      {scenario.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{scenario.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 自定义V2查询 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">自定义V2研究</CardTitle>
              <CardDescription>体验智能规划和多任务协调的强大能力</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">研究模式</label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-xs text-gray-500">{mode.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                placeholder="例如：人工智能大模型在医疗诊断中的应用现状、技术挑战和未来发展趋势..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button
                onClick={() => startV2Research(customQuery, selectedMode)}
                disabled={!customQuery.trim() || currentSession?.status === 'running'}
                className="w-full flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                开始V2研究
              </Button>
            </CardContent>
          </Card>

          {/* V2历史会话 */}
          {sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">V2研究历史</CardTitle>
                <CardDescription>最近的高级研究会话记录</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      session.id === currentSession?.id 
                        ? "bg-blue-50 border-blue-200" 
                        : "bg-white hover:bg-gray-50"
                    )}
                    onClick={() => setCurrentSession(session)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(session.status)}
                      <span className="text-sm font-medium">
                        {session.status === 'running' ? '进行中' : 
                         session.status === 'completed' ? '已完成' : 
                         session.status === 'error' ? '出错' : '空闲'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {session.research_mode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {session.completed_tasks}/{session.total_tasks} 任务
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {session.steps.length} 步骤
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {session.query}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：执行监控 */}
        <div className="lg:col-span-3">
          {currentSession ? (
            <div className="space-y-6">
              {/* 任务概览 */}
              {currentSession.tasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">任务执行概览</CardTitle>
                    <CardDescription>多任务协调执行状态</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentSession.tasks.map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{task.name}</h4>
                            <Badge className={cn("text-xs", getTaskStatusColor(task.status))}>
                              {task.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>类型: {task.type}</div>
                            <div>优先级: {task.priority}</div>
                            <div>进度: {task.cycles_completed}/{task.max_cycles} 轮</div>
                            {task.quality_score && (
                              <div>质量: {task.quality_score.toFixed(1)}/10</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 执行监控 */}
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(currentSession.status)}
                      <div>
                        <CardTitle className="text-lg">V2 执行监控</CardTitle>
                        <CardDescription>实时跟踪智能规划和多任务协调过程</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>模式: {currentSession.research_mode}</span>
                      <span>任务: {currentSession.completed_tasks}/{currentSession.total_tasks}</span>
                      <span>步骤: {currentSession.steps.length}</span>
                      {currentSession.complexity_score && (
                        <span>复杂度: {currentSession.complexity_score}/10</span>
                      )}
                      {currentSession.startTime && (
                        <span>
                          用时: {currentSession.endTime ? 
                            Math.round((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 1000) :
                            Math.round((Date.now() - currentSession.startTime.getTime()) / 1000)
                          }秒
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 研究查询 */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">研究主题:</p>
                    <p className="text-sm text-gray-900 mt-1">{currentSession.query}</p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col min-h-0">
                  {/* 执行步骤 */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto space-y-4 pr-2"
                  >
                    {currentSession.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {getStepIcon(step.step)}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{step.title}</h4>
                            {step.task_name && (
                              <Badge variant="outline" className="text-xs">
                                {step.task_name}
                              </Badge>
                            )}
                            {step.cycle && (
                              <Badge variant="outline" className="text-xs">
                                第{step.cycle}轮
                              </Badge>
                            )}
                            {step.quality_score && (
                              <Badge variant="secondary" className="text-xs">
                                质量: {step.quality_score.toFixed(1)}
                              </Badge>
                            )}
                            {step.enhancement_type && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                {step.enhancement_type}
                              </Badge>
                            )}
                            {step.timestamp && (
                              <span className="text-xs text-gray-500">
                                {step.timestamp.toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          {step.details && step.details.length > 0 && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {step.details.map((detail, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                                  <span>{detail}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* 当前运行状态 */}
                    {currentSession.status === 'running' && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">V2执行中...</h4>
                          <p className="text-sm text-gray-600">
                            正在处理 {currentSession.current_step || '未知步骤'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 最终报告 */}
                    {currentSession.finalReport && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">📄 V2 综合研究报告</h4>
                        <div className="text-sm text-green-800 whitespace-pre-wrap">
                          {currentSession.finalReport}
                        </div>
                      </div>
                    )}

                    {/* 错误信息 */}
                    {currentSession.error && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-2">❌ V2执行错误</h4>
                        <p className="text-sm text-red-800">{currentSession.error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择测试场景开始V2研究</h3>
                <p className="text-gray-500">体验智能规划、多任务协调和内容增强的强大功能</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
      );
  }