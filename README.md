# PM Assistant - 智能产品需求文档助手

这是一个基于AI的产品需求文档(PRD)智能编写助手，帮助产品经理快速、高效地创建专业的PRD文档。

## 🚀 主要功能

### 1. 智能PRD编写
- **结构化表单**：按章节组织的PRD模板，确保内容完整性
- **实时验证**：自动检查必填字段和内容质量
- **动态管理**：支持变更记录、用户场景、迭代历史的动态添加和管理

### 2. AI助手功能 🤖

#### 🔍 用户场景AI扩展
- **功能**：基于需求介绍，自动生成多个用户使用场景
- **输入**：需求介绍内容
- **输出**：包含用户类型、使用场景、痛点分析的结构化数据
- **用途**：帮助产品经理全面理解用户需求，避免场景遗漏

#### 🌐 智能竞品分析
- **功能**：使用AI模型的内置联网搜索技术，分析市面上相关产品竞品
- **技术**：基于GPT-4o、Claude 3.5、Gemini 2.0的原生网络搜索能力
- **输出**：详细的竞品调研报告，包括功能对比、优劣势分析、机会点识别
- **用途**：为产品决策提供市场洞察和竞争情报

#### ✅ 内容质量审查
- **功能**：AI审查PRD内容的完整性和质量
- **评估维度**：
  - 完整性检查（必填字段、关键信息）
  - 质量评估（描述清晰度、方案完善性）
  - 逻辑一致性（内容一致性、逻辑关系）
  - 专业程度（符合PRD标准、表达专业性）
- **输出**：0-100分评分、问题清单、改进建议
- **用途**：确保PRD质量，减少返工

#### 📄 智能PRD生成
- **功能**：基于填写的所有数据，生成完整的Markdown格式PRD文档
- **包含**：项目信息、需求分析、竞品分析、方案设计、实施计划等完整章节
- **特点**：结构清晰、内容详实、格式专业
- **导出**：支持复制到剪贴板和下载为.md文件

### 🚀 V2 高级研究系统 (基于LangGraph) （暂未全部完成，当前写死2轮循环任务，AI自动拆解正在测试中）

#### 🧠 智能任务规划
- **功能**：AI自动将复杂查询分解为多个子任务
- **技术**：基于LangGraph的智能规划节点
- **特点**：动态任务分解、优先级排序、执行策略优化

#### 🔥 Firecrawl深度抓取 (新集成)
- **功能**：真实API深度内容抓取，替代基础网页搜索
- **技术**：Firecrawl SDK + 智能批量处理
- **特点**：深度内容解析、批量URL处理、自动降级机制
- **配置**：需要`FIRECRAWL_API_KEY`环境变量

#### ⚡ 并行处理优化
- **功能**：多查询并发执行，显著提升性能
- **技术**：异步并发处理 + 资源池管理

#### 📊 高级监控系统
- **功能**：实时性能监控、执行状态跟踪
- **界面**：专门的V2测试页面 (`/test-demos/langgraph-v2-test`)
- **监控项**：API调用统计、执行时间、内存使用、错误率



## 🛠 技术架构

### 前端技术栈
- **框架**：Next.js 15 (React 19)
- **样式**：Tailwind CSS 4
- **UI组件**：Radix UI + shadcn/ui
- **图标**：Lucide React
- **类型安全**：TypeScript

### AI集成
- **GPT-4o**：默认的文本生成和分析模型
- **Claude 3.7 Sonnet**：高质量文本生成
- **Gemini 2.0 Flash**：快速响应的多模态模型，支持Google Search Grounding
- **Gemini 2.5 Pro**：更强的多模态模型，支持Google Search Grounding
- **DeepSeek R1**：推理增强的开源模型

### API架构
```
/api/ai-prd
├── expand-user-scenarios  # 用户场景扩展
├── competitor-analysis    # 竞品分析
├── generate-prd          # PRD生成
└── review-content        # 内容审查
```

## 📋 使用指南

### 环境配置

1. **复制环境变量文件**
```bash
cp env.example .env.local
```

2. **配置API密钥**
```bash
# 必需的API密钥
GPT4O_API_KEY=your_gpt4o_api_key_here
GPT4O_BASE_URL=https://your-gpt4o-proxy.example.com/v1

# Firecrawl深度内容抓取（V2功能）
FIRECRAWL_API_KEY=fc-your-firecrawl-api_key_here

# 可选的备用模型（都支持内置网络搜索）
CLAUDE_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

3. **安装依赖**
```bash
pnpm install
```

4. **启动开发服务器**
```bash
pnpm dev
```

### 目录结构
```
pm-assistant/
├── src/
│   ├── app/
│   │   ├── api/ai-prd/          # AI功能API接口
│   │   └── test-demos/prd-cards-complete/  # 主要功能页面
│   ├── components/ui/           # UI组件库
│   ├── config/models.ts         # AI模型配置
│   └── types.ts                 # 类型定义
├── env.example                  # 环境变量示例
└── README.md                    # 项目文档
```
