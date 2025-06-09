import asyncio
import json
import uvicorn
from dotenv import load_dotenv

# --- IMPORTANT ---
# Load environment variables FIRST, before any other application modules are imported.
# This ensures that settings like HTTPS_PROXY are available globally when modules
# like `graph.py` are initialized and try to create network clients.
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent.graph import build_graph
from agent.state import ResearchState

# --- App Setup ---
app = FastAPI(
    title="AI Research Agent API",
    description="An API for running a multi-step research agent.",
    version="0.1.0",
)

# CORS (Cross-Origin Resource Sharing)
# Allows our frontend (running on a different port) to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you should restrict this to your frontend's domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request Body ---
class ResearchRequest(BaseModel):
    query: str

# --- Build the Research Agent Graph ---
# We build the graph once when the server starts.
try:
    research_agent = build_graph()
except Exception as e:
    print(f"FATAL: Could not build research agent graph. Shutting down. Error: {e}")
    research_agent = None

# --- API Endpoints ---

@app.get("/", summary="Health check endpoint")
def read_root():
    """A simple health check endpoint to confirm the server is running."""
    return {"status": "ok", "message": "Welcome to the AI Research Agent API!"}


@app.post("/research", summary="Start a research task and stream results")
async def research(request: ResearchRequest):
    """
    Accepts a research query and streams the agent's progress back to the client
    using Server-Sent Events (SSE).
    """
    if not research_agent:
        return {"error": "Research agent is not available."}

    query = request.query
    initial_state: ResearchState = {"user_query": query}

    async def event_stream():
        """The generator function that yields events for the SSE stream."""
        try:
            # astream() is the async version of stream()
            async for step in research_agent.astream(initial_state):
                step_name, step_state = list(step.items())[0]
                
                # We can filter or format what we send to the frontend
                # For now, we'll send a simplified version of the state for each step.
                event_data = {
                    "step": step_name,
                    "details": f"Processing step: {step_name}",
                    # You can add more specific data from step_state if needed
                    # e.g., "queries": step_state.get("search_queries")
                }
                
                # SSE format: "data: <json_string>\n\n"
                yield f"data: {json.dumps(event_data)}\n\n"
                await asyncio.sleep(0.1) # Small delay
            
            # A final event to signal completion
            final_report = step_state.get("report", "Report could not be generated.")
            final_event = {"step": "complete", "report": final_report}
            yield f"data: {json.dumps(final_event)}\n\n"

        except Exception as e:
            print(f"Error during research stream: {e}")
            error_event = {"step": "error", "details": str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# --- Main execution ---
if __name__ == "__main__":
    # This allows you to run the server directly for testing.
    # `uvicorn src.main:app --reload --port 8000`
    uvicorn.run(app, host="0.0.0.0", port=8000) 