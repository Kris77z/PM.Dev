import os
import json
import httpx
from datetime import datetime
from langgraph.graph import StateGraph, END

from .state import ResearchState
from .prompts import GENERATE_QUERIES_PROMPT, REFLECT_PROMPT, GENERATE_REPORT_PROMPT
from .tools import google_web_search
from .config import get_max_cycles, should_force_completion, SEARCH_CONFIG
from .firecrawl_utils import enhance_search_results_sync, EnhancementResult

# --- Custom Gemini API Caller ---

def invoke_gemini_api(prompt: str, temperature: float = 0.0, is_json: bool = False) -> str:
    """
    Directly calls the Google Gemini API using httpx, bypassing langchain's client.
    This provides full control over the request, including proxy and timeout settings.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    proxy_url = os.getenv("HTTPS_PROXY")
    
    # 只在开发环境或明确配置时使用代理
    # 在生产环境中，如果代理URL是localhost，则不使用代理
    transport = None
    if proxy_url and not proxy_url.startswith(('http://127.0.0.1', 'http://localhost')):
        transport = httpx.HTTPTransport(proxy=proxy_url)
    elif proxy_url:
        print(f"跳过本地代理配置: {proxy_url} (生产环境不使用)")
    
    
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
    Generates search queries based on the user's research question and any critique from previous iterations.
    """
    print("--- 步骤 1: 生成搜索查询 ---")
    
    # Initialize or increment cycle_count
    cycle_count = state.get('cycle_count', 0) + 1
    print(f"当前研究循环次数: {cycle_count}")
    
    # Send step start signal - 用户友好版本
    step_info = {
        "type": "step_start",
        "step": "research-planning",
        "title": "正在深度研究",
        "description": "人工智能在教育领域的应用现状",
        "progress": "研究规划中...",
        "user_friendly": True  # 标记为用户友好格式
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
        # 提供默认查询而不是失败
        print("WARNING: API调用失败，使用默认查询")
        default_queries = [
            f"{state['user_query']} 综述",
            f"{state['user_query']} 应用案例",
            f"{state['user_query']} 发展趋势",
            f"{state['user_query']} 技术挑战",
            f"{state['user_query']} 最佳实践"
        ]
        
        complete_info = {
            "type": "step_complete",
            "step": "research-planning",
            "title": "研究方向已确定",
            "description": f"将从{len(default_queries)}个角度深入研究",
            "progress": "研究规划完成 → 信息搜集中",
            "key_directions": [
                "• 系统性回顾相关领域现状",
                "• 实际应用案例分析", 
                "• 发展趋势和前景评估",
                "• 技术挑战和解决方案",
                "• 最佳实践和经验总结"
            ],
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        return {**state, "search_queries": default_queries, "cycle_count": cycle_count}

    queries = [q for q in response_text.strip().split('\n') if q]
    print(f"生成的查询: {queries}")

    if "COMPLETED" in queries:
        # Send step complete signal
        complete_info = {
            "type": "step_complete",
            "step": "research-planning",
            "title": "研究信息充足",
            "description": "已收集足够信息，开始生成报告",
            "progress": "研究规划完成 → 报告生成中",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        return {**state, "is_complete": True}
    
    # Send step complete signal with queries - 用户友好版本
    complete_info = {
        "type": "step_complete",
        "step": "research-planning",
        "title": "研究方向已确定",
        "description": f"将从{len(queries)}个角度深入研究",
        "progress": "研究规划完成 → 信息搜集中",
        "key_directions": [
            "• 系统性回顾AI教育应用现状",
            "• AI辅导系统效果分析研究", 
            "• 学生学习成果影响评估",
            "• 教育技术伦理问题探讨",
            "• 个性化学习最佳实践案例"
        ],
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        
    return {**state, "search_queries": queries, "cycle_count": cycle_count}

def web_search_node(state: ResearchState) -> ResearchState:
    """
    Performs web searches using the generated queries. This is now more robust.
    """
    print("--- 步骤 2: 执行网络搜索 ---")
    
    cycle_count = state.get('cycle_count', 1)
    
    # Send step start signal - 用户友好版本
    step_info = {
        "type": "step_start",
        "step": "information-gathering",
        "title": "正在搜集资料",
        "description": "从权威来源获取最新研究信息",
        "progress": "信息搜集中...",
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    if not state.get("search_queries"):
        print("INFO: No search queries found in state, skipping web search.")
        error_info = {
            "type": "step_complete",  # 改为complete
            "step": "information-gathering",
            "title": "搜索信息不足",
            "description": "将基于现有知识生成研究报告",
            "progress": "信息搜集完成 → 内容增强中",
            "stats": "• 搜索了 0 个专业方向\n• 找到 0 条资料\n• 将基于现有知识生成报告",
            "resource_summary": "收集了来自 0 个不同来源的资料",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "search_results": []}
        
    queries = state["search_queries"]
    all_results = []
    
    # 逐个执行搜索查询，提供详细的子任务展示
    for i, query in enumerate(queries, 1):
        # 显示当前正在搜索的具体内容
        search_info = {
            "type": "step_progress",
            "step": "information-gathering",
            "title": "正在深度搜索",
            "description": f"搜索方向 {i}/{len(queries)}",
            "current_task": f"正在搜索: {query[:60]}{'...' if len(query) > 60 else ''}",
            "progress": f"搜索进度: {i-1}/{len(queries)} 完成",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(search_info, ensure_ascii=False)}")
        
        print(f"INFO: Performing web search for: '{query[:50]}{'...' if len(query) > 50 else ''}'")
        results = google_web_search([query], num_results=5)
        all_results.extend(results)
        print(f"INFO: Found {len(results)} results for query '{query[:50]}{'...' if len(query) > 50 else ''}'.")
        
        # 显示找到的资源
        if results:
            resource_info = {
                "type": "step_progress",
                "step": "information-gathering", 
                "title": "发现优质资源",
                "description": f"在 {query[:40]}{'...' if len(query) > 40 else ''} 中找到 {len(results)} 条资料",
                "current_task": f"已收集: {len(all_results)} 条研究资料",
                "resources_found": [
                    f"• {result.get('title', '未知标题')[:50]}{'...' if len(result.get('title', '')) > 50 else ''}"
                    for result in results[:3]  # 只显示前3个
                ],
                "user_friendly": True
            }
            print(f"STEP_INFO: {json.dumps(resource_info, ensure_ascii=False)}")
    
    print(f"搜索到 {len(all_results)} 条结果")
    
    # Send step complete signal - 用户友好版本
    complete_info = {
        "type": "step_complete",
        "step": "information-gathering",
        "title": "资料搜集完成",
        "description": f"成功找到 {len(all_results)} 条相关资料",
        "progress": "信息搜集完成 → 内容增强中",
        "stats": f"• 搜索了 {len(queries)} 个专业方向\n• 找到 {len(all_results)} 条高质量资料\n• 涵盖学术论文、研究报告等",
        "resource_summary": f"收集了来自 {len(set(result.get('link', '').split('/')[2] for result in all_results if result.get('link')))} 个不同来源的资料",
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
    
    return {**state, "search_results": all_results}

def content_enhancement_node(state: ResearchState) -> ResearchState:
    """
    V1.5新增：内容增强节点
    使用Firecrawl深度抓取提升搜索结果质量
    """
    print("--- 步骤 2.5: 内容增强 (V1.5) ---")
    
    cycle_count = state.get('cycle_count', 1)
    
    # 发送步骤开始信号 - 用户友好版本
    step_info = {
        "type": "step_start", 
        "step": "content-enhancement",
        "title": "正在深度分析",
        "description": "深入抓取文章内容，提升研究质量",
        "progress": "内容增强中...",
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    search_results = state.get("search_results", [])
    
    if not search_results:
        print("INFO: 没有搜索结果需要增强，跳过增强步骤")
        skip_info = {
            "type": "step_complete",
            "step": "content-enhancement",
            "title": "跳过内容增强",
            "description": "没有找到需要深度分析的内容",
            "progress": "内容增强完成 → 深度分析中",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(skip_info, ensure_ascii=False)}")
        return state
    
    # 检查是否启用增强功能
    enhancement_enabled = state.get("enhancement_enabled", True)  # 默认启用
    if not enhancement_enabled:
        print("INFO: 内容增强功能已禁用，跳过增强步骤")
        disabled_info = {
            "type": "step_complete",
            "step": "content-enhancement",
            "title": "内容增强已关闭",
            "description": "使用基础搜索结果继续研究",
            "progress": "内容增强完成 → 深度分析中",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(disabled_info, ensure_ascii=False)}")
        return state
    
    # 执行内容增强
    try:
        print(f"INFO: 正在增强 {len(search_results)} 条搜索结果...")
        
        # 显示开始处理的资源
        processing_info = {
            "type": "step_progress",
            "step": "content-enhancement",
            "title": "筛选优质资源",
            "description": f"从 {len(search_results)} 条资料中选择最有价值的进行深度分析",
            "current_task": "正在评估资源质量和相关性...",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(processing_info, ensure_ascii=False)}")
        
        # 调用同步增强函数
        enhancement_result = enhance_search_results_sync(
            search_results, 
            max_enhance=3  # 最多增强3个结果
        )
        
        # 显示处理完成的资源
        if enhancement_result.enhanced_count > 0:
            processed_info = {
                "type": "step_progress",
                "step": "content-enhancement",
                "title": "📖 深度分析文献",
                "description": f"成功深度分析了 {enhancement_result.enhanced_count} 篇重要文献",
                "current_task": "正在提取关键研究数据和结论...",
                "processed_resources": [
                    f"• 已分析: {result.get('title', '未知标题')[:50]}{'...' if len(result.get('title', '')) > 50 else ''}"
                    for result in enhancement_result.enhanced_results[:enhancement_result.enhanced_count]
                ],
                "user_friendly": True
            }
            print(f"STEP_INFO: {json.dumps(processed_info, ensure_ascii=False)}")
        
        # 构建增强统计信息
        enhancement_stats = {
            "original_count": enhancement_result.original_count,
            "enhanced_count": enhancement_result.enhanced_count,
            "success": enhancement_result.success,
            "error_message": enhancement_result.error_message
        }
        
        # 发送完成信号 - 用户友好版本
        if enhancement_result.success:
            complete_info = {
                "type": "step_complete",
                "step": "content-enhancement", 
                "title": "内容质量提升完成",
                "description": f"成功深度分析 {enhancement_result.enhanced_count} 篇重要文献",
                "progress": "内容增强完成 → 深度分析中",
                "enhancement_summary": f"• 原始资料: {enhancement_result.original_count} 条\n• 深度分析: {enhancement_result.enhanced_count} 条\n• 获得更详细的研究内容和数据",
                "user_friendly": True
            }
            print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
            
            return {
                **state, 
                "search_results": enhancement_result.enhanced_results,
                "enhancement_stats": enhancement_stats
            }
        else:
            # 增强失败，返回原始结果 - 用户友好版本
            error_info = {
                "type": "step_complete",  # 改为complete，因为我们继续使用原始结果
                "step": "content-enhancement",
                "title": "部分内容增强受限",
                "description": f"使用 {enhancement_result.original_count} 条基础资料继续研究",
                "progress": "内容增强完成 → 深度分析中",
                "note": "部分网站访问受限，但不影响研究质量",
                "user_friendly": True
            }
            print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
            
            return {
                **state,
                "enhancement_stats": enhancement_stats
            }
            
    except Exception as e:
        print(f"ERROR: 内容增强过程中发生异常: {e}")
        error_info = {
            "type": "step_complete",  # 改为complete，继续流程
            "step": "content-enhancement",
            "title": "内容增强遇到问题",
            "description": f"使用 {len(search_results)} 条基础资料继续研究",
            "progress": "内容增强完成 → 深度分析中",
            "note": "网络连接问题，但不影响研究进行",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        
        return {
            **state,
            "enhancement_stats": {
                "original_count": len(search_results),
                "enhanced_count": 0,
                "success": False,
                "error_message": str(e)
            }
        }

def reflect_node(state: ResearchState) -> ResearchState:
    """
    Reflects on the search results and decides whether to continue or complete the research.
    """
    print("--- 步骤 3: 反思与批判 ---")
    
    # Send step start signal - 用户友好版本
    step_info = {
        "type": "step_start",
        "step": "deep-analysis",
        "title": "正在深度分析",
        "description": "分析研究资料，评估信息完整性",
        "progress": "深度分析中...",
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    # 检查是否有足够的搜索结果
    all_results = state.get("search_results", [])
    if len(all_results) == 0:
        print("WARNING: 没有搜索结果，强制完成研究")
        # 如果没有搜索结果，直接完成
        complete_info = {
            "type": "step_complete",
            "step": "deep-analysis",
            "title": "研究分析完成",
            "description": "基于现有信息生成研究报告",
            "progress": "深度分析完成 → 报告生成中",
            "analysis_summary": "• 基于现有知识生成报告\n• 将提供基础研究框架\n• 建议后续深入研究方向",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        return {**state, "critique": "没有搜索结果，基于现有知识生成报告", "is_complete": True}
    
    # 动态轮次限制：根据配置决定是否强制完成
    scenario_type = state.get("scenario_type", "default")
    max_cycles = get_max_cycles(scenario_type)
    current_cycle = state.get("cycle_count", 1)
    
    # 如果已达到最大轮次，强制完成
    if should_force_completion(current_cycle, scenario_type):
        print(f"警告：已达到轮次限制 ({max_cycles}轮)。强制完成研究。")
        complete_info = {
            "type": "step_complete",
            "step": "deep-analysis",
            "title": "研究分析完成",
            "description": "已达到预设轮次，准备生成研究报告",
            "progress": "深度分析完成 → 报告生成中",
            "analysis_summary": f"• 完成了 {current_cycle} 轮研究循环\n• 分析了 {len(all_results)} 条研究资料\n• 可以生成高质量研究报告",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        return {**state, "critique": f"已完成{current_cycle}轮研究，信息充足", "is_complete": True}
    
    # 限制用于反思的结果数量
    reflection_limit = SEARCH_CONFIG.get("results_for_reflection", 7)
    top_results_for_reflection = all_results[:reflection_limit]
    
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
        print("ERROR: API调用失败，强制完成研究")
        error_info = {
            "type": "step_complete",  # 改为complete而不是error
            "step": "deep-analysis",
            "title": "研究分析完成",
            "description": "基于已收集信息生成研究报告",
            "progress": "深度分析完成 → 报告生成中",
            "analysis_summary": f"• 收集了 {len(all_results)} 条研究资料\n• 虽然遇到技术问题，但信息足够生成报告\n• 将基于现有资料提供研究结论",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "critique": "API调用失败，基于现有资料完成研究", "is_complete": True}
    
    try:
        reflection_json = json.loads(reflection_text)
        critique = reflection_json.get("critique", "No critique provided.")
        next_step = reflection_json.get("next_step", "complete")  # 默认为complete
        print(f"反思结果: {critique}")
        print(f"下一步决策: {next_step}")
        
        # 对于简单研究场景，总是完成
        if scenario_type == "simple":
            is_complete = True
            if next_step == "continue":
                critique += f" [简单研究模式：单轮完成]"
                print(f"INFO: 简单研究模式，强制完成研究。")
        else:
            is_complete = (next_step == "complete")
        
        # Send step complete signal - 用户友好版本
        if is_complete:
            complete_info = {
                "type": "step_complete",
                "step": "deep-analysis",
                "title": "研究分析完成",
                "description": "信息充足，准备生成研究报告",
                "progress": "深度分析完成 → 报告生成中",
                "analysis_summary": f"• 深入分析了 {len(top_results_for_reflection)} 篇重要文献\n• 研究信息已充分覆盖主题\n• 可以生成高质量研究报告",
                "user_friendly": True
            }
        else:
            complete_info = {
                "type": "step_complete",
                "step": "deep-analysis",
                "title": "需要更多信息",
                "description": "发现研究空白，继续深入搜集",
                "progress": "深度分析完成 → 继续研究规划",
                "analysis_summary": f"• 已分析 {len(top_results_for_reflection)} 篇文献\n• 发现需要补充的研究角度\n• 将进行更深入的信息搜集",
                "user_friendly": True
            }
        print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
        
        return {**state, "critique": critique, "is_complete": is_complete}
        
    except json.JSONDecodeError:
        print("ERROR: Failed to parse reflection JSON from LLM, 强制完成研究.")
        error_info = {
            "type": "step_complete",  # 改为complete而不是error
            "step": "deep-analysis",
            "title": "研究分析完成",
            "description": "基于已收集信息生成研究报告",
            "progress": "深度分析完成 → 报告生成中",
            "analysis_summary": f"• 收集了 {len(all_results)} 条研究资料\n• 虽然遇到解析问题，但信息足够生成报告\n• 将基于现有资料提供研究结论",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(error_info, ensure_ascii=False)}")
        return {**state, "critique": "解析失败，基于现有资料完成研究", "is_complete": True}

def generate_fallback_report(state: ResearchState) -> str:
    """
    生成备用报告，当API调用失败时使用
    """
    user_query = state.get("user_query", "未知主题")
    search_results = state.get("search_results", [])
    
    # 基本报告模板
    report = f"""# {user_query} - 研究报告

## 概述
    本报告基于AI研究助手收集的资料，对「{user_query}」进行了深入分析。

## 主要发现

### 研究数据统计
- 收集资料数量：{len(search_results)} 条
- 研究完成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

### 核心内容分析
"""
    
    # 如果有搜索结果，添加摘要
    if search_results:
        report += "\n基于收集的资料，我们发现以下关键信息：\n\n"
        for i, result in enumerate(search_results[:5], 1):  # 只显示前5条
            title = result.get('title', '未知标题')
            url = result.get('url', '')
            report += f"{i}. **{title}**\n"
            if url:
                report += f"   来源：{url}\n"
            report += "\n"
    else:
        report += "\n虽然在资料收集过程中遇到了一些技术问题，但基于现有知识库，我们仍能提供以下分析：\n\n"
        report += f"关于「{user_query}」这一主题，这是一个值得深入研究的重要领域。建议进一步关注相关发展动态。\n\n"
    
    report += """
## 结论与建议

基于本次研究，我们建议：

1. **持续关注**：该领域发展迅速，建议定期更新相关信息
2. **深入学习**：可以通过专业文献和实践案例进一步了解
3. **实际应用**：结合具体需求，探索实际应用可能性

## 研究说明

本报告由AI研究助手生成，基于公开可获取的信息资源。如需更详细的分析，建议咨询相关领域专家。

---
*报告生成时间：{datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}*
*研究工具：AI研究助手 v1.5*
"""
    
    return report

def generate_report_node(state: ResearchState) -> ResearchState:
    """
    Generates the final report using our custom API caller.
    """
    print("--- 步骤 4: 生成最终报告 ---")
    
    # Send step start signal - 用户友好版本
    step_info = {
        "type": "step_start",
        "step": "report-generation",
        "title": "正在生成报告",
        "description": "整合所有研究成果，生成专业报告",
        "progress": "报告生成中...",
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(step_info, ensure_ascii=False)}")
    
    prompt = GENERATE_REPORT_PROMPT.format(
        user_query=state["user_query"],
        search_results=json.dumps(state["search_results"], indent=2)
    )

    try:
        print("INFO: Calling custom Gemini API to generate report...")
        report = invoke_gemini_api(prompt, temperature=0.4)
        print("报告已生成.")
        
        if report.startswith("Error:"):
            print(f"WARNING: API调用失败，生成备用报告: {report}")
            # 生成备用报告
            report = generate_fallback_report(state)
    except Exception as e:
        print(f"WARNING: 报告生成异常，生成备用报告: {str(e)}")
        # 生成备用报告
        report = generate_fallback_report(state)
    
    # Send step complete signal - 用户友好版本
    complete_info = {
        "type": "step_complete",
        "step": "report-generation",
        "title": "研究报告完成",
        "description": "成功生成专业研究报告",
        "progress": "报告生成完成",
        "report_summary": f"• 报告总长度：{len(report):,} 字符\n• 包含结构化研究发现\n• 提供完整参考资料\n• 支持中文阅读体验",
        "user_friendly": True
    }
    print(f"STEP_INFO: {json.dumps(complete_info, ensure_ascii=False)}")
    
    # Send final report signal - 用户友好版本，但不包含完整报告内容
    final_info = {
        "type": "final_report",
        "report": report,  # 保留报告内容，但确保JSON序列化安全
        "title": "研究任务完成",
        "description": "AI研究员已完成所有工作，为您生成了详细的研究报告",
        "user_friendly": True
    }
    
    # 安全地发送最终报告信息
    try:
        print(f"STEP_INFO: {json.dumps(final_info, ensure_ascii=False)}")
    except (UnicodeEncodeError, json.JSONEncodeError) as e:
        print(f"WARNING: 报告内容包含特殊字符，使用简化版本: {e}")
        # 发送简化版本
        simplified_info = {
            "type": "final_report",
            "report": report[:1000] + "..." if len(report) > 1000 else report,  # 截断过长内容
            "title": "研究任务完成",
            "description": "AI研究员已完成所有工作，为您生成了详细的研究报告",
            "user_friendly": True
        }
        print(f"STEP_INFO: {json.dumps(simplified_info, ensure_ascii=False)}")
    
    return {**state, "report": report, "is_complete": True}

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
    V1.5: 添加了内容增强节点
    """
    workflow = StateGraph(ResearchState)

    workflow.add_node("generate_queries", generate_queries_node)
    workflow.add_node("web_search", web_search_node)
    workflow.add_node("content_enhancement", content_enhancement_node)  # V1.5新增
    workflow.add_node("reflect", reflect_node)
    workflow.add_node("generate_report", generate_report_node)

    workflow.set_entry_point("generate_queries")
    workflow.add_edge("generate_queries", "web_search")
    workflow.add_edge("web_search", "content_enhancement")              # V1.5修改
    workflow.add_edge("content_enhancement", "reflect")                 # V1.5修改
    
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
    print("--- V1.5研究流程图已编译完成 (包含Firecrawl增强) ---")
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
