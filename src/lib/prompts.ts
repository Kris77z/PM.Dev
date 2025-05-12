// src/lib/prompts.ts
import { DocumentType, RequestData, GenericAnswers, PlannedPagesOutput, OptimizationAnswers, AddFeatureAnswers } from '../types'; // Import necessary types

// Define the Message interface locally or import if defined elsewhere centrally
export interface Message { // Exporting allows ai.ts to import it
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * 根据文档类型和数据生成用于 AI API 调用的消息数组。
 *
 * @param documentType 正在处理的文档类型 (来自 src/types.ts)。
 * @param data 提示词所需的相关数据 (来自 src/types.ts)。
 * @returns 用于 AI API 的消息数组，如果类型无效则返回 null。
 */
export const getPrompt = (documentType: DocumentType, data: RequestData): Message[] | null => {
    // 改进：为不同文档类型创建专门的系统提示
    let systemPrompt = "你是一位经验丰富的产品经理 AI 助手。你的目标是根据用户的输入，帮助他们定义、规划和完善软件产品功能。请使用清晰、结构化的 Markdown 格式生成回应。";

    // --- Data Handling ---
    // Helper to safely stringify answers using the correct type
    const stringifyAnswers = (answers: RequestData['answers']): string => {
        return JSON.stringify(answers || {}, null, 2);
    }

    // Removed the unused 'modification' check block
    // let originalDocument: string | undefined;
    // let modificationRequest: string | undefined;
    // if (documentType === 'modification') { ... } // This block is removed

    switch (documentType) {
        case 'product':
            // 针对 PRD 的专门系统提示
            systemPrompt = "你是一位经验丰富的产品经理 AI 助手。你的任务是创建一份详尽的产品需求文档 (PRD)，作为开发团队的指南。PRD 是项目的基础，设定产品的整体基调。它应当清晰传达产品的核心目标和范围，使所有团队成员理解「做什么」和「为什么做」。请使用清晰、专业的 Markdown 格式。";
            
            return [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `请根据以下用户输入，生成一份详细的产品需求文档（PRD）：\n\n\`\`\`json\n${stringifyAnswers(data.answers as GenericAnswers)}\n\`\`\`\n\n遵循以下结构严格编写文档：\n\n## 1. 应用概述 (App Overview)\n* **产品名称与平台**：明确说明产品名称及目标平台（网页端/移动端等）。\n* **产品概念**：简明扼要地描述产品是什么，解决什么问题。\n* **核心价值主张**：明确阐述产品的核心价值，它如何解决用户痛点。\n\n## 2. 目标用户 (Target Users)\n* 详细描述目标用户画像，包括人口统计学特征、行为特征、需求和痛点。\n* 尽可能具体，避免过于宽泛的描述。\n\n## 3. 用户流程 (User Flows)\n* 详细描述用户如何与产品交互以完成关键任务。\n* 对于每个核心功能，详细说明用户完成该功能的主要步骤。\n* 使用连贯的叙述性语言，而不是简单的要点列表。\n* 重点关注用户提供的"关键用户流程示例"，并基于此扩展。\n\n## 4. 核心功能 (Core Features)\n* 列出产品必须具备的所有关键功能点。\n* 对每个功能进行详细说明，解释其目的和价值。\n* 确保每个功能描述都明确且具体。\n\n## 5. 技术栈与 API (Tech Stack & APIs)\n* 基于产品需求和目标平台，提出初步的技术选型建议。\n* 如果已知，列出可能需要使用的第三方 API 或服务。\n* 简要解释技术选择的理由。\n\n## 6. 范围定义 (In-scope vs Out-of-scope)\n* 明确说明当前版本/阶段包含的内容。\n* 明确说明当前版本/阶段不包含的内容。\n* 如果用户提供了"范围说明/未来考虑"，利用这些信息丰富此部分。\n\n请确保文档语言专业、清晰，内容详实具体，避免空泛的表述。每个部分都应包含充分的细节，使开发团队能够清楚理解产品定义。`,
                },
            ];

        case 'page':
            // 针对应用流程文档的专门系统提示
            systemPrompt = "你是一位专注于用户体验的产品经理 AI 助手。你的任务是创建一份详尽的应用流程文档 (App Flow Document)，清晰展示应用的「地图」。这份文档需要极度清晰和具体，以指导开发团队理解页面间的导航和交互逻辑。请使用简单、明确的语言，避免技术术语，确保每个交互路径都被详细描述。";
             
             return [
                 { role: 'system', content: systemPrompt },
                 {
                     role: 'user',
                     content: `请根据以下规划的页面数据，生成一份详尽的应用流程文档 (App Flow Document)：\n\n\`\`\`json\n${stringifyAnswers(data.answers as PlannedPagesOutput)}\n\`\`\`\n\n遵循以下结构严格编写文档：\n\n## 1. 应用整体结构\n* 简要概述应用的整体结构和主要页面组成。\n* 说明主要导航模式（如标签栏、侧边菜单、层级导航等）。\n* 提供一个应用页面结构的高层次视图。\n\n## 2. 页面详情\n对于规划中的每一个页面，请**创建一个专门的小节**，包含以下内容：\n\n### [页面名称]\n* **文件名建议**：为该页面建议一个组件文件名（使用 PascalCase 命名法，以 .tsx 结尾，例如：UserProfilePage.tsx）。\n* **页面目的**：详细说明这个页面的主要目的和用户来到此页面想要完成的任务。\n* **核心功能组件**：列出并详细描述页面上的主要功能组件（如按钮、表单、列表等）。\n* **用户操作流程**：使用连贯的、叙述性的语言，详细描述用户在该页面的典型操作流程，从进入页面到完成主要任务的每一步。\n* **数据需求**：简要说明页面需要显示或处理的主要数据类型。\n\n## 3. 页面间导航流程\n* **详细的用户旅程描述**：使用连贯的叙述性语言（不是简单的要点列表），详细描述用户如何在不同页面间导航。\n* **明确的触发点**：对于每一个页面跳转，明确指出触发跳转的具体操作（如"点击登录按钮"）。\n* **条件导航**：如果存在基于条件的导航路径（如登录成功/失败导致不同跳转），清晰说明这些条件和相应的路径。\n* **基于用户提供的"页面间流转描述"，构建完整、连贯的用户旅程。**\n\n## 4. 特殊交互状态\n* 描述关键页面的特殊状态（如加载中、空数据、错误状态等）及其处理方式。\n* 说明模态框、抽屉、提示等临时 UI 元素的触发条件和交互方式。\n\n请确保描述极其具体、清晰，使得开发团队能够理解每个页面的目的、内容和交互方式，以及用户如何在整个应用中导航。避免使用模糊或抽象的术语，保持语言简单直接。不要简单罗列要点，而是使用完整的句子和段落进行描述。`,
                 },
             ];

        case 'techStack':
            // 针对技术栈文档的专门系统提示
            systemPrompt = "你是一位资深技术架构师 AI 助手。你的任务是创建一份详细的技术栈文档 (Tech Stack Document)，明确告知开发团队需要使用的具体技术工具和资源。这份文档的目的是约束技术选择，确保使用符合项目要求的、统一的技术栈，避免开发人员各自「即兴创作」。请注重完整性和精确性，包括版本号和具体依赖。";
             
             return [
                 { role: 'system', content: systemPrompt },
                 {
                     role: 'user',
                     content: `请根据以下技术选型和偏好，生成一份详细的技术栈文档 (Tech Stack Document)：\n\n\`\`\`json\n${stringifyAnswers(data.answers as GenericAnswers)}\n\`\`\`\n\n遵循以下结构严格编写文档：\n\n## 1. 项目技术概览\n* 简要说明项目类型（全栈、纯前端等）及整体技术方向。\n* 总结核心技术选择和架构决策。\n\n## 2. 所有包和依赖\n### 核心框架和平台\n* **前端框架**：详细说明选用的前端框架（如 React、Vue 等），**明确指定版本号**。\n* **后端框架**：详细说明选用的后端框架（如 Express、Django 等），**明确指定版本号**。\n* **数据库**：详细说明选用的数据库系统，**明确指定版本号**。\n\n### 主要依赖库\n* **状态管理**：指定状态管理解决方案（如 Redux、Zustand 等）。\n* **UI 组件库**：详细说明选用的 UI 库（如 Material UI、Ant Design 等）。\n* **路由**：指定路由解决方案。\n* **表单处理**：指定表单处理库（如 React Hook Form、Formik 等）。\n* **数据获取**：指定数据获取/API 调用库（如 Axios、SWR 等）。\n* **验证**：指定数据验证库（如 Zod、Yup 等）。\n* **工具库**：列出其他关键工具库（如 date-fns、lodash 等）。\n* **测试框架**：指定测试相关的库和工具。\n\n### 特定功能依赖\n* **认证**：指定认证相关的库和服务。\n* **文件处理**：指定文件上传/处理相关的库。\n* **其他专用功能库**：列出项目特定需求相关的库。\n\n## 3. API 文档链接\n* **内部 API**：如果适用，提供内部 API 的文档位置或组织结构说明。\n* **第三方 API**：列出所有需要集成的第三方 API，并提供其官方文档链接。\n  * 对于每个 API，简要说明其用途和集成重点。\n\n## 4. 偏好的库和工具\n* **代码风格和格式化**：指定代码风格指南和工具（如 ESLint、Prettier 配置）。\n* **构建工具**：指定项目使用的构建工具和配置。\n* **包管理器**：指定使用的包管理器（npm、yarn、pnpm 等）。\n* **开发环境**：推荐的 IDE 和插件配置。\n* **部署平台**：指定目标部署平台和相关工具。\n* **监控和日志**：指定监控和日志解决方案。\n* **CI/CD**：说明持续集成和部署策略。\n\n## 5. 版本控制和协作\n* **Git 策略**：说明分支策略和版本控制最佳实践。\n* **文档**：指定项目文档的组织方式和工具。\n\n请确保这份文档内容详实、具体，避免笼统的描述。对于每个技术选择，尽可能提供具体版本号、配置建议和使用理由。这份文档应当成为开发团队的技术「宪法」，明确规定项目的技术边界和标准。`,
                 },
             ];

        case 'backendStructure':
            // 针对后端结构文档的专门系统提示
            systemPrompt = "你是一位专注于后端架构的技术专家 AI 助手。你的任务是创建一份详尽的后端结构文档 (Backend Structure Document)，详细说明后端的数据存储、业务逻辑和规则。这份文档应当使开发团队能够准确理解数据库结构、认证机制、存储规则和关键业务逻辑，确保后端实现符合项目需求。请使用精确的技术术语，提供具体的表结构和 API 设计。";
             
             return [
                 { role: 'system', content: systemPrompt },
                 {
                     role: 'user',
                     content: `请根据以下用户输入，生成一份详细的后端结构文档 (Backend Structure Document)。只有当项目类型为"全栈项目"时才详细生成此文档，否则简要说明即可。\n\n\`\`\`json\n${stringifyAnswers(data.answers as GenericAnswers)}\n\`\`\`\n\n如果项目类型为"全栈项目"，请遵循以下结构严格编写文档：\n\n## 1. 数据库设计\n### 数据库类型与配置\n* 详细说明选用的数据库类型（如 PostgreSQL、MySQL 等）。\n* 提供关键配置建议（如字符集、排序规则等）。\n\n### 数据模式 (Schema)\n* **详细表结构**：为每个核心实体创建一个子部分，详细说明表结构。\n* 对于每个表，提供以下详细信息：\n  * 表名（遵循命名约定）\n  * 所有字段名及其数据类型\n  * 主键设计\n  * 索引设计\n  * 外键关系\n  * 约束条件\n  * 对关键字段的详细说明\n\n示例表结构格式（对于 SQL 数据库）：\n\`\`\`sql\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) NOT NULL UNIQUE,\n  password_hash VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n  -- 其他字段\n);\n\`\`\`\n\n### 实体关系\n* 详细描述表之间的关系（一对一、一对多、多对多）。\n* 说明如何实现这些关系（外键、连接表等）。\n* 如果可能，提供一个简化的 ER 图描述（文本形式）。\n\n## 2. 认证与授权\n*如果需要认证 (needs_authentication = '是')：*\n\n### 认证机制\n* 详细说明选用的认证方法（如 JWT、Session 等）。\n* 描述用户注册、登录、登出的完整流程。\n* 提供密码存储和安全策略（如加密方式）。\n\n### 授权规则\n* 说明不同类型用户的权限设计。\n* 描述资源访问控制策略。\n* 提供实现建议。\n\n## 3. 存储规则\n*如果有文件/媒体存储需求：*\n\n### 文件存储策略\n* 详细说明文件存储位置（本地文件系统、云存储等）。\n* 描述文件命名约定和目录结构。\n* 说明访问控制策略。\n* 提供对不同类型文件（图片、文档等）的处理建议。\n\n## 4. API 设计\n### REST API 端点\n* 根据核心实体和功能，详细列出主要 API 端点。\n* 对于每个端点，提供以下信息：\n  * HTTP 方法 (GET, POST, PUT, DELETE 等)\n  * 路径\n  * 请求参数/正文格式\n  * 响应格式\n  * 认证要求\n  * 简要说明\n\n示例 API 文档格式：\n\`\`\`\nGET /api/users/:id\n权限要求: 已认证用户\n参数:\n  - id: 用户ID (路径参数)\n响应: 200 OK\n{\n  "id": 1,\n  "email": "user@example.com",\n  "created_at": "2023-01-01T00:00:00Z"\n}\n\`\`\`\n\n### API 错误处理\n* 定义标准错误响应格式。\n* 列出常见错误代码和消息。\n\n## 5. 关键业务逻辑\n* 描述需要特殊处理的业务规则和边缘情况。\n* 说明复杂计算或处理的实现建议。\n* 提供事务处理、并发控制等策略。\n\n## 6. 安全考虑\n* 提供 API 安全、数据验证、防注入等建议。\n* 说明敏感数据处理策略。\n\n如果项目类型不是"全栈项目"，请简要说明为什么不需要详细的后端结构文档，但仍可提供简单的数据持久化建议（如使用 localStorage, IndexedDB 等客户端存储）。`,
                 },
             ];

        case 'frontendGuidelines':
            // 针对前端规范的专门系统提示
            systemPrompt = "你是一位专注于前端开发和用户界面的设计师 AI 助手。你的任务是创建一份详尽的前端规范文档 (Frontend Guidelines)，定义应用的视觉和交互风格。这份文档将确保 AI 生成的前端代码符合设计要求，保持视觉和用户体验的一致性。请提供精确的字体规范、颜色值、间距规则和组件样式指南。";
             
             return [
                 { role: 'system', content: systemPrompt },
                 {
                     role: 'user',
                     content: `请根据以下用户输入，生成一份详细的前端规范文档 (Frontend Guidelines)。仅当项目类型不是"纯前端项目 (静态页面为主...)"时才生成此详细文档，否则简化处理。\n\n\`\`\`json\n${stringifyAnswers(data.answers as GenericAnswers)}\n\`\`\`\n\n如果项目类型需要前端规范，请遵循以下结构严格编写文档：\n\n## 1. 设计理念与视觉风格\n* 概述产品的整体设计理念和视觉风格定位。\n* 说明设计语言的核心原则和关键特征。\n* 如果有品牌指南，简要提及相关要点。\n\n## 2. 颜色体系\n* **主色调**：提供主色调的确切色值（HEX、RGB 和 HSL）及其使用场景。\n* **辅助色/品牌色**：提供所有辅助色和品牌色的确切色值及使用场景。\n* **功能色**：定义成功、警告、错误、信息等状态颜色及其使用规则。\n* **中性色**：定义文本、背景、边框等元素的灰度色阶。\n* **颜色使用规则**：明确说明各种颜色的使用场景和约束。\n\n示例颜色定义格式：\n\`\`\`css\n/* 主色 */\n--primary: #4F46E5; /* HEX */\n--primary-rgb: 79, 70, 229; /* RGB */\n--primary-hsl: 245, 75%, 59%; /* HSL */\n\n/* 功能色 - 成功 */\n--success: #10B981;\n--success-light: #D1FAE5;\n--success-dark: #065F46;\n\`\`\`\n\n## 3. 字体规范\n* **字体族**：明确指定使用的字体名称，包括主要字体和备用字体。\n* **字重**：明确定义使用的字重级别（如 Regular 400、Medium 500、Bold 700 等）及其使用场景。\n* **字号系统**：定义一套完整的字号系统，明确各级标题、正文、辅助文本等的字号。\n* **行高**：为不同字号和文本类型定义适当的行高。\n* **字体颜色**：定义文本在不同场景下的颜色（主文本、次要文本、禁用文本等）。\n\n示例字体规范格式：\n\`\`\`css\n/* 字体族 */\n--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n\n/* 字号系统 */\n--text-xs: 0.75rem; /* 12px */\n--text-sm: 0.875rem; /* 14px */\n--text-base: 1rem; /* 16px */\n--text-lg: 1.125rem; /* 18px */\n--text-xl: 1.25rem; /* 20px */\n--text-2xl: 1.5rem; /* 24px */\n\n/* 行高 */\n--leading-tight: 1.25;\n--leading-normal: 1.5;\n--leading-relaxed: 1.625;\n\`\`\`\n\n## 4. 间距与布局系统\n* **基础单位**：定义间距的基础单位（如 4px 或 8px）。\n* **间距比例**：列出完整的间距比例系统。\n* **容器宽度**：定义不同设备上的容器最大宽度。\n* **网格系统**：说明使用的网格系统（如 12 列网格）及其规则。\n* **响应式断点**：定义所有响应式断点及其对应的设备类型。\n\n示例间距系统格式：\n\`\`\`css\n/* 间距系统 - 8px 基础单位 */\n--space-1: 0.25rem; /* 4px */\n--space-2: 0.5rem; /* 8px */\n--space-3: 0.75rem; /* 12px */\n--space-4: 1rem; /* 16px */\n--space-6: 1.5rem; /* 24px */\n--space-8: 2rem; /* 32px */\n--space-12: 3rem; /* 48px */\n--space-16: 4rem; /* 64px */\n\n/* 响应式断点 */\n--screen-sm: 640px;\n--screen-md: 768px;\n--screen-lg: 1024px;\n--screen-xl: 1280px;\n\`\`\`\n\n## 5. 组件样式指南\n* **按钮**：定义所有按钮类型、尺寸、状态及其样式。\n* **表单元素**：定义输入框、选择器、复选框等表单元素的样式。\n* **卡片与容器**：定义卡片、面板等容器元素的样式（圆角、阴影等）。\n* **导航元素**：定义菜单、导航栏、选项卡等导航元素的样式。\n* **其他常用组件**：根据项目需求，定义其他常用组件的样式。\n\n### 组件变体与状态\n对于每种组件，详细描述不同状态（默认、悬停、活动、禁用等）的样式变化。\n\n## 6. 图标系统\n* **图标库**：明确指定使用的图标库及其使用方法。\n* **图标尺寸**：定义不同场景使用的图标尺寸。\n* **图标颜色**：说明图标颜色的使用规则。\n* 如可能，提供一些核心图标的使用示例。\n\n## 7. 动效与过渡\n* 定义过渡动画的持续时间和缓动函数。\n* 说明不同类型交互的推荐动效。\n* 提供动效使用的一般原则和约束。\n\n## 8. 辅助功能 (Accessibility)\n* 提供色彩对比度要求。\n* 说明焦点状态的视觉指示器设计。\n* 列出其他辅助功能设计考虑。\n\n如果项目类型是"纯前端项目 (静态页面为主...)"，请提供一份简化的前端规范，专注于颜色、字体和基本组件样式的定义。`,
                 },
             ];

        // --- Placeholder Prompts for other flows ---
        case 'optimizePlan':
             return [
                 { role: 'system', content: systemPrompt },
                 { role: 'user', content: `请根据以下关于优化现有功能/页面的信息，生成一份概要文档：\n\n\`\`\`json\n${stringifyAnswers(data.answers as OptimizationAnswers)}\n\`\`\`\n\n请突出显示已识别的问题/PRD 摘要、优化目标、建议的解决方案和技术讨论要点。请清晰地组织文档结构以便审阅。` },
             ];
        case 'addFeaturePlan':
             return [
                 { role: 'system', content: systemPrompt },
                 { role: 'user', content: `请根据以下输入，生成一份新增功能定义文档初稿：\n\n\`\`\`json\n${stringifyAnswers(data.answers as AddFeatureAnswers)}\n\`\`\`\n\n文档应包含以下部分：功能目标与价值、目标用户、核心工作流程以及与现有功能的交互。请确保清晰说明该功能的目的和范围。` },
             ];
         case 'addFeatureTechPlan':
              return [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: `请为新增的功能，根据以下技术规划信息生成一份技术实施概要：\n\n\`\`\`json\n${stringifyAnswers(data.answers as GenericAnswers)}\n\`\`\`\n\n重点关注与新增功能相关的技术选型、依赖、可能的API端点或数据库表结构变更。` },
              ];
         case 'addFeaturePagePlan':
               return [
                   { role: 'system', content: systemPrompt },
                   { role: 'user', content: `请为新增的功能，根据以下页面规划信息生成一份页面流程说明：\n\n\`\`\`json\n${stringifyAnswers(data.answers as PlannedPagesOutput)}\n\`\`\`\n\n描述新增页面/修改页面的目的、核心功能，并说明它们如何融入现有应用流程。为新页面建议文件名。` },
               ];

        // Removed the commented out 'modification' case block

        default:
             console.error(`Unhandled document type in getPrompt: ${documentType}`);
            return null;
    }
};