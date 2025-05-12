// src/lib/documentGenerator.ts
import { FlowAnswers, DocumentType, RequestData } from '../types'; // Import shared types from the file you just created
import { callAIApi } from './ai'; // Import the AI call function

/**
 * Generates documents based on the collected flow answers.
 * This function is designed to be reusable across different pages/components.
 *
 * @param flowAnswers - An object containing answers from various steps of a planning flow (using types from src/types.ts).
 * @returns A promise that resolves to an object containing:
 *          - generatedDocsMap: A Map where keys are filenames and values are the generated content (string) or null if generation failed.
 *          - errors: An array of error messages encountered during generation.
 */
export const generateAllDocuments = async (
    flowAnswers: FlowAnswers
): Promise<{ generatedDocsMap: Map<string, string | null>; errors: string[] }> => {

    const generatedDocsMap = new Map<string, string | null>();
    const errors: string[] = [];
    const tasks: Promise<void>[] = [];

    console.log("Starting document generation with answers:", flowAnswers); // For debugging

    // Helper function to generate a single document and handle errors/logging
    const generateSingleDoc = async (docType: DocumentType, filename: string, data: RequestData) => {
        try {
            console.log(`Generating ${filename} using type ${docType}...`); // Log which doc type is used
            const content = await callAIApi(docType, data);
            generatedDocsMap.set(filename, content || null); // Store content or null if AI returns nothing
            if (!content) {
                errors.push(`${filename} 文档生成失败 (AI未返回内容)`);
            }
        } catch (e: unknown) {
            generatedDocsMap.set(filename, null); // Mark as failed on error
            errors.push(`${filename} 文档生成错误: ${e instanceof Error ? e.message : String(e)}`);
            console.error(`Error generating ${filename}:`, e); // Log the detailed error
        }
    };

    // --- Create generation tasks based on available answers in flowAnswers ---

    // New Product Flow Documents
    if (flowAnswers.product) {
        tasks.push(generateSingleDoc('product', 'PRODUCT_DEFINITION.md', { answers: flowAnswers.product }));
    }
    if (flowAnswers.page) {
        // Ensure the 'answers' structure matches what the 'page' prompt expects
        tasks.push(generateSingleDoc('page', 'APP_FLOW.md', { answers: flowAnswers.page }));
    }
    if (flowAnswers.tech) {
        // Generate the specific technical documents based on tech answers
        tasks.push(generateSingleDoc('techStack', 'TECH_STACK.md', { answers: flowAnswers.tech }));
        tasks.push(generateSingleDoc('backendStructure', 'BACKEND_STRUCTURE.md', { answers: flowAnswers.tech }));
        tasks.push(generateSingleDoc('frontendGuidelines', 'FRONTEND_GUIDELINES.md', { answers: flowAnswers.tech }));
    }

    // Optimize Flow Document (Placeholder - requires specific DocumentType and prompt)
    if (flowAnswers.optimize) {
        // Example: assumes 'optimizePlan' type and corresponding prompt exist
        // tasks.push(generateSingleDoc('optimizePlan', 'OPTIMIZATION_PLAN.md', { answers: flowAnswers.optimize }));
        console.warn("Optimize flow document generation is not yet fully configured in generateAllDocuments.");
    }

    // Add Feature Flow Documents (Placeholders - require specific DocumentTypes and prompts)
    if (flowAnswers.addFeature) {
        // Example: assumes 'addFeaturePlan' type exists
        // tasks.push(generateSingleDoc('addFeaturePlan', 'ADD_FEATURE_PLAN.md', { answers: flowAnswers.addFeature }));
        console.warn("Add Feature definition document generation is not yet fully configured.");
    }
    if (flowAnswers.addFeatureTech) {
        // Example: assumes 'addFeatureTechPlan' type exists
        // tasks.push(generateSingleDoc('addFeatureTechPlan', 'ADD_FEATURE_TECH_PLAN.md', { answers: flowAnswers.addFeatureTech }));
         console.warn("Add Feature tech plan document generation is not yet fully configured.");
    }
     if (flowAnswers.addFeaturePage) {
        // Example: assumes 'addFeaturePagePlan' type exists
        // tasks.push(generateSingleDoc('addFeaturePagePlan', 'ADD_FEATURE_PAGE_PLAN.md', { answers: flowAnswers.addFeaturePage }));
         console.warn("Add Feature page plan document generation is not yet fully configured.");
     }

    // Run all generation tasks concurrently
    try {
        await Promise.all(tasks);
        console.log("All AI generation tasks finished.");
    } catch (error) {
        // Although individual errors are caught in generateSingleDoc,
        // catch potential errors from Promise.all itself (less likely here).
        console.error("Error during Promise.all execution:", error);
        errors.push(`并发任务执行出错: ${error instanceof Error ? error.message : String(error)}`);
    }


    return { generatedDocsMap, errors };
};