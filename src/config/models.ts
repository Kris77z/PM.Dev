// 多模型配置文件
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  headers?: Record<string, string>;
  supportsStreaming: boolean;
  hasWebSearch?: boolean;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai-proxy',
    apiKey: process.env.GPT4O_API_KEY || '',
    baseUrl: process.env.GPT4O_BASE_URL || 'https://gpt.co.link/openai/v1',
    model: 'gpt-4o',
    headers: {
      'x-auth-key': process.env.GPT4O_API_KEY || '',
    },
    supportsStreaming: true,
    hasWebSearch: false, // 基础版本不支持搜索
  },
  'gpt-4o-search': {
    id: 'gpt-4o-search',
    name: 'GPT-4o Search (🔍 专业搜索)',
    provider: 'openai-proxy',
    apiKey: process.env.GPT4O_API_KEY || '',
    baseUrl: process.env.GPT4O_BASE_URL || 'https://gpt.co.link/openai/v1',
    model: 'gpt-4o-search-preview',
    headers: {
      'x-auth-key': process.env.GPT4O_API_KEY || '',
    },
    supportsStreaming: true,
    hasWebSearch: true, // 专门为搜索优化的模型
  },
  'gpt-4.5-preview': {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview (🆕 最新预览)',
    provider: 'openai-proxy',
    apiKey: process.env.GPT4O_API_KEY || '',
    baseUrl: process.env.GPT4O_BASE_URL || 'https://gpt.co.link/openai/v1',
    model: 'gpt-4.5-preview',
    headers: {
      'x-auth-key': process.env.GPT4O_API_KEY || '',
    },
    supportsStreaming: true,
    hasWebSearch: false, // 预览版，搜索功能待确认
  },
  'gpt-4.1': {
    id: 'gpt-4.1',
    name: 'GPT-4.1 (🚀 最新正式版)',
    provider: 'openai-proxy',
    apiKey: process.env.GPT4O_API_KEY || '',
    baseUrl: process.env.GPT4O_BASE_URL || 'https://gpt.co.link/openai/v1',
    model: 'gpt-4.1',
    headers: {
      'x-auth-key': process.env.GPT4O_API_KEY || '',
    },
    supportsStreaming: true,
    hasWebSearch: true, // 根据OpenAI文档，4.1支持Responses API web search
  },
  'o3-mini': {
    id: 'o3-mini',
    name: 'o3-mini (🎯 推理专家)',
    provider: 'openai-proxy',
    apiKey: process.env.GPT4O_API_KEY || '',
    baseUrl: process.env.GPT4O_BASE_URL || 'https://gpt.co.link/openai/v1',
    model: 'o3-mini',
    headers: {
      'x-auth-key': process.env.GPT4O_API_KEY || '',
    },
    supportsStreaming: true,
    hasWebSearch: false, // o3系列专注推理，可能不支持搜索
  },
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude-3.5-Sonnet',
    provider: 'anthropic-proxy',
    apiKey: process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.CLAUDE_BASE_URL || process.env.OPENAI_BASE_URL || 'http://bedroc-proxy-dh1fsjo6ma3a-1005305369.us-east-1.elb.amazonaws.com/api/v1',
    model: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    supportsStreaming: true,
    hasWebSearch: true, // Claude 3.5支持Web Search API
  },
  'claude-3.7-sonnet': {
    id: 'claude-3.7-sonnet',
    name: 'Claude-3.7-Sonnet (🆕 最新)',
    provider: 'anthropic-proxy',
    apiKey: process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.CLAUDE_BASE_URL || process.env.OPENAI_BASE_URL || 'http://bedroc-proxy-dh1fsjo6ma3a-1005305369.us-east-1.elb.amazonaws.com/api/v1',
    model: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    supportsStreaming: true,
    hasWebSearch: true, // Claude 3.7应该支持更好的Web Search
  },
  'claude-4-opus': {
    id: 'claude-4-opus',
    name: 'Claude-4-Opus (🚀 全新一代)',
    provider: 'anthropic-proxy',
    apiKey: process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.CLAUDE_BASE_URL || process.env.OPENAI_BASE_URL || 'http://bedroc-proxy-dh1fsjo6ma3a-1005305369.us-east-1.elb.amazonaws.com/api/v1',
    model: 'us.anthropic.claude-opus-4-20250514-v1:0',
    supportsStreaming: true,
    hasWebSearch: true, // Claude 4应该有最强的Web Search能力
  },
  'claude-4-sonnet': {
    id: 'claude-4-sonnet',
    name: 'Claude-4-Sonnet (🚀 全新一代)',
    provider: 'anthropic-proxy',
    apiKey: process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.CLAUDE_BASE_URL || process.env.OPENAI_BASE_URL || 'http://bedroc-proxy-dh1fsjo6ma3a-1005305369.us-east-1.elb.amazonaws.com/api/v1',
    model: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    supportsStreaming: true,
    hasWebSearch: true, // Claude 4应该有最强的Web Search能力
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash',
    supportsStreaming: true,
    hasWebSearch: true, // Gemini 2.0支持Google Search Grounding
  },
  // Gemini 2.5 系列模型
  'gemini-2.5-flash-preview-05-20': {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash Preview',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash-preview-05-20',
    supportsStreaming: true,
    hasWebSearch: true,
  },
  'gemini-2.5-pro-preview-06-05': {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro Preview',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-pro-preview-06-05',
    supportsStreaming: true,
    hasWebSearch: true,
  },
  // Gemini 2.0 其他版本
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash-exp',
    supportsStreaming: true,
    hasWebSearch: true,
  },
  'gemini-2.0-flash-thinking-exp': {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking Experimental',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash-thinking-exp',
    supportsStreaming: true,
    hasWebSearch: true,
  },
  'gemini-2.0-pro-exp-02-05': {
    id: 'gemini-2.0-pro-exp-02-05',
    name: 'Gemini 2.0 Pro Experimental',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-pro-exp-02-05',
    supportsStreaming: true,
    hasWebSearch: true,
  },
  'gemini-exp-1206': {
    id: 'gemini-exp-1206',
    name: 'Gemini Experimental 1206',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-exp-1206',
    supportsStreaming: true,
    hasWebSearch: true,
  },
  'gemini-2.0-flash-preview-image-generation': {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Image Generation',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash-preview-image-generation',
    supportsStreaming: true,
    hasWebSearch: false, // 图像生成专用模型
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek: R1 0528',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-r1-0528:free',
    supportsStreaming: true,
    hasWebSearch: false, // DeepSeek暂不支持网络搜索
  },
};

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gpt-4o';

export function getModelConfig(modelId: string): ModelConfig | null {
  return MODEL_CONFIGS[modelId] || null;
}

export function getAllModels(): ModelConfig[] {
  return Object.values(MODEL_CONFIGS);
}

export function isModelAvailable(modelId: string): boolean {
  const config = getModelConfig(modelId);
  return config !== null && config.apiKey !== '';
} 