import {NextRequest, NextResponse} from "next/server";
import {anthropic} from "@ai-sdk/anthropic";
import {CoreMessage, streamText} from "ai";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const {answers, chapters} = await req.json();

        // 1. 构建 Prompt
        const prompt = buildPrompt(answers, chapters);

        // 2. 调用 AI
        const result = await streamText({
            model: anthropic('claude-3-5-sonnet-20240620'),
            system: `You are a world-class senior product manager. Your task is to take the user's fragmented answers and a standard PRD template structure, and compile them into a professional, well-written, and complete Product Requirement Document (PRD) in Markdown format.

Key requirements:
- Strictly follow the provided chapter structure.
- Ensure the language is professional, clear, and concise.
- Elaborate on the user's points where necessary to ensure completeness and readability, but do not invent new requirements.
- The output must be a single, complete Markdown document.
- Use Chinese for the entire document.`,
            messages: [{role: 'user', content: prompt}] as CoreMessage[],
        });

        // 3. 返回流式响应
        return result.toAIStreamResponse();

    } catch (error) {
        console.error("Error generating PRD:", error);
        return NextResponse.json({error: "Failed to generate PRD"}, {status: 500});
    }
}

interface Question {
  id: string;
  text: string;
}

interface Chapter {
  title: string;
  questions: Question[];
}

function buildPrompt(answers: { [key: string]: string }, chapters: Chapter[]): string {
    let markdown = `# 功能迭代产品需求文档 (PRD)\n\n`;

    chapters.forEach(chapter => {
        markdown += `## ${chapter.title}\n\n`;

        chapter.questions.forEach((question) => {
            const answer = answers[question.id] || '用户未填写';
            markdown += `### ${question.text}\n\n`;
            markdown += `${answer}\n\n`;
        });
    });

    return `
Here is the user's input, structured by chapters. Please synthesize this into a complete and professional PRD document in Markdown format.

---
${markdown}
---
`;
} 