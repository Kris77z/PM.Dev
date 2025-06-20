"""
内容增强器节点
智能决策深度内容抓取和质量评估
"""

import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from langchain_core.runnables import RunnableConfig
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

from .advanced_state import AdvancedResearchState, ContentQualityAssessment
from .planner import get_current_task


@dataclass
class EnhancementDecision:
    """增强决策结果"""
    needs_enhancement: bool
    confidence_score: float  # 0-1
    enhancement_type: str    # "depth", "breadth", "accuracy", "none"
    priority_urls: List[str]
    reasoning: str
    quality_gaps: List[str]


class ContentQualitySchema(BaseModel):
    """内容质量评估架构"""
    overall_score: float = Field(description="总体质量评分 0-1")
    needs_enhancement: bool = Field(description="是否需要增强")
    enhancement_type: str = Field(description="增强类型：depth/breadth/accuracy/none")
    priority_urls: List[str] = Field(description="优先增强的URL列表")
    quality_gaps: List[str] = Field(description="质量缺口列表")
    reasoning: str = Field(description="决策推理过程")


class ContentEnhancer:
    """内容增强器"""
    
    def __init__(self):
        self.llm = None
    
    def get_llm(self, config: RunnableConfig = None) -> ChatGoogleGenerativeAI:
        """获取LLM实例"""
        if not self.llm:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.2,  # 评估需要较低温度
                max_retries=2,
                api_key=os.getenv("GEMINI_API_KEY"),
            )
        return self.llm
    
    def extract_grounding_sources(self, state: AdvancedResearchState) -> List[Dict[str, str]]:
        """从研究状态中提取信息源"""
        grounding_sources = []
        
        # 从搜索结果中提取
        search_results = state.get("web_research_results", [])
        for result in search_results[-10:]:  # 最近10个结果
            if isinstance(result, dict):
                # 兼容不同的URL字段名：'url' 或 'link'（Google搜索使用'link'）
                result_url = result.get("url") or result.get("link", "")
                grounding_sources.append({
                    "title": result.get("title", "未知标题"),
                    "url": result_url,
                    "snippet": result.get("snippet", result.get("content", ""))[:200]  # 限制长度
                })
        
        # 从收集的源中提取
        sources_gathered = state.get("sources_gathered", [])
        for source in sources_gathered[-5:]:  # 最近5个源
            # 兼容不同的URL字段名
            source_url = source.get("url") or source.get("link", "") if isinstance(source, dict) else ""
            if isinstance(source, dict) and source_url:
                grounding_sources.append({
                    "title": source.get("title", "未知来源"),
                    "url": source_url,
                    "snippet": source.get("snippet", "")[:200]
                })
        
        # 去重（基于URL）
        seen_urls = set()
        unique_sources = []
        for source in grounding_sources:
            url = source.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append(source)
        
        return unique_sources[:8]  # 最多8个源
    
    def generate_enhancement_prompt(
        self, 
        research_topic: str,
        current_findings: List[str],
        grounding_sources: List[Dict[str, str]]
    ) -> str:
        """生成内容增强评估提示"""
        
        findings_text = "\n".join([f"- {finding}" for finding in current_findings[-5:]])
        sources_text = "\n".join([
            f"- [{source['title']}]({source['url']}): {source['snippet']}"
            for source in grounding_sources
        ])
        
        return f"""你是 **ContentEnhancementAnalyzer**。你的任务是评估当前研究内容的质量，并决定是否需要深度内容增强。

=== 研究主题 ===
{research_topic}

=== 当前研究发现 ===
{findings_text}

=== 可用信息源 ===
{sources_text}

=== 评估标准 ===
基于以下维度评估内容质量：

1. **完整性** (0-1)：是否涵盖了研究主题的主要方面
2. **深度** (0-1)：是否提供了足够的技术细节和深入分析
3. **准确性** (0-1)：信息是否来自可靠源，是否有明确引用
4. **时效性** (0-1)：信息是否为最新，是否包含当前趋势
5. **多样性** (0-1)：是否从多个角度和来源收集了信息

=== 增强类型定义 ===
- **depth**：需要深入技术细节、实现方式、具体案例
- **breadth**：需要扩展覆盖范围、更多角度、相关领域
- **accuracy**：需要验证信息、获取权威来源、更新数据
- **none**：当前内容质量充足，无需增强

=== 决策逻辑 ===
**需要增强的情况**：
- 总体质量评分 < 0.75
- 关键维度评分 < 0.6
- 缺少权威来源或官方数据
- 信息过于表面，缺乏深度分析
- 研究主题复杂但内容覆盖不全

**无需增强的情况**：
- 总体质量评分 ≥ 0.8
- 所有维度评分 ≥ 0.7
- 有足够的深度分析和权威引用
- 内容全面覆盖研究主题

=== 输出格式 ===
返回JSON格式，包含以下字段：

{{
  "overall_score": 0.0-1.0,
  "needs_enhancement": true/false,
  "enhancement_type": "depth|breadth|accuracy|none",
  "priority_urls": ["url1", "url2", ...],
  "quality_gaps": ["缺口1", "缺口2", ...],
  "reasoning": "详细的决策推理过程"
}}

=== 指令 ===
仔细分析当前研究内容的质量，识别信息缺口，并给出明确的增强建议。**只**输出JSON格式的评估结果。"""
    
    def analyze_enhancement_need(
        self,
        research_topic: str,
        current_findings: List[str],
        grounding_sources: List[Dict[str, str]],
        config: RunnableConfig = None
    ) -> EnhancementDecision:
        """分析内容增强需求"""
        
        # 生成评估提示
        prompt = self.generate_enhancement_prompt(
            research_topic, current_findings, grounding_sources
        )
        
        # 获取结构化输出LLM
        llm = self.get_llm(config)
        structured_llm = llm.with_structured_output(ContentQualitySchema)
        
        try:
            # 调用LLM进行评估
            result = structured_llm.invoke(prompt)
            
            # 转换为EnhancementDecision
            decision = EnhancementDecision(
                needs_enhancement=result.needs_enhancement,
                confidence_score=result.overall_score,
                enhancement_type=result.enhancement_type,
                priority_urls=result.priority_urls,
                reasoning=result.reasoning,
                quality_gaps=result.quality_gaps
            )
            
            print(f"🔍 内容质量评估完成：")
            print(f"  质量评分：{decision.confidence_score:.2f}")
            print(f"  需要增强：{decision.needs_enhancement}")
            print(f"  增强类型：{decision.enhancement_type}")
            print(f"  优先URL数量：{len(decision.priority_urls)}")
            
            return decision
            
        except Exception as e:
            print(f"❌ 内容质量评估失败：{e}")
            
            # fallback：基于简单规则
            return self._fallback_analysis(current_findings, grounding_sources)
    
    def _fallback_analysis(
        self, 
        current_findings: List[str], 
        grounding_sources: List[Dict[str, str]]
    ) -> EnhancementDecision:
        """备用分析方法"""
        
        findings_count = len(current_findings)
        sources_count = len(grounding_sources)
        
        # 简单规则判断
        if findings_count < 3 or sources_count < 2:
            needs_enhancement = True
            enhancement_type = "breadth"
            confidence_score = 0.4
        elif findings_count < 5 or sources_count < 4:
            needs_enhancement = True
            enhancement_type = "depth"
            confidence_score = 0.6
        else:
            needs_enhancement = False
            enhancement_type = "none"
            confidence_score = 0.8
        
        priority_urls = [source["url"] for source in grounding_sources[:3]]
        
        return EnhancementDecision(
            needs_enhancement=needs_enhancement,
            confidence_score=confidence_score,
            enhancement_type=enhancement_type,
            priority_urls=priority_urls,
            reasoning="基于简单规则的fallback分析",
            quality_gaps=["信息数量不足"] if needs_enhancement else []
        )
    
    def execute_enhancement(
        self, 
        priority_urls: List[str], 
        enhancement_type: str,
        config: RunnableConfig = None
    ) -> List[Dict[str, Any]]:
        """执行内容增强（占位符实现）"""
        
        # 这里应该集成Firecrawl或其他深度抓取工具
        # 目前返回模拟结果
        
        enhanced_results = []
        
        for url in priority_urls[:3]:  # 限制处理数量
            enhanced_result = {
                "url": url,
                "enhanced_content": f"[增强内容] 对 {url} 的深度分析结果...",
                "enhancement_type": enhancement_type,
                "extraction_success": True,
                "content_length": 1500,
                "quality_score": 0.85
            }
            enhanced_results.append(enhanced_result)
        
        print(f"🔍 内容增强完成：处理了 {len(enhanced_results)} 个URL")
        
        return enhanced_results


