import os
import json
import httpx
from langgraph.graph import StateGraph, END

from .state import ResearchState
from .prompts import GENERATE_QUERIES_PROMPT, REFLECT_PROMPT, GENERATE_REPORT_PROMPT
from .tools import google_web_search

# --- Custom Gemini API Caller ---

def invoke_gemini_api(prompt: str, temperature: float = 0.0, is_json: bool = False) -> str:
    """
    Directly calls the Google Gemini API using httpx, bypassing langchain's client.
    This provides full control over the request, including proxy and timeout settings.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    proxy_url = os.getenv("HTTPS_PROXY")
    
    # Use httpx.HTTPTransport to explicitly set the proxy. This is a more robust method.
    transport = httpx.HTTPTransport(proxy=proxy_url) if proxy_url else None
    
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")

    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
        }
    }
    if is_json:
        request_body["generationConfig"]["responseMimeType"] = "application/json"

    try:
        # Pass the transport to the client
        with httpx.Client(transport=transport, timeout=60.0) as client:
            response = client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
                json=request_body,
            )
            response.raise_for_status()
            
            response_json = response.json()
            return response_json["candidates"][0]["content"]["parts"][0]["text"]

    except httpx.RequestError as e:
        print(f"ERROR: An HTTP request error occurred: {e}")
        return f"Error: The request to Gemini API failed. Details: {e}"
    except Exception as e:
        print(f"ERROR: A general error occurred in invoke_gemini_api: {e}")
        return f"Error: An unexpected error occurred. Details: {e}"

# --- NODE DEFINITIONS ---

def generate_queries_node(state: ResearchState) -> ResearchState:
    """
    Generates search queries using our custom API caller.
    Also responsible for initializing or incrementing the cycle count.
    """
    print("--- 步骤 1: 生成搜索查询 ---")
    
    # Initialize or increment cycle_count
    cycle_count = state.get('cycle_count', 0) + 1
    print(f"当前研究循环次数: {cycle_count}")
    
    # Send step start signal
    step_info = {
        "type": "step_start",
        "step": "query-generation",
        "cycle": cycle_count,
        "title": "生成搜索查询",
        "description": f"正在分析研究主题并生成第{cycle_count}轮搜索查询..."
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    prompt = GENERATE_QUERIES_PROMPT.format(
        user_query=state["user_query"],
        critique=state.get("critique", "N/A")
    )
    
    print("INFO: Calling custom Gemini API to generate queries...")
    response_text = invoke_gemini_api(prompt)
    print(f"INFO: Received response from Gemini API: {response_text[:100]}...")
    
    if response_text.startswith("Error:"):
        # Send step error signal
        error_info = {
            "type": "step_error",
            "step": "query-generation",
            "cycle": cycle_count,
            "title": "查询生成失败",
            "description": f"生成搜索查询时发生错误：{response_text}"
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "is_complete": True, "report": response_text}

    queries = [q for q in response_text.strip().split('\n') if q]
    print(f"生成的查询: {queries}")

    if "COMPLETED" in queries:
        # Send step complete signal
        complete_info = {
            "type": "step_complete",
            "step": "query-generation",
            "cycle": cycle_count,
            "title": "查询生成完成",
            "description": "研究已达到完成条件，准备生成最终报告",
            "details": ["研究信息已充足", "跳过进一步搜索", "开始报告生成"]
        }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        return {**state, "is_complete": True}
    
    # Send step complete signal with queries
    complete_info = {
        "type": "step_complete",
        "step": "query-generation",
        "cycle": cycle_count,
        "title": "查询生成完成",
        "description": f"成功生成{len(queries)}个搜索查询",
        "details": [f"查询 {i+1}: {q}" for i, q in enumerate(queries)]
    }
    print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        
    return {**state, "search_queries": queries, "cycle_count": cycle_count}

def web_search_node(state: ResearchState) -> ResearchState:
    """
    Performs web searches using the generated queries. This is now more robust.
    """
    print("--- 步骤 2: 执行网络搜索 ---")
    
    cycle_count = state.get('cycle_count', 1)
    
    # Send step start signal
    step_info = {
        "type": "step_start",
        "step": "search",
        "cycle": cycle_count,
        "title": "执行网络搜索",
        "description": f"正在执行第{cycle_count}轮网络搜索，获取最新信息..."
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    if not state.get("search_queries"):
        print("INFO: No search queries found in state, skipping web search.")
        error_info = {
            "type": "step_error",
            "step": "search",
            "cycle": cycle_count,
            "title": "搜索失败",
            "description": "未找到搜索查询，跳过网络搜索"
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return state
        
    queries = state["search_queries"]
    results = google_web_search(queries, num_results=5)
    print(f"搜索到 {len(results)} 条结果")
    
    # Send step complete signal
    complete_info = {
        "type": "step_complete",
        "step": "search",
        "cycle": cycle_count,
        "title": "网络搜索完成",
        "description": f"成功搜索{len(queries)}个查询，获得{len(results)}条结果",
        "details": [f"查询: {q}" for q in queries] + [f"共找到 {len(results)} 条相关结果"]
    }
    print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
    
    return {**state, "search_results": results}

def reflect_node(state: ResearchState) -> ResearchState:
    """
    Analyzes search results using our custom API caller, now with cycle count awareness.
    """
    print("--- 步骤 3: 反思与批判 ---")
    
    cycle_count = state.get('cycle_count', 1)
    
    # Send step start signal
    step_info = {
        "type": "step_start",
        "step": "reflection",
        "cycle": cycle_count,
        "title": "反思和分析",
        "description": f"正在分析第{cycle_count}轮搜索结果，评估信息完整性..."
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    # --- Optimization: Limit results for reflection ---
    # To prevent overwhelming the model with too much text, 
    # we'll only pass the top N results for its critique.
    all_results = state.get("search_results", [])
    top_results_for_reflection = all_results[:7]
    
    prompt = REFLECT_PROMPT.format(
        user_query=state["user_query"],
        cycle_count=state["cycle_count"],
        search_results=json.dumps(top_results_for_reflection, indent=2)
    )
    
    print(f"INFO: Reflecting on the top {len(top_results_for_reflection)} of {len(all_results)} results (Cycle: {state['cycle_count']})...")
    print("INFO: Calling custom Gemini API for reflection...")
    reflection_text = invoke_gemini_api(prompt, is_json=True)
    print(f"INFO: Received reflection from Gemini API: {reflection_text[:100]}...")

    if reflection_text.startswith("Error:"):
        error_info = {
            "type": "step_error",
            "step": "reflection",
            "cycle": cycle_count,
            "title": "反思分析失败",
            "description": f"分析搜索结果时发生错误：{reflection_text}"
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "critique": reflection_text, "is_complete": False}
    
    try:
        reflection_json = json.loads(reflection_text)
        critique = reflection_json.get("critique", "No critique provided.")
        next_step = reflection_json.get("next_step", "continue")
        print(f"反思结果: {critique}")
        print(f"下一步决策: {next_step}")
        
        # 强制限制：如果已经达到第3轮或更多，必须完成
        if state["cycle_count"] >= 3:
            is_complete = True
            if next_step == "continue":
                critique += f" [系统强制完成：已达到第{state['cycle_count']}轮搜索限制]"
                print(f"警告：AI尝试继续搜索，但已达到轮次限制。强制完成研究。")
        else:
            is_complete = (next_step == "complete")
        
        # Send step complete signal
        complete_info = {
            "type": "step_complete",
            "step": "reflection",
            "cycle": cycle_count,
            "title": "反思分析完成",
            "description": f"完成第{cycle_count}轮分析，决策：{'继续研究' if not is_complete else '准备生成报告'}",
            "details": [
                f"分析了 {len(top_results_for_reflection)} 条搜索结果",
                f"反思内容：{critique[:100]}...",
                f"下一步：{'继续搜索更多信息' if not is_complete else '信息充足，开始生成报告'}"
            ]
        }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        
        return {**state, "critique": critique, "is_complete": is_complete}
        
    except json.JSONDecodeError:
        print("ERROR: Failed to parse reflection JSON from LLM.")
        error_info = {
            "type": "step_error",
            "step": "reflection",
            "cycle": cycle_count,
            "title": "反思结果解析失败",
            "description": "无法解析AI反思结果，将继续研究流程"
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "critique": "Failed to parse reflection JSON.", "is_complete": False}

def generate_report_node(state: ResearchState) -> ResearchState:
    """
    Generates the final report using our custom API caller.
    """
    print("--- 步骤 4: 生成最终报告 ---")
    
    # Send step start signal
    step_info = {
        "type": "step_start",
        "step": "report",
        "cycle": 1,
        "title": "生成研究报告",
        "description": "正在整合所有研究成果，生成最终的中文研究报告..."
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    prompt = GENERATE_REPORT_PROMPT.format(
        user_query=state["user_query"],
        search_results=json.dumps(state["search_results"], indent=2)
    )

    print("INFO: Calling custom Gemini API to generate report...")
    report = invoke_gemini_api(prompt, temperature=0.4)
    print("报告已生成.")
    
    if report.startswith("Error:"):
        error_info = {
            "type": "step_error",
            "step": "report",
            "cycle": 1,
            "title": "报告生成失败",
            "description": f"生成研究报告时发生错误：{report}"
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "report": report}
    
    # Send step complete signal
    complete_info = {
        "type": "step_complete",
        "step": "report",
        "cycle": 1,
        "title": "研究报告完成",
        "description": "成功生成完整的中文研究报告",
        "details": [
            f"报告总长度：{len(report)} 字符",
            "包含结构化的研究发现",
            "包含完整的参考资料列表",
            "支持中文阅读和链接跳转"
        ]
    }
    print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
    
    # Send final report signal
    final_info = {
        "type": "final_report",
        "report": report,
        "title": "研究完成",
        "description": "AI研究员已完成所有工作，生成了详细的研究报告"
    }
    print(f"STEP_INFO: {json.dumps(final_info, ensure_ascii=False)}")
    
    return {**state, "report": report}

# --- CONDITIONAL EDGE ---

def should_continue(state: ResearchState) -> str:
    """
    Determines the next node to visit based on the 'is_complete' flag.
    """
    print("--- 决策点: 是否继续研究? ---")
    if state.get("is_complete", False):
        print("决策: 研究完成，生成报告。")
        return "complete"
    else:
        print("决策: 信息不足，继续研究。")
        return "continue"

# --- GRAPH ASSEMBLY ---

def build_graph():
    """
    Builds and compiles the LangGraph research agent.
    """
    workflow = StateGraph(ResearchState)

    workflow.add_node("generate_queries", generate_queries_node)
    workflow.add_node("web_search", web_search_node)
    workflow.add_node("reflect", reflect_node)
    workflow.add_node("generate_report", generate_report_node)

    workflow.set_entry_point("generate_queries")
    workflow.add_edge("generate_queries", "web_search")
    workflow.add_edge("web_search", "reflect")
    
    workflow.add_conditional_edges(
        "reflect",
        should_continue,
        {
            "continue": "generate_queries",
            "complete": "generate_report"
        }
    )
    
    workflow.add_edge("generate_report", END)

    app = workflow.compile()
    print("--- 研究流程图已编译完成 ---")
    return app

# To test the graph logic, you can run this file directly.
if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    app = build_graph()
    
    initial_state = {
        "user_query": "What are the latest trends in AI agents in 2024?",
    }
    
    for step in app.stream(initial_state):
        step_name, step_state = list(step.items())[0]
        print(f"\n--- 当前节点: {step_name} ---")
        print("-" * (len(step_name) + 16))
    
    final_state = app.invoke(initial_state)
    print("\n\n--- 研究完成 ---")
    print("最终报告:")
    print(final_state.get("report"))
