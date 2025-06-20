'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Brain, Clock, CheckCircle, AlertCircle, RefreshCw, Eye, Play, Square, CheckCircle2, Circle, CircleDotDashed, CircleX, Copy, FileText, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
// import { Progress } from "@/components/ui/progress";

// LangGraph 执行状态类型
interface LangGraphStep {
  type: 'step_start' | 'step_complete' | 'step_error' | 'step_progress';
  step: string;
  cycle: number;
  title: string;
  description: string;
  details?: string[];
  timestamp?: Date;
}

// 研究会话状态
interface ResearchSession {
  id: string;
  query: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  totalCycles: number;
  currentStep?: string;
  steps: LangGraphStep[];
  finalReport?: string;
  report?: string;
  error?: string;
  lastNodeStatusUpdate?: number;
}

// 预定义测试场景
const TEST_SCENARIOS = [
  {
    id: 'simple',
    title: '简单研究',
    description: '基础单轮搜索和报告生成 (1轮)',
    query: '人工智能在教育领域的应用现状',
    maxCycles: 1,
    icon: <Search className="w-4 h-4" />
  },
  {
    id: 'complex',
    title: '复杂研究',
    description: '多轮迭代搜索优化 (3轮)',
    query: '量子计算在金融风险管理中的应用前景与技术挑战',
    maxCycles: 3,
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: 'adaptive',
    title: '自适应研究',
    description: 'AI自主决定搜索深度 (2轮)',
    query: '区块链技术在供应链管理中的实际应用案例和效果评估',
    maxCycles: 2,
    icon: <RefreshCw className="w-4 h-4" />
  }
];

// 测试数据 - 基于实际日志
const MOCK_SESSION_DATA: ResearchSession = {
  id: 'test-session-1',
  query: '人工智能在教育领域的应用现状',
  status: 'completed',
  startTime: new Date('2024-01-15T19:50:40'),
  endTime: new Date('2024-01-15T19:51:15'),
  totalCycles: 1,
  steps: [
    // 主步骤1: 研究规划
    {
      type: 'step_complete',
      step: 'research-planning',
      cycle: 1,
      title: '🔍 正在深度研究',
      description: '人工智能在教育领域的应用现状',
      details: ['研究规划中...'],
      timestamp: new Date('2024-01-15T19:50:41')
    },
    {
      type: 'step_complete', 
      step: 'research-planning',
      cycle: 1,
      title: '📋 研究方向已确定',
      description: '将从5个角度深入研究',
      details: [
        '• 系统性回顾AI教育应用现状',
        '• AI辅导系统效果分析研究', 
        '• 学生学习成果影响评估',
        '• 教育技术伦理问题探讨',
        '• 个性化学习最佳实践案例'
      ],
      timestamp: new Date('2024-01-15T19:50:42')
    },
    // 主步骤2: 信息搜集 (包含多个子步骤)
    {
      type: 'step_start',
      step: 'information-gathering',
      cycle: 1,
      title: '🌐 正在搜集资料',
      description: '从权威来源获取最新研究信息',
      details: ['信息搜集中...'],
      timestamp: new Date('2024-01-15T19:50:43')
    },
    {
      type: 'step_complete',
      step: 'information-gathering-search-1',
      cycle: 1,
      title: '🔍 正在深度搜索',
      description: '搜索方向 1/5',
      details: [
        '正在搜索: "AI in education: a systematic review of current applications and challenges"',
        '搜索进度: 0/5 完成'
      ],
      timestamp: new Date('2024-01-15T19:50:44')
    },
    {
      type: 'step_complete',
      step: 'information-gathering-found-1',
      cycle: 1,
      title: '📄 发现优质资源',
      description: '在 AI in education: a systematic review... 中找到 5 条资料',
      details: [
        '已收集: 5 条研究资料',
        '• Systematic review of research on artificial intelligence...',
        '• Artificial intelligence in education: A systematic...',
        '• Applications and Challenges of Implementing Artificial...'
      ],
      timestamp: new Date('2024-01-15T19:50:45')
    },
    // 继续其他搜索...
    {
      type: 'step_complete',
      step: 'information-gathering-search-2',
      cycle: 1,
      title: '🔍 正在深度搜索',
      description: '搜索方向 2/5',
      details: [
        '正在搜索: "Effectiveness of AI-powered tutoring systems: meta-analysis..."',
        '搜索进度: 1/5 完成'
      ],
      timestamp: new Date('2024-01-15T19:50:46')
    },
    {
      type: 'step_complete',
      step: 'information-gathering-complete',
      cycle: 1,
      title: '📚 资料搜集完成',
      description: '成功找到 25 条相关资料',
      details: [
        '• 搜索了 5 个专业方向',
        '• 找到 25 条高质量资料',
        '• 涵盖学术论文、研究报告等',
        '收集了来自 15 个不同来源的资料'
      ],
      timestamp: new Date('2024-01-15T19:50:51')
    },
    // 主步骤3: 内容增强
    {
      type: 'step_complete',
      step: 'content-enhancement',
      cycle: 1,
      title: '🔥 正在深度分析',
      description: '深入抓取文章内容，提升研究质量',
      details: [
        '• 原始资料: 25 条',
        '• 深度分析: 3 条',
        '• 获得更详细的研究内容和数据'
      ],
      timestamp: new Date('2024-01-15T19:50:55')
    },
    // 主步骤4: 深度分析
    {
      type: 'step_complete',
      step: 'deep-analysis',
      cycle: 1,
      title: '🤔 正在深度分析',
      description: '分析研究资料，评估信息完整性',
      details: [
        '• 深入分析了 7 篇重要文献',
        '• 研究信息已充分覆盖主题',
        '• 可以生成高质量研究报告'
      ],
      timestamp: new Date('2024-01-15T19:51:05')
    },
    // 主步骤5: 报告生成
    {
      type: 'step_complete',
      step: 'report-generation',
      cycle: 1,
      title: '📄 正在生成报告',
      description: '整合所有研究成果，生成专业报告',
      details: [
        '• 报告总长度：4,813 字符',
        '• 包含结构化研究发现',
        '• 提供完整参考资料',
        '• 支持中文阅读体验'
      ],
      timestamp: new Date('2024-01-15T19:51:15')
    }
  ],
  finalReport: `人工智能在教育领域的应用现状
研究报告

一、概述

人工智能(AI)技术正以前所未有的速度发展，并在教育领域展现出巨大的应用潜力。从智能辅导系统到个性化学习平台，AI正在改变着教学和学习的方式。本报告旨在综述人工智能在教育领域的应用现状，分析其发展趋势，并提出相应的建议。

二、主要发现

1. 智能辅导系统与自适应学习的应用
智能辅导系统(ITS)是AI在教育领域最成熟的应用之一。大量的研究表明，ITS能够有效提高学生的学习成绩和学习效率。

2. 人工智能在评估与反馈中的应用
AI技术可以用于自动化评估和提供个性化反馈。例如，AI可以自动批改客观题，并分析学生的作答模式。

三、结论与建议

人工智能在教育领域具有巨大的应用潜力，能够有效提高教学质量和学习效率。然而，在应用AI技术的同时，必须充分考虑伦理道德问题。`
};

