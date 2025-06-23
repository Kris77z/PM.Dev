import { useState, useCallback } from 'react';
import type { ResearchSession, ResearchLangGraphStep } from "@/types/research";
import type { Message } from "@/types/message";

// 研究历史数据类型
export interface ResearchHistorySession {
  id: string;
  title: string; // 研究主题
  query: string; // 原始查询
  status: 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
  messages: Message[]; // 保存完整的消息历史
  report?: string; // 最终报告内容
}

// 获取研究历史
const getResearchHistory = (): ResearchHistorySession[] => {
  try {
    const stored = localStorage.getItem('pm-assistant-research-history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// 保存研究历史
const saveResearchHistory = (sessions: ResearchHistorySession[]): void => {
  try {
    localStorage.setItem('pm-assistant-research-history', JSON.stringify(sessions));
  } catch (error) {
    console.error('保存研究历史失败:', error);
  }
};

// 创建新研究会话
const createResearchSession = (query: string, messages: Message[]): ResearchHistorySession => {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    title: query.length > 30 ? query.substring(0, 30) + '...' : query,
    query,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
    messages,
    report: messages.find(m => m.role === 'assistant' && m.content)?.content
  };
};

// 保存研究会话
const saveResearchSession = (session: ResearchHistorySession): void => {
  const history = getResearchHistory();
  const existingIndex = history.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    history[existingIndex] = session;
  } else {
    history.unshift(session); // 新会话添加到开头
  }
  
  // 限制历史记录数量（最多保存50个）
  const limitedHistory = history.slice(0, 50);
  saveResearchHistory(limitedHistory);
};

// 删除研究会话
const deleteResearchSession = (sessionId: string): void => {
  const history = getResearchHistory();
  const filteredHistory = history.filter(s => s.id !== sessionId);
  saveResearchHistory(filteredHistory);
};

export const useAgentResearch = () => {
  const [agentMessages, setAgentMessages] = useState<Message[]>([
    {
      id: 'agent-welcome',
      role: 'assistant',
      content: '你好！我是您的 AI 深度研究助手，专门使用 Gemini 2.0 Flash 模型为您提供专业的研究服务。我可以帮助您：\n\n🔍 深度研究任何主题\n📊 生成专业分析报告\n🌐 搜索最新资料信息\n📝 整合多源数据分析\n💡 提供专业见解总结\n\n请告诉我您想要研究的主题，我将调用专业的 Agent 工具链为您进行全面的调研分析。',
      timestamp: new Date(),
      blocks: [] // 添加必需的 blocks 属性
    }
  ]);
  
  const [currentResearchSession, setCurrentResearchSession] = useState<ResearchSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // 历史研究管理状态
  const [researchHistory, setResearchHistory] = useState<ResearchHistorySession[]>([]);
  const [currentHistorySession, setCurrentHistorySession] = useState<ResearchHistorySession | null>(null);

  // 初始化研究历史
  const initializeResearchHistory = useCallback(() => {
    const history = getResearchHistory();
    setResearchHistory(history);
  }, []);

  // 保存当前研究到历史记录
  const saveCurrentResearch = useCallback((messages: Message[]) => {
    if (messages.length <= 1) return; // 只有欢迎消息时不保存

    const userQuery = messages.find(msg => msg.role === 'user')?.content;
    if (!userQuery) return;

    const researchMessages = messages.slice(1); // 移除欢迎消息
    const lastAssistantMessage = researchMessages.filter(m => m.role === 'assistant').pop();
    
    // 只保存已完成的研究
    if (lastAssistantMessage?.agentPlan?.status === 'completed') {
      const session = createResearchSession(userQuery, researchMessages);
      saveResearchSession(session);
      setCurrentHistorySession(session);
      
      // 刷新历史列表
      setResearchHistory(getResearchHistory());
    }
  }, []);

  // 加载历史研究会话
  const loadHistoryResearchSession = useCallback((session: ResearchHistorySession) => {
    setCurrentHistorySession(session);
    setAgentMessages([
      {
        id: 'agent-welcome',
        role: 'assistant',
        content: '你好！我是您的 AI 深度研究助手，专门使用 Gemini 2.0 Flash 模型为您提供专业的研究服务。我可以帮助您：\n\n🔍 深度研究任何主题\n📊 生成专业分析报告\n🌐 搜索最新资料信息\n📝 整合多源数据分析\n💡 提供专业见解总结\n\n请告诉我您想要研究的主题，我将调用专业的 Agent 工具链为您进行全面的调研分析。',
        timestamp: new Date(),
        blocks: []
      },
      ...session.messages
    ]);
    setIsLoading(false);
  }, []);

  // 删除历史研究
  const handleDeleteResearch = useCallback((sessionId: string) => {
    deleteResearchSession(sessionId);
    setResearchHistory(getResearchHistory());
    
    // 如果删除的是当前研究，重置状态
    if (currentHistorySession?.id === sessionId) {
      resetAgentResearch();
    }
  }, [currentHistorySession?.id]);

  // 开始新研究
  const startNewResearch = useCallback(() => {
    setAgentMessages([
      {
        id: 'agent-welcome',
        role: 'assistant',
        content: '你好！我是您的 AI 深度研究助手，专门使用 Gemini 2.0 Flash 模型为您提供专业的研究服务。我可以帮助您：\n\n🔍 深度研究任何主题\n📊 生成专业分析报告\n🌐 搜索最新资料信息\n📝 整合多源数据分析\n💡 提供专业见解总结\n\n请告诉我您想要研究的主题，我将调用专业的 Agent 工具链为您进行全面的调研分析。',
        timestamp: new Date(),
        blocks: []
      }
    ]);
    setCurrentResearchSession(null);
    setCurrentHistorySession(null);
    setIsLoading(false);
    setShowReport(false);
  }, []);

  // Agent 研究消息处理函数
  const handleAgentResearchMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: userInput,
      timestamp: new Date(),
      blocks: []
    };

    const assistantMessageId = Date.now().toString() + '-assistant';
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true,
      blocks: [],
      agentPlan: {
        steps: [],
        status: 'running' as const,
        currentStep: 'research-planning'
      }
    };

    setAgentMessages(prevMessages => [...prevMessages, userMessage, initialAssistantMessage]);
    setIsLoading(true);

    // 创建研究会话
    const newSession: ResearchSession = {
      id: Date.now().toString(),
      query: userInput.trim(),
      status: 'running' as const,
      startTime: new Date(),
      totalCycles: 1, // 固定使用1轮研究
      currentStep: 'research-planning',
      steps: [],
    };

    setCurrentResearchSession(newSession);

    try {
      // 调用 LangGraph 研究 API - 固定使用 Gemini 模型
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userInput.trim(),
          scenario_type: 'simple', // 固定使用简单研究模式（1轮）
          model: 'gemini-2.0-flash' // 固定使用 Gemini 模型
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
          console.log('📡 Agent研究SSE连接结束');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              
              // 🔍 调试：显示关键信息
              if (data.type === 'step_update' || data.type === 'step_complete' || data.user_friendly) {
                console.log('📡 接收到步骤更新:', {
                  type: data.type,
                  step: data.step,
                  currentStep: data.currentStep,
                  title: data.title
                });
              }
              
              // 处理不同类型的事件
              if (data.type === 'connection_test') {
                continue;
              } else if (data.type === 'final_report') {
                // 处理最终报告
                console.log('🎉 接收到最终报告:', { reportLength: data.report?.length });
                
                setCurrentResearchSession(prev => {
                  if (!prev) return null;
                  
                  const reportCompleteStep: ResearchLangGraphStep = {
                    type: 'step_complete',
                    step: 'report-generation',
                    cycle: 1,
                    title: '研究报告完成',
                    description: '成功生成专业研究报告',
                    details: [
                      `• 报告总长度：${data.report?.length || 0} 字符`,
                      '• 包含结构化研究发现',
                      '• 提供完整参考资料'
                    ],
                    timestamp: new Date()
                  };
                  
                  return {
                    ...prev,
                    status: 'completed' as const,
                    endTime: new Date(),
                    currentStep: 'report-generation',
                    report: data.report,
                    steps: [...prev.steps, reportCompleteStep]
                  };
                });

                // 更新消息，显示最终报告
                setAgentMessages(prevMessages => {
                  const updatedMessages = prevMessages.map(msg =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          content: data.report || '研究报告生成完成',
                          isGenerating: false,
                          agentPlan: {
                            steps: [...(msg.agentPlan?.steps || []), {
                              type: 'step_complete' as const,
                              step: 'report-generation',
                              cycle: 1,
                              title: '研究报告完成',
                              description: '成功生成专业研究报告',
                              details: [],
                              timestamp: new Date()
                            }],
                            status: 'completed' as const,
                            currentStep: 'report-generation', // 确保currentStep正确
                            finalReport: data.report
                          }
                        }
                      : msg
                  );
                  
                  // 自动保存已完成的研究到历史记录
                  saveCurrentResearch(updatedMessages);
                  
                  return updatedMessages;
                });
              } else if (data.step === 'error') {
                // 发生错误
                setCurrentResearchSession(prev => prev ? {
                  ...prev,
                  status: 'error' as const,
                  endTime: new Date(),
                  error: data.details
                } : null);

                setAgentMessages(prevMessages => 
                  prevMessages.map(msg =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          content: `研究过程中发生错误: ${data.details}`,
                          isGenerating: false,
                          agentPlan: {
                            steps: msg.agentPlan?.steps || [],
                            status: 'error' as const
                          }
                        }
                      : msg
                  )
                );
              } else if (data.type === 'step_update' || data.type === 'step_complete') {
                // 🔥 优先处理简化的步骤更新
                const stepInfo: ResearchLangGraphStep = {
                  type: data.type as 'step_start' | 'step_complete' | 'step_error' | 'step_progress',
                  step: data.step,
                  cycle: 1,
                  title: data.title || `${data.step} 执行中`,
                  description: data.description || '',
                  details: [],
                  timestamp: new Date()
                };

                setCurrentResearchSession(prev => {
                  if (!prev) return null;
                  
                  // 🔥 直接使用后端提供的currentStep，不再进行复杂推理
                  const updatedCurrentStep = data.currentStep || data.step;
                  
                  console.log('🎯 直接更新currentStep:', {
                    dataStep: data.step,
                    dataCurrentStep: data.currentStep,
                    finalCurrentStep: updatedCurrentStep,
                    dataType: data.type
                  });
                  
                  return {
                    ...prev,
                    currentStep: updatedCurrentStep,
                    steps: [...prev.steps, stepInfo]
                  };
                });

                // 更新消息中的 agentPlan
                setAgentMessages(prevMessages => 
                  prevMessages.map(msg =>
                    msg.id === assistantMessageId
                      ? { 
                          ...msg, 
                          agentPlan: {
                            steps: [...(msg.agentPlan?.steps || []), stepInfo],
                            status: 'running' as const,
                            currentStep: data.currentStep || data.step
                          }
                        }
                      : msg
                  )
                );
              } else {
                // 处理其他复杂的步骤信息（向后兼容）
                if (data.user_friendly && data.step && data.title) {
                  const stepInfo: ResearchLangGraphStep = {
                    type: data.type as 'step_start' | 'step_complete' | 'step_error' | 'step_progress',
                    step: data.step,
                    cycle: 1,
                    title: data.title,
                    description: data.description || '',
                    details: [
                      ...(data.key_directions || []),
                      ...(data.resources_found || []),
                      ...(data.processed_resources || []),
                      ...(data.stats ? [data.stats] : []),
                      ...(data.resource_summary ? [data.resource_summary] : []),
                      ...(data.enhancement_summary ? [data.enhancement_summary] : []),
                      ...(data.analysis_summary ? [data.analysis_summary] : [])
                    ].filter(Boolean),
                    timestamp: new Date()
                  };

                  setCurrentResearchSession(prev => {
                    if (!prev) return null;
                    
                    // 🔥 关键修复：优先使用后端提供的currentStep
                    const updatedCurrentStep = data.currentStep || data.step;
                    
                    console.log('🔄 useAgentResearch 更新currentStep:', {
                      dataStep: data.step,
                      dataCurrentStep: data.currentStep,
                      finalCurrentStep: updatedCurrentStep,
                      dataType: data.type,
                      dataTitle: data.title
                    });
                    
                    return {
                      ...prev,
                      currentStep: updatedCurrentStep,
                      steps: [...prev.steps, stepInfo]
                    };
                  });

                  // 更新消息中的 agentPlan
                  setAgentMessages(prevMessages => 
                    prevMessages.map(msg =>
                      msg.id === assistantMessageId
                        ? { 
                            ...msg, 
                            agentPlan: {
                              steps: [...(msg.agentPlan?.steps || []), stepInfo],
                              status: 'running' as const,
                              currentStep: data.currentStep || data.step
                            }
                          }
                        : msg
                    )
                  );
                }
              }
            } catch (error) {
              console.warn('解析Agent研究SSE数据失败:', jsonStr, error);
            }
          }
        }
      }

    } catch (error) {
      console.error('Agent研究任务执行失败:', error);
      setCurrentResearchSession(prev => prev ? {
        ...prev,
        status: 'error' as const,
        endTime: new Date(),
        error: error instanceof Error ? error.message : '未知错误'
      } : null);

      setAgentMessages(prevMessages => 
        prevMessages.map(msg =>
          msg.id === assistantMessageId
            ? { 
                ...msg, 
                content: `研究任务执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
                isGenerating: false,
                agentPlan: {
                  steps: msg.agentPlan?.steps || [],
                  status: 'error' as const
                }
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 重置Agent研究状态
  const resetAgentResearch = useCallback(() => {
    setAgentMessages([
      {
        id: 'agent-welcome',
        role: 'assistant',
        content: '你好！我是您的 AI 深度研究助手，专门使用 Gemini 2.0 Flash 模型为您提供专业的研究服务。我可以帮助您：\n\n🔍 深度研究任何主题\n📊 生成专业分析报告\n🌐 搜索最新资料信息\n📝 整合多源数据分析\n💡 提供专业见解总结\n\n请告诉我您想要研究的主题，我将调用专业的 Agent 工具链为您进行全面的调研分析。',
        timestamp: new Date(),
        blocks: [] // 添加必需的 blocks 属性
      }
    ]);
    setCurrentResearchSession(null);
    setIsLoading(false);
    setShowReport(false);
  }, []);

  return {
    // State
    agentMessages,
    setAgentMessages,
    currentResearchSession,
    isLoading,
    showReport,
    setShowReport,
    
    // Research History State
    researchHistory,
    currentHistorySession,
    
    // Actions
    handleAgentResearchMessage,
    resetAgentResearch,
    
    // Research History Actions
    initializeResearchHistory,
    saveCurrentResearch,
    loadHistoryResearchSession,
    handleDeleteResearch,
    startNewResearch,
  };
}; 