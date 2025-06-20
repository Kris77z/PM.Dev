// 研究相关类型定义
export interface LangGraphStep {
  type: 'step_start' | 'step_complete' | 'step_error' | 'step_progress';
  step: string;
  cycle: number;
  title: string;
  description: string;
  details?: string[];
  timestamp?: Date;
}

export interface ResearchSession {
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
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  // 支持 Agent Plan 渲染
  agentPlan?: {
    steps: LangGraphStep[];
    currentStep?: string;
    status: 'running' | 'completed' | 'error';
    finalReport?: string;
  };
}

export type ViewType = 'chat' | 'prompt-house' | 'prd-house' | 'prototype-house' | 'infinite-canvas' | 'agent-research'; 