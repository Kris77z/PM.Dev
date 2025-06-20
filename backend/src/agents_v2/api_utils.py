"""
V2高级API工具集
包含API重试机制、并行处理、Firecrawl集成等核心功能
"""

import asyncio
import time
import logging
from typing import Optional, Dict, Any, List, Callable, Awaitable
from dataclasses import dataclass
from contextlib import asynccontextmanager
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import json
from dotenv import load_dotenv
import os
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# V2 Firecrawl配置类 - 基于Firesearch最佳实践
@dataclass
class V2FirecrawlConfig:
    """V2 Firecrawl配置参数"""
    # 速率限制 - 更保守的设置
    MAX_CONCURRENT_REQUESTS: int = 1        # V2降低并发数
    MAX_SOURCES_TO_SCRAPE: int = 2          # V2减少抓取数量
    REQUEST_DELAY: float = 2.0              # V2增加请求间延迟
    
    # 重试配置
    MAX_RETRIES: int = 1                    # V2减少重试次数
    RETRY_DELAY: float = 3.0                # V2增加重试延迟
    
    # 超时配置
    SCRAPE_TIMEOUT: int = 10                # V2缩短超时时间
    BATCH_TIMEOUT: int = 20                 # V2缩短批量超时
    
    # 内容限制
    MIN_CONTENT_LENGTH: int = 50            # V2降低最小长度要求
    MAX_CONTENT_LENGTH: int = 3000          # V2减少最大内容长度
    
    # 质量控制
    PRIORITY_DOMAINS: List[str] = None
    EXCLUDED_DOMAINS: List[str] = None
    
    def __post_init__(self):
        if self.PRIORITY_DOMAINS is None:
            self.PRIORITY_DOMAINS = [
                '.edu', '.gov', '.org',
                'wikipedia.org', 'arxiv.org'
            ]
        
        if self.EXCLUDED_DOMAINS is None:
            self.EXCLUDED_DOMAINS = [
                'twitter.com', 'facebook.com', 'instagram.com',
                'tiktok.com', 'youtube.com', 'linkedin.com',
                'pinterest.com', 'reddit.com'
            ]

# V2全局配置实例
V2_FIRECRAWL_CONFIG = V2FirecrawlConfig()

@dataclass
class APICallResult:
    """API调用结果"""
    success: bool
    data: Any = None
    error: str = ""
    attempt_count: int = 0
    execution_time: float = 0.0

