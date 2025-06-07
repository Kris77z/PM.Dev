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
  },
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude-3.5-Sonnet',
    provider: 'anthropic-proxy',
    apiKey: process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.CLAUDE_BASE_URL || process.env.OPENAI_BASE_URL || 'http://bedroc-proxy-dh1fsjo6ma3a-1005305369.us-east-1.elb.amazonaws.com/api/v1',
    model: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    supportsStreaming: true,
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash',
    supportsStreaming: true,
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek: R1 0528',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-r1-0528:free',
    supportsStreaming: true,
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