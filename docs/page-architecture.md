# `ask-anything/page.tsx` 架构文档

本文档详细介绍了 `pm-assistant`项目中核心页面 `ask-anything/page.tsx` 的架构、组件和渲染逻辑，旨在为后续开发和维护提供清晰的指引。

## 1. 页面概览

`ask-anything/page.tsx` 是一个多视图容器页面，通过 URL 参数 `view` 来动态切换和渲染不同的功能模块。它是整个应用的核心交互界面。

主要功能模块包括：
- **主聊天视图** (`view='chat'`)
- **Agent 研究视图** (`view='agent-research'`)
- **PRD 工具视图** (`view='prd-house'`)
- **Prompt 工具视图** (`view='prompt-house'`)

## 2. 核心 Hooks

页面的状态管理和业务逻辑主要由两个自定义 Hooks驱动：

### `useChat`
- **作用**: 管理所有与主聊天功能相关的状态和操作。
- **核心职责**:
    - `messages`: 存储当前对话的消息列表。
    - `chatHistory`: 管理和存储历史对话列表。
    - `handleSendMessage`: 处理发送新消息的逻辑。
    - `loadHistorySession`: 加载指定的历史对话。
    - `startNewChat`: 创建新对话。
    - `isLoading`: 跟踪消息是否正在生成中。

### `useAgentResearch`
- **作用**: 管理 Agent 研究功能相关的状态和操作。
- **核心职责**:
    - `agentMessages`: 存储当前研究任务的消息和计划步骤。
    - `researchHistory`: 管理和存储历史研究列表。
    - `handleAgentResearchMessage`: 发起一个新的研究任务。
    - `loadHistoryResearchSession`: 加载指定的历史研究。
    - `isLoading`: 跟踪研究任务是否正在进行中。

## 3. 视图详解

### 3.1. 主聊天视图 (`view='chat'`)

这是应用的默认和核心视图，用于用户与 AI 的自由对话。

#### 消息渲染流程

1.  **消息循环**: 页面通过 `chat.messages.slice(1).map(...)` 遍历消息列表（跳过第一条系统消息）。
2.  **消息块转换**: 对于每条消息，调用 `convertMessageToBlocks(message)` 函数。此函数将原始的 `message.content` 字符串转换为一个结构化的 `MainTextMessageBlock` 对象。这是为了支持未来更复杂的消息结构（例如，包含图片、工具输出等）。
3.  **核心渲染组件**: `<EnhancedMessageItem />`
    - **作用**: 渲染单条消息的气泡，是消息展示的顶层容器。
    - **关键 Props**:
        - `message`: 完整的消息对象。
        - `blocks`: 消息块对象记录。
        - `isGenerating`: 控制是否显示"正在思考中..."的 `TextShimmer` 动画。
    - **内部逻辑**:
        - 根据消息角色 (`user` 或 `assistant`) 决定气泡的对齐方式和颜色。
        - 当 `isGenerating` 为 `true` 且没有消息内容时，显示 `TextShimmer` 加载动画。
        - 内部调用 `<BlockRenderer />` 组件来实际渲染消息内容。

#### 消息内容渲染

- **`<BlockRenderer />`**:
    - **作用**: 遍历消息中的所有"块"（Blocks），并根据块的类型 (`type`) 渲染对应的组件。
    - **当前实现**: 主要渲染 `MainTextBlock`。

- **`<MainTextBlock />`**:
    - **作用**: 负责渲染核心的文本和代码内容。
    - **关键特性**:
        - **打字机效果**:
            - 使用 `TypewriterText` 组件为5秒内创建的新消息提供逐字显示的打字机动画，提升交互体验。
            - 历史消息则直接完全显示，避免重复动画。
        - **Markdown 渲染**:
            - 使用 `react-markdown` 及其插件 (`remark-gfm`, `rehype-highlight` 等) 来解析和渲染 Markdown 内容。
            - 提供了对表格、列表、链接、代码块等的丰富样式支持。
        - **代码块高亮**:
            - 内置了自定义的 `CodeComponent`，使用 `react-syntax-highlighter` 对代码块进行语法高亮。
            - 解决了之前代码块背景不统一、样式冲突的问题。
            - 包含"一键复制"功能。

#### 输入组件

- **`<AnimatedAIInput />`**:
    - **作用**: 提供一个带动画效果的用户输入框。
    - **功能**:
        - 发送消息 (`onSendMessage`)。
        - 模型选择 (`selectedModel`, `onModelChange`)。
        - 加载状态 (`disabled`)。

### 3.2. Agent 研究视图 (`view='agent-research'`)

此视图用于执行和展示多步骤的 Agent 研究任务。

#### 组件构成

- **`<ResearchPlan />`**:
    - **作用**: 核心组件，用于可视化地展示整个研究任务的步骤（Tasks）。
    - **功能**:
        - 将从 `useAgentResearch` 获取的 `agentPlan` 数据转换为任务列表。
        - 使用 `convertLangGraphToResearchTasks` 工具函数进行数据转换。
        - **状态显示**: 实时高亮显示当前正在执行的步骤 (`currentStep`)。
        - **渐进式展示**: `enableProgressiveDisplay` 属性确保只有已完成或正在进行的步骤才会被渲染，提供了任务进展的实时反馈。
        - **报告查看**: 任务完成后，显示"查看报告"按钮。

- **`<ResearchReportModal />`**:
    - **作用**: 以弹窗形式展示最终生成的研究报告。
    - **内容**: 报告内容 (`reportContent`) 也使用 `MainTextBlock` 进行渲染，确保了与主聊天视图一致的 Markdown 和代码块样式。

### 3.3. PRD 与 Prompt 工具视图

- **PRD 工具 (`view='prd-house'`)**:
    - **渲染组件**: `<PRDHouseViewRefactored />`
    - **描述**: 一个独立的、功能完善的 PRD 文档管理和编辑模块。

- **Prompt 工具 (`view='prompt-house'`)**:
    - **渲染组件**: `<PromptStashView />`
    - **描述**: 一个独立的、用于管理和使用 Prompt 的工具模块。

## 4. 侧边栏 (`Sidebar`)

侧边栏提供了应用的主要导航功能。

- **组件**: `<Sidebar />`, `<SidebarBody />`, `<SidebarLink />`
- **功能**:
    - **新对话**: 点击后调用 `chat.startNewChat()` 清空当前对话。
    - **历史记录**:
        - **不再使用折叠按钮**，直接在"新对话"和"Agent研究"链接下方线性展示所有历史记录。
        - **左对齐显示**，移除了之前的缩进，界面更简洁。
        - 列表项包括会话标题和删除按钮。
    - **视图切换**: 点击"PRD 工具"、"Prompt 工具"、"Agent 研究"链接时，调用 `switchView()` 函数更新 URL 参数，从而切换主内容区的视图。 