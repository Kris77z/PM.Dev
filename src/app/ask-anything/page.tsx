'use client';

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatedAIInput } from "@/components/ui/animated-ai-input";
import { MessageItem } from "@/components/message";
import { AGENT_PROMPTS, getAgentPrompt } from "@/config/prompts";
import { DEFAULT_MODEL } from "@/config/models";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import PromptStashView from "@/components/prompt-stash/PromptStashView";
import PRDHouseViewV4 from "@/components/prd-house/PRDHouseViewV4";
import { 
  MessageSquarePlus, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Lightbulb,
  FileText,
  Square,
  Home,
  Trash2,
  Layers
} from "lucide-react";
import {
  getChatHistory,
  getChatSession,
  saveChatSession,
  deleteChatSession,
  createNewChatSession,
  updateChatSessionMessages,
  type ChatSession,
  type ChatMessage
} from "@/lib/chat-history";

// 定义消息类型（保持与历史对话兼容）
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

// 定义视图类型
type ViewType = 'chat' | 'prompt-house' | 'prd-house' | 'prototype-house' | 'infinite-canvas';

export default function AskAnythingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session');
  const viewParam = searchParams?.get('view') as ViewType || 'chat';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [recentChatsOpen, setRecentChatsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // 添加视图状态
  const [activeView, setActiveView] = useState<ViewType>(viewParam);
  
  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 加载历史对话
  useEffect(() => {
    const history = getChatHistory();
    
    // 临时清理重复的历史对话
    const uniqueHistory = history.filter((session, index, self) => 
      index === self.findIndex(s => s.title === session.title && 
        Math.abs(new Date(s.createdAt).getTime() - new Date(session.createdAt).getTime()) < 1000)
    );
    
    // 如果发现重复，更新localStorage
    if (uniqueHistory.length !== history.length) {
      localStorage.setItem('pm-assistant-chat-history', JSON.stringify(uniqueHistory));
    }
    
    setChatHistory(uniqueHistory);

    // 如果URL中有sessionId，加载对应的对话
    if (sessionId) {
      const session = getChatSession(sessionId);
      if (session) {
        setCurrentSession(session);
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
            timestamp: new Date(),
          },
          ...session.messages
        ]);
        setSelectedModel(session.model);
        setCurrentAgent(session.agent || null);
      }
    }
  }, [sessionId]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 保存当前对话到历史记录
  const saveCurrentChat = (newMessages: Message[]) => {
    if (newMessages.length <= 1) return; // 只有欢迎消息时不保存

    const chatMessages = newMessages.slice(1); // 移除欢迎消息
    
    if (currentSession) {
      // 更新现有会话
      updateChatSessionMessages(currentSession.id, chatMessages as ChatMessage[]);
    } else {
      // 创建新会话
      const firstUserMessage = chatMessages.find(msg => msg.role === 'user')?.content;
      if (firstUserMessage) {
        const newSession = createNewChatSession(firstUserMessage, selectedModel, currentAgent || undefined);
        newSession.messages = chatMessages as ChatMessage[];
        saveChatSession(newSession);
        setCurrentSession(newSession);
        
        // 更新URL，但不触发页面重新加载
        window.history.replaceState(null, '', `/ask-anything?session=${newSession.id}`);
      }
    }
    
    // 刷新历史对话列表
    setChatHistory(getChatHistory());
  };

  // 开始新对话
  const startNewChat = () => {
    console.log('开始新对话');
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
        timestamp: new Date(),
      }
    ]);
    setCurrentSession(null);
    setCurrentAgent(null);
    setSelectedModel(DEFAULT_MODEL);
    setIsLoading(false); // 确保重置loading状态
    
    // 更新URL，移除session参数
    window.history.replaceState(null, '', '/ask-anything');
  };

  // 加载历史对话
  const loadChatSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
        timestamp: new Date(),
      },
      ...session.messages
    ]);
    setSelectedModel(session.model);
    setCurrentAgent(session.agent || null);
    setIsLoading(false); // 确保重置loading状态
    
    // 更新URL，但不触发页面重新加载
    window.history.replaceState(null, '', `/ask-anything?session=${session.id}`);
  };

  // 删除历史对话
  const handleDeleteChat = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteChatSession(sessionId);
    setChatHistory(getChatHistory());
    
    // 如果删除的是当前对话，开始新对话
    if (currentSession?.id === sessionId) {
      startNewChat();
    }
  };

  const handleSendMessage = async (userInput: string, modelId?: string, agentType?: keyof typeof AGENT_PROMPTS, enableWebSearch?: boolean) => {
    if (!userInput.trim()) return;

    // 使用传入的模型ID，如果没有则使用当前选中的模型
    const currentModel = modelId || selectedModel;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    const assistantMessageId = Date.now().toString() + '-assistant';
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true,
    };

    const newMessages = [...messages, userMessage, initialAssistantMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // 如果指定了agent类型，使用对应的系统提示词
    let systemPrompt = "你是一个专业的文档和文稿助手，专门帮助用户处理各种文档相关的任务，包括撰写、编辑、优化文档内容，制作报告和演示文稿等。请用中文回复，并提供实用、专业的建议。";
    
    if (agentType) {
      const agentConfig = getAgentPrompt(agentType);
      systemPrompt = agentConfig.systemPrompt;
      setCurrentAgent(agentConfig.name);
    }

    const messagesForApi = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // 使用新的多模型API
      const response = await fetch('/api/chat-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel, // 使用当前选中的模型
          messages: messagesForApi,
          context: systemPrompt,
          enableWebSearch: enableWebSearch || false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "请求失败，无法解析错误信息" } }));
        console.error("API Error from /api/chat-multi:", response.status, errorData);
              const errorMessages = newMessages.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: `错误: ${errorData.error?.message || errorData.details || response.statusText || '请求失败'}`, isGenerating: false }
          : msg
      );
        setMessages(errorMessages);
        saveCurrentChat(errorMessages);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader from /api/chat-multi");
      }
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 流结束时确保最终内容被设置
          if (accumulatedContent) {
            const finalMessages = newMessages.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent, isGenerating: false }
                : msg
            );
            setMessages(finalMessages);
            saveCurrentChat(finalMessages);
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6).trim();
            
            // 跳过空行和结束标记
            if (!jsonStr || jsonStr === '[DONE]') {
              continue;
            }
            
            try {
              const parsedChunk = JSON.parse(jsonStr);
              const deltaContent = parsedChunk.choices?.[0]?.delta?.content;
              if (deltaContent) {
                accumulatedContent += deltaContent;
                const updatedMessages = newMessages.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedContent, isGenerating: true }
                    : msg
                );
                setMessages(updatedMessages);
              }
              
              // 检查是否完成
              const finishReason = parsedChunk.choices?.[0]?.finish_reason;
              if (finishReason === 'stop' || finishReason === 'length') {
                // 流正常结束，设置最终状态
                const finalMessages = newMessages.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedContent, isGenerating: false }
                    : msg
                );
                setMessages(finalMessages);
                saveCurrentChat(finalMessages);
                return; // 提前退出
              }
            } catch {
              // 只在开发环境下输出详细错误信息
              if (process.env.NODE_ENV === 'development') {
                console.warn("跳过无效的JSON数据块:", jsonStr.substring(0, 100) + (jsonStr.length > 100 ? '...' : ''));
              }
              // 继续处理下一个数据块，不中断流
              continue;
            }
          }
        }
      }

    } catch (error) {
      console.error("Fetch Error to /api/chat-multi:", error);
      const errorMessages = newMessages.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: `请求出错: ${error instanceof Error ? error.message : '未知错误'}`, isGenerating: false }
          : msg
      );
      setMessages(errorMessages);
      saveCurrentChat(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // 侧边栏链接配置
  const links = [
    {
      label: "新对话",
      href: "#",
      icon: <MessageSquarePlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        startNewChat();
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
      onClick: () => handleSendMessage(AGENT_PROMPTS.prd.defaultPrompt, selectedModel, 'prd')
    },
    {
      title: "Prompt 工具",
      description: AGENT_PROMPTS.promptHouse.description,
      icon: <Lightbulb className="h-4 w-4" />,
      onClick: () => handleSendMessage(AGENT_PROMPTS.promptHouse.defaultPrompt, selectedModel, 'promptHouse')
    },
    {
      title: "原型工具",
      description: AGENT_PROMPTS.prototype.description,
      icon: <Layers className="h-4 w-4" />,
      onClick: () => handleSendMessage(AGENT_PROMPTS.prototype.defaultPrompt, selectedModel, 'prototype')
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
              
              {/* Recent Chats */}
              <div>
                {chatHistory.length >= 10 ? (
                  // 有10个以上历史对话时显示可折叠的版本
                  <>
                    <button
                      onClick={() => setRecentChatsOpen(!recentChatsOpen)}
                      className="flex items-center justify-start gap-2 group/sidebar py-2 w-full text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150"
                    >
                      <Clock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre inline-block !p-0 !m-0">历史对话</span>
                      {recentChatsOpen ? (
                        <ChevronDown className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0 ml-auto" />
                      ) : (
                        <ChevronRight className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0 ml-auto" />
                      )}
                    </button>
                    {recentChatsOpen && (
                      <div className="ml-10 mt-2 space-y-1">
                        {chatHistory.map((session) => (
                          <div 
                            key={session.id} 
                            className="group flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 py-1 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                            onClick={() => loadChatSession(session)}
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
                  </>
                ) : chatHistory.length > 0 ? (
                  // 有历史对话但少于10个时显示简单版本
                  <>
                    <SidebarLink 
                      link={{
                        label: "历史对话",
                        href: "#",
                        icon: <Clock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                      }}
                    />
                    <div className="ml-10 mt-2 space-y-1">
                      {chatHistory.map((session) => (
                        <div 
                          key={session.id} 
                          className="group flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 py-1 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                          onClick={() => loadChatSession(session)}
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
                  </>
                ) : (
                  // 没有历史对话时显示占位文本
                  <SidebarLink 
                    link={{
                      label: "暂无历史对话",
                      href: "#",
                      icon: <Clock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                    }}
                  />
                )}
              </div>
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
                    switchView('prompt-house');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "无限画布",
                  href: "#",
                  icon: <Square className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('infinite-canvas');
                  }
                }}
              />
              <SidebarLink 
                link={{
                  label: "原型工具",
                  href: "#",
                  icon: <Layers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    switchView('prototype-house');
                  }
                }}
              />
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
        {currentAgent && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
            <span className="text-sm text-blue-700">
              当前模式: {currentAgent}
            </span>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 py-12 h-screen">
          {/* 根据activeView渲染不同内容 */}
          {activeView === 'chat' && (
            <>
              {/* 标题 - 在页面绝对中心 */}
              {messages.length === 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-7xl font-normal text-black mb-12">Ask PM.Dev Anything</h1>
                    
                    {/* 输入框 */}
                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-2xl">
                        <AnimatedAIInput
                          onSendMessage={(message, modelId, enableWS) => handleSendMessage(message, modelId, undefined, enableWS)}
                          placeholder="What is Web3?"
                          disabled={isLoading}
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
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
              {messages.length > 1 && (
                <div className="flex-1 flex flex-col h-full">
                  {/* 消息显示区域 - 可滚动，带渐变 */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto pb-40 relative" 
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    <div className="max-w-2xl mx-auto space-y-8 px-6 pt-6">
                      {messages.slice(1).map((message) => (
                        <MessageItem
                          key={message.id}
                          id={message.id}
                          role={message.role}
                          content={message.content}
                          timestamp={message.timestamp}
                          isGenerating={message.isGenerating}
                        />
                      ))}
                      
                      {/* 底部占位空间，确保最后一条消息不被遮挡 */}
                      <div className="h-32"></div>
                    </div>
                  </div>

                  {/* 输入框区域 - 固定在底部，无分割线 */}
                  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
                    <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-[300px]' : 'md:ml-[60px]'} ml-0`}>
                      <div className="max-w-2xl mx-auto px-6 py-4">
                        <AnimatedAIInput
                          onSendMessage={(message, modelId, enableWS) => handleSendMessage(message, modelId, undefined, enableWS)}
                          placeholder="What is Web3?"
                          disabled={isLoading}
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
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
          {activeView === 'prompt-house' && (
            <div className="flex-1 overflow-hidden -mx-6 -my-12">
              <PromptStashView />
            </div>
          )}

          {/* PRD工具视图 */}
          {activeView === 'prd-house' && (
            <div className="flex-1 overflow-hidden -mx-6 -my-12">
              <PRDHouseViewV4 />
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
        </div>
      </div>
    </div>
  );
} 