// UI测试组件
function AgentPlanTestComponent({ onBack }: { onBack: () => void }) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const testSession = MOCK_SESSION_DATA;

  // 获取主步骤分组
  const getGroupedSteps = () => {
    const groups: { [key: string]: LangGraphStep[] } = {};
    
    testSession.steps.forEach(step => {
      const mainStep = step.step.split('-')[0]; // 获取主步骤名称
      if (!groups[mainStep]) {
        groups[mainStep] = [];
      }
      groups[mainStep].push(step);
    });
    
    return groups;
  };

  // 获取步骤状态图标
  const getStepStatusIcon = (step: LangGraphStep) => {
    if (step.type === 'step_complete') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (step.type === 'step_start') {
      return <CircleDotDashed className="h-4 w-4 text-blue-500" />;
    } else if (step.type === 'step_error') {
      return <CircleX className="h-4 w-4 text-red-500" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // 切换步骤展开状态
  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const groupedSteps = getGroupedSteps();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">Agent Plan UI 测试</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>研究执行监控 - Agent Plan 样式</CardTitle>
            <CardDescription>基于实际日志数据的UI测试</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 研究查询信息 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">研究主题:</p>
              <p className="text-sm text-gray-900 mt-1">{testSession.query}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span>步骤: {testSession.steps.length}</span>
                <span>轮次: {testSession.totalCycles}</span>
                <span>用时: 35秒</span>
              </div>
            </div>

            {/* Agent Plan 样式的步骤显示 */}
            <motion.div 
              className="bg-card border border-border rounded-lg shadow overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LayoutGroup>
                <div className="p-4">
                  <ul className="space-y-2">
                    {Object.entries(groupedSteps).map(([mainStep, steps], groupIndex) => {
                      const groupId = `group-${mainStep}`;
                      const isGroupExpanded = expandedSteps.includes(groupId);
                      const latestStep = steps[steps.length - 1];
                      
                      return (
                        <motion.li
                          key={groupId}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIndex * 0.1 }}
                        >
                          {/* 主步骤行 */}
                          <motion.div 
                            className="group flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleStepExpansion(groupId)}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                          >
                            <motion.div
                              className="mr-3 flex-shrink-0"
                              whileTap={{ scale: 0.9 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {getStepStatusIcon(latestStep)}
                            </motion.div>

                            <div className="flex min-w-0 flex-grow items-center justify-between">
                              <div className="mr-2 flex-1">
                                <span className="font-medium text-gray-900">
                                  {latestStep.title}
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                  {latestStep.description}
                                </p>
                              </div>

                              <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  第{latestStep.cycle}轮
                                </Badge>
                                <Badge 
                                  variant={latestStep.type === 'step_complete' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {latestStep.type === 'step_complete' ? '已完成' : 
                                   latestStep.type === 'step_start' ? '进行中' : '错误'}
                                </Badge>
                                {latestStep.timestamp && (
                                  <span className="text-gray-500">
                                    {latestStep.timestamp.toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>

                          {/* 子步骤详情 */}
                          <AnimatePresence>
                            {isGroupExpanded && steps.length > 1 && (
                              <motion.div 
                                className="ml-8 mt-2 space-y-1"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {steps.slice(0, -1).map((step, stepIndex) => (
                                  <motion.div 
                                    key={stepIndex}
                                    className="flex items-start gap-3 p-2 rounded border-l-2 border-gray-200 bg-gray-50"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: stepIndex * 0.05 }}
                                  >
                                    <div className="flex-shrink-0 mt-1">
                                      {step.type === 'step_complete' || step.type === 'step_progress' ? (
                                        <div className="h-3.5 w-3.5 rounded-full bg-gray-900 flex items-center justify-center">
                                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      ) : step.type === 'step_start' && (
                                        step.title.includes('正在') || 
                                        step.title.includes('深度研究') || 
                                        step.title.includes('搜集资料') ||
                                        step.title.includes('生成报告') ||
                                        step.title.includes('深度分析')
                                      ) ? (
                                        <div className="h-3.5 w-3.5 rounded-full bg-gray-900 flex items-center justify-center">
                                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      ) : step.type === 'step_start' ? (
                                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                                      ) : step.type === 'step_error' ? (
                                        <div className="h-3.5 w-3.5 rounded-full bg-red-500 flex items-center justify-center">
                                          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-800">
                                        {step.title}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {step.description}
                                      </p>
                                      {step.details && step.details.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                                          {step.details.map((detail, idx) => (
                                            <div key={idx} className="flex items-start gap-1">
                                              <span className="text-gray-400">•</span>
                                              <span>{detail}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {step.timestamp?.toLocaleTimeString()}
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              </LayoutGroup>
            </motion.div>

            {/* 报告预览按钮 */}
            {testSession.finalReport && (
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  预览研究报告
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 预览弹窗 */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">研究报告预览</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {testSession.finalReport}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LangGraphTestPage() {
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [showUITest, setShowUITest] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.steps]);

  // 自动展开进行中的步骤
  useEffect(() => {
    if (currentSession?.status === 'running') {
      // 自动展开所有步骤组
      const allGroupIds = ['group-research-planning', 'group-information-gathering', 'group-content-enhancement', 'group-deep-analysis', 'group-report-generation'];
      setExpandedSteps(allGroupIds);
    }
  }, [currentSession?.status, currentSession?.steps]);

  // 如果显示UI测试，直接返回测试组件
  if (showUITest) {
    return <AgentPlanTestComponent onBack={() => setShowUITest(false)} />;
  }

  // 启动研究任务
  const startResearch = async (query: string, scenarioType: string = 'default') => {
    if (!query.trim()) return;

    const scenario = TEST_SCENARIOS.find(s => s.id === scenarioType);
    const expectedCycles = scenario?.maxCycles || 3;

    const newSession: ResearchSession = {
      id: Date.now().toString(),
      query: query.trim(),
      status: 'running',
      startTime: new Date(),
      totalCycles: expectedCycles, // 预期轮次
      currentStep: 'research-planning', // 初始步骤
      steps: [],
    };

    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);

    try {
      // 调用Backend的研究API，传递场景类型
      const response = await fetch('http://localhost:8000/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim(),
          scenario_type: scenarioType 
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
        if (done) {
          console.log('📡 SSE连接结束');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('📡 收到原始数据块:', chunk);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              
              // 添加详细的SSE数据接收日志
              console.log(`📡 收到SSE数据: type=${data.type}, step=${data.step}, user_friendly=${data.user_friendly}`, data);
              
              // 强制更新调试信息
              if (data.step && data.step !== 'complete' && data.step !== 'error') {
                console.log(`🔥 强制更新currentStep: ${data.step}`);
              }
              
              // 处理不同类型的事件
              if (data.type === 'connection_test') {
                // 忽略连接测试消息
                console.log('📡 收到连接测试消息，忽略');
                continue;
              } else if (data.step === 'complete') {
                // 研究完成
                setCurrentSession(prev => prev ? {
                  ...prev,
                  status: 'completed',
                  endTime: new Date(),
                  finalReport: data.report,
                  steps: [...prev.steps, {
                    type: 'step_complete',
                    step: 'report-generation',
                    cycle: 1,
                    title: '研究报告完成',
                    description: '成功生成专业研究报告',
                    details: [`报告总长度：${data.report?.length || 0} 字符`, '包含结构化研究发现', '提供完整参考资料'],
                    timestamp: new Date()
                  }],
                  totalCycles: data.total_cycles || prev.totalCycles
                } : null);
              } else if (data.type === 'final_report') {
                // 处理最终报告
                setCurrentSession(prev => {
                  if (!prev) return null;
                  
                  // 检查是否已经有相同的报告完成步骤了（防止重复）
                  const hasReportCompleteStep = prev.steps.some(step => 
                    step.step === 'report-generation' && step.type === 'step_complete'
                  );
                  if (hasReportCompleteStep && prev.report) {
                    return prev;
                  }
                  
                  // 自动添加报告完成步骤
                  const reportCompleteStep: LangGraphStep = {
                    type: 'step_complete',
                    step: 'report-generation',
                    cycle: 1,
                    title: '研究报告完成',
                    description: '成功生成专业研究报告',
                    details: [
                      `• 报告总长度：${data.report?.length || 0} 字符`,
                      '• 包含结构化研究发现',
                      '• 提供完整参考资料',
                      '• 支持中文阅读体验'
                    ],
                    timestamp: new Date()
                  };
                  
                  return {
                    ...prev,
                    status: 'completed',
                    endTime: new Date(),
                    currentStep: 'report-generation', // 确保最终步骤正确
                    report: data.report,
                    steps: [...prev.steps, reportCompleteStep]
                  };
                });
              } else if (data.step === 'error') {
                // 发生错误
                setCurrentSession(prev => prev ? {
                  ...prev,
                  status: 'error',
                  endTime: new Date(),
                  error: data.details
                } : null);
              } else {
                // 处理步骤信息 - 支持用户友好格式
                if (data.user_friendly) {
                  // 处理节点状态更新（实时currentStep同步）
                  if (data.type === 'node_status') {
                    console.log(`🚀🚀🚀 收到节点状态更新: ${data.node_name} -> currentStep: ${data.currentStep}`);
                    console.log(`🚀🚀🚀 完整node_status数据:`, data);
                    
                    // 特别关注report-generation的node_status
                    if (data.currentStep === 'report-generation') {
                      console.log(`🔥🔥🔥 关键节点状态更新: 收到report-generation的node_status!`);
                      console.log(`🔥🔥🔥 节点名称: ${data.node_name}`);
                      console.log(`🔥🔥🔥 准备强制更新currentStep为report-generation`);
                    }
                    
                    setCurrentSession(prev => {
                      if (!prev) return null;
                      
                      console.log(`🚀🚀🚀 更新前currentStep: ${prev.currentStep}`);
                      console.log(`🚀🚀🚀 更新后currentStep: ${data.currentStep}`);
                      
                      // 只更新currentStep，不添加步骤信息
                      const updated = {
                        ...prev,
                        currentStep: data.currentStep,
                        // 添加时间戳确保强制更新
                        lastNodeStatusUpdate: new Date().getTime()
                      };
                      
                      console.log(`🚀🚀🚀 状态更新完成:`, updated);
                      console.log(`🚀🚀🚀 界面应该显示: ${data.currentStep}`);
                      return updated;
                    });
                    continue; // 处理完node_status后继续处理下一条消息
                  }
                  
                  // 用户友好的步骤信息
                  console.log(`🔍 创建步骤信息: step=${data.step}, type=${data.type}, title=${data.title}`);
                  
                  if (!data.step) {
                    console.warn('⚠️ 步骤数据缺少step字段:', data);
                    continue; // 跳过无效数据，继续处理下一条消息
                  }
                  
                  // 即使没有title，也要更新currentStep以保持同步
                  if (!data.title || data.title.trim() === '') {
                    console.log('跳过没有title的步骤，但更新currentStep:', data);
                    // 仍然更新currentStep，确保状态同步
                    setCurrentSession(prev => {
                      if (!prev) return null;
                      console.log(`无title步骤更新currentStep: ${prev.currentStep} -> ${data.step}`);
                      return {
                        ...prev,
                        currentStep: data.step
                      };
                    });
                    continue;
                  }
                  
                  const stepInfo: LangGraphStep = {
                    type: data.type as 'step_start' | 'step_complete' | 'step_error' | 'step_progress',
                    step: data.step,
                    cycle: 1, // 从数据中获取或默认为1
                    title: data.title,
                    description: data.description || '',
                    details: [
                      ...(data.key_directions || []),
                      ...(data.resources_found || []),
                      ...(data.processed_resources || []),
                      ...(data.stats ? [data.stats] : []),
                      ...(data.resource_summary ? [data.resource_summary] : []),
                      ...(data.enhancement_summary ? [data.enhancement_summary] : []),
                      ...(data.analysis_summary ? [data.analysis_summary] : []),
                      ...(data.report_summary ? [data.report_summary] : [])
                    ].filter(Boolean),
                    timestamp: new Date()
                  };

                  setCurrentSession(prev => {
                    if (!prev) return null;
                    
                    // 简化currentStep更新逻辑 - 直接使用后端提供的currentStep
                    const updatedCurrentStep = data.currentStep || data.step;
                    
                    // 调试日志
                    console.log(`🔄 SSE步骤更新: step=${data.step}, currentStep=${data.currentStep}, type=${data.type}`);
                    console.log(`🔄 title=${data.title}`);
                    console.log(`🔄 完整数据:`, data);
                    console.log(`🔄 准备更新currentStep: ${prev.currentStep} -> ${updatedCurrentStep}`);
                    
                    // 特别关注关键步骤的更新
                    if (data.step === 'report-generation' || data.currentStep === 'report-generation') {
                      console.log(`🔥🔥🔥 关键步骤: report-generation`);
                      console.log(`🔥🔥🔥 当前currentStep: ${prev.currentStep}`);
                      console.log(`🔥🔥🔥 新的currentStep: ${updatedCurrentStep}`);
                    }
                    
                    if (data.step === 'deep-analysis' || data.currentStep === 'deep-analysis') {
                      console.log(`🔍🔍🔍 关键步骤: deep-analysis`);
                      console.log(`🔍🔍🔍 当前currentStep: ${prev.currentStep}`);
                      console.log(`🔍🔍🔍 新的currentStep: ${updatedCurrentStep}`);
                    }
                    
                    // 检查是否已存在完全相同的步骤（防止重复）
                    const existingStepIndex = prev.steps.findIndex(
                      step => step.step === data.step && 
                               step.title === data.title && 
                               step.type === data.type &&
                               step.description === data.description
                    );
                    
                    if (existingStepIndex !== -1) {
                      // 如果已存在相同步骤，更新而不是添加
                      const updatedSteps = [...prev.steps];
                      updatedSteps[existingStepIndex] = stepInfo;
                      
                      console.log(`🔄 更新现有步骤: currentStep=${updatedCurrentStep}`);
                      return {
                        ...prev,
                        currentStep: updatedCurrentStep,
                        steps: updatedSteps
                      };
                    }
                    
                    // 添加新步骤并更新currentStep
                    console.log(`🔄 添加新步骤: currentStep=${updatedCurrentStep}`);
                    return {
                      ...prev,
                      currentStep: updatedCurrentStep,
                      steps: [...prev.steps, stepInfo]
                    };
                  });
                } else {
                  // 原有的处理逻辑
                const state = data.state || {};
                const cycle = state.cycle_count || 1;
                
                // 生成友好的步骤标题
                const getStepTitle = (stepName: string, cycle: number) => {
                  switch (stepName) {
                    case 'generate_queries': return `第${cycle}轮 - 生成搜索查询`;
                    case 'web_search': return `第${cycle}轮 - 执行网络搜索`;
                      case 'content_enhancement': return `第${cycle}轮 - 内容增强`;
                    case 'reflect': return `第${cycle}轮 - 反思和分析`;
                    case 'generate_report': return '生成最终报告';
                    default: return `${stepName} (第${cycle}轮)`;
                  }
                };

                const stepInfo: LangGraphStep = {
                  type: 'step_complete',
                  step: data.step,
                  cycle: cycle,
                  title: getStepTitle(data.step, cycle),
                  description: data.details,
                  details: [
                    ...(state.search_queries || []).map((q: string, i: number) => `查询${i+1}: ${q}`),
                    ...(state.search_results_count > 0 ? [`找到 ${state.search_results_count} 条搜索结果`] : []),
                    ...(state.critique ? [`反思内容: ${state.critique.substring(0, 100)}...`] : [])
                  ].filter(Boolean),
                  timestamp: new Date()
                };

                setCurrentSession(prev => prev ? {
                  ...prev,
                  currentStep: data.step,
                  totalCycles: Math.max(cycle, prev.totalCycles),
                  steps: [...prev.steps, stepInfo]
                } : null);
                }
              }
            } catch (error) {
              console.warn('解析SSE数据失败:', jsonStr, error);
            }
          }
        }
      }

    } catch (error) {
      console.error('研究任务执行失败:', error);
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'error',
        endTime: new Date(),
        error: error instanceof Error ? error.message : '未知错误'
      } : null);
    }
  };

  // 停止当前研究
  const stopResearch = () => {
    if (currentSession?.status === 'running') {
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'error',
        endTime: new Date(),
        error: '用户手动停止'
      } : null);
    }
  };

  // 清空会话
  const clearSessions = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  // 获取状态图标 - 移除动画，只显示静态状态
  const getStatusIcon = (status: ResearchSession['status']) => {
    switch (status) {
      case 'running': return <Circle className="w-4 h-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-gray-900" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // 切换步骤展开状态
  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  // 复制报告内容
  const copyReport = async () => {
    if (!currentSession?.finalReport) return;
    
    try {
      await navigator.clipboard.writeText(currentSession.finalReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="max-w-6xl mx-auto mb-8">
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
              <h1 className="text-3xl font-bold text-gray-900">LangGraph 测试实验室</h1>
              <p className="text-gray-600">测试多步骤AI代理的状态管理、循环逻辑和并行处理能力</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUITest(true)}
            >
              UI测试
            </Button>
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：控制面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 快速测试场景 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速测试场景</CardTitle>
              <CardDescription>预定义的测试用例，验证不同复杂度的研究任务</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEST_SCENARIOS.map((scenario) => (
                                    <Button
                      key={scenario.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                      onClick={() => startResearch(scenario.query, scenario.id)}
                      disabled={currentSession?.status === 'running'}
                    >
                  <div className="flex items-start gap-3">
                    {scenario.icon}
                    <div className="text-left">
                      <div className="font-medium">{scenario.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 自定义查询 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">自定义研究查询</CardTitle>
              <CardDescription>输入任何研究主题来测试LangGraph的处理能力</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="例如：人工智能在医疗诊断中的最新进展和挑战..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button
                onClick={() => startResearch(customQuery)}
                disabled={!customQuery.trim() || currentSession?.status === 'running'}
                className="w-full flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                开始研究
              </Button>
            </CardContent>
          </Card>

          {/* 历史会话 */}
          {sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">研究历史</CardTitle>
                <CardDescription>最近的研究会话记录</CardDescription>
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
        <div className="lg:col-span-2">
          {currentSession ? (
            <Card className="h-[800px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(currentSession.status)}
                    <div>
                      <CardTitle className="text-lg">研究执行监控</CardTitle>
                      <CardDescription>实时跟踪LangGraph的执行过程</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>步骤: {currentSession.steps.length}</span>
                    <span>轮次: {currentSession.totalCycles}</span>
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
                {/* 执行步骤 - Agent Plan 样式 */}
                <motion.div
                  key={currentSession.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >

                  
                  <motion.div 
                  ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto bg-card border border-border rounded-lg shadow overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                                        <div className="p-4 overflow-hidden">
                      {/* 临时调试信息 */}
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        <strong>调试:</strong> currentStep = {currentSession?.currentStep || 'undefined'}, status = {currentSession?.status}
            <br />
            <strong>🔍 实时状态监控:</strong>
            <br />
            - 当前执行步骤: {currentSession?.currentStep || 'none'}
            <br />
            - 会话状态: {currentSession?.status || 'none'}
            <br />
            - 步骤总数: {currentSession?.steps.length || 0}
            <br />
            - 最后更新: {currentSession?.steps[currentSession.steps.length - 1]?.timestamp?.toLocaleTimeString() || 'none'}
                        <br />
                        <strong>最新步骤:</strong> {currentSession?.steps[currentSession.steps.length - 1]?.step || 'none'} - {currentSession?.steps[currentSession.steps.length - 1]?.title || 'none'}
                      </div>
                        <ul className="space-y-1 overflow-hidden">
                        {(() => {
                          // 按主要步骤分组
                          const groupedSteps: { [key: string]: LangGraphStep[] } = {};
                          const stepOrder = ['research-planning', 'information-gathering', 'content-enhancement', 'deep-analysis', 'report-generation'];
                          
                          currentSession.steps.forEach(step => {
                            // 安全检查：确保step.step存在
                            if (!step.step) return;
                            
                            let mainStep = step.step;
                            
                            // 映射步骤到主要分组
                            if (step.step.includes('research-planning') || step.step === 'generate_queries') {
                              mainStep = 'research-planning';
                            } else if (step.step.includes('information-gathering') || step.step === 'web_search') {
                              mainStep = 'information-gathering';
                            } else if (step.step.includes('content-enhancement')) {
                              mainStep = 'content-enhancement';
                            } else if (step.step.includes('deep-analysis') || step.step === 'reflect') {
                              mainStep = 'deep-analysis';
                            } else if (step.step.includes('report-generation') || step.step === 'generate_report') {
                              mainStep = 'report-generation';
                            }
                            
                            // 调试分组过程
                            if (step.step.includes('report-generation')) {
                              console.log(`分组调试: step.step=${step.step}, mainStep=${mainStep}, title=${step.title}`);
                            }
                            
                            if (!groupedSteps[mainStep]) {
                              groupedSteps[mainStep] = [];
                            }
                            groupedSteps[mainStep].push(step);
                          });

                                    // 按预定义顺序显示分组 - 确保当前执行的步骤总是显示
          const currentExecutingStep = currentSession?.currentStep || '';
          const stepsToShow = stepOrder.filter(stepKey => {
            // 如果有步骤信息，显示
            if (groupedSteps[stepKey] && groupedSteps[stepKey].length > 0) {
              return true;
            }
            // 如果是当前正在执行的步骤，也要显示（即使没有步骤信息）
            if (stepKey === currentExecutingStep) {
              return true;
            }
            return false;
          });
          
          return stepsToShow.map((stepKey, groupIndex) => {
            const steps = groupedSteps[stepKey] || []; // 处理可能为空的情况
            const groupId = `group-${stepKey}`;
            const isGroupExpanded = expandedSteps.includes(groupId);
            
            // 修正的状态判断逻辑：基于当前正在执行的主步骤
            let groupStatus: 'completed' | 'in-progress' | 'error';
            
            // 检查是否有错误步骤
            const hasError = steps.length > 0 && steps.some(step => step.type === 'step_error');
                            
            if (hasError) {
              groupStatus = 'error';
            } else {
              // 检查是否有完成步骤
              const hasCompleteStep = steps.some(step => step.type === 'step_complete');
                              
                              // 更精确的状态判断
                              if (currentSession?.status === 'completed') {
                                // 如果整个研究已完成，所有步骤都显示为已完成
                                groupStatus = 'completed';
                              } else if (currentExecutingStep === stepKey) {
                                // 当前正在执行这个主步骤，应该显示进行中
                                // 不管是否有完成的子步骤，只要是当前步骤就显示进行中
                                groupStatus = 'in-progress';
                              } else {
                                // 不是当前执行的主步骤
                                if (hasCompleteStep) {
                                  // 有完成步骤，显示已完成
                                  groupStatus = 'completed';
                                } else {
                                  // 没有完成步骤，检查是否在当前步骤之前
                                  const currentStepIndex = stepOrder.indexOf(currentExecutingStep || '');
                                  const thisStepIndex = stepOrder.indexOf(stepKey);
                                  if (currentStepIndex > thisStepIndex && thisStepIndex !== -1 && currentStepIndex !== -1) {
                                    // 当前步骤在这个步骤之后，说明这个步骤应该已完成
                                    groupStatus = 'completed';
                                  } else {
                                    // 默认为已完成（如果没有明确的进行中状态）
                                    groupStatus = 'completed';
                                  }
                                }
                              }
                              
                                            // 调试关键步骤状态
              if (stepKey === 'deep-analysis' || stepKey === 'report-generation') {
                console.log(`🔍 ${stepKey}: currentStep=${currentSession?.currentStep}, 匹配=${currentExecutingStep === stepKey}, 状态=${groupStatus}`);
              }
                            }
                            
                                        // 获取主步骤的友好名称
            const getMainStepTitle = (key: string) => {
              const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
              const cycle = lastStep ? lastStep.cycle : 1;
              
              switch (key) {
                case 'research-planning': return '研究规划';
                case 'information-gathering': return `信息搜集 - 第${cycle}轮`;
                case 'content-enhancement': return `内容增强 - 第${cycle}轮`;
                case 'deep-analysis': return `深度分析 - 第${cycle}轮`;
                case 'report-generation': return '最终分析与报告生成';
                default: return key;
              }
            };

                            return (
                              <li key={groupId} className={`${groupIndex !== 0 ? "mt-1 pt-2" : ""}`}>
                                {/* 主步骤行 */}
                                <div 
                                  className="group flex items-center px-3 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer"
                                  onClick={() => toggleStepExpansion(groupId)}
                                >
                                  <div className="mr-2 flex-shrink-0">
                                    {groupStatus === 'completed' ? (
                                      <CheckCircle2 className="h-4 w-4 text-gray-900" />
                                    ) : groupStatus === 'in-progress' ? (
                                      <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                                    ) : (
                                      <CircleX className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>

                                  <div className="flex min-w-0 flex-grow items-center justify-between">
                                    <div className="mr-2 flex-1 truncate">
                                      <span className={`${
                                        groupStatus === 'completed' ? "text-gray-900 font-medium" : 
                                        groupStatus === 'in-progress' ? "text-orange-600 font-medium" : 
                                        "text-red-600 font-medium"
                                      }`}>
                                        {getMainStepTitle(stepKey)}
                            </span>
                                    </div>

                                    <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                                      <span className={`rounded px-1.5 py-0.5 ${
                                        groupStatus === 'completed' ? 'bg-gray-100 text-gray-800' : 
                                        groupStatus === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {groupStatus === 'completed' ? '已完成' : 
                                         groupStatus === 'in-progress' ? '进行中' :
                                         '错误'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                                {/* 子步骤详情 - 只有当前执行步骤且有实际步骤信息时才显示 */}
                {isGroupExpanded && steps.length > 0 && (
                                  <div className="relative overflow-hidden">
                                    <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-muted-foreground/30" />
                                    <div className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                                      {steps.map((step, stepIndex) => {
                                        // 检查是否是部分失败的步骤
                                        const isWarningStep = step.title.includes('受限') || 
                                          step.title.includes('部分') ||
                                          step.description?.includes('受限') ||
                                          step.description?.includes('失败');
                                        
                                        return (
                                          <div key={stepIndex} className="group flex flex-col py-0.5 pl-6">
                                            <div className="flex flex-1 items-center rounded-md p-1 hover:bg-muted/30">
                                              <div className="mr-2 flex-shrink-0">
                                                {isWarningStep ? (
                                                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                                                ) : step.type === 'step_complete' || step.type === 'step_progress' ? (
                                                  <div className="h-3.5 w-3.5 rounded-full bg-gray-900 flex items-center justify-center">
                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                  </div>
                                                ) : step.type === 'step_start' && (
                                                  step.title.includes('正在') || 
                                                  step.title.includes('深度研究') || 
                                                  step.title.includes('搜集资料') ||
                                                  step.title.includes('生成报告') ||
                                                  step.title.includes('深度分析')
                                                ) ? (
                                                  <div className="h-3.5 w-3.5 rounded-full bg-gray-900 flex items-center justify-center">
                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                  </div>
                                                ) : step.type === 'step_start' ? (
                                                  <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                                                ) : step.type === 'step_error' ? (
                                                  <div className="h-3.5 w-3.5 rounded-full bg-red-500 flex items-center justify-center">
                                                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                  </div>
                                                ) : (
                                                  <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>

                                              <span className={`text-sm ${
                                                isWarningStep ? "text-yellow-600" :
                                                step.type === 'step_complete' || step.type === 'step_progress' ? "text-gray-900" : 
                                                (step.type === 'step_start' && (
                                                  step.title.includes('正在') || 
                                                  step.title.includes('深度研究') || 
                                                  step.title.includes('搜集资料') ||
                                                  step.title.includes('生成报告') ||
                                                  step.title.includes('深度分析')
                                                )) ? "text-gray-900" :
                                                step.type === 'step_start' ? "text-gray-600" : 
                                                step.type === 'step_error' ? "text-red-600" :
                                                "text-gray-600"
                                              }`}>
                                                {step.title.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌⚠️🔄]/g, '').trim()}
                                              </span>
                                            </div>

                                          {step.description && (
                                            <div className="text-muted-foreground border-foreground/20 mt-1 ml-1.5 border-l border-dashed pl-5 text-xs overflow-hidden">
                                              <p className="py-1">{step.description.replace(/[🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌]/g, '').trim()}</p>
                        {step.details && step.details.length > 0 && (
                                                <div className="mt-0.5 mb-1">
                            {step.details.map((detail, idx) => (
                                                    <div key={idx} className="flex items-start gap-1.5 py-0.5">
                                <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                                                      <span className="text-gray-500">{detail.replace(/[•🔍📋🌐📄🔥🤔📚✨🎉🎊✅❌]/g, '').trim()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                                              
                                              {/* 添加工具组件样式 */}
                                              {step.step && step.step.includes('research-planning') && (
                                                <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                                  <span className="text-muted-foreground font-medium">
                                                    工具组件:
                                                  </span>
                                                  <div className="flex flex-wrap gap-1">
                                                    {['research-planner', 'scope-analyzer', 'query-optimizer'].map((tool, idx) => (
                                                      <span
                                                        key={idx}
                                                        className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
                                                      >
                                                        {tool}
                                                      </span>
                                                    ))}
                      </div>
                    </div>
                                              )}
                                              
                                              {step.step && step.step.includes('information-gathering') && (
                                                <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                                  <span className="text-muted-foreground font-medium">
                                                    工具组件:
                                                  </span>
                                                  <div className="flex flex-wrap gap-1">
                                                    {['web-search', 'content-analyzer', 'relevance-scorer'].map((tool, idx) => (
                                                      <span
                                                        key={idx}
                                                        className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
                                                      >
                                                        {tool}
                                                      </span>
                                                    ))}
                      </div>
                                                </div>
                                              )}
                                              
                                              {step.step && step.step.includes('content-enhancement') && (
                                                <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                                  <span className="text-muted-foreground font-medium">
                                                    工具组件:
                                                  </span>
                                                  <div className="flex flex-wrap gap-1">
                                                    {['content-extractor', 'deep-analyzer', 'quality-assessor'].map((tool, idx) => (
                                                      <span
                                                        key={idx}
                                                        className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
                                                      >
                                                        {tool}
                                                      </span>
                                                    ))}
                      </div>
                    </div>
                  )}

                                              {/* 如果是报告生成完成步骤，显示报告内容 */}
                                              {step.step === 'report-generation' && step.type === 'step_complete' && 
                                               (currentSession?.report || currentSession?.finalReport) && 
                                               stepIndex === steps.length - 1 && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                                  <div className="flex items-center gap-2 mb-3">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                    <span className="font-medium text-green-700">研究报告已完成</span>
                                                  </div>
                                                  <div className="text-sm text-gray-600 mb-3">
                                                    PM.DEV 已经完成所有工作，请查收附件。
                                                  </div>
                                                  
                                                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                                                    <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                                        <FileText className="h-4 w-4 text-red-600" />
                                                      </div>
                                                      <div>
                                                        <div className="font-medium text-sm">research_report.md</div>
                                                        <div className="text-xs text-gray-500">
                                                          {((currentSession?.report || currentSession?.finalReport)?.length || 0) > 1000 
                                                            ? `${Math.round(((currentSession?.report || currentSession?.finalReport)?.length || 0) / 1000)} KB` 
                                                            : `${(currentSession?.report || currentSession?.finalReport)?.length || 0} B`} • 研究报告
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm"
                                                      onClick={() => setShowReport(true)}
                                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    >
                                                      预览报告
                                                    </Button>
                      </div>
                    </div>
                  )}
                                            </div>
                                          )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          });
                        })()}
                      </ul>
                    </div>
                  </motion.div>

                  {/* 错误信息 */}
                  {currentSession.error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">执行错误</h4>
                      <p className="text-sm text-red-800">{currentSession.error}</p>
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[800px] flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">准备开始LangGraph测试</h3>
                <p className="text-gray-600">选择左侧的测试场景或输入自定义查询来开始</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 报告预览弹窗 */}
      {showReport && (currentSession?.finalReport || currentSession?.report) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">研究报告</h2>
                <p className="text-sm text-gray-600 mt-1">{currentSession.query}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyReport}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copySuccess ? '已复制!' : '复制报告'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowReport(false)}
                  className="h-8 w-8 p-0"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="prose prose-sm max-w-none leading-relaxed">
                {(currentSession?.finalReport || currentSession?.report || '').split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 border-b-2 border-gray-200 pb-3">{line.substring(2)}</h1>
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-gray-800 mb-4 mt-8 border-b border-gray-200 pb-2">{line.substring(3)}</h2>
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold text-gray-700 mb-3 mt-6">{line.substring(4)}</h3>
                  } else if (line.startsWith('#### ')) {
                    return <h4 key={index} className="text-lg font-medium text-gray-700 mb-2 mt-4">{line.substring(5)}</h4>
                  } else if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.*?)\*\*[：:](.*)/)
                    if (match) {
                      return (
                        <div key={index} className="mb-3 pl-4 border-l-4 border-blue-300 bg-blue-50 p-3 rounded-r-lg">
                          <span className="font-bold text-blue-900 text-base">{match[1]}：</span>
                          <span className="text-gray-700">{match[2]}</span>
                        </div>
                      )
                    }
                    return <p key={index} className="mb-2 text-gray-700">{line}</p>
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="mb-2 text-gray-700 ml-4 list-disc">{line.substring(2)}</li>
                  } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
                    return <p key={index} className="font-bold text-gray-900 mb-3 mt-6 text-xl bg-gray-100 p-3 rounded-lg">{line.slice(2, -2)}</p>
                  } else if (line.match(/^\d+\.\s/)) {
                    return <li key={index} className="mb-2 text-gray-700 ml-4 list-decimal font-medium">{line.replace(/^\d+\.\s/, '')}</li>
                  } else if (line.trim() === '---') {
                    return <hr key={index} className="my-8 border-gray-300 border-t-2" />
                  } else if (line.trim() === '') {
                    return <div key={index} className="mb-3"></div>
                  } else if (line.includes('http://') || line.includes('https://')) {
                    // 处理包含链接的行
                    const parts = line.split(/(https?:\/\/[^\s]+)/g);
                    return (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {parts.map((part, partIndex) => {
                          if (part.match(/^https?:\/\//)) {
                            return (
                              <a 
                                key={partIndex} 
                                href={part} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-medium"
                              >
                                {part}
                              </a>
                            );
                          }
                          return part;
                        })}
                      </p>
                    );
                  } else if (line.includes('*') && !line.startsWith('*')) {
                    // 处理行内加粗文本
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {parts.map((part, partIndex) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partIndex} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  } else {
                    return <p key={index} className="mb-3 text-gray-700 leading-relaxed">{line}</p>
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 