// src/app/api/ai/route.ts
import { NextResponse } from 'next/server';
import { type Message } from '../../../lib/prompts'; // Import Message type

// Import necessary functions or SDKs to call your actual AI service
// Example for OpenAI (ensure you have 'openai' package installed):
import OpenAI from 'openai';

// Initialize AI client for OpenRouter
// Ensure API keys and base URLs are securely managed (e.g., environment variables)
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Your OpenRouter API Key from .env.local
  baseURL: 'https://openrouter.ai/api/v1', // OpenRouter API base URL
  // defaultHeaders: { // Optional: Some models might require specific headers
  //   "HTTP-Referer": "YOUR_SITE_URL", // Replace with your actual site URL if required by OpenRouter
  //   "X-Title": "YOUR_APP_NAME", // Replace with your app name if required
  // },
});

// Define a more specific type for API errors to avoid using 'any'
interface ApiError extends Error {
  status?: number;
  message: string; // Error interface already has message, but we ensure it here
}

export async function POST(request: Request) {
  console.log("Received POST request at /api/ai"); // Log entry into the function
  let modelToUse = ""; // Declare modelToUse here to make it accessible in catch block

  try {
    // 1. Parse the request body to get the messages
    const body = await request.json();
    const messages: Message[] = body.messages; // Assuming frontend sends { messages: [...] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("API Route Error: Invalid or missing 'messages' in request body.");
      return NextResponse.json({ error: 'Missing or invalid messages in request body' }, { status: 400 });
    }

    console.log(`API Route: Received ${messages.length} messages. First message role: ${messages[0]?.role}`);
    // console.log("API Route DEBUG: Received messages structure:", JSON.stringify(messages, null, 2)); // Deeper debug if needed


    // -------------------------------------------------------------------------
    // --- Actual AI service call using OpenRouter ---
    // -------------------------------------------------------------------------
    modelToUse = "deepseek/deepseek-chat-v3-0324:free"; // Your specified OpenRouter model
    console.log(`API Route: Calling OpenRouter API (${openai.baseURL}) with model ${modelToUse}`);

    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: messages,
      // Add other parameters like temperature, max_tokens etc. if needed
      // For example:
      // temperature: 0.7,
      // max_tokens: 1500,
    });

    console.log("API Route: OpenRouter API Response Status: OK"); // Assuming success if no error thrown

    const aiContent = completion.choices[0]?.message?.content;

    if (!aiContent) {
        console.error("API Route Error: AI service did not return content.");
        throw new Error("AI service response did not contain content.");
    }
    console.log("API Route: Successfully received content from AI.");
    // -------------------------------------------------------------------------
    // --- End of AI service call section ---
    // -------------------------------------------------------------------------


    // 3. Return the AI's response content in the expected format
    //    Adjust the response structure if your frontend expects something different than { message: { content: ... } }
    return NextResponse.json({ message: { content: aiContent } }, { status: 200 });

  } catch (error: unknown) {
    console.error("API Route Error (/api/ai):", error); // Log the detailed error
    // Return a generic server error response
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
        // Check if it's an API error from OpenAI/OpenRouter library
        const apiError = error as ApiError; // Use the defined ApiError interface
        if (apiError.status === 401) {
            errorMessage = "Authentication error. Please check your OpenRouter API key (OPENROUTER_API_KEY in .env.local) and ensure it's correctly set and your Next.js server has been restarted.";
        } else if (apiError.status === 429) {
            errorMessage = "Rate limit exceeded or quota finished for the model on OpenRouter. Please check your OpenRouter account or try a different model.";
        } else if (apiError.status === 400 && apiError.message?.includes("model_not_found")) {
            errorMessage = `The model '${modelToUse}' was not found on OpenRouter. Please verify the model identifier.`;
        }
    }
    
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}

// Optional: Handle other methods if needed, otherwise they default to 405
// export async function GET(request: Request) {
//   return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
// }