# 全局增强器实例
_content_enhancer = ContentEnhancer()


def content_enhancement_node(state: AdvancedResearchState, config: RunnableConfig) -> Dict[str, Any]:
    """
    LangGraph内容增强节点
    智能决策是否需要深度内容抓取
    """
    
    print(f"🔍 内容增强器启动...")
    
    # 获取当前研究上下文
    current_task = get_current_task(state)
    research_topic = current_task.description
    
    # 获取当前研究发现
    current_findings = state.get("web_research_results", [])
    findings_content = [
        result.get("content", result.get("snippet", ""))
        for result in current_findings
        if isinstance(result, dict)
    ]
    
    # 提取引用源
    grounding_sources = _content_enhancer.extract_grounding_sources(state)
    
    print(f"  研究主题：{research_topic}")
    print(f"  当前发现数量：{len(findings_content)}")
    print(f"  可用信息源：{len(grounding_sources)}")
    
    # 分析增强需求
    decision = _content_enhancer.analyze_enhancement_need(
        research_topic=research_topic,
        current_findings=findings_content,
        grounding_sources=grounding_sources,
        config=config
    )
    
    # 构建结果
    result = {
        "enhancement_decision": {
            "needs_enhancement": decision.needs_enhancement,
            "confidence_score": decision.confidence_score,
            "enhancement_type": decision.enhancement_type,
            "priority_urls": decision.priority_urls,
            "reasoning": decision.reasoning,
            "quality_gaps": decision.quality_gaps
        },
        "enhancement_status": "analyzing"
    }
    
    # 如果需要增强，执行增强
    if decision.needs_enhancement and decision.priority_urls:
        print(f"🚀 执行内容增强，类型：{decision.enhancement_type}")
        
        enhanced_results = _content_enhancer.execute_enhancement(
            priority_urls=decision.priority_urls,
            enhancement_type=decision.enhancement_type,
            config=config
        )
        
        result.update({
            "enhanced_content_results": enhanced_results,
            "enhanced_sources_count": len(enhanced_results),
            "enhancement_status": "completed",
            "enhancement_quality_boost": min(0.3, (1.0 - decision.confidence_score) / 2)
        })
        
        print(f"✅ 增强完成：获得 {len(enhanced_results)} 个增强结果")
        
    else:
        print(f"⏭️ 跳过内容增强：质量评分 {decision.confidence_score:.2f}")
        result.update({
            "enhancement_status": "skipped",
            "enhanced_sources_count": 0
        })
    
    return result


def should_enhance_content(state: AdvancedResearchState) -> str:
    """
    决定是否应该进行内容增强
    用于LangGraph的条件边
    """
    
    # 检查是否有增强决策结果
    enhancement_decision = state.get("enhancement_decision")
    
    if enhancement_decision and enhancement_decision.get("needs_enhancement", False):
        print("🔍 内容需要增强，启动增强流程")
        return "analyze_enhancement_need"
    else:
        print("⏭️ 内容质量充足，跳过增强")
        return "continue_without_enhancement" 