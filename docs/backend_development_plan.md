# 后端研发计划：构建具备自主研究能力的AI核心服务

本文档旨在规划和指导后端服务的开发过程，该服务将为我们的AI助手提供实时网络搜索、信息整合与溯源的核心能力。

## 1. 项目目标

构建一个基于 Python、FastAPI 和 LangGraph 的后端服务。该服务能够接收一个研究性问题，自主地进行多轮网络搜索、分析和反思，并最终生成一份包含引用来源的、有理有据的回答。

这个过程模仿一位"博士生"的研究模式：**提出假设 -> 搜集资料 -> 批判性反思 -> 修正方向 -> 再次搜集 -> 撰写报告**。

## 2. 技术选型 (Tech Stack)

我们将采用业界验证的、现代化的技术栈来构建此服务：

- **Web框架**: `FastAPI` - 高性能、易于开发的Python Web框架。
- **AI编排**: `LangGraph` - LangChain推出的图式（Graph）状态机，用于构建可循环、有状态的Agent工作流。
- **核心大模型**: `Google Gemini` - 用于生成搜索查询、进行反思、整合报告。
- **网络搜索**: `Google Search API` - 提供实时、高质量的网页搜索能力。
- **实时通信**: `Redis (Pub/Sub)` - 用于将后端研究过程中的实时状态（如"正在搜索..."、"已找到3篇文章..."）推送到前端。
- **应用容器化**: `Docker` - 用于打包和部署我们的后端服务，确保环境一致性。
- **依赖管理**: `Poetry` 或 `pip` (配合 `requirements.txt`)。

## 3. 核心架构设计

我们将构建一个由 LangGraph 驱动的状态机，它包含以下几个关键的"节点"（Node）和"边"（Edge）。

### 3.1 状态（State）

我们需要一个贯穿始终的状态对象，用于在不同节点间传递信息。它将包含：

- `user_query`: 用户的原始问题。
- `search_queries`: (列表) 由AI生成的Google搜索关键词。
- `search_results`: (列表) 从Google返回的网页链接和摘要。
- `critique`: AI对当前搜索结果的"反思"和"批判"，判断信息是否充足。
- `report`: 最终生成的综合报告。
- `is_complete`: (布尔值) 标记研究是否完成。

### 3.2 节点（Nodes） - 研究步骤

1.  **`generate_queries_node` (生成查询节点)**
    - **输入**: `user_query`, `critique` (可选，来自反思节点的反馈)
    - **处理**: 调用Gemini模型，根据用户问题和上一轮的反思，生成1-3个精准的Google搜索关键词。
    - **输出**: 更新状态中的 `search_queries`。

2.  **`web_search_node` (网络搜索节点)**
    - **输入**: `search_queries`
    - **处理**: 调用Google Search API，执行搜索，获取网页列表。
    - **输出**: 更新状态中的 `search_results`。

3.  **`reflect_node` (反思节点)**
    - **输入**: `user_query`, `search_results`
    - **处理**: 核心节点。调用Gemini模型，分析搜索到的内容，并回答两个问题：
        1. "基于现有信息，是否足以回答用户的问题？"
        2. "如果不足，还缺少哪些关键信息？下一步应该搜索什么？"
    - **输出**: 更新状态中的 `critique`，并根据分析结果决定下一步走向。

4.  **`generate_report_node` (生成报告节点)**
    - **输入**: `user_query`, `search_results`
    - **处理**: 调用Gemini模型，整合所有搜索到的有效信息，撰写一份最终的、带引用链接的报告。
    - **输出**: 更新状态中的 `report`。

### 3.3 边（Edges） - 工作流程

工作流程将由"边"来定义，其中最关键的是一个**条件边**：

1.  **`START` -> `generate_queries_node`**: 从生成查询开始。
2.  **`generate_queries_node` -> `web_search_node`**: 生成查询后进行搜索。
3.  **`web_search_node` -> `reflect_node`**: 搜索完毕后进行反思。
4.  **`reflect_node` -> (条件判断)**:
    - **如果 `critique` 判断信息不全**: 回到 `generate_queries_node`，开始新一轮的迭代研究。
    - **如果 `critique` 判断信息充足**: 前往 `generate_report_node`。
5.  **`generate_report_node` -> `END`**: 生成报告后，流程结束。

![Architecture Diagram](https://i.imgur.com/uR0Tf2S.png)

## 4. API接口设计

我们将通过FastAPI暴露一个HTTP接口来触发这个研究流程。

- **Endpoint**: `POST /research`
- **Request Body**:
    ```json
    {
      "query": "用户的研究问题，例如：Web3游戏领域的最新发展趋势是什么？"
    }
    ```
- **Response (Streaming)**:
    - 后端将采用**服务器发送事件（Server-Sent Events, SSE）**或 **WebSocket** 的方式，向前端实时推送研究进展。
    - **消息格式示例**:
        ```json
        // 消息1
        { "type": "status", "step": "generate_queries", "details": "正在生成搜索查询..." }
        // 消息2
        { "type": "data", "step": "web_search", "details": "[{'title': '...', 'link': '...'}, ...]" }
        // 消息3
        { "type": "status", "step": "reflect", "details": "正在分析搜索结果..." }
        // ...
        // 最终消息
        { "type": "report", "step": "generate_report", "details": "这是最终的报告文本..." }
        ```

## 5. 开发步骤 (Roadmap)

1.  **环境搭建**:
    - 在 `pm-assistant` 目录下创建 `backend` 文件夹。
    - 初始化Python项目 (`pyproject.toml` 或 `requirements.txt`)。
    - 创建 `.env.template` 文件，声明需要的环境变量（`GOOGLE_API_KEY`, `GOOGLE_CSE_ID`等）。
2.  **实现核心Graph**:
    - 在 `backend/src/agent` 目录中，编写 `state.py`, `prompts.py`, `graph.py`，分别定义状态、提示词和核心的LangGraph图。
3.  **实现工具节点**:
    - 编写 `tools.py`，封装对Google Search API的调用。
4.  **构建API服务**:
    - 在 `backend/src/main.py` 中，创建FastAPI应用，并实现 `/research` 接口。
    - 集成Redis，实现研究状态的实时推送。
5.  **容器化**:
    - 编写 `Dockerfile` 和 `docker-compose.yml`，将后端服务、Redis等打包。
6.  **联调与测试**:
    - 编写简单的测试脚本，或与前端进行联调，确保流程通畅。

## 6. 需要的准备

- **Google API Key**: 用于访问Gemini和Google Search API。
- **Google Programmable Search Engine ID**: 需要创建一个自定义搜索引擎来使用Search API。

---
这份文档将作为我们后续开发工作的纲领。下一步，我们将开始着手**第一步：环境搭建**。 