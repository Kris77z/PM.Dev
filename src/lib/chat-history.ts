// 历史对话管理工具
import { 
  Model, 
  MultiModelMessageStyle 
} from '@/types/message';
import { ResearchLangGraphStep } from '@/types/research';

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content?: string; // 保持向后兼容
  blocks: string[]; // 消息块ID数组（与Message一致）
  timestamp: Date;
  isGenerating?: boolean;
  
  // 扩展属性（与Message一致）
  mentions?: Model[];
  multiModelMessageStyle?: MultiModelMessageStyle;
  foldSelected?: boolean;
  askId?: string; // 用于分组
  
  // Agent Plan 支持
  agentPlan?: {
    steps: ResearchLangGraphStep[];
    currentStep?: string;
    status: 'running' | 'completed' | 'error';
    finalReport?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  agent?: string;
}

const STORAGE_KEY = 'pm-assistant-chat-history';
const MAX_HISTORY_COUNT = 50; // 最多保存50个对话

// 生成对话标题（基于第一条用户消息）
export function generateChatTitle(firstUserMessage: string): string {
  const maxLength = 30;
  const cleaned = firstUserMessage.trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  return cleaned.substring(0, maxLength) + '...';
}

// 获取所有历史对话
export function getChatHistory(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const sessions: ChatSession[] = JSON.parse(stored);
    
    // 转换日期字符串为Date对象
    return sessions.map(session => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    })).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

// 保存对话会话
export function saveChatSession(session: ChatSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getChatHistory();
    
    // 查找是否已存在该会话
    const existingIndex = history.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      // 更新现有会话
      history[existingIndex] = {
        ...session,
        updatedAt: new Date()
      };
    } else {
      // 添加新会话
      history.unshift({
        ...session,
        updatedAt: new Date()
      });
      
      // 限制历史记录数量
      if (history.length > MAX_HISTORY_COUNT) {
        history.splice(MAX_HISTORY_COUNT);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save chat session:', error);
  }
}

// 获取特定对话会话
export function getChatSession(sessionId: string): ChatSession | null {
  const history = getChatHistory();
  return history.find(session => session.id === sessionId) || null;
}

// 删除对话会话
export function deleteChatSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getChatHistory();
    const filtered = history.filter(session => session.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete chat session:', error);
  }
}

// 清空所有历史对话
export function clearChatHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

// 创建新的对话会话
export function createNewChatSession(
  firstUserMessage: string,
  model: string,
  agent?: string
): ChatSession {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: generateChatTitle(firstUserMessage),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    model,
    agent
  };
}

// 更新对话会话的消息
export function updateChatSessionMessages(
  sessionId: string,
  messages: ChatMessage[]
): void {
  const session = getChatSession(sessionId);
  if (session) {
    session.messages = messages;
    saveChatSession(session);
  }
} 