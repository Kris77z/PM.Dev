export type WorkflowStage = 'welcome' | 'guiding' | 'ai-review' | 'prd-generation' | 'completed';

export type ViewMode = 'single' | 'overview';

export interface Question {
  id: string;
  text: string;
  placeholder?: string;
  hint?: string;
  isOptional?: boolean;
  type?: 'text' | 'select' | 'input' | 'section_header' | 'dynamic-user-scenarios' | 'dynamic-iteration-history' | 'ai-competitor' | 'priority-select' | 'dynamic-requirement-solution';
  options?: string[];
  gridColumn?: string;
  isRequired?: boolean;
  hasAI?: boolean;
  aiPrompt?: string;
  isAIGenerated?: boolean;
}

export interface PrdChapter {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface ChangeRecord {
  version: string;
  modifier: string;
  content: string;
  reason: string;
  date: string;
}

export interface UserScenario {
  userType: string;
  scenario: string;
  painPoint: string;
}

export interface IterationHistory {
  version: string;
  date: string;
  content: string;
  author: string;
}

export interface CompetitorItem {
  name: string;
  features: string;
  advantages: string;
  disadvantages: string;
  marketPosition: string;
}

export interface RequirementItem {
  name: string;
  features: string;
  businessLogic: string;
  dataRequirements: string;
  edgeCases: string;
  painPoints: string;
  modules: string;
  priority: 'High' | 'Middle' | 'Low';
  openIssues: string;
}

export interface RequirementSolution {
  sharedPrototype: string;
  requirements: RequirementItem[];
}

export interface ContentReview {
  score: number;
  isReadyForGeneration: boolean;
  issues?: Array<{
    level: 'error' | 'warning' | 'info';
    field: string;
    message: string;
    suggestion: string;
  }>;
  summary: string;
  recommendations?: string[];
}

export interface FeatureSuggestion {
  featureName: string;
  description: string;
  workflow: string;
  value: string;
}

export interface EdgeCaseSuggestion {
  category: string;
  scenario: string;
  issue: string;
  solution: string;
}

export interface PRDState {
  answers: { [key: string]: string };
  changeRecords: ChangeRecord[];
  userScenarios: UserScenario[];
  iterationHistory: IterationHistory[];
  competitors: CompetitorItem[];
  requirementSolution: RequirementSolution;
  contentReview: ContentReview | null;
  generatedPRD: string;
} 