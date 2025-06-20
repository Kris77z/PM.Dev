"""
任务协调器节点
管理多任务工作流和状态转换
"""

from typing import Dict, List, Any, Optional
from langchain_core.runnables import RunnableConfig

from .advanced_state import AdvancedResearchState, ResearchTask, TaskResult
from .planner import get_current_task, is_planning_complete


class TaskCoordinator:
    """任务协调器"""
    
    def __init__(self):
        pass
    
    def determine_execution_strategy(
        self, 
        task: ResearchTask, 
        global_context: List[str],
        previous_results: List[TaskResult]
    ) -> str:
        """确定任务执行策略"""
        
        # 基于任务类型选择策略
        if task.task_type == "technical":
            return "deep_technical_research"
        elif task.task_type == "comparison":
            return "comparative_analysis"
        elif task.task_type == "analysis":
            return "analytical_research"
        else:
            return "general_research"
    
    def should_continue_current_task(self, state: AdvancedResearchState) -> bool:
        """判断是否应该继续当前任务"""
        
        current_task_loop_count = state.get("current_task_loop_count", 0)
        max_loops_per_task = state.get("max_research_loops_per_task", 4)
        
        # 检查轮次限制
        if current_task_loop_count >= max_loops_per_task:
            print(f"⏹️ 任务达到最大轮次限制 ({max_loops_per_task})")
            return False
        
        # 检查是否有足够的研究结果
        current_findings = state.get("current_task_detailed_findings", [])
        if len(current_findings) >= 5:  # 简单阈值
            print(f"✅ 任务有足够研究结果 ({len(current_findings)}个)")
            return False
        
        return True
    
    def advance_to_next_task(self, state: AdvancedResearchState) -> Dict[str, Any]:
        """推进到下一个任务"""
        
        research_plan = state.get("research_plan", [])
        current_pointer = state.get("current_task_pointer", 0)
        
        # 标记当前任务为完成
        if current_pointer < len(research_plan):
            # 处理字典格式的任务
            if isinstance(research_plan[current_pointer], dict):
                research_plan[current_pointer]["status"] = "completed"
                completed_task_id = research_plan[current_pointer].get("id", f"task-{current_pointer}")
            else:
                # 处理对象格式的任务
                research_plan[current_pointer].status = "completed"
                completed_task_id = research_plan[current_pointer].id
                
            completed_tasks = state.get("completed_tasks", [])
            completed_tasks.append(completed_task_id)
            
            print(f"✅ 任务 {completed_task_id} 标记为完成")
        
        # 移动到下一个任务
        new_pointer = current_pointer + 1
        
        if new_pointer < len(research_plan):
            # 处理字典格式的任务描述
            if isinstance(research_plan[new_pointer], dict):
                next_task_desc = research_plan[new_pointer].get("description", "未知任务")
            else:
                next_task_desc = research_plan[new_pointer].description
                
            print(f"📋 推进到任务 {new_pointer}: {next_task_desc}")
            
            return {
                "current_task_pointer": new_pointer,
                "current_task_loop_count": 0,  # 重置新任务的循环计数
                "completed_tasks": completed_tasks,
                "research_plan": research_plan  # 确保更新的计划被传递
            }
        else:
            print(f"🏁 所有任务已完成！")
            return {
                "is_complete": True,
                "current_task_pointer": new_pointer,
                "completed_tasks": completed_tasks,
                "research_plan": research_plan
            }
    
    def get_task_context(self, state: AdvancedResearchState) -> Dict[str, Any]:
        """获取任务上下文信息"""
        
        current_task = get_current_task(state)
        global_memory = state.get("global_memory", [])
        task_results = state.get("task_results", [])
        
        # 构建相关上下文
        relevant_context = {
            "current_task": current_task,
            "previous_findings": global_memory[-3:] if global_memory else [],  # 最近3个全局记忆
            "related_results": [
                result for result in task_results 
                if result.task_id != current_task.id  # 其他任务的结果
            ][-2:],  # 最近2个相关结果
            "task_progress": {
                "current_loop": state.get("current_task_loop_count", 0),
                "max_loops": state.get("max_research_loops_per_task", 4),
                "total_findings": len(state.get("current_task_detailed_findings", []))
            }
        }
        
        return relevant_context


# 全局协调器实例
_task_coordinator = TaskCoordinator()


