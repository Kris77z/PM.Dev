'use client';

// 消息块类型枚举
export enum MessageBlockType {
  MAIN_TEXT = 'main_text',
  CODE = 'code',
  IMAGE = 'image',
  CITATION = 'citation',
  ERROR = 'error',
  THINKING = 'thinking',
  SEARCH_RESULT = 'search_result',
  KNOWLEDGE = 'knowledge'
}

// 基础消息块接口
export interface BaseMessageBlock {
  id: string;
  type: MessageBlockType;
  createdAt?: Date;
  updatedAt?: Date;
}

// 主文本块
export interface MainTextMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.MAIN_TEXT;
  content: string;
  language?: string;
}

// 代码块
export interface CodeMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.CODE;
  content: string;
  language: string;
  filename?: string;
  editable?: boolean;
}

// 图片块
export interface ImageMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.IMAGE;
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

// 引用块
export interface CitationMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.CITATION;
  citations: Citation[];
}

// 错误块
export interface ErrorMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.ERROR;
  error: string;
  details?: string;
}

// 思考块
export interface ThinkingMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.THINKING;
  content: string;
  visible?: boolean;
}

// 搜索结果块
export interface SearchResultMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.SEARCH_RESULT;
  query: string;
  results: SearchResult[];
  source: string;
}

// 知识库块
export interface KnowledgeMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.KNOWLEDGE;
  references: KnowledgeReference[];
}

// 联合类型
export type MessageBlock = 
  | MainTextMessageBlock
  | CodeMessageBlock
  | ImageMessageBlock
  | CitationMessageBlock
  | ErrorMessageBlock
  | ThinkingMessageBlock
  | SearchResultMessageBlock
  | KnowledgeMessageBlock;

// 引用类型
export interface Citation {
  number: number;
  url: string;
  title?: string;
  hostname?: string;
  content?: string;
  showFavicon?: boolean;
  type: 'websearch' | 'knowledge';
  metadata?: Record<string, unknown>;
}

// 搜索结果类型
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

// 知识库引用类型
export interface KnowledgeReference {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  score?: number;
}

// 消息接口
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content?: string; // 保持向后兼容
  blocks: string[]; // 消息块ID数组
  timestamp: Date;
  isGenerating?: boolean;
  
  // 扩展属性
  mentions?: Model[];
  multiModelMessageStyle?: MultiModelMessageStyle;
  foldSelected?: boolean;
  askId?: string; // 用于分组
  
  // Agent Plan 支持
  agentPlan?: {
    steps: import('./research').ResearchLangGraphStep[];
    currentStep?: string;
    status: 'running' | 'completed' | 'error';
    finalReport?: string;
  };
}

// 模型类型
export interface Model {
  id: string;
  name: string;
  provider: string;
}

// 多模型消息样式
export type MultiModelMessageStyle = 'fold' | 'horizontal' | 'vertical' | 'grid';

// LangGraph步骤类型（保持向后兼容）
export interface LangGraphStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: Record<string, unknown>[];
}

// 消息组类型
export interface MessageGroup {
  askId: string;
  messages: Message[];
  timestamp: Date;
}

// 消息容器Props
export interface MessageContainerProps {
  messages: Message[];
  blocks: Record<string, MessageBlock>;
  isLoading?: boolean;
  onMessageEdit?: (messageId: string, updates: Partial<Message>) => void;
  onBlockEdit?: (blockId: string, updates: Partial<MessageBlock>) => void;
}

// 消息显示选项
export interface MessageDisplayOptions {
  showTimestamp?: boolean;
  showAvatar?: boolean;
  showActions?: boolean;
  enableMarkdown?: boolean;
  enableCodeHighlight?: boolean;
  maxWidth?: string;
  density?: 'compact' | 'normal' | 'spacious';
} 