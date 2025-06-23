"""
智能规划器节点
基于 langgraph-deep-research 项目的规划架构
将复杂用户查询分解为多个可执行的研究任务
"""

import os
from typing import Dict, List, Any
from dataclasses import dataclass
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

from .advanced_state import AdvancedResearchState, ResearchTask, PlanningState


@dataclass
class QueryComplexityAnalysis:
    """查询复杂度分析结果"""
    complexity_score: float  # 0-1，复杂度评分
    domain_count: int        # 涉及领域数量
    temporal_scope: str      # 时间范围：current/historical/future
    technical_depth: str     # 技术深度：basic/intermediate/advanced
    recommended_tasks: int   # 推荐任务数量
    estimated_cycles: int    # 预估总轮次


class ResearchPlanSchema(BaseModel):
    """研究计划输出架构"""
    tasks: List[Dict[str, Any]] = Field(
        description="研究任务列表，每个任务包含id、description、source_hint等字段"
    )


class PlannerAgent:
    """智能规划代理"""
    
    def __init__(self):
        self.llm = None
        
    def get_llm(self, config: RunnableConfig = None) -> ChatGoogleGenerativeAI:
        """获取LLM实例"""
        if not self.llm:
            api_key = os.getenv("GOOGLE_API_KEY")  # 与V1保持一致
            if not api_key:
                raise ValueError("GOOGLE_API_KEY环境变量未设置")
            
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    temperature=0.3,  # 规划需要较低温度保证逻辑性
                    max_retries=2,
                    api_key=api_key,  # 使用标准参数名
                )
                print(f"✅ V2 LLM实例创建成功")
            except Exception as e:
                print(f"❌ V2 LLM实例创建失败：{e}")
                raise
        return self.llm

    def analyze_query_complexity(self, user_query: str) -> QueryComplexityAnalysis:
        """分析查询复杂度"""
        
        # 简单的复杂度分析规则
        query_lower = user_query.lower()
        
        # 计算领域数量（基于关键词）
        domains = {
            "tech": ["ai", "人工智能", "machine learning", "区块链", "blockchain", "量子计算", "quantum"],
            "business": ["市场", "market", "商业", "business", "管理", "management", "金融", "finance"],
            "health": ["医疗", "health", "healthcare", "医学", "medicine", "健康"],
            "education": ["教育", "education", "学习", "learning", "培训", "training"],
            "environment": ["环境", "environment", "绿色", "green", "可持续", "sustainable"],
            "social": ["社会", "social", "文化", "culture", "政策", "policy"]
        }
        
        domain_count = 0
        for domain, keywords in domains.items():
            if any(keyword in query_lower for keyword in keywords):
                domain_count += 1
        
        # 分析时间范围
        temporal_indicators = {
            "current": ["2024", "现在", "当前", "目前", "current", "now", "today"],
            "future": ["未来", "前景", "趋势", "future", "trend", "projection", "forecast"],
            "historical": ["历史", "过去", "发展", "history", "past", "evolution"]
        }
        
        temporal_scope = "current"  # 默认
        for scope, indicators in temporal_indicators.items():
            if any(indicator in query_lower for indicator in indicators):
                temporal_scope = scope
                break
        
        # 分析技术深度
        technical_indicators = {
            "advanced": ["技术挑战", "实现", "implementation", "technical", "架构", "algorithm"],
            "intermediate": ["应用", "application", "使用", "方法", "method"],
            "basic": ["介绍", "概述", "overview", "基础", "basic"]
        }
        
        technical_depth = "intermediate"  # 默认
        for depth, indicators in technical_indicators.items():
            if any(indicator in query_lower for indicator in indicators):
                technical_depth = depth
                break
        
        # 计算复杂度评分
        complexity_score = min(1.0, (
            len(query_lower.split()) / 20 * 0.3 +  # 查询长度
            domain_count / 3 * 0.4 +               # 领域数量
            {"basic": 0.2, "intermediate": 0.5, "advanced": 0.8}[technical_depth] * 0.3
        ))
        
        # 推荐任务数量
        if complexity_score < 0.3:
            recommended_tasks = 2
        elif complexity_score < 0.6:
            recommended_tasks = 3
        elif complexity_score < 0.8:
            recommended_tasks = 4
        else:
            recommended_tasks = 5
            
        # 预估轮次
        estimated_cycles = recommended_tasks * 2 + domain_count
        
        return QueryComplexityAnalysis(
            complexity_score=complexity_score,
            domain_count=max(1, domain_count),
            temporal_scope=temporal_scope,
            technical_depth=technical_depth,
            recommended_tasks=recommended_tasks,
            estimated_cycles=estimated_cycles
        )

    def generate_planning_prompt(self, user_query: str, complexity: QueryComplexityAnalysis) -> str:
        """生成规划提示词"""
        
        return f"""你是 **PlannerAgent**。你的任务是分析用户研究查询并将其分解为多个具体、可执行的研究任务。

=== 任务分析原则 ===
1. **分解复杂查询**：将广泛主题分解为具体、可管理的子任务
2. **识别关键维度**：提取不同方面、类别或领域
3. **创建并行任务**：生成2-5个可独立研究的聚焦任务
4. **确保全面覆盖**：所有重要方面都应被涵盖

=== 当前查询分析 ===
- 复杂度评分：{complexity.complexity_score:.2f}
- 涉及领域数：{complexity.domain_count}
- 时间范围：{complexity.temporal_scope}
- 技术深度：{complexity.technical_depth}
- 推荐任务数：{complexity.recommended_tasks}

=== 任务分解策略 ===
基于研究查询，考虑这些维度：
- **领域分离**：分割不同字段/行业（如交通 vs 能源）
- **地理范围**：不同地区或全球 vs 本地
- **时间焦点**：当前趋势 vs 未来预测 vs 历史分析
- **技术深度**：概述 vs 实现细节 vs 案例研究
- **利益相关者视角**：政府、行业、技术、用户影响

=== 输出格式 ===
返回一个JSON数组，每个元素必须包含以下字段：

{{
  "id": "<kebab-case-unique-slug>",
  "description": "<一个具体、聚焦的研究任务>", 
  "info_needed": true,
  "source_hint": "<此任务的具体搜索关键词>",
  "status": "pending",
  "priority": 1-5,
  "task_type": "general|technical|comparison|analysis",
  "estimated_cycles": 2-4
}}

=== 规划示例 ===

**示例1**：用户查询："人工智能在医疗领域的应用现状"
[
  {{
    "id": "ai-medical-diagnostics",
    "description": "研究AI在医疗诊断和影像学中的应用",
    "info_needed": true,
    "source_hint": "AI医疗诊断 影像学 机器学习 医疗健康 2024",
    "status": "pending",
    "priority": 1,
    "task_type": "technical", 
    "estimated_cycles": 3
  }},
  {{
    "id": "ai-treatment-recommendations",
    "description": "研究AI驱动的治疗建议和药物发现",
    "info_needed": true,
    "source_hint": "AI治疗建议 药物发现 个性化医疗",
    "status": "pending",
    "priority": 2,
    "task_type": "analysis",
    "estimated_cycles": 3
  }},
  {{
    "id": "ai-healthcare-challenges",
    "description": "分析AI在医疗领域的挑战和伦理考量",
    "info_needed": true,
    "source_hint": "AI医疗伦理 隐私挑战 监管问题",
    "status": "pending", 
    "priority": 3,
    "task_type": "analysis",
    "estimated_cycles": 2
  }}
]

=== 要求 ===
1. **始终创建{complexity.recommended_tasks}个任务**（除非查询极其具体）
2. **每个任务应聚焦且具体**
3. **任务应互补但独立**
4. **使用描述性、可操作的任务描述**
5. **为每个任务提供针对性的搜索提示**
6. **考虑优先级和预估轮次**

=== 当前研究查询 ===
用户查询：{user_query}

=== 指令 ===
分析用户查询并将其分解为具体的研究任务。专注于创建多个聚焦任务而不是一个广泛任务。**只**输出JSON数组。"""

    def create_research_plan(self, user_query: str, config: RunnableConfig = None) -> List[ResearchTask]:
        """创建研究计划"""
        
        print(f"📝 开始创建研究计划...")
        print(f"📝 用户查询: {user_query}")
        
        # 分析查询复杂度
        print(f"📝 分析查询复杂度...")
        complexity = self.analyze_query_complexity(user_query)
        print(f"📝 复杂度分析完成: 评分={complexity.complexity_score:.2f}, 推荐任务数={complexity.recommended_tasks}")
        
        # 生成规划提示
        print(f"📝 生成规划提示...")
        prompt = self.generate_planning_prompt(user_query, complexity)
        print(f"📝 提示长度: {len(prompt)} 字符")
        
        try:
            # 使用与V1相同的直接API调用方式
            print(f"📝 使用直接API调用...")
            response_text = self.invoke_gemini_api_direct(prompt)
            print(f"📝 API调用成功，响应长度: {len(response_text)} 字符")
            print(f"📝 响应内容前100字符: {response_text[:100]}...")
            
            # 手动解析JSON
            print(f"📝 解析JSON响应...")
            import json
            
            # 清理响应文本，提取JSON部分
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            if response_text.startswith('['):
                # 直接是JSON数组
                tasks_data = json.loads(response_text)
            else:
                # 可能包含其他文本，尝试找到JSON部分
                import re
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    tasks_data = json.loads(json_match.group())
                else:
                    raise ValueError("无法在响应中找到JSON数组")
            
            print(f"📝 解析成功，获得 {len(tasks_data)} 个任务")
            
            # 转换为ResearchTask对象
            print(f"📝 转换为ResearchTask对象...")
            research_tasks = []
            for i, task_data in enumerate(tasks_data):
                print(f"📝 处理任务 {i+1}: {task_data.get('id', 'unknown')}")
                task = ResearchTask(
                    id=task_data.get("id", f"task-{i+1}"),
                    description=task_data.get("description", f"研究任务 {i+1}"),
                    priority=task_data.get("priority", 1),
                    status=task_data.get("status", "pending"),
                    task_type=task_data.get("task_type", "general"),
                    estimated_cycles=task_data.get("estimated_cycles", 2),
                    info_needed=task_data.get("info_needed", True),
                    source_hint=task_data.get("source_hint", task_data.get("description", ""))
                )
                research_tasks.append(task)
            
            print(f"🎯 成功生成研究计划：{len(research_tasks)}个任务")
            for task in research_tasks:
                print(f"  - {task.id}: {task.description}")
            
            return research_tasks
            
        except Exception as e:
            print(f"❌ 规划生成失败：{e}")
            import traceback
            traceback.print_exc()
            
            # fallback：创建单一任务
            print(f"📝 使用fallback任务...")
            fallback_task = ResearchTask(
                id="task-1",
                description=f"研究和回答：{user_query}",
                priority=1,
                status="pending",
                task_type="general",
                estimated_cycles=3,
                info_needed=True,
                source_hint=user_query
            )
            
            return [fallback_task]
    
    def invoke_gemini_api_direct(self, prompt: str) -> str:
        """
        直接调用Gemini API，使用与V1相同的方法
        """
        import httpx
        import os
        
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
                "temperature": 0.3,
                "responseMimeType": "application/json"
            }
        }

        try:
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
            raise Exception(f"Error: The request to Gemini API failed. Details: {e}")
        except Exception as e:
            print(f"ERROR: A general error occurred in invoke_gemini_api_direct: {e}")
            raise Exception(f"Error: An unexpected error occurred. Details: {e}")


