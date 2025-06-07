// src/types.ts

// Re-export PlannedPagesOutput from its original location if needed elsewhere,
// or duplicate the definition here if preferred for complete separation.
// For now, let's keep the import for consistency.
import { PlannedPagesOutput as ImportedPlannedPagesOutput } from '@/components/PagePlanningForm';

// Basic JSON value type
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

// Define types for the overall planning mode
export type PlanningMode = 'optimize' | 'newProduct' | null;

// Define types for the current step within a mode
export type CurrentForm =
    'product' | 'tech' | 'page' | 'completed' |
    'optimizeForm' | 'optimizeCompleted' |
    'addFeatureForm' | 'addFeatureTech' | 'addFeaturePage' | 'addFeatureCompleted' |
    null;

// General type for form answers using key-value pairs with JsonValue
export interface GenericAnswers {
  [key: string]: JsonValue;
}

// Type for planned page details - use the imported type
export type PlannedPagesOutput = ImportedPlannedPagesOutput;

// Type for optimization form answers
export interface OptimizationAnswers {
  platformType?: string;
  featureOrPageName?: string;
  hasPrd?: 'yes' | 'no';
  prdPathOrContent?: string;
  prdSummaryConfirmation?: string;
  problemDescription?: string;
  optimizationGoal?: string;
  proposedSolution?: string;
  techDiscussionPoints?: string;
}

// Type for add feature form answers
export interface AddFeatureAnswers {
  platformType?: string;
  featureNameAndPurpose?: string;
  hasPrd?: 'yes' | 'no';
  prdPathOrContent?: string;
  prdSummaryConfirmation?: string;
  featureGoalAndValue?: string;
  targetUsers?: string;
  coreWorkflow?: string;
  interactionWithExisting?: string;
  nextStepDecision?: string;
}

// Type encompassing answers from all potential steps in any flow
export interface FlowAnswers {
  product?: GenericAnswers;
  page?: PlannedPagesOutput;
  tech?: GenericAnswers;
  optimize?: OptimizationAnswers;
  addFeature?: AddFeatureAnswers;
  addFeatureTech?: GenericAnswers;
  addFeaturePage?: PlannedPagesOutput;
}

// Define types for AI interaction (consistent with ai.ts)
export type DocumentType =
    | 'product'
    | 'page'
    // | 'tech' // Deprecated
    | 'techStack'
    | 'backendStructure'
    | 'frontendGuidelines'
    | 'optimizePlan' // Example for optimize flow (ensure prompt exists)
    | 'addFeaturePlan' // Example for add feature flow (ensure prompt exists)
    | 'addFeatureTechPlan' // Example (ensure prompt exists)
    | 'addFeaturePagePlan'; // Example (ensure prompt exists)

// Interface for the data sent to the AI API (consistent with ai.ts)
export interface RequestData {
    answers: GenericAnswers | PlannedPagesOutput | OptimizationAnswers | AddFeatureAnswers; // Use specific types based on DocumentType
    // Include other relevant context if needed
}