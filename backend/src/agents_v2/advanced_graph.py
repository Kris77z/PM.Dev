"""
高级LangGraph图结构
连接智能规划器、任务协调器、内容增强器等核心节点
"""

from langgraph.graph import StateGraph, START, END
from langchain_core.runnables import RunnableConfig

from .advanced_state import AdvancedResearchState
from .planner import planner_node
from .coordinator import task_coordinator_node, decide_next_step_in_plan
from .enhancer import content_enhancement_node, should_enhance_content
from .api_utils import retry_manager, robust_web_search, enhance_content_with_firecrawl

# 重用现有的节点（兼容性）
from agent.graph import (
    generate_queries_node,
    web_search_node, 
    reflect_node,
    generate_report_node
)


def create_advanced_research_graph():
    """创建高级研究图"""
    
    # 创建状态图
    builder = StateGraph(AdvancedResearchState)
    
    # ===== 添加所有节点 =====
    
    # 新的高级节点
    builder.add_node("planner", planner_node)
    builder.add_node("task_coordinator", task_coordinator_node)
    builder.add_node("content_enhancer", content_enhancement_node)
    
    # 重用的现有节点（适配后）
    builder.add_node("generate_query", generate_query_adapter)
    builder.add_node("web_research", web_research_adapter) 
    builder.add_node("reflection", reflection_adapter)
    builder.add_node("finalize_answer", finalize_answer_adapter)
    
    # ===== 定义图结构 =====
    
    # 1. 入口：智能规划
    builder.add_edge(START, "planner")
    
    # 2. 规划 -> 任务协调
    builder.add_edge("planner", "task_coordinator")
    
    # 3. 任务协调 -> 查询生成（条件边）
    builder.add_conditional_edges(
        "task_coordinator",
        route_from_coordinator,
        {
            "continue_task": "generate_query",
            "start_new_task": "generate_query", 
            "finalize_report": "finalize_answer"
        }
    )
    
    # 4. 查询生成 -> 网络搜索（并行）
    builder.add_conditional_edges(
        "generate_query", 
        continue_to_web_research_advanced, 
        ["web_research"]
    )
    
    # 5. 网络搜索 -> 反思
    builder.add_edge("web_research", "reflection")
    
    # 6. 反思 -> 内容增强（条件边）
    builder.add_conditional_edges(
        "reflection",
        should_enhance_content_advanced,
        {
            "enhance": "content_enhancer",
            "skip_enhancement": "task_coordinator"
        }
    )
    
    # 7. 内容增强 -> 任务协调
    builder.add_edge("content_enhancer", "task_coordinator")
    
    # 8. 最终答案 -> 结束
    builder.add_edge("finalize_answer", END)
    
    # 编译图
    graph = builder.compile()
    
    print("🎯 高级研究图创建完成")
    print("  节点数量：", len(builder.nodes))
    
    return graph


# ===== 路由函数 =====

def route_from_coordinator(state: AdvancedResearchState) -> str:
    """从任务协调器路由到下一步"""
    
    next_step = state.get("next_step", "continue_task")
    is_complete = state.get("is_complete", False)
    
    print(f"🎛️ 协调器路由调试:")
    print(f"  next_step: {next_step}")
    print(f"  is_complete: {is_complete}")
    print(f"  状态字段: {list(state.keys())}")
    print(f"🎛️ 协调器路由：{next_step}")
    
    # 如果研究已完成，强制路由到最终报告生成
    if is_complete:
        print(f"🏁 检测到研究完成，强制路由到最终报告生成")
        return "finalize_report"
    
    if next_step == "finalize_report":
        print(f"🏁 路由到最终报告生成")
        return "finalize_report"  # 这个会映射到 finalize_answer 节点
    elif next_step == "start_new_task":
        print(f"🔄 路由到新任务开始")
        return "start_new_task"
    else:
        print(f"🔄 路由到继续任务")
        return "continue_task"


