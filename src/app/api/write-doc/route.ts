import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the expected request body structure
interface WriteDocRequestBody {
    filename: string;
    content: string;
    // Optional: specify a subdirectory within docs?
    // directory?: string;
}

// Define the target directory relative to the project root
// IMPORTANT: Ensure this path is correct and writable by the server process
const DOCS_DIR = path.resolve(process.cwd(), 'docs');

export async function POST(request: Request) {
    try {
        // 1. Parse request body
        const body = await request.json();
        const { filename, content } = body as WriteDocRequestBody;

        // 2. Validate input
        if (!filename || typeof filename !== 'string' || !content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Invalid request body: filename and content are required strings.' }, { status: 400 });
        }

        // Basic sanitization: prevent path traversal, allow only .md extension
        const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '');
        if (!sanitizedFilename.endsWith('.md') || sanitizedFilename === '.md') {
             return NextResponse.json({ error: 'Invalid filename: Must end with .md and contain valid characters.' }, { status: 400 });
        }

        // 3. Construct the full path
        const filePath = path.join(DOCS_DIR, sanitizedFilename);

        // Security check: Ensure the final path is still within the intended docs directory
        if (!filePath.startsWith(DOCS_DIR)) {
             console.error(`Attempted path traversal: ${filePath}`);
             return NextResponse.json({ error: 'Invalid filename path.' }, { status: 400 });
        }

        // 4. Ensure the docs directory exists
        try {
            await fs.mkdir(DOCS_DIR, { recursive: true });
            console.log(`Ensured directory exists: ${DOCS_DIR}`);
        } catch (mkdirError: unknown) {
            console.error(`Error creating directory ${DOCS_DIR}:`, mkdirError);
            const message = mkdirError instanceof Error ? mkdirError.message : String(mkdirError);
            return NextResponse.json({ error: `Server error: Could not create storage directory. ${message}` }, { status: 500 });
        }

        // 5. Write the file
        try {
            await fs.writeFile(filePath, content, 'utf8');
            console.log(`Successfully wrote file: ${filePath}`);
            return NextResponse.json({ message: `File ${sanitizedFilename} saved successfully.` });
        } catch (writeError: unknown) {
            console.error(`Error writing file ${filePath}:`, writeError);
            const message = writeError instanceof Error ? writeError.message : String(writeError);
            return NextResponse.json({ error: `Server error: Could not write file. ${message}` }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error('Error in /api/write-doc route:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        // Check if it's a JSON parsing error
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
} 