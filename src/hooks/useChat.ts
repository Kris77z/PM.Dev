import { useState, useCallback } from 'react';
import { AGENT_PROMPTS, getAgentPrompt } from "@/config/prompts";
import { DEFAULT_MODEL } from "@/config/models";
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
import type { Message } from "@/types/message";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
      timestamp: new Date(),
      blocks: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // 初始化聊天历史
  const initializeChatHistory = useCallback(() => {
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
  }, []);

  // 加载指定会话
  const loadChatSession = useCallback((sessionId: string) => {
    const session = getChatSession(sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
          timestamp: new Date(),
          blocks: []
        },
        ...session.messages
      ]);
      setSelectedModel(session.model);
      setCurrentAgent(session.agent || null);
    }
  }, []);

  // 保存当前对话到历史记录
  const saveCurrentChat = useCallback((newMessages: Message[]) => {
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
        
        // 更新URL，但不触发页面重新加载（延迟执行避免渲染期间的状态更新）
        setTimeout(() => {
          window.history.replaceState(null, '', `/ask-anything?session=${newSession.id}`);
        }, 0);
      }
    }
    
    // 刷新历史对话列表
    setChatHistory(getChatHistory());
  }, [currentSession, selectedModel, currentAgent]);

  // 开始新对话
  const startNewChat = useCallback(() => {
    console.log('开始新对话');
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
        timestamp: new Date(),
        blocks: []
      }
    ]);
    setCurrentSession(null);
    setCurrentAgent(null);
    setSelectedModel(DEFAULT_MODEL);
    setIsLoading(false);
    
    // 更新URL，移除session参数（延迟执行避免渲染期间的状态更新）
    setTimeout(() => {
      window.history.replaceState(null, '', '/ask-anything');
    }, 0);
  }, []);

  // 加载历史对话
  const loadHistorySession = useCallback((session: ChatSession) => {
    setCurrentSession(session);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是您的文档和文稿助手。我可以帮助您：\n\n📝 撰写和优化各类文档\n📊 制作报告和演示文稿\n✍️ 改进文案和内容\n🔍 分析和总结文档\n💡 提供写作建议和灵感\n\n请告诉我您需要什么帮助？',
        timestamp: new Date(),
        blocks: []
      },
      ...session.messages
    ]);
    setSelectedModel(session.model);
    setCurrentAgent(session.agent || null);
    setIsLoading(false);
    
    // 更新URL，但不触发页面重新加载（延迟执行避免渲染期间的状态更新）
    setTimeout(() => {
      window.history.replaceState(null, '', `/ask-anything?session=${session.id}`);
    }, 0);
  }, []);

  // 删除历史对话
  const handleDeleteChat = useCallback((sessionId: string) => {
    deleteChatSession(sessionId);
    setChatHistory(getChatHistory());
    
    // 如果删除的是当前对话，开始新对话
    if (currentSession?.id === sessionId) {
      startNewChat();
    }
  }, [currentSession?.id, startNewChat]);

  // 发送消息
  const handleSendMessage = useCallback(async (
    userInput: string, 
    modelId?: string, 
    agentType?: keyof typeof AGENT_PROMPTS, 
    enableWebSearch?: boolean
  ) => {
    if (!userInput.trim()) return;

    // 使用传入的模型ID，如果没有则使用当前选中的模型
    const currentModel = modelId || selectedModel;

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
      blocks: []
    };

    let currentMessages: Message[] = [];
    let messagesForApi: Array<{role: string; content: string}> = [];

    setMessages(prevMessages => {
      currentMessages = [...prevMessages, userMessage, initialAssistantMessage];
      messagesForApi = [...prevMessages, userMessage]
        .filter(msg => msg.content) // 过滤掉没有内容的消息
        .map(msg => ({
          role: msg.role,
          content: msg.content || '', // 提供默认值以确保类型安全
        }));
      return currentMessages;
    });
    setIsLoading(true);

    // 如果指定了agent类型，使用对应的系统提示词
    let systemPrompt = "你是一个专业的文档和文稿助手，专门帮助用户处理各种文档相关的任务，包括撰写、编辑、优化文档内容，制作报告和演示文稿等。请用中文回复，并提供实用、专业的建议。";
    
    if (agentType) {
      const agentConfig = getAgentPrompt(agentType);
      systemPrompt = agentConfig.systemPrompt;
      setCurrentAgent(agentConfig.name);
    }

    try {
      // 使用新的多模型API
      const response = await fetch('/api/chat-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel,
          messages: messagesForApi,
          context: systemPrompt,
          enableWebSearch: enableWebSearch || false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "请求失败，无法解析错误信息" } }));
        console.error("API Error from /api/chat-multi:", response.status, errorData);
        setMessages(prevMessages => {
          const errorMessages = prevMessages.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: `错误: ${errorData.error?.message || errorData.details || response.statusText || '请求失败'}`, isGenerating: false }
              : msg
          );
          setTimeout(() => saveCurrentChat(errorMessages), 0);
          return errorMessages;
        });
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
            setMessages(prevMessages => {
              const finalMessages = prevMessages.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent, isGenerating: false }
                  : msg
              );
              setTimeout(() => saveCurrentChat(finalMessages), 0);
              return finalMessages;
            });
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
                setMessages(prevMessages =>
                  prevMessages.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, isGenerating: true }
                      : msg
                  )
                );
              }
              
              // 检查是否完成
              const finishReason = parsedChunk.choices?.[0]?.finish_reason;
              if (finishReason === 'stop' || finishReason === 'length') {
                // 流正常结束，设置最终状态
                setMessages(prevMessages => {
                  const finalMessages = prevMessages.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, isGenerating: false }
                      : msg
                  );
                  setTimeout(() => saveCurrentChat(finalMessages), 0);
                  return finalMessages;
                });
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
      setMessages(prevMessages => {
        const errorMessages = prevMessages.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: `请求出错: ${error instanceof Error ? error.message : '未知错误'}`, isGenerating: false }
            : msg
        );
        setTimeout(() => saveCurrentChat(errorMessages), 0);
        return errorMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel]);

  return {
    // State
    messages,
    setMessages,
    isLoading,
    currentAgent,
    selectedModel,
    setSelectedModel,
    currentSession,
    chatHistory,
    
    // Actions
    initializeChatHistory,
    loadChatSession,
    startNewChat,
    loadHistorySession,
    handleDeleteChat,
    handleSendMessage,
  };
}; 