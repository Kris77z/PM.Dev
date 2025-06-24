// 统一导出所有PRD相关提示词

export {
  getUserScenariosPrompt,
  getRequirementGoalPrompt,
  getCompetitorAnalysisPrompt,
  getFeatureSuggestionPrompt,
  getBusinessLogicPrompt,
  getEdgeCasesPrompt,
  getReviewPrompt,
  getPRDGenerationPrompt
} from './prd-prompts';

export type {
  PRDFormData,
  ReviewData,
  PRDGenerationData,
  UserScenariosData,
  RequirementGoalData,
  CompetitorAnalysisData,
  FeatureSuggestionData,
  BusinessLogicData,
  EdgeCasesData
} from './types'; 