def should_enhance_content_advanced(state: AdvancedResearchState) -> str:
    """决定是否进行内容增强"""
    
    print(f"🔀 内容增强决策开始...")
    print(f"🔀 is_complete状态: {state.get('is_complete', False)}")
    print(f"🔀 状态字段数量: {len(state.keys())}")
    print(f"🔀 研究计划长度: {len(state.get('research_plan', []))}")
    
    # 首先检查是否已经完成研究
    if state.get("is_complete", False):
        print("🏁 研究已完成，跳过增强，回到任务协调器")
        print("🔀 返回路由: skip_enhancement -> task_coordinator")
        print("🔀🔀🔀 即将返回 'skip_enhancement' 路由")
        return "skip_enhancement"
    
    # 简化版决策逻辑
    current_findings = state.get("web_research_results", [])
    
    if len(current_findings) < 3:
        print("🔍 内容较少，启用增强")
        print("🔀 返回路由: enhance -> content_enhancer")
        print("🔀🔀🔀 即将返回 'enhance' 路由")
        return "enhance"
    else:
        print("⏭️ 内容充足，跳过增强")
        print("🔀 返回路由: skip_enhancement -> task_coordinator")
        print("🔀🔀🔀 即将返回 'skip_enhancement' 路由")
        return "skip_enhancement"


def continue_to_web_research_advanced(state: AdvancedResearchState):
    """发送搜索查询到网络研究节点（并行）"""
    
    from langgraph.types import Send
    
    # 调试：打印所有可能的查询字段
    print(f"🔍 调试查询字段:")
    print(f"  query_list: {state.get('query_list', 'NOT_FOUND')}")
    print(f"  search_queries: {state.get('search_queries', 'NOT_FOUND')}")
    print(f"  executed_search_queries: {state.get('executed_search_queries', 'NOT_FOUND')}")
    print(f"  所有状态字段: {list(state.keys())}")
    
    # 获取生成的查询 - 尝试多个可能的字段名
    query_list = (
        state.get("query_list") or 
        state.get("search_queries") or 
        state.get("executed_search_queries") or
        []
    )
    
    print(f"🔍 最终获取的查询列表: {query_list}")
    
    if not query_list:
        print("⚠️ 没有生成搜索查询")
        return []
    
    # 获取当前任务信息
    research_plan = state.get("research_plan", [])
    current_pointer = state.get("current_task_pointer", 0)
    current_task_id = "unknown"
    
    if current_pointer < len(research_plan):
        task_data = research_plan[current_pointer]
        if isinstance(task_data, dict):
            current_task_id = task_data.get("id", "unknown")
        else:
            current_task_id = getattr(task_data, 'id', 'unknown')
    
    print(f"🔄 并行发送 {len(query_list)} 个搜索查询")
    print(f"🔄 当前任务ID: {current_task_id}")
    
    # 创建并行搜索任务
    return [
        Send("web_research", {
            "search_query": query,
            "id": idx,
            "current_task_id": current_task_id
        })
        for idx, query in enumerate(query_list)
    ]


# ===== 适配器函数 =====

def generate_query_adapter(state: AdvancedResearchState, config: RunnableConfig):
    """查询生成适配器"""
    
    print(f"🔧 查询生成适配器启动...")
    print(f"🔧 输入状态字段: {list(state.keys())}")
    
    # 转换状态格式以兼容现有节点
    adapted_state = {
        "user_query": state.get("user_query", ""),
        "plan": state.get("plan", []),
        "current_task_pointer": state.get("current_task_pointer", 0),
        "messages": state.get("messages", []),
        "cycle_count": state.get("cycle_count", 0),
        "critique": state.get("critique", "")
    }
    
    print(f"🔧 调用V1 generate_queries_node...")
    # 调用现有函数
    result = generate_queries_node(adapted_state)
    print(f"🔧 V1返回字段: {list(result.keys())}")
    print(f"🔧 V1返回的search_queries: {result.get('search_queries', 'NOT_FOUND')}")
    
    # 检查是否查询生成失败
    search_queries = result.get("search_queries", [])
    if not search_queries:
        # 如果查询生成失败，提供fallback查询
        current_task = get_current_task(state)
        fallback_queries = [
            f"{current_task.description} 最新研究",
            f"{current_task.description} 案例分析",
            f"{current_task.description} 技术趋势"
        ]
        print(f"🔧 查询生成失败，使用fallback查询: {fallback_queries}")
        search_queries = fallback_queries
    
    # 更新状态
    updated_state = {**state}
    updated_state.update(result)
    updated_state["query_list"] = search_queries  # V2需要的字段名
    
    print(f"🔧 适配器返回字段: {list(updated_state.keys())}")
    print(f"🔧 适配器返回的查询: {search_queries}")
    
    return updated_state


