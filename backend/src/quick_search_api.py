"""
V1.5快速搜索API - 支持基础对话增强
为DeepSeek等不具备网络搜索能力的模型提供信息检索增强
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import time
import json

# 导入V1的搜索工具和新的Firecrawl工具
from agent.tools import google_web_search
from agent.firecrawl_utils import enhance_search_results_sync, EnhancementResult

logger = logging.getLogger(__name__)

class QuickSearchRequest(BaseModel):
    """快速搜索请求"""
    query: str
    enhance: bool = False            # 是否启用Firecrawl增强
    max_results: int = 3            # 最大搜索结果数
    max_enhance: int = 2            # 最大增强结果数
    language: str = "zh"             # 搜索语言偏好

class QuickSearchResponse(BaseModel):
    """快速搜索响应"""
    query: str
    results: List[Dict[str, Any]]
    summary: str
    enhanced: bool = False
    enhancement_stats: Optional[Dict[str, Any]] = None
    execution_time: float = 0.0

class QuickSearchAPI:
    """快速搜索API类"""
    
    def __init__(self):
        self.search_stats = {
            "total_searches": 0,
            "enhanced_searches": 0,
            "average_response_time": 0.0
        }
    
    async def quick_search(self, request: QuickSearchRequest) -> QuickSearchResponse:
        """执行快速搜索"""
        start_time = time.time()
        
        try:
            logger.info(f"🔍 开始快速搜索: {request.query}")
            
            # Step 1: 执行网络搜索
            search_results = self._execute_web_search(
                request.query, 
                request.max_results
            )
            
            enhanced_results = search_results
            enhancement_stats = None
            
            # Step 2: 可选的内容增强
            if request.enhance and search_results:
                logger.info("🔥 启用Firecrawl内容增强")
                
                enhancement_result = enhance_search_results_sync(
                    search_results, 
                    max_enhance=request.max_enhance
                )
                
                enhanced_results = enhancement_result.enhanced_results
                enhancement_stats = {
                    "original_count": enhancement_result.original_count,
                    "enhanced_count": enhancement_result.enhanced_count,
                    "success": enhancement_result.success,
                    "error_message": enhancement_result.error_message
                }
                
                logger.info(f"📊 增强统计: {enhancement_result.enhanced_count}/{enhancement_result.original_count} 成功")
            
            # Step 3: 生成摘要
            summary = self._generate_summary(enhanced_results, request.query)
            
            # Step 4: 统计和响应
            execution_time = time.time() - start_time
            self._update_stats(execution_time, request.enhance)
            
            logger.info(f"✅ 快速搜索完成，耗时: {execution_time:.2f}s")
            
            return QuickSearchResponse(
                query=request.query,
                results=enhanced_results,
                summary=summary,
                enhanced=request.enhance and bool(enhancement_stats and enhancement_stats.get("enhanced_count", 0) > 0),
                enhancement_stats=enhancement_stats,
                execution_time=execution_time
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"❌ 快速搜索失败: {e}")
            
            # 返回错误响应，但不抛出异常
            return QuickSearchResponse(
                query=request.query,
                results=[],
                summary=f"搜索失败: {str(e)}",
                enhanced=False,
                execution_time=execution_time
            )
    
    def _execute_web_search(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """执行网络搜索"""
        try:
            # 使用V1的搜索工具
            results = google_web_search([query], num_results=max_results)
            logger.info(f"🌐 搜索到 {len(results)} 条结果")
            return results
        except Exception as e:
            logger.error(f"❌ 网络搜索失败: {e}")
            return []
    
    def _generate_summary(self, results: List[Dict[str, Any]], query: str) -> str:
        """生成搜索结果摘要"""
        if not results:
            return "未找到相关信息。"
        
        try:
            summary_parts = []
            
            # 检查是否有增强内容
            enhanced_count = sum(1 for r in results if r.get('enhanced', False))
            
            if enhanced_count > 0:
                summary_parts.append(f"**🔥 深度搜索结果 (含{enhanced_count}条增强内容):**\n")
            else:
                summary_parts.append(f"**🔍 搜索结果:**\n")
            
            for i, result in enumerate(results[:3], 1):
                title = result.get('title', '未知标题')[:80]
                content = result.get('content', '')[:200]
                url = result.get('url', '')
                enhanced = result.get('enhanced', False)
                
                # 标记增强内容
                enhanced_mark = " 🔥" if enhanced else ""
                
                summary_parts.append(
                    f"{i}. **{title}**{enhanced_mark}\n"
                    f"   {content}...\n"
                    f"   [链接]({url})\n"
                )
            
            # 添加统计信息
            total_results = len(results)
            if total_results > 3:
                summary_parts.append(f"\n*共找到 {total_results} 条相关结果*")
            
            return "\n".join(summary_parts)
            
        except Exception as e:
            logger.error(f"❌ 生成摘要失败: {e}")
            return f"找到 {len(results)} 条搜索结果，但摘要生成失败。"
    
    def _update_stats(self, execution_time: float, enhanced: bool):
        """更新统计信息"""
        self.search_stats["total_searches"] += 1
        if enhanced:
            self.search_stats["enhanced_searches"] += 1
        
        # 计算平均响应时间
        current_avg = self.search_stats["average_response_time"]
        total_searches = self.search_stats["total_searches"]
        self.search_stats["average_response_time"] = (
            (current_avg * (total_searches - 1) + execution_time) / total_searches
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            **self.search_stats,
            "enhancement_rate": (
                self.search_stats["enhanced_searches"] / 
                max(self.search_stats["total_searches"], 1) * 100
            )
        }

# 全局API实例
quick_search_api = QuickSearchAPI()

def create_quick_search_endpoints(app: FastAPI):
    """创建快速搜索端点"""
    
    @app.post("/api/quick-search", response_model=QuickSearchResponse)
    async def quick_search(request: QuickSearchRequest):
        """快速搜索端点 - 用于基础对话增强"""
        try:
            return await quick_search_api.quick_search(request)
        except Exception as e:
            logger.error(f"❌ 快速搜索端点异常: {e}")
            raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")
    
    @app.get("/api/quick-search/stats")
    async def get_quick_search_stats():
        """获取快速搜索统计信息"""
        try:
            return JSONResponse(content=quick_search_api.get_stats())
        except Exception as e:
            logger.error(f"❌ 获取统计信息失败: {e}")
            raise HTTPException(status_code=500, detail=f"获取统计失败: {str(e)}")
    
    @app.post("/api/quick-search/test")
    async def test_quick_search():
        """测试快速搜索功能"""
        test_request = QuickSearchRequest(
            query="最新的AI发展趋势",
            enhance=True,
            max_results=2,
            max_enhance=1
        )
        
        try:
            result = await quick_search_api.quick_search(test_request)
            return {
                "status": "success",
                "test_result": result.dict(),
                "message": "快速搜索功能测试通过"
            }
        except Exception as e:
            logger.error(f"❌ 快速搜索测试失败: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "message": "快速搜索功能测试失败"
            }

# 智能搜索判断函数，供前端调用
def should_trigger_web_search(user_message: str, enable_web_search: bool = False) -> bool:
    """判断是否应该触发网络搜索"""
    if not enable_web_search:
        return False
    
    user_message = user_message.lower()
    
    # 搜索触发关键词
    search_triggers = [
        # 时间相关
        '最新', '新闻', '现在', '今天', '最近', '当前', '2024', '2025',
        # 搜索意图
        '查找', '搜索', '找一下', '了解一下', '给我找', '帮我查',
        # 疑问词
        '什么是', '如何', '怎么', '为什么', '哪里', '什么时候',
        # 实时信息
        '价格', '股价', '汇率', '天气', '新闻', '事件',
        # 比较和分析
        '对比', '比较', '分析', '评价', '优缺点',
        # 具体查询
        '公司', '产品', '技术', '市场', '趋势'
    ]
    
    return any(trigger in user_message for trigger in search_triggers)

# 导出主要功能
__all__ = [
    'QuickSearchRequest', 
    'QuickSearchResponse', 
    'QuickSearchAPI',
    'create_quick_search_endpoints',
    'should_trigger_web_search',
    'quick_search_api'
]

if __name__ == "__main__":
    # 测试快速搜索功能
    import asyncio
    
    async def test_api():
        print("🧪 测试V1.5快速搜索API...")
        
        test_request = QuickSearchRequest(
            query="2024年AI发展趋势",
            enhance=True,
            max_results=2
        )
        
        result = await quick_search_api.quick_search(test_request)
        
        print(f"查询: {result.query}")
        print(f"结果数量: {len(result.results)}")
        print(f"增强状态: {result.enhanced}")
        print(f"执行时间: {result.execution_time:.2f}s")
        print(f"摘要:\n{result.summary}")
        
        return result
    
    asyncio.run(test_api()) 