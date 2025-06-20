"""
V1.5 Firecrawl集成工具
从V2中提取核心功能，简化集成到V1
专为V1.5版本设计的轻量级Firecrawl客户端
"""

# 确保在模块加载时就加载环境变量
from dotenv import load_dotenv
load_dotenv()

import os
import asyncio
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
import time
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

@dataclass
class EnhancementResult:
    """内容增强结果"""
    success: bool
    enhanced_results: List[Dict[str, Any]]
    original_count: int
    enhanced_count: int
    error_message: str = ""

# Firecrawl配置类 - 基于Firesearch最佳实践
@dataclass
class FirecrawlConfig:
    """Firecrawl配置参数"""
    # 速率限制
    MAX_CONCURRENT_REQUESTS: int = 2        # 最大并发请求数
    MAX_SOURCES_TO_SCRAPE: int = 3          # 最多抓取源数量
    REQUEST_DELAY: float = 1.0              # 请求间延迟(秒)
    
    # 重试配置
    MAX_RETRIES: int = 2                    # 最大重试次数
    RETRY_DELAY: float = 2.0                # 重试延迟(秒)
    
    # 超时配置
    SCRAPE_TIMEOUT: int = 15                # 抓取超时(秒)
    BATCH_TIMEOUT: int = 30                 # 批量超时(秒)
    
    # 内容限制
    MIN_CONTENT_LENGTH: int = 100           # 最小内容长度
    MAX_CONTENT_LENGTH: int = 5000          # 最大内容长度
    
    # 质量控制
    PRIORITY_DOMAINS: List[str] = None      # 优先域名
    EXCLUDED_DOMAINS: List[str] = None      # 排除域名
    
    def __post_init__(self):
        if self.PRIORITY_DOMAINS is None:
            self.PRIORITY_DOMAINS = [
                '.edu', '.gov', '.org',           # 权威机构
                'wikipedia.org', 'arxiv.org',     # 学术资源
                'github.com', 'stackoverflow.com' # 技术资源
            ]
        
        if self.EXCLUDED_DOMAINS is None:
            self.EXCLUDED_DOMAINS = [
                'twitter.com', 'facebook.com', 'instagram.com',  # 社交媒体
                'tiktok.com', 'youtube.com',                     # 视频平台
                'pinterest.com', 'reddit.com'                    # 其他社交
            ]

# 全局配置实例
FIRECRAWL_CONFIG = FirecrawlConfig()

