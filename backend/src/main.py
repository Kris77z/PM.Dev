"""
FastAPI主应用
支持V1和V2两种LangGraph架构的研究功能
"""

import os
import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, AsyncGenerator
from langchain_core.runnables import RunnableConfig
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# V1架构导入
from agent.graph import build_graph
from agent.state import ResearchState

# V2架构导入
from unified_api import create_unified_research_endpoint, UnifiedResearchRequest

# V1.5 快速搜索API导入
from quick_search_api import create_quick_search_endpoints


class ResearchRequest(BaseModel):
    """V1研究请求（保持兼容性）"""
    query: str
    scenario_type: str = "default"


# 应用生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动和关闭时的处理"""
    print("🚀 FastAPI应用启动")
    print("🔧 初始化LangGraph研究系统...")
    
    # 可以在这里进行预热或初始化
    try:
        # 测试V1图
        test_state: ResearchState = {
            "user_query": "测试", 
            "search_queries": [], 
            "search_results": [], 
            "critique": "", 
            "report": "", 
            "is_complete": False, 
            "cycle_count": 0
        }
        print("✅ V1架构测试通过")
        
        # 测试V2图（如果需要）
        # test_v2_graph = get_advanced_research_graph()
        print("✅ V2架构准备就绪")
        
    except Exception as e:
        print(f"⚠️ 初始化警告：{e}")
    
    print("✅ 系统初始化完成")
    
    yield
    
    print("🛑 FastAPI应用关闭")


# 创建FastAPI应用
app = FastAPI(
    title="LangGraph Research API",
    description="支持多种架构的智能研究API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== V1 API（保持现有功能） =====

async def stream_research_v1(query: str, scenario_type: str) -> AsyncGenerator[str, None]:
    """
    V1研究流式处理 - 支持新的用户友好格式
    """
    initial_state = {
        "user_query": query,
        "search_queries": [],
        "search_results": [],
        "critique": "",
        "report": "",
        "cycle_count": 0,
        "max_cycles": 1,
        "scenario_type": scenario_type,
        "enhancement_stats": None
    }
    
    config = RunnableConfig(
        configurable={
            "thread_id": f"research-{hash(query)}",
        }
    )
    
    final_state = None
    current_step = None  # 跟踪当前步骤
    
    # 定义步骤顺序和下一步映射
    step_order = ["research-planning", "information-gathering", "content-enhancement", "deep-analysis", "report-generation"]
    next_step_map = {
        "research-planning": "information-gathering",
        "information-gathering": "content-enhancement", 
        "content-enhancement": "deep-analysis",
        "deep-analysis": "report-generation",
        "report-generation": None  # 最后一步
    }
    
    # 使用自定义的print函数来捕获STEP_INFO
    import sys
    from io import StringIO
    
    original_stdout = sys.stdout
    step_info_buffer = []
    
    class StepInfoCapture:
        def __init__(self, original_stdout):
            self.original_stdout = original_stdout
            self.buffer = ""
            
        def write(self, text):
            # 始终输出到控制台（保持日志可见）
            self.original_stdout.write(text)
            
            # 检查是否包含STEP_INFO并缓存
            if "STEP_INFO:" in text:
                lines = text.split('\n')
                for line in lines:
                    if line.strip().startswith("STEP_INFO:"):
                        step_info_buffer.append(line.strip())
            
        def flush(self):
            self.original_stdout.flush()
    
    try:
        # 使用自定义的stdout捕获器
        sys.stdout = StepInfoCapture(original_stdout)
        
        # 创建V1图实例
        v1_graph = build_graph()
        
        async for event in v1_graph.astream(initial_state, config):
            for node_name, node_data in event.items():
                if isinstance(node_data, dict):
                    final_state = node_data
                    
                    # 根据节点名称更新currentStep并立即发送状态
                    if node_name == "generate_queries":
                        current_step = "research-planning"
                    elif node_name == "web_search":
                        current_step = "information-gathering"
                    elif node_name == "content_enhancement":
                        current_step = "content-enhancement"
                    elif node_name == "reflect":
                        current_step = "deep-analysis"
                    elif node_name == "generate_report":
                        current_step = "report-generation"
                    
                    print(f"节点开始执行: {node_name} -> currentStep: {current_step}")
                    
                    # 🔥 发送用户友好的步骤状态
                    step_titles = {
                        "research-planning": "正在深度研究",
                        "information-gathering": "正在搜集资料", 
                        "content-enhancement": "正在深度分析",
                        "deep-analysis": "正在深度分析",
                        "report-generation": "正在生成报告"
                    }
                    
                    simple_status = {
                        "type": "step_update",
                        "step": current_step,
                        "currentStep": current_step,
                        "title": step_titles.get(current_step, f"正在执行{current_step}"),
                        "description": f"{step_titles.get(current_step, current_step)}阶段",
                        "user_friendly": True
                    }
                    print(f"📡 发送简化状态: {current_step}")
                    yield f"data: {json.dumps(simple_status, ensure_ascii=False)}\n\n"
                    
                    # 强制刷新，确保数据立即发送
                    await asyncio.sleep(0.01)
                    
                    # 🔥 恢复完整STEP_INFO处理，但修复currentStep逻辑
                    while step_info_buffer:
                        step_info_line = step_info_buffer.pop(0)
                        try:
                            json_str = step_info_line.split("STEP_INFO:", 1)[1].strip()
                            step_info = json.loads(json_str)
                            
                            # 关键修复：根据步骤类型决定currentStep
                            if step_info.get("type") == "step_complete":
                                # 如果是步骤完成，currentStep应该指向下一个步骤
                                step_name = step_info.get("step")
                                next_step = next_step_map.get(step_name)
                                if next_step:
                                    step_info["currentStep"] = next_step
                                    print(f"✅ 步骤完成: {step_name} -> currentStep设为下一步: {next_step}")
                                else:
                                    step_info["currentStep"] = step_name  # 最后一步保持不变
                                    print(f"✅ 最后步骤完成: {step_name}")
                            else:
                                # 如果是步骤开始或进行中，currentStep就是当前步骤
                                step_info["currentStep"] = current_step
                            
                            print(f"📤 发送步骤信息: step={step_info.get('step')}, currentStep={step_info.get('currentStep')}, type={step_info.get('type')}")
                            
                            # 直接yield完整的STEP_INFO（保留原有的详细信息）
                            yield f"data: {json.dumps(step_info, ensure_ascii=False)}\n\n"
                        except Exception as e:
                            print(f"解析STEP_INFO失败: {e}")
                    
                    # 如果有报告内容且标记为完成，发送完成事件
                    if node_data.get("report") and node_data.get("is_complete", False):
                        complete_data = {
                            "step": "complete", 
                            "report": node_data.get("report", ""),
                            "total_cycles": node_data.get("cycle_count", 1)
                        }
                        yield f"data: {json.dumps(complete_data, ensure_ascii=False)}\n\n"
                        return
            
            # 小延迟避免过快发送
            await asyncio.sleep(0.1)
        
        # 处理剩余的STEP_INFO
        while step_info_buffer:
            step_info_line = step_info_buffer.pop(0)
            try:
                json_str = step_info_line.split("STEP_INFO:", 1)[1].strip()
                step_info = json.loads(json_str)
                
                # 同样处理剩余的STEP_INFO
                if step_info.get("type") == "step_complete":
                    step_name = step_info.get("step")
                    next_step = next_step_map.get(step_name)
                    if next_step:
                        step_info["currentStep"] = next_step
                    else:
                        step_info["currentStep"] = step_name
                
                yield f"data: {json.dumps(step_info, ensure_ascii=False)}\n\n"
            except Exception as e:
                print(f"解析最终STEP_INFO失败: {e}")
        
        # 图执行完毕后的最终检查
        if final_state and final_state.get("report") and not final_state.get("is_complete"):
            complete_data = {
                "step": "complete",
                "report": final_state.get("report", ""),
                "total_cycles": final_state.get("cycle_count", 1)
            }
            yield f"data: {json.dumps(complete_data, ensure_ascii=False)}\n\n"
            
    except Exception as e:
        error_data = {"step": "error", "details": str(e)}
        yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"
    finally:
        # 恢复原始stdout
        sys.stdout = original_stdout


@app.post("/research")
async def research(request: ResearchRequest):
    """
    V1研究端点（保持兼容性）
    执行基础的多轮搜索和报告生成
    """
    print(f"📡 收到V1研究请求：{request.query} (场景：{request.scenario_type})")
    
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="查询不能为空")
    
    return StreamingResponse(
        stream_research_v1(request.query, request.scenario_type),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )


