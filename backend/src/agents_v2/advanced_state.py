"""
高级研究状态管理
基于 langgraph-deep-research 项目的状态架构
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import TypedDict, List, Optional, Dict, Any
from typing_extensions import Annotated
import operator


@dataclass
class ResearchTask:
    """研究任务数据结构"""
    id: str
    description: str
    priority: int = 1
    status: str = "pending"  # pending, running, completed, failed
    task_type: str = "general"  # general, technical, comparison, analysis
    estimated_cycles: int = 2
    info_needed: bool = True
    source_hint: Optional[str] = None


@dataclass  
class TaskResult:
    """任务执行结果"""
    task_id: str
    description: str
    findings_summary: str  # AI生成的简洁总结 (1-2句话)
    detailed_findings: List[str]  # 详细发现列表
    search_queries_used: List[str]  # 使用的搜索查询
    sources_citations: List[Dict[str, str]]  # 引用来源映射
    quality_score: float = 0.0  # 结果质量评分
    completion_time: Optional[str] = None


@dataclass
class ContentQualityAssessment:
    """内容质量评估结果"""
    overall_score: float  # 总体质量分数 (0-1)
    needs_enhancement: bool  # 是否需要增强
    priority_urls: List[str]  # 优先增强的URL
    enhancement_type: str  # 增强类型: "depth", "breadth", "accuracy"
    gap_analysis: str  # 缺口分析描述


class AdvancedResearchState(TypedDict):
    """
    高级研究代理状态
    支持多任务、跨任务记忆、智能增强等高级功能
    """
    
    # ===== 核心研究信息 =====
    user_query: str                    # 用户原始查询
    research_plan: List[ResearchTask]  # AI生成的研究计划
    current_task_pointer: int          # 当前任务指针
    total_estimated_cycles: int        # 预估总轮次
    
    # ===== 多任务协调 =====
    task_results: Annotated[List[TaskResult], operator.add]        # 任务执行结果
    global_memory: Annotated[List[str], operator.add]              # 跨任务全局记忆
    completed_tasks: List[str]                                     # 已完成任务ID列表
    failed_tasks: List[str]                                        # 失败任务ID列表
    
    # ===== 搜索和处理 =====
    executed_search_queries: Annotated[List[str], operator.add]    # 已执行的搜索查询
    web_research_results: Annotated[List[dict], operator.add]      # 网络搜索结果
    sources_gathered: Annotated[List[dict], operator.add]          # 收集的源信息
    parallel_search_results: Annotated[List[dict], operator.add]   # 并行搜索结果
    
    # ===== 反思和评估 =====
    reflection_is_sufficient: Optional[bool]           # 反思：信息是否充足
    reflection_knowledge_gap: Optional[str]            # 反思：识别的知识缺口
    reflection_follow_up_queries: Optional[List[str]]  # 反思：建议的后续查询
    reflection_quality_score: Optional[float]         # 反思：质量评分
    
    # ===== 智能增强系统 =====
    enhancement_decision: Optional[Dict[str, Any]]     # 增强决策结果
    enhancement_status: Optional[str]                  # 增强状态: analyzing/completed/skipped/failed
    enhanced_content_results: Optional[List[Dict[str, Any]]]  # 增强内容结果
    enhanced_sources_count: Optional[int]              # 成功增强的源数量
    enhancement_quality_boost: Optional[float]         # 增强带来的质量提升
    enhancement_error: Optional[str]                   # 增强过程错误信息
    
    # ===== 执行控制 =====
    max_research_loops_per_task: int        # 每任务最大轮次
    current_task_loop_count: int            # 当前任务轮次计数
    total_research_loops: int               # 总研究轮次
    reasoning_model: str                    # 推理模型名称
    
    # ===== 任务特定结果 =====
    current_task_detailed_findings: Annotated[List[Dict[str, Any]], operator.add]  # 当前任务详细发现
    task_specific_results: Annotated[List[Dict[str, Any]], operator.add]           # 按任务分组的结果
    
    # ===== 最终输出 =====
    final_report_markdown: Optional[str]    # 最终Markdown报告
    execution_summary: Optional[Dict]       # 执行总结统计
    
    # ===== 错误处理 =====
    last_error: Optional[str]               # 最后一个错误
    error_recovery_attempts: int            # 错误恢复尝试次数
    
    # ===== 兼容性字段 (保持与v1的兼容) =====
    search_queries: List[str]                              # v1兼容：搜索查询列表
    search_results: Annotated[List[dict], operator.add]    # v1兼容：搜索结果 (支持并行更新)
    critique: str                                          # v1兼容：反思内容
    report: str                                            # v1兼容：报告内容
    is_complete: bool                                      # v1兼容：完成标志
    cycle_count: int                                       # v1兼容：轮次计数
    scenario_type: Optional[str]                           # v1兼容：场景类型


# ===== 专用状态类型 =====

class PlanningState(TypedDict):
    """规划器专用状态"""
    user_query: str
    complexity_analysis: Optional[Dict[str, Any]]
    generated_plan: Optional[List[ResearchTask]]
    planning_rationale: Optional[str]


class TaskExecutionState(TypedDict):
    """任务执行专用状态"""
    current_task: ResearchTask
    execution_strategy: str
    search_queries: List[str]
    search_results: List[dict]
    task_progress: Dict[str, Any]


class EnhancementState(TypedDict):
    """内容增强专用状态"""
    content_quality: Optional[ContentQualityAssessment]
    enhancement_targets: List[str]
    enhancement_results: List[Dict[str, Any]]
    enhancement_metrics: Dict[str, float]


class ReportingState(TypedDict):
    """报告生成专用状态"""
    all_task_results: List[TaskResult]
    global_insights: List[str]
    report_structure: Dict[str, Any]
    final_report: str 