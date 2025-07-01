import { PRDGenerationData } from '@/lib/prd-generator';
import { ENHANCED_INTERACTION_PROMPT } from './prd-to-html-enhanced-interaction';
import { STRUCTURED_PROMPT_FRAMEWORK } from './structured-prompt-framework';
import { QUALITY_ASSURANCE_SYSTEM } from './quality-assurance-system';
import { QUALITY_EXECUTION_INSTRUCTIONS } from './quality-execution-instructions';
import { STANDARD_DATA_MANAGEMENT_TOOLS } from './standard-data-management-tools';
import { RESPONSIVE_DESIGN_TOOLS } from './responsive-design-tools';
import { PRD_ENHANCEMENT_SYSTEM } from './prd-enhancement-system';

export interface PRDToHTMLPromptData {
  prdData: PRDGenerationData;
  userQuery?: string;
}

export const PRD_TO_HTML_SYSTEM_PROMPT = `
${STRUCTURED_PROMPT_FRAMEWORK}

<DESIGN_SYSTEM_REQUIREMENTS>
## 🎨 使用现代化的 Tailwind CSS 设计系统

### ⚡ 为什么选择 Tailwind CSS
**优势明显**：成熟稳定、AI友好、生态完善、语法简洁
**最佳实践**：使用最新稳定版本，结合现代组件设计模式

### CDN资源引入（推荐稳定版本）
在HTML的<head>部分包含：
\`\`\`html
<!-- Tailwind CSS - 稳定版本 -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- 自定义配置 -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#4F46E5',
          'primary-hover': '#4338CA',
        }
      }
    }
  }
</script>
\`\`\`

### 现代化组件设计模式
采用类似Shadcn/ui的设计语言：

**按钮系统**：
- 主要按钮：\`bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium transition-colors\`
- 次要按钮：\`bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium\`
- 危险按钮：\`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium\`

**卡片系统**：
- 基础卡片：\`bg-white rounded-lg border border-gray-200 shadow-sm\`
- 交互卡片：\`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow\`
- 突出卡片：\`bg-white rounded-lg border border-gray-200 shadow-lg\`

**表单系统**：
- 输入框：\`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary\`
- 标签：\`block text-sm font-medium text-gray-700 mb-1\`
- 错误状态：\`border-red-300 focus:ring-red-20 focus:border-red-500\`

### 布局系统（现代化响应式）
**容器系统**：
- 主容器：\`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\`
- 内容容器：\`max-w-4xl mx-auto\`
- 全宽容器：\`w-full\`

**Grid布局**：
\`\`\`html
<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside class="lg:col-span-1">侧边栏</aside>
  <main class="lg:col-span-2">主内容</main>
  <aside class="lg:col-span-1">右侧栏</aside>
</div>
\`\`\`

**Flexbox布局**：
\`\`\`html
<div class="flex flex-col lg:flex-row gap-6">
  <aside class="lg:w-1/4">侧边栏</aside>
  <main class="lg:w-1/2">主内容</main>
  <aside class="lg:w-1/4">右侧栏</aside>
</div>
\`\`\`

### 响应式断点系统
- **sm**: 640px+ (平板竖屏)
- **md**: 768px+ (平板横屏)  
- **lg**: 1024px+ (桌面)
- **xl**: 1280px+ (大桌面)
- **2xl**: 1536px+ (超大屏)

### 颜色系统（语义化）
- **主色调**: \`bg-primary\`, \`text-primary\`, \`border-primary\`
- **中性色**: \`bg-gray-50\`, \`bg-gray-100\`, \`bg-gray-900\`, \`text-gray-600\`, \`text-gray-900\`
- **状态色**: \`bg-green-500\`(成功), \`bg-yellow-500\`(警告), \`bg-red-500\`(错误)
- **背景**: \`bg-white\`, \`bg-gray-50\`, \`bg-gray-100\`

### 交互状态系统
- **悬停**: \`hover:bg-gray-50\`, \`hover:text-primary\`, \`hover:shadow-md\`
- **焦点**: \`focus:outline-none focus:ring-2 focus:ring-primary/20\`
- **活跃**: \`active:bg-gray-100\`
- **禁用**: \`disabled:opacity-50 disabled:cursor-not-allowed\`
- **过渡**: \`transition-colors duration-200\`, \`transition-shadow duration-200\`

### 现代化JavaScript交互
使用原生JavaScript + CSS实现：
- 模态框：结合Tailwind样式和简单的show/hide逻辑
- 下拉菜单：使用绝对定位和条件渲染
- 选项卡：通过数据属性和class切换
- 通知：使用固定定位和动画类
</DESIGN_SYSTEM_REQUIREMENTS>

<PRODUCT_TYPE_STANDARDS>
## 不同产品类型的必备页面和功能

### SaaS/工具类产品标准
必备页面：主仪表盘、数据管理、详情编辑、设置配置、用户权限
核心功能：数据CRUD、搜索筛选、批量操作、导入导出、权限管理
交互重点：表格操作、表单验证、工作流程、数据可视化
推荐布局：Dashboard布局（侧边栏+顶部导航+主内容区）

### 社交/内容类产品标准  
必备页面：信息流、个人资料、内容发布、消息通知、发现探索
核心功能：内容发布、互动评论、关注关系、消息通知、内容搜索
交互重点：内容展示、社交互动、富文本编辑、实时通知
推荐布局：Single Page布局（顶部导航+流式内容）

### 电商类产品标准
必备页面：商品展示、商品详情、购物车、订单管理、用户中心
核心功能：商品筛选、购买流程、支付结算、订单跟踪、用户管理
交互重点：商品展示、购买流程、支付体验、订单管理
推荐布局：Grid布局（商品网格+侧边筛选）

### 仪表盘类产品标准
必备页面：数据概览、报表分析、数据源管理、告警监控、系统设置
核心功能：数据可视化、实时监控、报表生成、告警配置、系统管理
交互重点：图表交互、数据筛选、实时刷新、告警处理
推荐布局：Dashboard布局（多列卡片+侧边导航）
</PRODUCT_TYPE_STANDARDS>

${ENHANCED_INTERACTION_PROMPT}

${QUALITY_ASSURANCE_SYSTEM}

${QUALITY_EXECUTION_INSTRUCTIONS}

${STANDARD_DATA_MANAGEMENT_TOOLS}

${RESPONSIVE_DESIGN_TOOLS}

${PRD_ENHANCEMENT_SYSTEM}
`;

