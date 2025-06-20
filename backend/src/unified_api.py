"""
统一API入口
支持V1（现有）和V2（高级）两种LangGraph架构
"""

from typing import Dict, Any, Iterator, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
from langchain_core.runnables import RunnableConfig

# V1架构导入
from agent.graph import build_graph
from agent.state import ResearchState as V1State

# V2架构导入
from agents_v2.advanced_graph import get_advanced_research_graph
from agents_v2.advanced_state import AdvancedResearchState as V2State


class UnifiedResearchRequest(BaseModel):
    """统一研究请求"""
    query: str
    version: str = "v1"  # "v1" 或 "v2"
    scenario_type: str = "default"  # v1兼容
    mode: str = "research_assistant"  # v2模式：research_assistant, quick_lookup, deep_research
    research_mode: Optional[str] = None  # v2兼容字段


class APIManager:
    """API管理器"""
    
    def __init__(self):
        self.v1_graph = None
        self.v2_graph = None
    
    def get_v1_graph(self):
        """获取V1图实例"""
        if not self.v1_graph:
            self.v1_graph = build_graph()
        return self.v1_graph
    
    def get_v2_graph(self):
        """获取V2图实例"""
        if not self.v2_graph:
            self.v2_graph = get_advanced_research_graph()
        return self.v2_graph
    
    def create_v1_initial_state(self, query: str, scenario_type: str) -> V1State:
        """创建V1初始状态"""
        return {
            "user_query": query,
            "scenario_type": scenario_type,
            "search_queries": [],
            "search_results": [],
            "critique": "",
            "report": "",
            "is_complete": False,
            "cycle_count": 0
        }
    
    def create_v2_initial_state(self, query: str, mode: str) -> V2State:
        """创建V2初始状态"""
        return {
            # 核心研究信息
            "user_query": query,
            "research_plan": [],
            "current_task_pointer": 0,
            "total_estimated_cycles": 0,
            
            # 多任务协调
            "task_results": [],
            "global_memory": [],
            "completed_tasks": [],
            "failed_tasks": [],
            
            # 搜索和处理
            "executed_search_queries": [],
            "web_research_results": [],
            "sources_gathered": [],
            "parallel_search_results": [],
            
            # 反思和评估
            "reflection_is_sufficient": None,
            "reflection_knowledge_gap": None,
            "reflection_follow_up_queries": None,
            "reflection_quality_score": None,
            
            # 智能增强系统
            "enhancement_decision": None,
            "enhancement_status": None,
            "enhanced_content_results": None,
            "enhanced_sources_count": None,
            "enhancement_quality_boost": None,
            "enhancement_error": None,
            
            # 执行控制
            "max_research_loops_per_task": 4,
            "current_task_loop_count": 0,
            "total_research_loops": 0,
            "reasoning_model": "gemini-1.5-flash",
            
            # 任务特定结果
            "current_task_detailed_findings": [],
            "task_specific_results": [],
            
            # 最终输出
            "final_report_markdown": None,
            "execution_summary": None,
            
            # 错误处理
            "last_error": None,
            "error_recovery_attempts": 0,
            
            # V1兼容性字段
            "search_queries": [],
            "search_results": [],
            "critique": "",
            "report": "",
            "is_complete": False,
            "cycle_count": 0,
            "scenario_type": mode
        }
    
    async def execute_v1_research(
        self, 
        query: str, 
        scenario_type: str
    ) -> Iterator[Dict[str, Any]]:
        """执行V1研究流程"""
        
        print(f"🔄 启动V1研究流程：{query}")
        
        graph = self.get_v1_graph()
        initial_state = self.create_v1_initial_state(query, scenario_type)
        
        config = RunnableConfig(
            configurable={
                "thread_id": "v1-research",
            }
        )
        
        try:
            async for event in graph.astream(initial_state, config):
                yield {
                    "version": "v1",
                    "event_type": "state_update",
                    "data": event,
                    "timestamp": "now"
                }
                
                # 检查完成状态
                if any(state.get("is_complete", False) for state in event.values()):
                    yield {
                        "version": "v1",
                        "event_type": "completion",
                        "data": {"status": "completed"},
                        "timestamp": "now"
                    }
                    break
                    
        except Exception as e:
            yield {
                "version": "v1",
                "event_type": "error",
                "data": {"error": str(e)},
                "timestamp": "now"
            }
    
    async def execute_v2_research(
        self, 
        query: str, 
        mode: str
    ) -> Iterator[Dict[str, Any]]:
        """执行V2研究流程"""
        
        print(f"🚀 启动V2研究流程：{query} (模式：{mode})")
        
        graph = self.get_v2_graph()
        initial_state = self.create_v2_initial_state(query, mode)
        
        config = RunnableConfig(
            configurable={
                "thread_id": "v2-research",
            }
        )
        
        try:
            print(f"🔄 开始执行V2图...")
            # 处理V2图事件 - 使用异步方式
            async for event in graph.astream(initial_state, config={"configurable": {"thread_id": "v2-research"}}):
                print(f"🔄 V2图事件: {list(event.keys())}")
                
                # 发送状态更新事件
                yield {
                    "version": "v2",
                    "event_type": "state_update",
                    "data": event,
                    "timestamp": "now"
                }
                
                for node_name, node_data in event.items():
                    print(f"🔄 处理节点: {node_name}")
                    print(f"🔄 节点数据类型: {type(node_data)}")
                    
                    if node_data is not None:
                        if isinstance(node_data, dict):
                            print(f"🔄 节点数据包含字段: {list(node_data.keys())}")
                            if "research_plan" in node_data:
                                print(f"🔄 研究计划包含 {len(node_data['research_plan'])} 个任务")
                            if "is_complete" in node_data:
                                print(f"🔄 完成状态: {node_data['is_complete']}")
                        else:
                            print(f"🔄 节点数据: {str(node_data)[:100]}...")
                    
                    # 特别关注reflection节点后的路由
                    if node_name == "reflection":
                        print(f"🔀🔀🔀 REFLECTION节点完成，等待下一个节点...")
                        if isinstance(node_data, dict) and node_data.get("is_complete", False):
                            print(f"🔀🔀🔀 反思返回is_complete=True，应该路由到task_coordinator")
                
                # 检查完成状态 - 只有finalize_answer节点完成时才真正结束
                should_complete = False
                for node_name, state in event.items():
                    if isinstance(state, dict) and state.get("is_complete", False):
                        # 只有最终答案节点完成时才真正结束
                        if node_name == "finalize_answer":
                            should_complete = True
                            break
                        # 任务协调器和反思节点返回完成时，继续等待后续节点
                        elif node_name in ["task_coordinator", "reflection"]:
                            print(f"🔀 {node_name}节点完成，但继续等待后续节点处理...")
                            continue
                
                if should_complete:
                    print(f"🔄 V2研究完成")
                    # 获取最终报告
                    final_report = ""
                    completed_tasks = 0
                    for node_name, state in event.items():
                        if isinstance(state, dict):
                            if state.get("final_report_markdown"):
                                final_report = state["final_report_markdown"]
                            if state.get("report"):
                                final_report = state["report"]
                            if state.get("execution_summary"):
                                completed_tasks = state["execution_summary"].get("completed_tasks", 0)
                    
                    print(f"📝 报告长度: {len(final_report or '')}")
                    yield {
                        "version": "v2",
                        "event_type": "completion",
                        "data": {
                            "status": "completed",
                            "report": final_report,
                            "completed_tasks": completed_tasks
                        },
                        "timestamp": "now"
                    }
                    break
                    
        except Exception as e:
            print(f"❌ V2研究执行失败: {e}")
            import traceback
            traceback.print_exc()
            yield {
                "version": "v2",
                "event_type": "error",
                "data": {"error": str(e)},
                "timestamp": "now"
            }
    
    async def execute_research(
        self, 
        request: UnifiedResearchRequest
    ) -> Iterator[Dict[str, Any]]:
        """执行统一研究流程"""
        
        if request.version == "v1":
            async for event in self.execute_v1_research(
                request.query, 
                request.scenario_type
            ):
                yield event
        elif request.version == "v2":
            async for event in self.execute_v2_research(
                request.query, 
                request.mode
            ):
                yield event
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"不支持的版本：{request.version}"
            )


