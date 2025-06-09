import os
import json
from dotenv import load_dotenv
from googleapiclient.discovery import build

# It's recommended to load environment variables at the start of your application.
# This will be handled by main.py when running as a server.
# load_dotenv() is kept in the __main__ block below for direct testing of this file.

def google_web_search(search_queries: list[str], num_results: int = 5) -> list[dict]:
    """
    Performs a Google web search for each query and returns the results.

    Args:
        search_queries: A list of strings, where each string is a search query.
        num_results: The number of results to return for each query.

    Returns:
        A list of dictionaries, where each dictionary represents a search result
        and contains 'title', 'link', and 'snippet'.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    cse_id = os.getenv("GOOGLE_CSE_ID")

    if not api_key or not cse_id:
        raise ValueError("GOOGLE_API_KEY and GOOGLE_CSE_ID environment variables must be set.")

    all_results = []
    try:
        service = build("customsearch", "v1", developerKey=api_key)
        for query in search_queries:
            # --- Query Sanitization ---
            # The LLM might return queries with extraneous quotes (e.g., '"my query"').
            # We strip them to ensure cleaner search results.
            sanitized_query = query.strip().strip('"').strip("'")
            
            print(f"INFO: Performing web search for: '{sanitized_query}'")
            # https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
            res = service.cse().list(
                q=sanitized_query,
                cx=cse_id,
                num=num_results,
            ).execute()
            
            if 'items' in res:
                for item in res['items']:
                    all_results.append({
                        "title": item.get("title"),
                        "link": item.get("link"),
                        "snippet": item.get("snippet")
                    })
            print(f"INFO: Found {len(res.get('items', []))} results for query '{sanitized_query}'.")

    except Exception as e:
        print(f"ERROR: An error occurred during web search: {e}")
        # Depending on the desired behavior, you might want to handle this more gracefully.
        # For now, we'll just print the error and return what we have.
    
    return all_results

if __name__ == '__main__':
    # This is a simple test to check if the search function is working.
    # To run this, execute `python -m src.agent.tools` from the `backend` directory.
    
    # Load .env for direct script execution
    load_dotenv()

    try:
        print("--- Running Web Search Tool Test ---")
        test_queries = ["what is langgraph", "gemini 1.5 flash"]
        results = google_web_search(test_queries)
        
        if results:
            print(f"\nSuccessfully retrieved {len(results)} results in total.")
            for i, result in enumerate(results, 1):
                print(f"\nResult {i}:")
                print(json.dumps(result, indent=2))
        else:
            print("\nNo results found or an error occurred.")
            print("Please ensure your .env file is correctly set up with GOOGLE_API_KEY and GOOGLE_CSE_ID.")

    except Exception as e:
        print(f"\nAn error occurred during the test: {e}") 