export function buildPRDToHTMLPrompt(data: PRDToHTMLPromptData): string {
  const { prdData, userQuery } = data;

  let prompt = PRD_TO_HTML_SYSTEM_PROMPT;

  prompt += `

<PRD_DATA_INPUT>
以下是需要转换为产品原型的结构化PRD数据：

${JSON.stringify(prdData, null, 2)}
</PRD_DATA_INPUT>

`;

  if (userQuery) {
    prompt += `
<USER_REQUIREMENTS>
用户的额外要求和偏好：
${userQuery}

请在构建产品原型时特别考虑这些要求，确保生成的原型符合用户期望。
</USER_REQUIREMENTS>

`;
  }

  prompt += `
<EXECUTION_INSTRUCTION>
现在请基于<THINKING_FRAMEWORK>完成产品分析和规划，然后严格遵循<STRICT_CONSTRAINTS>和<QUALITY_GATES>的要求，构建一个高质量的、可交互的产品应用原型。

## 🚨 最终执行要求（必须严格遵守）

### CSS框架选择（现代化方案）
1. ✅ **首选**现代化、成熟的Tailwind CSS
2. ✅ 使用稳定的CDN版本
3. ✅ 配置自定义primary颜色主题
4. ✅ 采用现代化组件设计模式

### 布局要求
1. ✅ 使用 max-w-7xl mx-auto px-4 作为主容器
2. ✅ 使用 grid grid-cols-* 或 flex 进行布局
3. ✅ 响应式：sm: md: lg: xl: 断点系统
4. ✅ 间距：gap-* space-y-* p-* m-* 系统

### 质量验证清单
生成前必须确认：
- HTML正确引入Tailwind CSS CDN
- 组件使用现代化的设计模式
- 响应式布局移动优先
- 交互状态完整流畅

记住：用户希望看到的是**产品本身的界面和功能**，而不是关于产品的文档展示！

开始构建真实的产品原型界面吧！
</EXECUTION_INSTRUCTION>
`;

  return prompt;
}