# 全局API管理器
api_manager = APIManager()


async def stream_research_response(request: UnifiedResearchRequest):
    """流式研究响应"""
    
    try:
        async for event in api_manager.execute_research(request):
            # 根据版本处理不同的事件格式
            if request.version == "v1":
                # V1事件转换为前端期望的格式
                await handle_v1_event(event, request)
                for sse_data in convert_v1_event_to_sse(event):
                    yield sse_data
            elif request.version == "v2":
                # V2事件转换为前端期望的格式
                for sse_data in convert_v2_event_to_sse(event):
                    yield sse_data
            
            # 小延迟以确保流式体验
            await asyncio.sleep(0.1)
            
    except Exception as e:
        if request.version == "v1":
            error_data = {"step": "error", "details": str(e)}
        else:
            error_data = {"step": "error", "details": str(e)}
        
        error_json = json.dumps(error_data, ensure_ascii=False)
        yield f"data: {error_json}\n\n"


async def handle_v1_event(event: Dict[str, Any], request: UnifiedResearchRequest):
    """处理V1事件"""
    # 这里可以添加V1特定的处理逻辑
    pass


def convert_v1_event_to_sse(event: Dict[str, Any]) -> list:
    """将V1事件转换为SSE格式"""
    results = []
    
    if event.get("event_type") == "completion":
        # 完成事件
        complete_data = {"step": "complete", "report": ""}
        results.append(f"data: {json.dumps(complete_data, ensure_ascii=False)}\n\n")
    elif event.get("event_type") == "error":
        # 错误事件
        error_data = {"step": "error", "details": event.get("data", {}).get("error", "未知错误")}
        results.append(f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n")
    elif event.get("event_type") == "state_update":
        # 状态更新事件
        data = event.get("data", {})
        for node_name, node_data in data.items():
            if isinstance(node_data, dict):
                # 映射节点名称到步骤名称
                step_mapping = {
                    "generate_queries_node": "generate_queries",
                    "web_search_node": "search", 
                    "reflect_node": "reflection",
                    "generate_report_node": "generate_report"
                }
                
                step_name = step_mapping.get(node_name, node_name)
                cycle = node_data.get("cycle_count", 1)
                
                # 构建步骤数据
                step_data = {
                    "step": step_name,
                    "details": f"执行{step_name}步骤",
                    "state": {
                        "cycle_count": cycle,
                        "search_queries": node_data.get("search_queries", []),
                        "critique": node_data.get("critique", ""),
                        "report": node_data.get("report", ""),
                        "search_results_count": len(node_data.get("search_results", []))
                    }
                }
                
                # 如果是完成状态或有报告内容
                if node_data.get("is_complete", False) or node_data.get("report"):
                    complete_data = {
                        "step": "complete",
                        "report": node_data.get("report", ""),
                        "total_cycles": cycle
                    }
                    results.append(f"data: {json.dumps(complete_data, ensure_ascii=False)}\n\n")
                else:
                    results.append(f"data: {json.dumps(step_data, ensure_ascii=False)}\n\n")
    
    return results


def convert_v2_event_to_sse(event: Dict[str, Any]) -> list:
    """将V2事件转换为SSE格式"""
    results = []
    
    if event.get("event_type") == "completion":
        # 完成事件
        event_data = event.get("data", {})
        complete_data = {
            "step": "complete", 
            "report": event_data.get("report", ""),
            "completed_tasks": event_data.get("completed_tasks", 0),
            "data": event_data  # 包含完整数据以便前端访问
        }
        results.append(f"data: {json.dumps(complete_data, ensure_ascii=False)}\n\n")
    elif event.get("event_type") == "error":
        # 错误事件
        error_data = {"step": "error", "details": event.get("data", {}).get("error", "未知错误")}
        results.append(f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n")
    elif event.get("event_type") == "state_update":
        # V2状态更新事件
        data = event.get("data", {})
        for node_name, node_data in data.items():
            if isinstance(node_data, dict):
                # 生成V2节点的友好步骤信息
                step_info = generate_v2_step_info(node_name, node_data)
                if step_info:
                    results.append(f"data: {json.dumps(step_info, ensure_ascii=False)}\n\n")
    
    return results


def generate_v2_step_info(node_name: str, node_data: dict) -> dict:
    """生成V2节点的友好步骤信息"""
    
    # 获取当前任务信息
    current_task = None
    current_task_name = "未知任务"
    cycle = 1
    
    if "research_plan" in node_data and "current_task_pointer" in node_data:
        research_plan = node_data["research_plan"]
        pointer = node_data.get("current_task_pointer", 0)
        if 0 <= pointer < len(research_plan):
            current_task = research_plan[pointer]
            if hasattr(current_task, 'description'):
                current_task_name = current_task.description
            elif isinstance(current_task, dict):
                current_task_name = current_task.get('description', '未知任务')
    
    # 获取循环次数
    cycle = node_data.get("current_task_loop_count", 1) or 1
    
    # 根据节点类型生成友好的步骤信息
    if node_name == "planner":
        return {
            "step": "planning",
            "details": "🧠 智能规划 - 分析查询复杂度并生成研究计划",
            "state": {
                "tasks": [
                    {
                        "id": getattr(task, 'id', f'task-{i}') if hasattr(task, 'id') else (task.get('id', f'task-{i}') if isinstance(task, dict) else f'task-{i}'),
                        "name": getattr(task, 'description', f'任务{i+1}') if hasattr(task, 'description') else (task.get('description', f'任务{i+1}') if isinstance(task, dict) else f'任务{i+1}'),
                        "type": "research",
                        "priority": i + 1,
                        "status": "pending",
                        "cycles_completed": 0,
                        "max_cycles": 3
                    }
                    for i, task in enumerate(node_data.get("research_plan", []))
                ],
                "complexity_score": node_data.get("total_estimated_cycles", 0) / 3 if node_data.get("total_estimated_cycles") else None,
                "total_tasks": len(node_data.get("research_plan", [])),
                "completed_tasks": 0
            }
        }
    
    elif node_name == "task_coordinator":
        completed_tasks = len(node_data.get("completed_tasks", []))
        total_tasks = len(node_data.get("research_plan", []))
        
        return {
            "step": "task_coordination",
            "details": f"🎯 任务协调 - 管理研究进度 ({completed_tasks}/{total_tasks} 任务完成)",
            "state": {
                "current_task": {
                    "id": getattr(current_task, 'id', 'unknown') if current_task and hasattr(current_task, 'id') else (current_task.get('id', 'unknown') if current_task and isinstance(current_task, dict) else 'unknown'),
                    "name": current_task_name,
                    "cycles_completed": cycle
                } if current_task else None,
                "completed_tasks": completed_tasks,
                "total_tasks": total_tasks
            }
        }
    
    elif node_name == "generate_query":
        return {
            "step": "query_generation",
            "details": f"🔍 [{current_task_name}] 第{cycle}轮 - 生成搜索查询",
            "state": {
                "current_task": {
                    "name": current_task_name,
                    "cycles_completed": cycle
                },
                "search_queries": node_data.get("search_queries", [])
            }
        }
    
    elif node_name == "web_research":
        search_results_count = len(node_data.get("search_results", []))
        return {
            "step": "web_search",
            "details": f"🌐 [{current_task_name}] 第{cycle}轮 - 执行网络搜索 (获得{search_results_count}条结果)",
            "state": {
                "current_task": {
                    "name": current_task_name,
                    "cycles_completed": cycle
                },
                "search_results_count": search_results_count
            }
        }
    
    elif node_name == "reflection":
        is_complete = node_data.get("is_complete", False)
        critique = node_data.get("critique", "")
        
        return {
            "step": "reflection",
            "details": f"🤔 [{current_task_name}] 第{cycle}轮 - 反思和分析 ({'完成' if is_complete else '继续'})",
            "state": {
                "current_task": {
                    "name": current_task_name,
                    "cycles_completed": cycle
                },
                "critique": critique[:100] + "..." if len(critique) > 100 else critique,
                "is_complete": is_complete
            }
        }
    
    elif node_name == "finalize_answer":
        report_length = len(node_data.get("report", "") or node_data.get("final_report_markdown", ""))
        return {
            "step": "report_generation",
            "details": f"📄 生成综合报告 (报告长度: {report_length} 字符)",
            "state": {
                "report_length": report_length,
                "is_complete": True
            }
        }
    
    # 默认情况
    return {
        "step": node_name,
        "details": f"执行节点: {node_name}",
        "state": {}
    }


def create_unified_research_endpoint(app: FastAPI):
    """创建统一研究端点"""
    
    @app.post("/unified-research")
    async def unified_research(request: UnifiedResearchRequest):
        """
        统一研究端点
        支持V1和V2两种架构
        """
        
        print(f"📡 收到统一研究请求：")
        print(f"  查询：{request.query}")
        print(f"  版本：{request.version}")
        print(f"  场景/模式：{request.scenario_type if request.version == 'v1' else request.mode}")
        
        return StreamingResponse(
            stream_research_response(request),
            media_type="text/plain; charset=utf-8",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
    
    @app.get("/research-versions")
    async def get_research_versions():
        """获取支持的研究版本"""
        return {
            "versions": [
                {
                    "version": "v1",
                    "name": "经典研究架构",
                    "description": "基础的多轮搜索和报告生成",
                    "scenarios": ["simple", "adaptive", "complex"]
                },
                {
                    "version": "v2", 
                    "name": "高级智能架构",
                    "description": "智能规划、多任务协调、内容增强",
                    "modes": ["research_assistant", "quick_lookup", "deep_research"]
                }
            ]
        }
    
    print("🔗 统一研究端点已创建")


def get_api_manager() -> APIManager:
    """获取API管理器实例"""
    return api_manager 