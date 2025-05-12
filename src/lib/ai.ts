// src/lib/ai.ts
import { DocumentType, RequestData } from '../types'; // Import shared types (JsonValue removed as unused)
import { getPrompt } from './prompts'; // Assuming you have a function to get the correct prompt
import type { Message } from './prompts'; // Import the Message type definition

/**
 * Calls the backend API to generate content using AI.
 *
 * @param docType - The type of document to generate (using the shared DocumentType from src/types.ts).
 * @param data - The data payload containing answers and potentially other context (using shared RequestData from src/types.ts).
 * @returns A promise that resolves to the generated content (string) or null/undefined if generation fails.
 */
export const callAIApi = async (docType: DocumentType, data: RequestData): Promise<string | null | undefined> => {
    console.log(`callAIApi called for docType: ${docType}`); // Log the call

    // 1. Get the appropriate prompt messages based on docType and data
    const messages: Message[] | null = getPrompt(docType, data); // Pass both arguments
    if (!messages) {
        console.error(`Error: Could not generate prompt messages for document type "${docType}"`);
        throw new Error(`Prompt messages for document type "${docType}" could not be generated.`);
    }

    // --- Prompt Formatting/Templating Logic ---
    // Find the 'user' message content, which usually contains the template + data
    const userMessage = messages.find(msg => msg.role === 'user');
    if (!userMessage) {
         console.error(`Error: No 'user' role message found in prompt structure for "${docType}"`);
         throw new Error(`Prompt structure for "${docType}" is missing a user message.`);
    }

    // NOTE: The current `prompts.ts` structure already includes the JSON data within the user message content.
    // Therefore, the simple `.replace('{{answers}}', ...)` logic below is likely REDUNDANT
    // because the data is already embedded in the template string fetched by getPrompt.
    // If your prompts relied on simple {{placeholder}} replacement *before* data was stringified
    // *inside* getPrompt, you would need a different templating approach here.
    // For now, we assume the messages from getPrompt are ready to be sent.

    /* --- Removed Redundant Formatting Logic ---
    let formattedUserContent = userMessage.content;
    // Basic substitution - replace placeholders like {{answers}} or specific keys
    if (typeof data.answers === 'object' && data.answers !== null) {
       // Example: Replace a generic placeholder (IF the prompt template actually uses it)
       // formattedUserContent = formattedUserContent.replace('{{answers}}', JSON.stringify(data.answers, null, 2));
    } else {
       // Handle cases where answers might not be an object
       // formattedUserContent = formattedUserContent.replace('{{answers}}', String(data.answers));
    }
    // --- End of Removed Logic --- */


    // 3. Prepare the request body for your API endpoint using the message structure
    //    Your /api/generate endpoint should be designed to handle this message array format.
    const requestBody = {
        messages: messages, // Send the entire message array
        // Include any other parameters your API endpoint needs (e.g., model, temperature)
        // model: "gpt-4-turbo", // Example
    };

    console.log(`Sending request to /api/generate with messages for ${docType}`);
    // console.log("User Message Content Snippet:", userMessage.content.substring(0, 200) + "..."); // Log snippet

    try {
        // 4. Make the API call to your backend endpoint
        const response = await fetch('/api/ai', { // Ensure this endpoint expects a 'messages' array
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        // 5. Handle the response
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error Response (Status ${response.status}):`, errorBody);
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // 6. Extract and return the generated content
        //    Adjust '.content' or '.message.content' based on your actual API response structure
        if (result && result.content && typeof result.content === 'string') { // Simple case: { content: "..." }
            console.log(`Successfully received content for ${docType}`);
            return result.content;
        } else if (result && result.message && typeof result.message.content === 'string') { // Common case for chat models: { message: { role: 'assistant', content: "..." } }
             console.log(`Successfully received message content for ${docType}`);
             return result.message.content;
        } else {
            console.warn(`API response for ${docType} did not contain expected content structure. Response:`, result);
            return null; // Or handle as appropriate
        }

    } catch (error) {
        console.error(`Error calling AI API for ${docType}:`, error);
        throw error; // Re-throw
    }
};