def task_coordinator_node(state: AdvancedResearchState, config: RunnableConfig) -> Dict[str, Any]:
    """
    LangGraph任务协调器节点
    管理多任务执行流程
    """
    
    print(f"🎛️🎛️🎛️ 任务协调器启动!!! 🎛️🎛️🎛️")
    print(f"🎛️ 状态字段: {list(state.keys())}")
    print(f"🎛️ 研究计划长度: {len(state.get('research_plan', []))}")
    print(f"🎛️ 当前任务指针: {state.get('current_task_pointer', 0)}")
    print(f"🎛️ is_complete状态: {state.get('is_complete', False)}")
    
    try:
        # 首先检查反思是否决定完成整个研究
        if state.get("is_complete", False):
            print(f"🏁 反思决定研究完成，立即生成最终报告")
            return {
                "is_complete": True,
                "next_step": "finalize_report"
            }
        
        # 检查是否所有任务完成
        print(f"🎛️ 检查是否所有任务完成...")
        planning_complete = is_planning_complete(state)
        print(f"🎛️ 规划完成状态: {planning_complete}")
        
        if planning_complete:
            print(f"🏁 所有任务已完成，准备生成最终报告")
            return {
                "is_complete": True,
                "next_step": "finalize_report"
            }
        
        # 获取当前任务
        print(f"🎛️ 获取当前任务...")
        current_task = get_current_task(state)
        current_pointer = state.get("current_task_pointer", 0)
        
        print(f"📋 当前任务 {current_pointer}: {current_task.id} - {current_task.description}")
        
        # 检查是否应该继续当前任务
        print(f"🎛️ 检查是否继续当前任务...")
        should_continue = _task_coordinator.should_continue_current_task(state)
        print(f"🎛️ 是否继续: {should_continue}")
        
        if should_continue:
            # 继续当前任务
            execution_strategy = _task_coordinator.determine_execution_strategy(
                task=current_task,
                global_context=state.get("global_memory", []),
                previous_results=state.get("task_results", [])
            )
            
            print(f"🔄 继续任务执行，策略：{execution_strategy}")
            
            result = {
                "current_task_execution_strategy": execution_strategy,
                "next_step": "continue_task",
                "task_context": _task_coordinator.get_task_context(state)
            }
            print(f"🎛️ 返回结果字段: {list(result.keys())}")
            return result
        else:
            # 完成当前任务，推进到下一个任务
            print(f"✅ 完成当前任务，推进到下一个任务")
            
            advance_result = _task_coordinator.advance_to_next_task(state)
            print(f"🎛️ 推进结果字段: {list(advance_result.keys())}")
            
            # 检查advance_result是否已经标记为完成
            if advance_result.get("is_complete", False):
                print(f"🏁 所有任务完成")
                advance_result.update({
                    "next_step": "finalize_report"
                })
                print(f"🎛️ 最终返回结果字段: {list(advance_result.keys())}")
                return advance_result
            
            # 检查是否还有更多任务
            new_pointer = advance_result["current_task_pointer"]
            research_plan = advance_result["research_plan"]
            
            if new_pointer >= len(research_plan):
                print(f"🏁 所有任务完成")
                advance_result.update({
                    "is_complete": True,
                    "next_step": "finalize_report"
                })
            else:
                # 处理字典格式的任务描述
                if isinstance(research_plan[new_pointer], dict):
                    next_task_desc = research_plan[new_pointer].get("description", "未知任务")
                else:
                    next_task_desc = research_plan[new_pointer].description
                    
                print(f"📋 推进到任务 {new_pointer}: {next_task_desc}")
                advance_result.update({
                    "next_step": "start_new_task"
                })
            
            print(f"🎛️ 最终返回结果字段: {list(advance_result.keys())}")
            return advance_result
            
    except Exception as e:
        print(f"❌ 任务协调器执行失败: {e}")
        import traceback
        traceback.print_exc()
        
        # 返回fallback状态
        return {
            "next_step": "continue_task",
            "error": str(e)
        }


def decide_next_step_in_plan(state: AdvancedResearchState) -> str:
    """
    决定研究计划中的下一步
    用于LangGraph的条件边
    """
    
    # 检查是否完成所有任务
    if is_planning_complete(state):
        print("🏁 所有研究任务完成，生成最终报告")
        return "finalize_report"
    
    # 继续下一个任务
    print("📋 继续执行下一个研究任务")
    return "continue_research"


def get_execution_status(state: AdvancedResearchState) -> Dict[str, Any]:
    """获取执行状态摘要"""
    
    research_plan = state.get("research_plan", [])
    current_pointer = state.get("current_task_pointer", 0)
    completed_tasks = state.get("completed_tasks", [])
    failed_tasks = state.get("failed_tasks", [])
    
    total_tasks = len(research_plan)
    completed_count = len(completed_tasks)
    failed_count = len(failed_tasks)
    pending_count = total_tasks - completed_count - failed_count
    
    return {
        "total_tasks": total_tasks,
        "completed_count": completed_count,
        "failed_count": failed_count,
        "pending_count": pending_count,
        "current_task_index": current_pointer,
        "progress_percentage": (completed_count / total_tasks * 100) if total_tasks > 0 else 0,
        "current_task": get_current_task(state) if current_pointer < total_tasks else None
    } 