# ===== V1.5 快速搜索API =====

# 集成快速搜索端点 - 用于基础对话增强
create_quick_search_endpoints(app)


# ===== V2 API（新的统一架构） =====

# 集成统一API端点
create_unified_research_endpoint(app)


# ===== 通用端点 =====

@app.get("/")
async def root():
    """API根端点"""
    return {
        "message": "LangGraph Research API",
        "version": "2.0.0",
        "description": "支持V1.5和V2两种架构的智能研究API",
        "endpoints": {
            "v1.5": "/research - 增强研究架构 (含Firecrawl)",
            "v2": "/unified-research - 高级智能架构",
            "quick_search": "/api/quick-search - 快速搜索 (支持对话增强)",
            "versions": "/research-versions - 获取支持的版本信息"
        }
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "v1_available": True,
        "v2_available": True,
        "timestamp": "now"
    }


@app.get("/api-info")
async def api_info():
    """API信息端点"""
    return {
        "api_version": "2.0.0",
        "supported_architectures": [
            {
                "version": "v1.5",
                "name": "增强研究架构",
                "endpoint": "/research",
                "features": ["多轮搜索", "Firecrawl内容增强", "智能反思", "报告生成"],
                "scenarios": ["simple", "adaptive", "complex"],
                "new_in_v1_5": ["深度内容抓取", "URL质量筛选", "增强统计报告"]
            },
            {
                "version": "v2",
                "name": "高级智能架构", 
                "endpoint": "/unified-research",
                "features": ["智能规划", "多任务协调", "内容增强", "并行处理"],
                "modes": ["research_assistant", "quick_lookup", "deep_research"]
            }
        ],
        "quick_search_api": {
            "endpoint": "/api/quick-search",
            "purpose": "为基础对话提供信息检索增强",
            "features": ["快速网络搜索", "可选Firecrawl增强", "智能摘要生成"],
            "use_cases": ["DeepSeek等模型增强", "实时信息查询", "对话上下文补充"]
        },
        "environment": {
            "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY")),
            "google_search_configured": bool(os.getenv("GOOGLE_API_KEY"))
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    print("🌟 启动LangGraph Research API服务器")
    print("📋 支持的功能：")
    print("  ✅ V1架构：经典多轮搜索")
    print("  🚀 V2架构：智能多任务研究")
    print("  🔄 流式响应")
    print("  🌐 CORS支持")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 