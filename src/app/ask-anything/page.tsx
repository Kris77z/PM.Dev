'use client';

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatedAIInput } from "@/components/ui/animated-ai-input";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { EnhancedMessageItem } from "@/components/message";
import { MessageBlockType, MainTextMessageBlock } from "@/types/message";
import { AGENT_PROMPTS } from "@/config/prompts";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import PromptStashView from "@/components/prompt-stash/PromptStashView";
import PRDHouseViewRefactored from "@/components/prd-house/PRDHouseViewRefactored";
import { 
  MessageSquarePlus, 
  Lightbulb,
  FileText,
  Home,
  Trash2,
  Brain
} from "lucide-react";
import ResearchPlan from "@/components/ui/research-plan";
import type { ViewType } from "@/types/research";
import { useChat } from "@/hooks/useChat";
import { useAgentResearch } from "@/hooks/useAgentResearch";
import { convertLangGraphToResearchTasks, getCurrentExecutingStep } from "@/utils/research-converter";
import { ResearchReportModal } from "@/components/ui/research-report-modal";

// 消息转换为块格式的辅助函数
const convertMessageToBlocks = (message: { content: string; timestamp: Date }): Record<string, MainTextMessageBlock> => {
  if (!message.content) return {};
  
  const blockId = `${message.timestamp.getTime()}-main-text`;
  const block: MainTextMessageBlock = {
    id: blockId,
    type: MessageBlockType.MAIN_TEXT,
    content: message.content,
    createdAt: message.timestamp // 使用消息的时间戳而不是当前时间
  };
  
  return { [blockId]: block };
};