async def web_research_adapter(state: AdvancedResearchState, config: RunnableConfig):
    """网络搜索适配器 - 支持并行搜索和内容增强"""
    
    print(f"🔍 V2并行网络搜索适配器启动...")
    print(f"🔍 输入状态字段: {list(state.keys())}")
    print(f"🔍 search_query: {state.get('search_query', 'NOT_FOUND')}")
    print(f"🔍 id: {state.get('id', 'NOT_FOUND')}")
    print(f"🔍 current_task_id: {state.get('current_task_id', 'NOT_FOUND')}")
    
    # 获取搜索查询
    search_query = state.get("search_query", "")
    if not search_query:
        print("⚠️ 没有搜索查询，返回空结果")
        return {
            "web_research_results": [],
            "sources_gathered": [],
            "search_results": [],
            "current_task_detailed_findings": []
        }
    
    # 检查是否启用并行搜索
    enable_parallel = state.get("enable_parallel_search", True)
    enable_enhancement = state.get("enable_content_enhancement", True)
    
    if enable_parallel:
        print(f"🚀 启用并行搜索模式")
        
        # 生成相关查询进行并行搜索
        related_queries = [
            search_query,
            f"{search_query} 案例研究",
            f"{search_query} 最新发展",
        ]
        
        # 使用并行搜索工具
        try:
            # 创建搜索函数的包装器
            async def single_search(query):
                adapted_state = {
                    "search_query": query,
                    "search_queries": [query],
                    "id": state.get("id", 0),
                    "current_task_id": state.get("current_task_id", "unknown"),
                    "cycle_count": state.get("cycle_count", 1),
                    "user_query": state.get("user_query", "")
                }
                return web_search_node(adapted_state)
            
            # 并行执行搜索
            all_results = await robust_web_search(single_search, related_queries)
            
            # 合并所有结果
            web_results = []
            sources = []
            
            for result_data in all_results:
                if isinstance(result_data, dict):
                    web_results.extend(result_data.get("search_results", []))
                    sources.extend(result_data.get("sources_gathered", []))
            
            print(f"🚀 并行搜索完成: {len(web_results)} 条结果")
            
        except Exception as e:
            print(f"❌ 并行搜索失败，回退到单一搜索: {e}")
            # 回退到单一搜索
            adapted_state = {
                "search_query": search_query,
                "search_queries": [search_query],
                "id": state.get("id", 0),
                "current_task_id": state.get("current_task_id", "unknown"),
                "cycle_count": state.get("cycle_count", 1),
                "user_query": state.get("user_query", "")
            }
            result = web_search_node(adapted_state)
            web_results = result.get("search_results", [])
            sources = result.get("sources_gathered", [])
    
    else:
        print(f"🔍 使用标准搜索模式")
        # 标准单一搜索
        adapted_state = {
            "search_query": search_query,
            "search_queries": [search_query],
            "id": state.get("id", 0),
            "current_task_id": state.get("current_task_id", "unknown"),
            "cycle_count": state.get("cycle_count", 1),
            "user_query": state.get("user_query", "")
        }
        
        result = web_search_node(adapted_state)
        web_results = result.get("search_results", [])
        sources = result.get("sources_gathered", [])
    
    # 内容增强处理
    enhanced_results = web_results
    if enable_enhancement and web_results:
        print(f"🔥 启用Firecrawl内容增强")
        try:
            # 转换搜索结果格式以适配增强函数
            formatted_results = []
            for result in web_results:
                if isinstance(result, dict):
                    formatted_results.append(result)
                else:
                    # 如果是字符串，创建基本格式
                    formatted_results.append({
                        "title": "搜索结果",
                        "snippet": str(result),
                        "url": f"https://example.com/search/{len(formatted_results)}"
                    })
            
            enhanced_results = await enhance_content_with_firecrawl(
                formatted_results,
                {
                    "max_urls": 3,
                    "quality_threshold": 0.6
                }
            )
            
            print(f"🔥 内容增强完成: {len(enhanced_results)} 条结果")
            
        except Exception as e:
            print(f"❌ 内容增强失败，使用原始结果: {e}")
            enhanced_results = web_results
    
    # 构建返回结果
    v2_result = {
        "web_research_results": enhanced_results,
        "sources_gathered": sources,
        "search_results": enhanced_results,  # v1兼容
        "parallel_search_results": enhanced_results,  # 标记为并行搜索结果
        
        # 任务特定结果
        "current_task_detailed_findings": [{
            "task_id": state.get("current_task_id", "unknown"),
            "content": content,
            "source": "parallel_web_search" if enable_parallel else "web_search",
            "enhanced": enable_enhancement,
            "timestamp": "now"
        } for content in enhanced_results] if enhanced_results else []
    }
    
    print(f"🔍 V2网络搜索适配器返回字段: {list(v2_result.keys())}")
    print(f"🔍 返回的搜索结果数量: {len(v2_result.get('search_results', []))}")
    print(f"🔍 并行搜索: {enable_parallel}, 内容增强: {enable_enhancement}")
    
    return v2_result