# 全局规划器实例
_planner_agent = PlannerAgent()


def planner_node(state: AdvancedResearchState, config: RunnableConfig) -> Dict[str, Any]:
    """
    LangGraph规划器节点
    将用户查询转换为多步骤研究计划
    """
    
    try:
        # 获取用户查询
        user_query = state.get("user_query", "")
        if not user_query:
            # 从消息中提取查询（兼容性处理）
            messages = state.get("messages", [])
            if messages:
                user_query = str(messages[-1])
        
        if not user_query:
            raise ValueError("无法获取用户查询")
        
        print(f"🎯 开始规划研究任务...")
        print(f"  用户查询：{user_query}")
        
        # 创建研究计划
        research_plan = _planner_agent.create_research_plan(user_query, config)
        
        # 计算预估总轮次
        total_estimated_cycles = sum(task.estimated_cycles for task in research_plan)
        
        print(f"📋 规划完成：")
        print(f"  任务数量：{len(research_plan)}")
        print(f"  预估总轮次：{total_estimated_cycles}")
        
        # 将ResearchTask对象转换为字典格式，确保可序列化
        research_plan_dicts = []
        for task in research_plan:
            task_dict = {
                "id": task.id,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "task_type": task.task_type,
                "estimated_cycles": task.estimated_cycles,
                "info_needed": task.info_needed,
                "source_hint": task.source_hint
            }
            research_plan_dicts.append(task_dict)
        
        # 返回状态更新
        result = {
            "user_query": user_query,
            "research_plan": research_plan_dicts,  # 使用字典格式
            "current_task_pointer": 0,
            "total_estimated_cycles": total_estimated_cycles,
            "completed_tasks": [],
            "failed_tasks": [],
            "reasoning_model": "gemini-1.5-flash",
            
            # 兼容性字段
            "plan": [
                {
                    "id": task.id,
                    "description": task.description,
                    "info_needed": task.info_needed,
                    "source_hint": task.source_hint,
                    "status": task.status
                }
                for task in research_plan
            ]
        }
        
        print(f"✅ 规划器节点执行成功，返回 {len(result)} 个字段")
        return result
        
    except Exception as e:
        print(f"❌ 规划器节点执行失败：{e}")
        import traceback
        traceback.print_exc()
        
        # 返回fallback状态
        fallback_task_dict = {
            "id": "fallback-task",
            "description": f"研究：{state.get('user_query', '未知查询')}",
            "priority": 1,
            "status": "pending",
            "task_type": "general",
            "estimated_cycles": 3,
            "info_needed": True,
            "source_hint": state.get('user_query', '')
        }
        
        return {
            "user_query": state.get("user_query", ""),
            "research_plan": [fallback_task_dict],  # 使用字典格式
            "current_task_pointer": 0,
            "total_estimated_cycles": 3,
            "completed_tasks": [],
            "failed_tasks": [],
            "reasoning_model": "gemini-1.5-flash",
            "plan": [fallback_task_dict]
        }


