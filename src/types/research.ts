// 研究相关类型定义
export interface ResearchLangGraphStep {
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
  steps: ResearchLangGraphStep[];
  finalReport?: string;
  report?: string;
  error?: string;
}

// 注意：Message 接口现在统一在 message.ts 中定义

export type ViewType = 'chat' | 'prompt-stash' | 'prd-house' | 'prototype-house' | 'infinite-canvas' | 'agent-research'; 