def reflection_adapter(state: AdvancedResearchState, config: RunnableConfig):
    """反思适配器"""
    
    print(f"🤔 反思适配器启动...")
    print(f"🤔 输入状态字段: {list(state.keys())}")
    
    # 转换状态格式
    adapted_state = {
        "user_query": state.get("user_query", ""),  # 确保包含user_query
        "web_research_result": state.get("web_research_results", []),
        "search_results": state.get("search_results", []),  # V1兼容字段
        "sources_gathered": state.get("sources_gathered", []),
        "plan": state.get("plan", []),
        "current_task_pointer": state.get("current_task_pointer", 0),
        "research_loop_count": state.get("current_task_loop_count", 0),
        "cycle_count": state.get("cycle_count", 1),  # V1需要的字段
        "number_of_ran_queries": len(state.get("executed_search_queries", [])),
        "scenario_type": state.get("scenario_type", "default")
    }
    
    print(f"🤔 传递给V1的字段: {list(adapted_state.keys())}")
    print(f"🤔 user_query: {adapted_state.get('user_query', 'NOT_FOUND')}")
    print(f"🤔 搜索结果数量: {len(adapted_state.get('search_results', []))}")
    
    # 调用现有函数
    result = reflect_node(adapted_state)
    print(f"🤔 V1返回字段: {list(result.keys())}")
    
    # 转换结果格式
    v2_result = {
        # 保持原有状态
        **state,
        
        # 映射V1返回的字段
        "reflection_is_sufficient": result.get("reflection_is_sufficient", False),
        "reflection_knowledge_gap": result.get("reflection_knowledge_gap", ""),
        "reflection_follow_up_queries": result.get("reflection_follow_up_queries", []),
        "critique": result.get("critique", ""),  # v1兼容
        "is_complete": result.get("is_complete", False),
        "cycle_count": result.get("cycle_count", state.get("cycle_count", 1)),
        
        # 更新任务轮次
        "current_task_loop_count": state.get("current_task_loop_count", 0) + 1
    }
    
    print(f"🤔 反思适配器返回字段: {list(v2_result.keys())}")
    print(f"🤔 is_complete: {v2_result.get('is_complete', 'NOT_FOUND')}")
    
    return v2_result


