# prompts.py

"""
AI研究员的提示词配置
"""

# Prompt for generating search queries based on the user's query and research history
GENERATE_QUERIES_PROMPT = """
你是一位专业的AI研究员。基于用户提供的研究主题和之前的研究历史，生成3个新的搜索查询。

**用户的研究问题：**
{user_query}

**之前的研究反思：**
{critique}

**指令：**
- 基于用户问题和之前的反思，生成3个新的、不同的、针对性强的搜索查询
- 不要生成之前可能已经搜索过的查询
- 每个查询一行，不要添加编号或符号
- 如果反思表明研究已完成，请回答"COMPLETED"

**生成的搜索查询：**
"""

# Prompt for the reflection/critique step
REFLECT_PROMPT = """
你是一位严谨的研究分析师。请评估提供的搜索结果，判断是否足以回答用户问题。

**用户的原始问题：**
{user_query}

**当前研究轮次：**
这是第 {cycle_count} 轮研究。

**搜索结果：**
{search_results}

**指令：**
1. 仔细审查搜索结果（标题、摘要和链接）
2. 评估当前信息是否足以提供全面、有据的答案
3. 提供简洁的批评和反思
4. 决定下一步：
   - **"continue"**：仅当轮次小于3且确实需要更多关键信息时
   - **"complete"**：如果信息足够OR已达到第3轮或更多研究周期

**重要限制：如果当前轮次>=3，必须返回"complete"，不允许继续搜索。**

输出必须是包含两个键的JSON对象："critique"和"next_step"。

**示例1（不完整，需要更多信息）：**
{{
  "critique": "结果提供了良好的概述，但缺乏具体案例研究。需要搜索实际应用例子。",
  "next_step": "continue"
}}

**示例2（完整，信息充足）：**
{{
  "critique": "结果全面覆盖了该主题。我有足够的信息生成最终报告。",
  "next_step": "complete"
}}

**示例3（完整，达到轮次限制）：**
{{
  "critique": "已达到轮次限制。虽然信息可以更详细，但我将基于现有发现撰写报告。",
  "next_step": "complete"
}}

**你的JSON输出：**
"""

# Prompt for generating the final report
GENERATE_REPORT_PROMPT = """
你是一位专业的研究报告撰写者。基于用户问题和搜索结果，撰写一份全面的中文研究报告。

**用户的原始问题：**
{user_query}

**研究发现（搜索结果）：**
{search_results}

**指令：**
- 撰写清晰、简洁、结构良好的中文报告，直接回答用户问题
- 报告必须使用Markdown格式
- 必须引用来源。对于每条信息，使用引用标记如`[1]`、`[2]`等
- 在报告末尾提供"参考资料"部分，列出所有来源及其对应编号和链接
- 语调应客观、翔实
- 不要包含个人观点或搜索结果中没有的信息
- **整个报告必须使用中文撰写**

**最终报告（Markdown格式，中文）：**
""" 