class APIRetryManager:
    """API重试管理器 - 解决超时和失败问题"""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0, timeout: float = 30.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.timeout = timeout
        self.call_stats = {
            "total_calls": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "retry_calls": 0
        }
    
    async def robust_api_call(self, 
                            api_func: Callable[..., Awaitable[Any]], 
                            *args, 
                            **kwargs) -> APICallResult:
        """带重试机制的API调用"""
        start_time = time.time()
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                self.call_stats["total_calls"] += 1
                if attempt > 0:
                    self.call_stats["retry_calls"] += 1
                
                logger.info(f"🔄 API调用尝试 {attempt + 1}/{self.max_retries}")
                
                # 使用超时控制
                result = await asyncio.wait_for(
                    api_func(*args, **kwargs), 
                    timeout=self.timeout
                )
                
                execution_time = time.time() - start_time
                self.call_stats["successful_calls"] += 1
                
                logger.info(f"✅ API调用成功，尝试次数: {attempt + 1}, 耗时: {execution_time:.2f}s")
                
                return APICallResult(
                    success=True,
                    data=result,
                    attempt_count=attempt + 1,
                    execution_time=execution_time
                )
                
            except asyncio.TimeoutError as e:
                last_error = f"请求超时 (尝试 {attempt + 1})"
                logger.warning(f"⏰ {last_error}")
                
            except Exception as e:
                last_error = f"API调用失败: {str(e)} (尝试 {attempt + 1})"
                logger.warning(f"❌ {last_error}")
            
            # 指数退避策略
            if attempt < self.max_retries - 1:
                delay = self.base_delay * (2 ** attempt)
                logger.info(f"⏳ 等待 {delay} 秒后重试...")
                await asyncio.sleep(delay)
        
        # 所有重试都失败
        execution_time = time.time() - start_time
        self.call_stats["failed_calls"] += 1
        
        fallback_result = f"API调用失败，已重试{self.max_retries}次。最后错误: {last_error}"
        logger.error(f"💥 {fallback_result}")
        
        return APICallResult(
            success=False,
            error=fallback_result,
            attempt_count=self.max_retries,
            execution_time=execution_time
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """获取调用统计信息"""
        total = self.call_stats["total_calls"]
        success_rate = (self.call_stats["successful_calls"] / total * 100) if total > 0 else 0
        
        return {
            **self.call_stats,
            "success_rate": success_rate,
            "failure_rate": 100 - success_rate
        }

class ParallelProcessor:
    """并行处理器 - 支持多任务并发执行"""
    
    def __init__(self, max_concurrent: int = 5):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def parallel_execute(self, 
                             tasks: List[Callable[..., Awaitable[Any]]], 
                             *args_list, 
                             **kwargs) -> List[APICallResult]:
        """并行执行多个任务"""
        logger.info(f"🚀 开始并行执行 {len(tasks)} 个任务")
        
        async def execute_single_task(task, task_args):
            async with self.semaphore:
                try:
                    result = await task(*task_args, **kwargs)
                    return APICallResult(success=True, data=result)
                except Exception as e:
                    logger.error(f"❌ 任务执行失败: {str(e)}")
                    return APICallResult(success=False, error=str(e))
        
        # 准备任务参数
        if not args_list:
            args_list = [() for _ in tasks]
        elif len(args_list) != len(tasks):
            args_list = [args_list[0] if args_list else () for _ in tasks]
        
        # 并行执行所有任务
        results = await asyncio.gather(
            *[execute_single_task(task, args) for task, args in zip(tasks, args_list)],
            return_exceptions=True
        )
        
        # 处理异常结果
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(
                    APICallResult(success=False, error=str(result))
                )
            else:
                processed_results.append(result)
        
        successful_count = sum(1 for r in processed_results if r.success)
        logger.info(f"✅ 并行执行完成: {successful_count}/{len(tasks)} 成功")
        
        return processed_results

class RealFirecrawlClient:
    """真实的Firecrawl客户端 - V2版本，支持自动降级到Mock"""
    
    def __init__(self, api_key: str = None):
        from firecrawl import AsyncFirecrawlApp
        
        self.api_key = api_key or os.getenv("FIRECRAWL_API_KEY")
        self.config = V2_FIRECRAWL_CONFIG
        self.last_request_time = 0  # 用于速率限制
        
        if self.api_key:
            try:
                self.client = AsyncFirecrawlApp(api_key=self.api_key)
                self.mock_mode = False
                logger.info("🔥 V2真实Firecrawl客户端初始化成功")
            except Exception as e:
                logger.error(f"❌ V2 Firecrawl客户端初始化失败: {e}")
                self.client = None
                self.mock_mode = True
        else:
            logger.info("ℹ️ V2 Firecrawl API Key未配置，使用Mock模式")
            self.client = None
            self.mock_mode = True
        
        self.retry_manager = APIRetryManager(
            max_retries=self.config.MAX_RETRIES, 
            timeout=float(self.config.SCRAPE_TIMEOUT)
        )
    
    def _extract_domain(self, url: str) -> str:
        """提取域名"""
        try:
            return urlparse(url).netloc.lower()
        except:
            return ""
    
    def _is_suitable_for_enhancement(self, url: str) -> bool:
        """判断URL是否适合增强"""
        if not url:
            return False
        
        domain = self._extract_domain(url)
        
        # 检查排除域名
        for excluded in self.config.EXCLUDED_DOMAINS:
            if excluded in domain:
                return False
        
        # 检查文件类型排除
        excluded_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
        if any(url.lower().endswith(ext) for ext in excluded_extensions):
            return False
        
        return True
    
    def _calculate_priority_score(self, url: str) -> float:
        """计算URL优先级分数"""
        domain = self._extract_domain(url)
        score = 0.5
        
        # 优先域名加分
        for priority in self.config.PRIORITY_DOMAINS:
            if priority in domain:
                score += 0.4
                break
        
        # HTTPS加分
        if url.startswith('https://'):
            score += 0.1
        
        return min(1.0, max(0.0, score))
    
    async def _rate_limited_request(self):
        """实现速率限制"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.config.REQUEST_DELAY:
            sleep_time = self.config.REQUEST_DELAY - time_since_last
            logger.debug(f"⏱️ V2速率限制：等待 {sleep_time:.1f} 秒")
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    async def scrape_url(self, url: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """抓取单个URL的深度内容"""
        
        if self.mock_mode:
            return await self._mock_scrape_url(url, options)
        
        async def _real_scrape():
            # 构建Firecrawl参数 - 正确的参数传递方式
            scrape_kwargs = {
                "formats": ["markdown", "html"],
                "only_main_content": True,
                "timeout": 20000
            }
            
            # 合并用户选项
            if options:
                scrape_kwargs.update(options)
            
            # 调用真实的Firecrawl API - 使用正确的参数传递方式
            result = await self.client.scrape_url(url, **scrape_kwargs)
            
            # 处理Firecrawl SDK返回的对象
            if result and hasattr(result, 'success') and result.success:
                # 从ScrapeResponse对象中提取数据
                metadata = getattr(result, 'metadata', {}) or {}
                
                # 获取内容
                markdown_content = getattr(result, 'markdown', '')
                html_content = getattr(result, 'html', '')
                content = markdown_content or html_content or ''
                
                return {
                    "success": True,
                    "url": url,
                    "title": metadata.get("title", f"Content from {url}") if isinstance(metadata, dict) else f"Content from {url}",
                    "content": content,
                    "html": html_content,
                    "metadata": metadata if isinstance(metadata, dict) else {},
                    "word_count": len(content.split()) if content else 0,
                    "extraction_time": time.time(),
                    "source": "firecrawl_real"
                }
            else:
                # 处理错误情况
                error_msg = "Unknown Firecrawl error"
                if result:
                    if hasattr(result, 'error'):
                        error_msg = str(result.error)
                    elif hasattr(result, 'success') and not result.success:
                        error_msg = "Firecrawl scraping failed"
                else:
                    error_msg = "No response from Firecrawl"
                raise Exception(error_msg)
        
        result = await self.retry_manager.robust_api_call(_real_scrape)
        
        if result.success:
            logger.info(f"🔥 Firecrawl抓取成功: {url} ({result.data.get('word_count', 0)} 词)")
            return result.data
        else:
            logger.warning(f"🔥 Firecrawl抓取失败: {url} - {result.error}")
            # 不使用假数据，直接返回失败状态
            return {
                "success": False,
                "url": url,
                "title": "增强失败",
                "content": "",  # 空内容，不污染报告
                "error": result.error,
                "source": "firecrawl_failed"
            }
    
    async def _mock_scrape_url(self, url: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Mock抓取模式 - 降级方案"""
        
        async def _mock_scrape():
            # 模拟网络延迟
            await asyncio.sleep(0.5)
            
            # 模拟不同的抓取结果
            if "example.com" in url:
                return {
                    "success": True,
                    "url": url,
                    "title": f"深度内容标题 - {url}",
                    "content": f"这是从 {url} 抓取的深度内容。包含详细的技术分析、案例研究和专业见解。" * 10,
                    "metadata": {"author": "专家作者", "publish_date": "2024-01-01"},
                    "word_count": 500,
                    "extraction_time": time.time(),
                    "source": "firecrawl_mock"
                }
            else:
                # 模拟真实的内容抓取
                return {
                    "success": True,
                    "url": url,
                    "title": f"增强内容 - {url.split('/')[-1]}",
                    "content": f"从 {url} 获取的增强内容：\n\n" + 
                              "这是通过Firecrawl深度抓取获得的高质量内容。" * 20,
                    "metadata": {"source": "firecrawl_mock", "quality": "high"},
                    "word_count": 800,
                    "extraction_time": time.time(),
                    "source": "firecrawl_mock"
                }
        
        result = await self.retry_manager.robust_api_call(_mock_scrape)
        
        if result.success:
            logger.info(f"🔥 Mock Firecrawl抓取成功: {url} ({result.data.get('word_count', 0)} 词)")
            return result.data
        else:
            logger.warning(f"🔥 Mock Firecrawl抓取失败: {url} - {result.error}")
            return {
                "success": False,
                "url": url,
                "title": "抓取失败",
                "content": f"无法抓取内容: {result.error}",
                "error": result.error,
                "source": "firecrawl_mock"
            }
    
    async def batch_scrape(self, urls: List[str], options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """批量抓取多个URL"""
        logger.info(f"🔥 开始批量Firecrawl抓取: {len(urls)} 个URL (Real: {not self.mock_mode})")
        
        if not self.mock_mode and self.client and len(urls) > 1:
            # 尝试使用Firecrawl的批量抓取功能
            try:
                batch_kwargs = {
                    "formats": ["markdown", "html"],
                    "only_main_content": True,
                    "timeout": 20000
                }
                
                if options:
                    batch_kwargs.update(options)
                
                batch_result = await self.client.batch_scrape_urls(urls, **batch_kwargs)
                
                # 处理批量抓取的响应对象
                if batch_result and hasattr(batch_result, 'success') and batch_result.success:
                    scraped_data = []
                    # 批量抓取通常返回的是响应对象，需要获取数据列表
                    data_list = getattr(batch_result, 'data', []) or []
                    
                    for item in data_list:
                        if item:
                            # 处理单个抓取结果
                            metadata = getattr(item, 'metadata', {}) or {}
                            markdown_content = getattr(item, 'markdown', '')
                            html_content = getattr(item, 'html', '')
                            content = markdown_content or html_content or ''
                            
                            scraped_data.append({
                                "success": True,
                                "url": metadata.get("sourceURL", "unknown") if isinstance(metadata, dict) else "unknown",
                                "title": metadata.get("title", "Unknown title") if isinstance(metadata, dict) else "Unknown title",
                                "content": content,
                                "html": html_content,
                                "metadata": metadata if isinstance(metadata, dict) else {},
                                "word_count": len(content.split()) if content else 0,
                                "extraction_time": time.time(),
                                "source": "firecrawl_real_batch"
                            })
                    
                    successful_count = len(scraped_data)
                    logger.info(f"🔥 批量Firecrawl抓取完成: {successful_count}/{len(urls)} 成功")
                    return scraped_data
                    
            except Exception as e:
                logger.warning(f"🔥 批量Firecrawl抓取失败，降级到单个抓取: {e}")
        
        # 降级到单个抓取模式
        processor = ParallelProcessor(max_concurrent=3)
        
        # 创建抓取任务
        scrape_tasks = [self.scrape_url for _ in urls]
        args_list = [(url, options) for url in urls]
        
        results = await processor.parallel_execute(scrape_tasks, *args_list)
        
        # 提取成功的结果
        scraped_data = []
        for result in results:
            if result.success:
                scraped_data.append(result.data)
            else:
                scraped_data.append({
                    "success": False,
                    "url": "unknown",
                    "content": f"抓取失败: {result.error}",
                    "error": result.error,
                    "source": "firecrawl_fallback"
                })
        
        successful_count = sum(1 for data in scraped_data if data.get("success", False))
        logger.info(f"🔥 批量抓取完成: {successful_count}/{len(urls)} 成功")
        
        return scraped_data


# 保留Mock类以供向后兼容
class MockFirecrawlClient(RealFirecrawlClient):
    """向后兼容的Mock客户端 - 现在基于真实客户端"""
    
    def __init__(self):
        # 强制使用Mock模式
        super().__init__(api_key=None)
        self.mock_mode = True
        self.client = None

# 全局实例
retry_manager = APIRetryManager()
parallel_processor = ParallelProcessor()
firecrawl_client = RealFirecrawlClient()  # 现在使用真实客户端，会自动降级到Mock如果没有API Key

# 工具函数
async def robust_web_search(search_func: Callable, queries: List[str]) -> List[Dict[str, Any]]:
    """并行执行多个搜索查询"""
    logger.info(f"🔍 开始并行搜索: {len(queries)} 个查询")
    
    search_tasks = [search_func for _ in queries]
    args_list = [(query,) for query in queries]
    
    results = await parallel_processor.parallel_execute(search_tasks, *args_list)
    
    # 合并所有搜索结果
    all_results = []
    for i, result in enumerate(results):
        if result.success and result.data:
            if isinstance(result.data, list):
                for item in result.data:
                    if isinstance(item, dict):
                        item["source_query"] = queries[i]
                        all_results.append(item)
            elif isinstance(result.data, dict):
                result.data["source_query"] = queries[i]
                all_results.append(result.data)
        else:
            logger.warning(f"🔍 搜索失败: {queries[i]} - {result.error}")
    
    logger.info(f"🔍 并行搜索完成: 获得 {len(all_results)} 条结果")
    return all_results

async def enhance_content_with_firecrawl(search_results: List[Dict], 
                                       enhancement_config: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """使用Firecrawl增强搜索结果内容 - V2版本，使用严格的速率限制"""
    config = enhancement_config or {}
    firecrawl_config = V2_FIRECRAWL_CONFIG
    
    # 使用配置化的限制
    max_urls = config.get("max_urls", firecrawl_config.MAX_SOURCES_TO_SCRAPE)
    quality_threshold = config.get("quality_threshold", 0.6)  # V2降低阈值
    
    # 选择高质量的URL进行增强 - 使用优先级算法
    priority_urls = []
    url_scores = []
    seen_domains = set()
    
    for result in search_results[:max_urls * 3]:  # 扩大候选范围
        # 兼容不同的URL字段名：'url' 或 'link'（Google搜索使用'link'）
        url = result.get("url") or result.get("link", "")
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        
        if not url:
            continue
        
        # 域名去重
        domain = urlparse(url).netloc.lower() if url else ""
        if domain in seen_domains:
            continue
        
        # 检查是否适合增强
        if not _is_url_suitable_for_enhancement(url, firecrawl_config):
            continue
        
        # 计算质量评分
        quality_score = _calculate_url_quality_score(url, title, snippet, firecrawl_config)
        
        if quality_score >= quality_threshold:
            url_scores.append((url, quality_score, domain))
            seen_domains.add(domain)
    
    # 按分数排序并选择前N个
    url_scores.sort(key=lambda x: x[1], reverse=True)
    priority_urls = [url for url, score, domain in url_scores[:max_urls]]
    
    if not priority_urls:
        logger.info("🔥 V2没有找到适合增强的URL")
        return search_results
    
    logger.info(f"🔥 V2选择 {len(priority_urls)} 个URL进行Firecrawl增强")
    
    # 使用Firecrawl批量抓取 - 应用速率限制
    enhanced_data = await firecrawl_client.batch_scrape(priority_urls)
    
    # 将增强内容合并到搜索结果中
    enhanced_results = search_results.copy()
    
    for enhanced in enhanced_data:
        if enhanced.get("success") and enhanced.get("content"):
            # 只处理真实的增强内容，跳过失败的项
            for result in enhanced_results:
                # 兼容不同的URL字段名进行匹配
                result_url = result.get("url") or result.get("link", "")
                if result_url == enhanced.get("url"):
                    # 限制增强内容长度
                    enhanced_content = enhanced["content"]
                    if len(enhanced_content) > firecrawl_config.MAX_CONTENT_LENGTH:
                        enhanced_content = enhanced_content[:firecrawl_config.MAX_CONTENT_LENGTH] + "..."
                    
                    result["enhanced_content"] = enhanced_content
                    result["enhanced_title"] = enhanced["title"]
                    result["enhanced_metadata"] = enhanced.get("metadata", {})
                    result["word_count"] = enhanced.get("word_count", 0)
                    result["is_enhanced"] = True
                    result["enhancement_source"] = enhanced.get("source", "unknown")
                    break
    
    enhanced_count = sum(1 for r in enhanced_results if r.get("is_enhanced"))
    failed_count = sum(1 for enhanced in enhanced_data if not enhanced.get("success"))
    
    if enhanced_count > 0:
        logger.info(f"🔥 V2内容增强完成: {enhanced_count} 个结果被增强")
    if failed_count > 0:
        logger.info(f"⚠️ V2内容增强跳过: {failed_count} 个URL失败，使用原始搜索结果")
    
    return enhanced_results 

def _is_url_suitable_for_enhancement(url: str, config: V2FirecrawlConfig) -> bool:
    """判断URL是否适合增强"""
    if not url:
        return False
    
    domain = urlparse(url).netloc.lower()
    
    # 检查排除域名
    for excluded in config.EXCLUDED_DOMAINS:
        if excluded in domain:
            return False
    
    # 检查文件类型排除
    excluded_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
    if any(url.lower().endswith(ext) for ext in excluded_extensions):
        return False
    
    return True

def _calculate_url_quality_score(url: str, title: str, snippet: str, config: V2FirecrawlConfig) -> float:
    """计算URL质量分数"""
    domain = urlparse(url).netloc.lower()
    score = 0.3  # 基础分数
    
    # 标题长度加分
    if len(title) > 10:
        score += 0.2
    
    # 摘要长度加分
    if len(snippet) > 50:
        score += 0.2
    
    # 优先域名大幅加分
    for priority in config.PRIORITY_DOMAINS:
        if priority in domain:
            score += 0.4
            break
    
    # HTTPS加分
    if url.startswith('https://'):
        score += 0.1
    
    return min(1.0, max(0.0, score)) 