def finalize_answer_adapter(state: AdvancedResearchState, config: RunnableConfig):
    """最终答案适配器"""
    
    print(f"📝📝📝 最终报告生成适配器启动!!! 📝📝📝")
    print(f"📝 输入状态字段: {list(state.keys())}")
    print(f"📝 用户查询: {state.get('user_query', 'NOT_FOUND')}")
    
    # 安全获取列表长度
    task_results = state.get('task_results', []) or []
    global_memory = state.get('global_memory', []) or []
    research_plan = state.get('research_plan', []) or []
    
    print(f"📝 任务结果数量: {len(task_results)}")
    print(f"📝 全局记忆数量: {len(global_memory)}")
    print(f"📝 研究计划数量: {len(research_plan)}")
    
    # 收集所有搜索结果
    all_search_results = []
    
    # 从web_research_results收集
    web_results = state.get("web_research_results", []) or []
    if web_results:
        all_search_results.extend(web_results)
        print(f"📝 从web_research_results收集到 {len(web_results)} 条结果")
    
    # 从search_results收集（V1兼容字段）
    search_results = state.get("search_results", []) or []
    if search_results:
        all_search_results.extend(search_results)
        print(f"📝 从search_results收集到 {len(search_results)} 条结果")
    
    # 从parallel_search_results收集
    parallel_results = state.get("parallel_search_results", []) or []
    if parallel_results:
        all_search_results.extend(parallel_results)
        print(f"📝 从parallel_search_results收集到 {len(parallel_results)} 条结果")
    
    # 从current_task_detailed_findings收集
    detailed_findings = state.get("current_task_detailed_findings", []) or []
    if detailed_findings:
        # 转换格式
        for finding in detailed_findings:
            if isinstance(finding, dict) and "content" in finding:
                all_search_results.append(finding["content"])
        print(f"📝 从current_task_detailed_findings收集到 {len(detailed_findings)} 条结果")
    
    print(f"📝 总共收集到 {len(all_search_results)} 条搜索结果")
    
    # 如果没有搜索结果，创建一个基本的结果
    if not all_search_results:
        all_search_results = [f"基于查询'{state.get('user_query', '')}' 的研究结果"]
        print(f"📝 没有找到搜索结果，创建默认结果")
    
    # 转换状态格式以兼容V1 generate_report_node
    adapted_state = {
        "user_query": state.get("user_query", ""),
        "search_results": all_search_results,  # V1必需字段
        "sources_gathered": state.get("sources_gathered", []),
        "ledger": [],  # 从task_results构建
        "final_report_markdown": state.get("final_report_markdown", ""),
        "cycle_count": state.get("cycle_count", 1),
        "scenario_type": state.get("scenario_type", "default")
    }
    
    print(f"📝 开始构建ledger...")
    # 构建ledger格式
    task_results_list = state.get("task_results", []) or []
    for task_result in task_results_list:
        if hasattr(task_result, 'task_id'):
            ledger_entry = {
                "task_id": task_result.task_id,
                "description": task_result.description,
                "findings_summary": task_result.findings_summary,
                "detailed_snippets": task_result.detailed_findings,
                "citations_for_snippets": task_result.sources_citations
            }
            adapted_state["ledger"].append(ledger_entry)
            print(f"📝 添加ledger条目: {task_result.task_id}")
    
    print(f"📝 ledger构建完成，共 {len(adapted_state['ledger'])} 个条目")
    print(f"📝 适配状态字段: {list(adapted_state.keys())}")
    print(f"📝 search_results数量: {len(adapted_state['search_results'])}")
    print(f"📝 调用V1 generate_report_node...")
    
    # 直接调用V1报告生成（同步方式）
    print(f"📝 调用V1报告生成...")
    try:
        result = generate_report_node(adapted_state)
        print(f"📝 V1报告生成成功")
    except Exception as e:
        print(f"📝 报告生成异常: {e}")
        result = {
            "report": f"报告生成遇到异常: {str(e)}",
            "final_report_markdown": f"# 报告生成异常\n\n错误信息: {str(e)}",
            "is_complete": True
        }
    
    print(f"📝 V1返回字段: {list(result.keys())}")
    
    # 安全获取报告内容 - 优先从report字段获取
    final_report = result.get('report') or result.get('final_report_markdown') or ""
    print(f"📝 报告长度: {len(final_report)}")
    print(f"📝 V1返回的report字段: {len(result.get('report') or '')}")
    print(f"📝 V1返回的final_report_markdown字段: {len(result.get('final_report_markdown') or '')}")
    
    # 转换结果格式
    final_result = {
        "final_report_markdown": final_report,
        "report": final_report,  # v1兼容
        "is_complete": True,
        "execution_summary": {
            "total_tasks": len(research_plan),
            "completed_tasks": len(state.get("completed_tasks", []) or []),
            "total_cycles": state.get("total_research_loops", 0),
            "api_calls": 0,  # 暂时设为0，避免依赖retry_manager
            "success_rate": 1.0
        }
    }
    
    print(f"📝 最终报告适配器返回字段: {list(final_result.keys())}")
    print(f"📝 最终报告长度: {len(final_result.get('final_report_markdown', ''))}")
    
    return final_result


# ===== 图实例化 =====

def get_advanced_research_graph():
    """获取高级研究图实例"""
    return create_advanced_research_graph() 