def get_current_task(state: AdvancedResearchState) -> ResearchTask:
    """获取当前任务"""
    research_plan = state.get("research_plan", [])
    current_pointer = state.get("current_task_pointer", 0)
    
    if current_pointer < len(research_plan):
        task_data = research_plan[current_pointer]
        
        # 如果是字典格式，转换为ResearchTask对象
        if isinstance(task_data, dict):
            return ResearchTask(
                id=task_data.get("id", f"task-{current_pointer}"),
                description=task_data.get("description", "未知任务"),
                priority=task_data.get("priority", 1),
                status=task_data.get("status", "pending"),
                task_type=task_data.get("task_type", "general"),
                estimated_cycles=task_data.get("estimated_cycles", 2),
                info_needed=task_data.get("info_needed", True),
                source_hint=task_data.get("source_hint", "")
            )
        # 如果已经是ResearchTask对象，直接返回
        elif isinstance(task_data, ResearchTask):
            return task_data
    
    # 返回默认任务
    return ResearchTask(
        id="default-task",
        description="默认研究任务",
        priority=1,
        status="pending"
    )


def is_planning_complete(state: AdvancedResearchState) -> bool:
    """判断规划是否完成"""
    
    # 首先检查反思是否决定完成整个研究
    if state.get("is_complete", False):
        print(f"🏁 反思决定研究完成，结束所有任务")
        return True
    
    # 然后检查是否所有任务都已完成
    research_plan = state.get("research_plan", [])
    current_pointer = state.get("current_task_pointer", 0)
    
    all_tasks_done = current_pointer >= len(research_plan)
    if all_tasks_done:
        print(f"🏁 所有任务已完成 ({current_pointer}/{len(research_plan)})")
    
    return all_tasks_done 