class SimpleFirecrawlClient:
    """简化版Firecrawl客户端 - 专为V1.5设计"""
    
    def __init__(self):
        self.api_key = os.getenv("FIRECRAWL_API_KEY")
        self.enabled = bool(self.api_key)
        self.client = None
        self.config = FIRECRAWL_CONFIG
        self.last_request_time = 0  # 用于速率限制
        
        if self.enabled:
            try:
                # 修复：使用AsyncFirecrawlApp用于异步操作
                from firecrawl import AsyncFirecrawlApp
                self.client = AsyncFirecrawlApp(api_key=self.api_key)
                logger.info("🔥 V1.5 Firecrawl异步客户端初始化成功")
            except Exception as e:
                logger.error(f"❌ Firecrawl初始化失败: {e}")
                self.enabled = False
                self.client = None
        else:
            logger.info("ℹ️ Firecrawl API Key未配置，使用Mock模式")
    
    def _extract_domain(self, url: str) -> str:
        """提取域名"""
        try:
            return urlparse(url).netloc.lower()
        except:
            return ""
    
    def _is_suitable_for_enhancement(self, url: str) -> bool:
        """判断URL是否适合增强 - 使用配置化的域名过滤"""
        if not url:
            return False
        
        domain = self._extract_domain(url)
        
        # 检查排除域名
        for excluded in self.config.EXCLUDED_DOMAINS:
            if excluded in domain:
                return False
        
        # 检查文件类型排除
        excluded_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']
        if any(url.lower().endswith(ext) for ext in excluded_extensions):
            return False
        
        return True
    
    def _calculate_priority_score(self, url: str) -> float:
        """计算URL优先级分数"""
        domain = self._extract_domain(url)
        score = 0.5  # 基础分数
        
        # 优先域名加分
        for priority in self.config.PRIORITY_DOMAINS:
            if priority in domain:
                score += 0.3
                break
        
        # HTTPS加分
        if url.startswith('https://'):
            score += 0.1
        
        # 避免过长URL
        if len(url) > 200:
            score -= 0.2
        
        return min(1.0, max(0.0, score))
    
    def _select_priority_urls(self, results: List[Dict], max_count: int = None) -> List[str]:
        """选择优先增强的URLs - 使用配置化的限制"""
        if max_count is None:
            max_count = self.config.MAX_SOURCES_TO_SCRAPE
        
        # 计算每个URL的优先级分数
        url_scores = []
        seen_domains = set()
        
        for result in results:
            # 兼容不同的URL字段名：'url' 或 'link'（Google搜索使用'link'）
            url = result.get('url') or result.get('link', '')
            url = url.strip() if url else ''
            
            if not url or not self._is_suitable_for_enhancement(url):
                continue
            
            # 域名去重，提高多样性
            domain = self._extract_domain(url)
            if domain in seen_domains:
                continue
            
            score = self._calculate_priority_score(url)
            url_scores.append((url, score, domain))
            seen_domains.add(domain)
        
        # 按分数排序并选择前N个
        url_scores.sort(key=lambda x: x[1], reverse=True)
        selected_urls = [url for url, score, domain in url_scores[:max_count]]
        
        logger.info(f"📌 从{len(results)}个结果中选择了{len(selected_urls)}个优质URL进行增强")
        return selected_urls
    
    async def _rate_limited_request(self):
        """实现速率限制"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.config.REQUEST_DELAY:
            sleep_time = self.config.REQUEST_DELAY - time_since_last
            logger.debug(f"⏱️ 速率限制：等待 {sleep_time:.1f} 秒")
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    async def _batch_scrape(self, urls: List[str]) -> List[Dict[str, Any]]:
        """批量抓取URLs - 使用严格的并发控制"""
        results = []
        
        # 使用配置化的并发限制
        semaphore = asyncio.Semaphore(self.config.MAX_CONCURRENT_REQUESTS)
        
        async def scrape_single_url(url: str) -> Optional[Dict[str, Any]]:
            async with semaphore:
                try:
                    # 实施速率限制
                    await self._rate_limited_request()
                    
                    logger.info(f"🔄 正在抓取: {self._extract_domain(url)}")
                    
                    # 使用配置化的参数
                    scrape_kwargs = {
                        "formats": ["markdown"],
                        "only_main_content": True,
                        "timeout": self.config.SCRAPE_TIMEOUT * 1000  # 转换为毫秒
                    }
                    
                    # 修复：正确调用AsyncFirecrawlApp
                    content = await asyncio.wait_for(
                        self.client.scrape_url(url, **scrape_kwargs),
                        timeout=self.config.SCRAPE_TIMEOUT
                    )
                    
                    # 修复：正确处理AsyncFirecrawlApp的响应格式
                    if content:
                        # 检查是否是 ScrapeResponse 对象
                        if hasattr(content, 'success') and hasattr(content, 'markdown'):
                            if content.success and content.markdown:
                                markdown_text = content.markdown.strip()
                                
                                # 内容长度检查
                                if len(markdown_text) < self.config.MIN_CONTENT_LENGTH:
                                    logger.warning(f"⚠️ 内容过短: {self._extract_domain(url)} ({len(markdown_text)} 字符)")
                                    return None
                                
                                # 截断过长内容
                                if len(markdown_text) > self.config.MAX_CONTENT_LENGTH:
                                    markdown_text = markdown_text[:self.config.MAX_CONTENT_LENGTH] + "..."
                                    logger.info(f"✂️ 内容截断: {self._extract_domain(url)} (限制为 {self.config.MAX_CONTENT_LENGTH} 字符)")
                                
                                logger.info(f"✅ 成功抓取: {self._extract_domain(url)} ({len(markdown_text)} 字符)")
                                
                                # 获取元数据
                                metadata = getattr(content, 'metadata', {}) or {}
                                title = metadata.get('title', '') if isinstance(metadata, dict) else ''
                                
                                return {
                                    "url": url,
                                    "content": markdown_text,
                                    "title": title or f"Content from {self._extract_domain(url)}",
                                    "word_count": len(markdown_text.split()),
                                    "extraction_time": time.time(),
                                    "metadata": metadata
                                }
                            else:
                                logger.warning(f"⚠️ 抓取失败: {self._extract_domain(url)} - success: {getattr(content, 'success', False)}")
                                return None
                        # 兼容字典格式返回
                        elif isinstance(content, dict) and content.get('markdown'):
                            markdown_text = content['markdown'].strip()
                            
                            # 内容长度检查
                            if len(markdown_text) < self.config.MIN_CONTENT_LENGTH:
                                logger.warning(f"⚠️ 内容过短: {self._extract_domain(url)} ({len(markdown_text)} 字符)")
                                return None
                            
                            # 截断过长内容
                            if len(markdown_text) > self.config.MAX_CONTENT_LENGTH:
                                markdown_text = markdown_text[:self.config.MAX_CONTENT_LENGTH] + "..."
                                logger.info(f"✂️ 内容截断: {self._extract_domain(url)} (限制为 {self.config.MAX_CONTENT_LENGTH} 字符)")
                            
                            logger.info(f"✅ 成功抓取: {self._extract_domain(url)} ({len(markdown_text)} 字符)")
                            
                            return {
                                "url": url,
                                "content": markdown_text,
                                "title": content.get('metadata', {}).get('title', '') or f"Content from {self._extract_domain(url)}",
                                "word_count": len(markdown_text.split()),
                                "extraction_time": time.time(),
                                "metadata": content.get('metadata', {})
                            }
                        else:
                            logger.warning(f"⚠️ 无有效内容: {self._extract_domain(url)}")
                            return None
                    else:
                        logger.warning(f"⚠️ 无响应: {self._extract_domain(url)}")
                        return None
                        
                except asyncio.TimeoutError:
                    logger.warning(f"⏰ 抓取超时: {self._extract_domain(url)}")
                    return None
                except Exception as e:
                    logger.error(f"❌ 抓取失败: {self._extract_domain(url)} - {str(e)}")
                    return None
        
        # 并发执行抓取任务
        tasks = [scrape_single_url(url) for url in urls]
        
        try:
            completed_results = await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=self.config.BATCH_TIMEOUT
            )
            
            # 过滤有效结果
            for result in completed_results:
                if isinstance(result, dict) and result:
                    results.append(result)
                elif isinstance(result, Exception):
                    logger.error(f"❌ 任务异常: {result}")
            
        except asyncio.TimeoutError:
            logger.error(f"⏰ 批量抓取超时 ({self.config.BATCH_TIMEOUT}秒)")
        
        return results
    
    async def enhance_search_results(self, 
                                   search_results: List[Dict], 
                                   max_enhance: int = 3) -> EnhancementResult:
        """增强搜索结果 - V1.5核心功能"""
        
        if not self.enabled or not self.client:
            logger.info("ℹ️ Firecrawl未启用，跳过内容增强")
            return EnhancementResult(
                success=False,
                enhanced_results=search_results,
                original_count=len(search_results),
                enhanced_count=0,
                error_message="Firecrawl未启用"
            )
        
        logger.info(f"🔍 开始增强 {len(search_results)} 条搜索结果")
        
        # 选择优质URLs进行增强
        priority_urls = self._select_priority_urls(search_results, max_enhance)
        
        if not priority_urls:
            logger.info("ℹ️ 未找到适合增强的URL")
            return EnhancementResult(
                success=True,
                enhanced_results=search_results,
                original_count=len(search_results),
                enhanced_count=0,
                error_message="未找到适合增强的URL"
            )
        
        logger.info(f"📥 选择 {len(priority_urls)} 个URL进行深度抓取")
        
        # 并行抓取内容
        enhanced_content = await self._batch_scrape(priority_urls)
        
        if not enhanced_content:
            logger.warning("⚠️ 所有URL增强都失败了")
            return EnhancementResult(
                success=False,
                enhanced_results=search_results,
                original_count=len(search_results),
                enhanced_count=0,
                error_message="所有URL增强都失败"
            )
        
        # 合并增强内容到原始结果
        enhanced_results = self._merge_enhanced_content(
            search_results, enhanced_content
        )
        
        logger.info(f"✅ 成功增强 {len(enhanced_content)} 条内容")
        
        return EnhancementResult(
            success=True,
            enhanced_results=enhanced_results,
            original_count=len(search_results),
            enhanced_count=len(enhanced_content)
        )
    
    def _merge_enhanced_content(self, 
                              original_results: List[Dict], 
                              enhanced_content: List[Dict]) -> List[Dict]:
        """合并增强内容到原始结果"""
        enhanced_urls = {item['url'] for item in enhanced_content}
        
        merged_results = []
        
        # 添加增强后的结果
        for result in original_results:
            result_copy = result.copy()  # 避免修改原始数据
            
            # 兼容不同的URL字段名
            result_url = result.get('url') or result.get('link', '')
            
            if result_url in enhanced_urls:
                # 找到对应的增强内容
                enhanced = next(
                    (item for item in enhanced_content if item['url'] == result_url), 
                    None
                )
                if enhanced:
                    # 合并内容
                    original_content = result_copy.get('content', result_copy.get('snippet', ''))
                    enhanced_text = enhanced['content']
                    
                    # 构建增强后的内容
                    if original_content:
                        result_copy['content'] = f"{original_content}\n\n**🔥 深度内容分析:**\n{enhanced_text}"
                    else:
                        result_copy['content'] = f"**🔥 深度内容分析:**\n{enhanced_text}"
                    
                    # 统一URL字段（如果原来是'link'，也添加'url'字段）
                    if not result_copy.get('url') and result_copy.get('link'):
                        result_copy['url'] = result_copy['link']
                    
                    # 添加增强标记
                    result_copy['enhanced'] = True
                    result_copy['enhancement_source'] = 'firecrawl'
                    result_copy['original_length'] = len(original_content)
                    result_copy['enhanced_length'] = len(enhanced_text)
                    
                    logger.info(f"🔗 已增强: {enhanced.get('domain', 'unknown')} (+{len(enhanced_text)} 字符)")
            
            merged_results.append(result_copy)
        
        return merged_results

# 同步包装器，适配V1的同步调用模式
def enhance_search_results_sync(search_results: List[Dict], max_enhance: int = 3) -> EnhancementResult:
    """同步版本的搜索结果增强 - 适配V1的同步调用"""
    try:
        # 检查是否在异步环境中
        try:
            loop = asyncio.get_running_loop()
            # 如果已有事件循环，使用线程池执行
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    asyncio.run, 
                    firecrawl_client.enhance_search_results(search_results, max_enhance)
                )
                return future.result(timeout=45)  # 45秒总超时
        except RuntimeError:
            # 没有运行中的事件循环，直接运行
            return asyncio.run(
                firecrawl_client.enhance_search_results(search_results, max_enhance)
            )
    except Exception as e:
        logger.error(f"❌ 同步增强失败: {e}")
        return EnhancementResult(
            success=False,
            enhanced_results=search_results,
            original_count=len(search_results),
            enhanced_count=0,
            error_message=str(e)
        )

# 全局实例
firecrawl_client = SimpleFirecrawlClient()

# 测试函数
def test_firecrawl_integration():
    """测试Firecrawl集成功能"""
    from dotenv import load_dotenv
    load_dotenv()  # 确保加载.env文件
    
    print("🧪 测试V1.5 Firecrawl集成...")
    
    # 重新初始化客户端以使用新的环境变量
    global firecrawl_client
    firecrawl_client = SimpleFirecrawlClient()
    
    # 模拟搜索结果
    test_results = [
        {
            'title': 'Test Article',
            'url': 'https://example.com/article',
            'content': 'Original content...'
        }
    ]
    
    result = enhance_search_results_sync(test_results, max_enhance=1)
    
    print(f"测试结果:")
    print(f"- 成功: {result.success}")
    print(f"- 原始数量: {result.original_count}")
    print(f"- 增强数量: {result.enhanced_count}")
    print(f"- 错误信息: {result.error_message}")
    
    return result

if __name__ == "__main__":
    test_firecrawl_integration() 