export default function AskAnythingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session');
  const viewParam = searchParams?.get('view') as ViewType || 'chat';
  const queryParam = searchParams?.get('query');

  // 使用自定义hooks
  const chat = useChat();
  const agentResearch = useAgentResearch();
  
  // 本地状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>(viewParam);
  
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 加载历史对话
  useEffect(() => {
    chat.initializeChatHistory();
    agentResearch.initializeResearchHistory(); // 初始化研究历史

    // 如果URL中有sessionId，加载对应的对话
    if (sessionId) {
      chat.loadChatSession(sessionId);
    }
  }, [sessionId, chat.initializeChatHistory, chat.loadChatSession, agentResearch.initializeResearchHistory]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, chat.isLoading]);

  // 删除历史对话 - 包装处理事件
  const handleDeleteChat = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    chat.handleDeleteChat(sessionId);
  };

  // 侧边栏链接配置
  const links = [
    {
      label: "新对话",
      href: "#",
      icon: <MessageSquarePlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        chat.startNewChat();
      }
    },
  ];

  const bottomLinks = [
    {
      label: "返回首页",
      href: "/",
      icon: <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];

  // 快捷按钮配置 - Claude风格
  const quickActions = [
    {
      title: "PRD 工具",
      description: AGENT_PROMPTS.prd.description,
      icon: <FileText className="h-4 w-4" />,
      onClick: () => switchView('prd-house')  // 直接切换到PRD工具视图
    },
    {
      title: "Prompt 工具",
      description: AGENT_PROMPTS.promptHouse.description,
      icon: <Lightbulb className="h-4 w-4" />,
      onClick: () => switchView('prompt-stash')  // 直接切换到Prompt Stash视图
    }
  ];

  // 视图切换函数
  const switchView = (view: ViewType) => {
    setActiveView(view);
    const params = new URLSearchParams(searchParams?.toString());
    if (view === 'chat') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const newUrl = params.toString() ? `/ask-anything?${params.toString()}` : '/ask-anything';
    router.push(newUrl, { scroll: false });
  };

  // 同步URL变化
  useEffect(() => {
    setActiveView(viewParam);
  }, [viewParam]);

  // 处理 query 参数，自动发送研究消息
  useEffect(() => {
    if (queryParam && viewParam === 'agent-research' && agentResearch.agentMessages.length === 1) {
      // 延迟一下确保页面完全加载
      setTimeout(() => {
        agentResearch.handleAgentResearchMessage(queryParam);
        // 清除 URL 中的 query 参数
        const newParams = new URLSearchParams(searchParams?.toString());
        newParams.delete('query');
        const newUrl = newParams.toString() ? `/ask-anything?${newParams.toString()}` : '/ask-anything?view=agent-research';
        router.replace(newUrl, { scroll: false });
      }, 100);
    }
  }, [queryParam, viewParam, agentResearch.agentMessages.length, agentResearch.handleAgentResearchMessage, searchParams, router]);

  return (
    <div className="min-h-screen bg-white flex">
      
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Chat Management Section - New Chat & Recent Chats */}
            <div className="mt-8 flex flex-col gap-2">
              {/* New Chat */}
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              
              {/* Recent Chats - 直接左对齐显示，无缩进 */}
              {chat.chatHistory.length > 0 && (
                <div className="mt-2 space-y-1">
                  {chat.chatHistory.map((session) => (
                    <div 
                      key={session.id} 
                      className="group flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 py-2 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                      onClick={() => chat.loadHistorySession(session)}
                    >
                      <span className="truncate flex-1" title={session.title}>
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                        title="删除对话"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="mt-8 flex flex-col gap-2">
              <SidebarLink 
                link={{
                  label: "PRD 工具",
                  href: "#",
                  icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('prd-house');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "Prompt 工具",
                  href: "#",
                  icon: <Lightbulb className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('prompt-stash');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "Agent 研究",
                  href: "#",
                  icon: <Brain className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('agent-research');
                  }
                }}
              />
              
              {/* 历史研究 - 直接左对齐显示，无缩进 */}
              {agentResearch.researchHistory.length > 0 && (
                <div className="mt-2 space-y-1">
                  {agentResearch.researchHistory.map((session) => (
                    <div 
                      key={session.id} 
                      className="group flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 py-2 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                      onClick={() => {
                        // 切换到 agent-research 视图并加载历史研究
                        switchView('agent-research');
                        agentResearch.loadHistoryResearchSession(session);
                      }}
                    >
                      <span className="truncate flex-1" title={session.title}>
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          agentResearch.handleDeleteResearch(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-opacity"
                        title="删除研究"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Links */}
          <div className="mb-4">
            {bottomLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </SidebarBody>
      </Sidebar>

      {/* 主要内容区域 */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
        {/* 当前代理状态显示 */}
        {chat.currentAgent && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
            <span className="text-sm text-blue-700">
              当前模式: {chat.currentAgent}
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 py-12 h-screen">
          {/* 根据activeView渲染不同内容 */}
          {activeView === 'chat' && (
            <>
              {/* 标题 - 在页面绝对中心 */}
              {chat.messages.length === 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-7xl font-normal text-black mb-12">Ask PM.Dev Anything</h1>
                    
                    {/* 输入框 */}
                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-2xl">
                        <AnimatedAIInput
                          onSendMessage={(message, modelId, enableWS) => chat.handleSendMessage(message, modelId, undefined, enableWS)}
                          placeholder="What is Web3?"
                          disabled={chat.isLoading}
                          selectedModel={chat.selectedModel}
                          onModelChange={chat.setSelectedModel}
                          webSearchEnabled={webSearchEnabled}
                          onWebSearchToggle={setWebSearchEnabled}
                        />
                      </div>
                    </div>

                    {/* 快捷按钮 - Claude风格 */}
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.onClick}
                          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          {action.icon}
                          <span>{action.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 有对话时的布局 */}
              {chat.messages.length > 1 && (
                <div className="flex-1 flex flex-col h-full">
                  {/* 消息显示区域 - 可滚动，带渐变 */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto pb-40 relative" 
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    <div className="max-w-2xl mx-auto space-y-8 px-6 pt-6">
                      {chat.messages.slice(1).map((message) => {
                        const blocks = convertMessageToBlocks(message);
                        
                        return (
                          <EnhancedMessageItem
                            key={message.id}
                            message={{
                              ...message,
                              blocks: Object.keys(blocks)
                            }}
                            blocks={blocks}
                            isGenerating={message.isGenerating}
                            showTimestamp={true}
                            showActions={true}
                            density="normal"
                          />
                        );
                      })}
                      
                      {/* 底部占位空间，确保最后一条消息不被遮挡 */}
                      <div className="h-32"></div>
                    </div>
                  </div>

                  {/* 输入框区域 - 固定在底部，无分割线 */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
                    <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
                      <div className="max-w-2xl mx-auto px-6 py-4">
                        <AnimatedAIInput
                          onSendMessage={(message, modelId, enableWS) => chat.handleSendMessage(message, modelId, undefined, enableWS)}
                          placeholder="What is Web3?"
                          disabled={chat.isLoading}
                          selectedModel={chat.selectedModel}
                          onModelChange={chat.setSelectedModel}
                          webSearchEnabled={webSearchEnabled}
                          onWebSearchToggle={setWebSearchEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Prompt工具视图 - 移除padding让其占满整个容器 */}
          {activeView === 'prompt-stash' && (
            <div className="flex-1 overflow-hidden -mx-6 -my-12">
              <PromptStashView />
            </div>
          )}

          {/* PRD工具视图 */}
          {activeView === 'prd-house' && (
            <div className="flex-1 overflow-hidden -mx-6 -my-12">
              <PRDHouseViewRefactored />
            </div>
          )}

          {/* 原型工具视图 */}
          {activeView === 'prototype-house' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-normal text-black mb-4">原型工具</h1>
                <p className="text-gray-600">快速原型设计工具正在开发中...</p>
              </div>
            </div>
          )}

          {/* 无限画布视图 */}
          {activeView === 'infinite-canvas' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-normal text-black mb-4">无限画布</h1>
                <p className="text-gray-600">思维导图和流程图工具正在开发中...</p>
              </div>
            </div>
          )}

          {/* Agent 研究视图 */}
          {activeView === 'agent-research' && (
            <>
              {/* 标题 - 在页面绝对中心 */}
              {agentResearch.agentMessages.length === 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-7xl font-normal text-black mb-12">Ask PM.Dev To Research</h1>
                    
                    {/* 输入框 - 和主页面一样大 */}
                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-2xl">
                        <AnimatedAIInput
                          onSendMessage={(message) => agentResearch.handleAgentResearchMessage(message)}
                          placeholder="请描述您想要研究的主题..."
                          disabled={agentResearch.isLoading}
                          selectedModel="gemini-2.0-flash"
                          onModelChange={() => {}}
                          webSearchEnabled={false}
                          onWebSearchToggle={() => {}}
                          hideModelSelector={true}
                          hideSearchIcon={true}
                        />
                      </div>
                    </div>

                    {/* 快捷按钮 - 与主页面样式一致 */}
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                      <button
                        onClick={() => agentResearch.handleAgentResearchMessage("大模型发展趋势")}
                        disabled={agentResearch.isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>大模型发展趋势</span>
                      </button>
                      
                      <button
                        onClick={() => agentResearch.handleAgentResearchMessage("AI在区块链中的应用")}
                        disabled={agentResearch.isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                        <span>AI在区块链中的应用</span>
                      </button>
                      
                      <button
                        onClick={() => agentResearch.handleAgentResearchMessage("Vibe Coding的未来")}
                        disabled={agentResearch.isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Vibe Coding的未来</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 对话区域 - 使用与测试页面相同的样式 */}
              {agentResearch.agentMessages.length > 1 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                      {agentResearch.agentMessages.slice(1).map((message) => (
                        <div key={message.id} className="space-y-4">
                          {/* 用户消息 */}
                          {message.role === 'user' && (
                            <div className="flex justify-end">
                              <div className="bg-black text-white px-4 py-2 rounded-lg max-w-xs">
                                {message.content}
                              </div>
                            </div>
                          )}

                          {/* Assistant 消息 - 不使用气泡包裹，直接展示 */}
                          {message.role === 'assistant' && (
                            <div className="space-y-4">
                              {/* 加载状态 - 当开始研究但还没有具体步骤内容时显示 */}
                              {message.isGenerating && (!message.agentPlan || message.agentPlan.steps.length === 0 || 
                                (message.agentPlan.steps.length === 1 && !message.agentPlan.steps[0].details?.length)) && (
                                <div className="max-w-[85%]">
                                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl px-4 py-3">
                                    <div className="text-sm leading-relaxed">
                                      <TextShimmer duration={1.5} spread={1}>
                                        正在思考中...
                                      </TextShimmer>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Agent Plan 展示 - 使用新的 ResearchPlan 组件 */}
                              {message.agentPlan && message.agentPlan.steps.length > 0 && (() => {
                                const tasks = convertLangGraphToResearchTasks(message.agentPlan.steps);
                                // 动态生成展开的任务ID列表
                                const expandedTaskIds = tasks.map(task => task.id);
                                
                                // 🔥 关键修复：直接使用useAgentResearch提供的currentStep
                                const currentStep = message.agentPlan.currentStep || getCurrentExecutingStep(message.agentPlan.steps);
                                const isActive = message.agentPlan.status === 'running';
                                
                                // 调试信息
                                console.log('ask-anything 调试信息:', {
                                  agentPlanStatus: message.agentPlan.status,
                                  agentPlanCurrentStep: message.agentPlan.currentStep,
                                  getCurrentExecutingStepResult: getCurrentExecutingStep(message.agentPlan.steps),
                                  finalCurrentStep: currentStep,
                                  isActive,
                                  totalSteps: message.agentPlan.steps.length,
                                  lastStep: message.agentPlan.steps[message.agentPlan.steps.length - 1]
                                });
                                
                                return (
                                  <div className="max-w-[85%] space-y-2">
                                    <ResearchPlan 
                                      tasks={tasks}
                                      expandedTaskIds={expandedTaskIds}
                                      currentStep={currentStep}
                                      isActive={isActive}
                                      showReport={message.agentPlan?.status === 'completed' && !!message.content}
                                      reportContent={message.content}
                                      onReportView={() => agentResearch.setShowReport(true)}
                                      className="p-0"
                                      enableProgressiveDisplay={true}
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* 任务完成后的新研究按钮 */}
                      {(() => {
                        const lastMessage = agentResearch.agentMessages.filter(m => m.role === 'assistant').pop();
                        const isTaskCompleted = lastMessage?.agentPlan?.status === 'completed';
                        
                        if (isTaskCompleted) {
                          return (
                            <div className="flex justify-center mt-8 mb-8">
                              <div className="w-full max-w-2xl">
                                {/* 开始新研究按钮 - 样式参考 ask-anything 快捷按钮 */}
                                <button
                                  onClick={() => {
                                    // 清空当前对话，开始新研究
                                    agentResearch.agentMessages.splice(1); // 保留系统消息
                                    // 重新加载页面以确保状态完全重置
                                    window.location.href = `/ask-anything?view=agent-research`;
                                  }}
                                  className="flex items-center gap-2 px-4 py-3 text-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors mx-auto"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span>开始新的研究</span>
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* 底部占位空间 - 根据是否有输入框调整 */}
                      {(() => {
                        const lastMessage = agentResearch.agentMessages.filter(m => m.role === 'assistant').pop();
                        const isTaskCompleted = lastMessage?.agentPlan?.status === 'completed';
                        const hasActiveTask = lastMessage?.agentPlan && lastMessage.agentPlan.status === 'running';
                        const shouldShowInput = !agentResearch.isLoading && !hasActiveTask && !isTaskCompleted;
                        
                        return <div className={shouldShowInput ? "h-32" : "h-8"}></div>;
                      })()}
                    </div>
                  </div>

                  {/* 输入框区域 - 单线程任务，任务开始后隐藏 */}
                  {/* 只有在没有正在进行的任务且任务未完成时才显示输入框 */}
                  {!agentResearch.isLoading && (() => {
                    const lastMessage = agentResearch.agentMessages.filter(m => m.role === 'assistant').pop();
                    const isTaskCompleted = lastMessage?.agentPlan?.status === 'completed';
                    const hasActiveTask = lastMessage?.agentPlan && lastMessage.agentPlan.status === 'running';
                    
                    // 如果有活跃任务或任务已完成，就不显示输入框
                    if (hasActiveTask || isTaskCompleted) {
                      return null;
                    }
                    
                    return (
                      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
                        <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
                          <div className="max-w-2xl mx-auto px-6 py-4">
                            <AnimatedAIInput
                              onSendMessage={(message) => agentResearch.handleAgentResearchMessage(message)}
                              placeholder="请描述您想要研究的主题..."
                              disabled={agentResearch.isLoading}
                              selectedModel="gemini-2.0-flash"
                              onModelChange={() => {}}
                              webSearchEnabled={false}
                              onWebSearchToggle={() => {}}
                              hideModelSelector={true}
                              hideSearchIcon={true}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 报告预览弹窗 */}
      <ResearchReportModal
        isOpen={agentResearch.showReport}
        onClose={() => agentResearch.setShowReport(false)}
        reportContent={
          agentResearch.agentMessages.filter(m => m.role === 'assistant' && m.content).pop()?.content || ''
        }
        userQuery={
          agentResearch.agentMessages.find(m => m.role === 'user')?.content || ''
        }
      />
    </div>
  );
} 