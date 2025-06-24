// 提示词数据类型定义

export interface PRDFormData {
  answers: { [key: string]: string };
  changeRecords?: unknown[];
  userScenarios?: unknown[];
  iterationHistory?: unknown[];
  competitors?: unknown[];
  requirementSolution?: unknown;
}

export type ReviewData = PRDFormData;

export type PRDGenerationData = PRDFormData;

export interface UserScenariosData {
  businessLine?: string;
  requirementIntro: string;
}

export interface RequirementGoalData {
  businessLine?: string;
  requirementIntro: string;
  userScenarios: unknown[];
}

export interface CompetitorAnalysisData {
  businessLine?: string;
  requirementIntro: string;
  requirementGoal?: string;
}

export interface FeatureSuggestionData {
  requirement: string;
  userScenarios?: unknown[];
  competitorAnalysis?: string;
}

export interface BusinessLogicData {
  featureName: string;
  requirement?: string;
}

export interface EdgeCasesData {
  featureName: string;
  businessLogic?: string;
} 