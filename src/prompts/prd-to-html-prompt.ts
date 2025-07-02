import { PRDGenerationData } from '@/lib/prd-generator';
import { ENHANCED_INTERACTION_PROMPT } from './prd-to-html-enhanced-interaction';
import { STRUCTURED_PROMPT_FRAMEWORK } from './structured-prompt-framework';
import { QUALITY_ASSURANCE_SYSTEM } from './quality-assurance-system';
import { QUALITY_EXECUTION_INSTRUCTIONS } from './quality-execution-instructions';
import { STANDARD_DATA_MANAGEMENT_TOOLS } from './standard-data-management-tools';
import { RESPONSIVE_DESIGN_TOOLS } from './responsive-design-tools';
import { PRD_ENHANCEMENT_SYSTEM } from './prd-enhancement-system';
import { 
  IntelligentTemplateMatcher, 
  TemplateMatchResult 
} from './intelligent-template-matcher';
import { 
  SimpleTemplate,
  getHighQualityTemplates 
} from './reference-templates/template-library-simplified';

export interface PRDToHTMLPromptData {
  prdData: PRDGenerationData;
  userQuery?: string;
}

// 构建参考模板信息文本
function buildTemplateReferenceSection(templates: SimpleTemplate[]): string {
  if (templates.length === 0) {
    return '';
  }

  let referenceText = `\n\n## 🎨 精美UI参考模板系统\n\n`;
  
  if (templates.length === 1) {
    const template = templates[0];
    referenceText += `### 主要参考模板：${template.name}\n`;
    referenceText += `**模板说明**：${template.description}\n`;
    referenceText += `**布局类型**：${template.layoutType}\n`;
    referenceText += `**产品类型**：${template.productType}\n`;
    referenceText += `**行业类型**：${template.industryType}\n`;
    referenceText += `**质量评分**：${template.trustScore}/10\n\n`;

    // 视觉设计参考和灵感
    referenceText += `### 🎨 视觉设计参考和灵感\n\n`;
    referenceText += `**配色灵感**（可参考这些优美的色彩搭配）：\n`;
    referenceText += `- 主色调参考：${template.designSystem.colorPalette.primary} (可调整色调和饱和度)\n`;
    referenceText += `- 副色调参考：${template.designSystem.colorPalette.secondary} (作为配色灵感)\n`;
    referenceText += `- 背景色参考：${template.designSystem.colorPalette.background} (保持简洁明亮)\n`;
    referenceText += `- 表面色参考：${template.designSystem.colorPalette.surface} (卡片和组件背景)\n`;
    referenceText += `- 文字色调参考：${template.designSystem.colorPalette.text.primary} / ${template.designSystem.colorPalette.text.secondary}\n`;
    if (template.designSystem.colorPalette.accent) {
      referenceText += `- 强调色灵感：${template.designSystem.colorPalette.accent} (用于重点突出)\n`;
    }
    referenceText += `- 边框色参考：${template.designSystem.colorPalette.border} (保持微妙和谐)\n`;
    if (template.designSystem.colorPalette.success) {
      referenceText += `- 状态色参考：成功${template.designSystem.colorPalette.success}`;
      if (template.designSystem.colorPalette.warning) referenceText += ` / 警告${template.designSystem.colorPalette.warning}`;
      if (template.designSystem.colorPalette.error) referenceText += ` / 错误${template.designSystem.colorPalette.error}`;
      referenceText += `\n`;
    }
    referenceText += `\n`;

    referenceText += `**字体层次参考**（学习其优美的字体比例）：\n`;
    referenceText += `- 字体族参考：${template.designSystem.typography.fontFamily.primary}\n`;
    referenceText += `- 标题比例参考：H1(${template.designSystem.typography.scale.h1}) → H2(${template.designSystem.typography.scale.h2}) → H3(${template.designSystem.typography.scale.h3})\n`;
    referenceText += `- 正文比例参考：正文(${template.designSystem.typography.scale.body}) / 小字(${template.designSystem.typography.scale.small})\n`;
    
    if (template.designSystem.typography.weights) {
      referenceText += `- 字重层次参考：`;
      const weights = Object.entries(template.designSystem.typography.weights).map(([key, value]) => `${key}(${value})`).join(' / ');
      referenceText += `${weights}\n`;
    }
    referenceText += `\n`;

    referenceText += `**间距节奏参考**（学习其和谐的空间比例）：\n`;
    referenceText += `- 间距比例：${template.designSystem.spacing.xs} → ${template.designSystem.spacing.sm} → ${template.designSystem.spacing.md} → ${template.designSystem.spacing.lg} → ${template.designSystem.spacing.xl} → ${template.designSystem.spacing["2xl"]}\n`;
    referenceText += `- 建议：参考这种渐进式的间距比例，创造和谐的视觉节奏\n\n`;

    // 布局灵感参考
    referenceText += `### 📐 布局架构灵感\n\n`;
    referenceText += `**参考布局类型**：${template.layoutType}\n`;
    referenceText += `**布局特点**：可参考其整体架构思路，但请根据产品特性灵活调整\n`;
    
    // 简化的布局要点提取
    if (template.layoutStructure.header) {
      referenceText += `- **顶部区域**：可参考其导航设计和高度比例\n`;
    }
    if (template.layoutStructure.hero) {
      referenceText += `- **英雄区域**：学习其视觉冲击力和内容组织\n`;
    }
    if (template.layoutStructure.layout) {
      referenceText += `- **整体布局**：${template.layoutStructure.layout} 布局模式\n`;
    }
    if (template.layoutStructure.sidebar) {
      referenceText += `- **侧边栏设计**：可参考其宽度比例和内容组织\n`;
    }
    if (template.layoutStructure.main) {
      referenceText += `- **主内容区**：学习其内容展示和交互设计\n`;
    }
    referenceText += `\n`;

    // 组件设计灵感
    if (template.designSystem.components) {
      referenceText += `### 🧩 组件设计灵感\n\n`;
      Object.entries(template.designSystem.components).forEach(([componentName, componentConfig]) => {
        referenceText += `**${componentName} 组件设计参考**：学习其设计精华，自由发挥创意\n`;
        // 只提取关键的设计要点，不是完整配置
        if (typeof componentConfig === 'object' && componentConfig) {
          const configObj = componentConfig as Record<string, unknown>;
          if (configObj.background) referenceText += `- 背景处理：${configObj.background}\n`;
          if (configObj.borderRadius) referenceText += `- 圆角设计：${configObj.borderRadius}\n`;
          if (configObj.padding) referenceText += `- 内边距：${configObj.padding}\n`;
          if (configObj.shadow) referenceText += `- 阴影效果：${configObj.shadow}\n`;
        }
        referenceText += `\n`;
      });
    }

    // 交互体验灵感
    if (template.interactionPatterns) {
      referenceText += `### 🔄 交互体验灵感\n\n`;
      referenceText += `**参考交互模式**（可借鉴并创新）：\n`;
      Object.entries(template.interactionPatterns).forEach(([key, value]) => {
        referenceText += `- **${key}**：${value} (可以此为灵感，设计更适合的交互)\n`;
      });
      referenceText += `\n`;
    }

    referenceText += `### 🏷️ 设计标签\n`;
    referenceText += `${template.tags.join(', ')}\n\n`;

    // 源URL参考
    if (template.sourceUrl) {
      referenceText += `### 🔗 参考来源\n`;
      referenceText += `原始参考：${template.sourceUrl}\n\n`;
    }

  } else {
    // 多模板融合策略
    referenceText += `### 多模板融合策略\n\n`;
    referenceText += `**融合模板数量**：${templates.length}个高质量模板\n\n`;
    
    templates.forEach((template, index) => {
      referenceText += `**模板${index + 1}**：${template.name}\n`;
      referenceText += `- 布局类型：${template.layoutType}\n`;
      referenceText += `- 产品类型：${template.productType}\n`;
      referenceText += `- 质量评分：${template.trustScore}/10\n`;
      referenceText += `- 特色标签：${template.tags.slice(0, 4).join(', ')}\n`;
      referenceText += `- 主色调：${template.designSystem.colorPalette.primary}\n`;
      referenceText += `- 主字体：${template.designSystem.typography.fontFamily.primary}\n\n`;
    });

    // 提供融合建议
    referenceText += `### 💡 智能融合建议\n\n`;
    referenceText += `1. **主布局框架**：采用评分最高的模板作为主要布局架构\n`;
    referenceText += `2. **配色融合**：优先使用第一个模板的配色，借鉴其他模板的强调色\n`;
    referenceText += `3. **组件设计**：结合各模板的最佳组件设计模式\n`;
    referenceText += `4. **交互体验**：融合各模板的优秀交互模式\n`;
    referenceText += `5. **视觉一致性**：确保整体设计风格统一协调\n\n`;
  }

  return referenceText;
}

// 基于html-ref文件的具体UI指导
function buildHTMLRefGuidance(): string {
  return `
## 🎯 基于html-ref文件的UI精美化指导

### 参考文件基础
我们有以下高质量的HTML参考文件，请学习其设计精髓：

1. **neura.framer.ai.html** - 现代AI产品落地页
   - 特色：现代渐变、流畅动画、专业排版
   - 布局：hero + features + testimonials + pricing
   - 配色：蓝色主题、高对比度、渐变背景
   - 交互：平滑滚动、悬停效果、响应式设计

2. **adaptify.framer.website.html** - 营销导向产品站点
   - 特色：营销转化优化、清晰CTA、信任元素
   - 布局：顶部导航、全宽区块、突出的行动按钮
   - 配色：紫色主题、对比色强调、专业配色
   - 交互：强化的按钮交互、表单优化

3. **xtract.framer.ai.html** - AI工具产品页面
   - 特色：技术感、数据可视化、专业工具界面
   - 布局：dashboard风格、卡片组织、清晰导航
   - 配色：科技蓝、数据图表配色、深浅搭配
   - 交互：工具类交互、数据展示、状态反馈

4. **Valaam - Free Framer Template Machine Learning & AI.html** - ML/AI模板
   - 特色：机器学习主题、算法展示、技术文档
   - 布局：文档风格、技术展示、代码示例
   - 配色：深色主题选项、技术感配色
   - 交互：技术文档交互、代码高亮

### UI精美化要求（基于参考文件）

#### 1. 现代化视觉设计
- **渐变背景**：学习neura.framer.ai的渐变使用方式
- **卡片设计**：采用adaptify的现代卡片样式
- **按钮设计**：参考xtract的专业按钮样式
- **图标系统**：使用一致的图标风格

#### 2. 专业排版系统
- **标题层次**：清晰的h1/h2/h3层次结构
- **行高规范**：舒适的阅读体验
- **对齐方式**：左对齐正文，居中对齐标题
- **字体选择**：现代Sans-serif字体

#### 3. 响应式布局
- **断点设计**：移动优先的响应式设计
- **网格系统**：灵活的grid/flexbox布局
- **间距规范**：一致的padding/margin体系
- **内容组织**：合理的视觉层次

#### 4. 交互细节
- **悬停状态**：所有可交互元素的悬停反馈
- **加载状态**：按钮和表单的加载状态
- **错误处理**：友好的错误提示
- **成功反馈**：操作成功的视觉反馈

#### 5. 颜色使用策略
- **主色调**：选择一个主要品牌色
- **辅助色**：2-3个辅助色彩
- **中性色**：灰色调层次
- **语义色**：成功/警告/错误色彩

#### 6. 组件质量标准
- **统一性**：所有组件风格统一
- **可用性**：符合用户体验原则
- **美观性**：视觉吸引力和专业感
- **功能性**：确保所有功能可用

### 具体实现指导

#### CSS架构建议
\`\`\`css
/* 基于参考文件的CSS变量系统 */
:root {
  /* 基于模板的配色方案 */
  --primary-color: #007AFF;
  --secondary-color: #FF6B6B;
  --background-color: #FFFFFF;
  --surface-color: #F8F9FA;
  --text-primary: #1C1C1E;
  --text-secondary: #8E8E93;
  --border-color: #E5E5E7;
  
  /* 基于参考的字体系统 */
  --font-primary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-h1: 3.5rem;
  --font-size-h2: 2.5rem;
  --font-size-body: 1rem;
  
  /* 基于参考的间距系统 */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
}
\`\`\`

#### 组件样式建议
参考html-ref文件中的优秀组件设计，确保每个组件都具备：
1. **视觉吸引力**：现代化的外观设计
2. **交互反馈**：清晰的状态变化
3. **功能完整**：实际可用的功能
4. **响应式**：多设备适配
`;
}

export const PRD_TO_HTML_SYSTEM_PROMPT = `
${STRUCTURED_PROMPT_FRAMEWORK}

<PREMIUM_DESIGN_SYSTEM_REQUIREMENTS>
## 🎨 顶级现代化 Tailwind CSS 设计系统

### ⚡ 为什么选择Tailwind CSS + 参考模板融合
**技术优势**：成熟稳定、AI友好、生态完善、语法简洁
**设计优势**：基于优秀产品参考、避免设计盲区、确保UI质量
**最佳实践**：参考模板 + Tailwind实现 = 高质量产品原型

### CDN资源引入（推荐稳定版本）
在HTML的<head>部分包含：
\`\`\`html
<!-- Tailwind CSS - 稳定版本 -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- 自定义配置 - 基于参考模板的配色 -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eff6ff',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            900: '#1e3a8a'
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
          }
        },
        fontFamily: {
          'display': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
          'body': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem'
        }
      }
    }
  }
</script>

<!-- Google Fonts - 现代字体 -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=SF+Pro+Display:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Heroicons for modern icons -->
<script src="https://unpkg.com/heroicons@2.0.18/24/outline/index.js"></script>
\`\`\`

### 现代化组件设计模式（学习优秀产品精华）
学习当前最优秀Web应用的设计语言，创造精美的视觉效果：

**按钮系统**（基于参考模板）：
- 主要按钮：\`bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md\`
- 次要按钮：\`bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-200\`
- 危险按钮：\`bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200\`
- 幽灵按钮：\`border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200\`

**卡片系统**（现代化阴影和圆角）：
- 基础卡片：\`bg-white rounded-2xl border border-gray-100 shadow-sm\`
- 交互卡片：\`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300\`
- 突出卡片：\`bg-white rounded-2xl border border-gray-100 shadow-xl\`
- 渐变卡片：\`bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 shadow-sm\`

**表单系统**（现代输入体验）：
- 输入框：\`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200\`
- 标签：\`block text-sm font-semibold text-gray-700 mb-2\`
- 错误状态：\`border-red-300 focus:ring-red-500/20 focus:border-red-500\`
- 成功状态：\`border-green-300 focus:ring-green-500/20 focus:border-green-500\`

### 布局系统（现代化响应式）
**容器系统**：
- 主容器：\`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\`
- 内容容器：\`max-w-4xl mx-auto\`
- 窄容器：\`max-w-2xl mx-auto\`
- 全宽容器：\`w-full\`

**现代Grid布局**：
\`\`\`html
<!-- Dashboard网格 -->
<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside class="lg:col-span-1 space-y-6">侧边栏</aside>
  <main class="lg:col-span-2 space-y-6">主内容</main>
  <aside class="lg:col-span-1 space-y-6">右侧栏</aside>
</div>

<!-- 产品网格 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- 产品卡片 -->
</div>
\`\`\`

**现代Flexbox布局**：
\`\`\`html
<div class="flex flex-col lg:flex-row gap-8">
  <aside class="lg:w-1/4">侧边栏</aside>
  <main class="lg:w-1/2">主内容</main>
  <aside class="lg:w-1/4">右侧栏</aside>
</div>
\`\`\`

### 响应式断点系统（移动优先）
- **sm**: 640px+ (大手机)
- **md**: 768px+ (平板竖屏)  
- **lg**: 1024px+ (桌面)
- **xl**: 1280px+ (大桌面)
- **2xl**: 1536px+ (超大屏)

### 现代配色系统（语义化 + 美学）
- **主色调**: \`bg-primary-500\`, \`text-primary-600\`, \`border-primary-300\`
- **中性色**: \`bg-gray-50\`, \`bg-gray-100\`, \`bg-gray-900\`, \`text-gray-600\`, \`text-gray-900\`
- **状态色**: \`bg-green-500\`(成功), \`bg-yellow-500\`(警告), \`bg-red-500\`(错误), \`bg-blue-500\`(信息)
- **背景**: \`bg-white\`, \`bg-gray-50\`, \`bg-gradient-to-br from-gray-50 to-gray-100\`

### 交互状态系统（现代化反馈）
- **悬停**: \`hover:bg-gray-50\`, \`hover:text-primary-600\`, \`hover:shadow-xl\`, \`hover:-translate-y-1\`
- **焦点**: \`focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500\`
- **活跃**: \`active:bg-gray-100 active:scale-95\`
- **禁用**: \`disabled:opacity-50 disabled:cursor-not-allowed\`
- **过渡**: \`transition-all duration-200\`, \`transition-transform duration-300\`

### 现代化JavaScript交互（原生 + 流畅）
使用原生JavaScript + CSS实现现代交互：
- **模态框**: backdrop-blur + 淡入淡出动画
- **下拉菜单**: 绝对定位 + 滑动展开动画
- **选项卡**: 数据属性切换 + 下划线动画
- **通知**: Toast样式 + 滑入动画
- **加载状态**: 骨架屏 + 旋转动画
</PREMIUM_DESIGN_SYSTEM_REQUIREMENTS>

<PRODUCT_TYPE_STANDARDS>
## 基于参考模板的产品类型标准

### SaaS/工具类产品标准（参考dashboard模板）
必备页面：主仪表盘、数据管理、详情编辑、设置配置、用户权限
核心功能：数据CRUD、搜索筛选、批量操作、导入导出、权限管理
交互重点：表格操作、表单验证、工作流程、数据可视化
推荐布局：Dashboard布局（侧边栏+顶部导航+主内容区）
参考配色：蓝色主题、专业感、高对比度

### 社交/内容类产品标准（参考feed模板）  
必备页面：信息流、个人资料、内容发布、消息通知、发现探索
核心功能：内容发布、互动评论、关注关系、消息通知、内容搜索
交互重点：内容展示、社交互动、富文本编辑、实时通知
推荐布局：Three-column布局（侧边栏+主信息流+推荐区）
参考配色：现代蓝、轻量灰、社交友好色彩

### 电商类产品标准（参考grid模板）
必备页面：商品展示、商品详情、购物车、订单管理、用户中心
核心功能：商品筛选、购买流程、支付结算、订单跟踪、用户管理
交互重点：商品展示、购买流程、支付体验、订单管理
推荐布局：Grid布局（商品网格+侧边筛选+顶部搜索）
参考配色：暖色调、购买引导色、信任建立色彩

### 数据分析类产品标准（参考analytics模板）
必备页面：数据概览、报表分析、数据源管理、告警监控、系统设置
核心功能：数据可视化、实时监控、报表生成、告警配置、系统管理
交互重点：图表交互、数据筛选、实时刷新、告警处理
推荐布局：Dashboard布局（多列卡片+侧边导航+顶部统计）
参考配色：数据蓝、图表配色、专业分析色彩
</PRODUCT_TYPE_STANDARDS>

${buildHTMLRefGuidance()}

${ENHANCED_INTERACTION_PROMPT}

${QUALITY_ASSURANCE_SYSTEM}

${QUALITY_EXECUTION_INSTRUCTIONS}

${STANDARD_DATA_MANAGEMENT_TOOLS}

${RESPONSIVE_DESIGN_TOOLS}

${PRD_ENHANCEMENT_SYSTEM}
`;

export function buildPRDToHTMLPrompt(data: PRDToHTMLPromptData): string {
  const { prdData, userQuery } = data;

  // 使用智能模板匹配器找到最佳参考模板
  const matchResult: TemplateMatchResult = IntelligentTemplateMatcher.findBestMatch(prdData);
  
  let prompt = PRD_TO_HTML_SYSTEM_PROMPT;

  // 添加智能匹配的参考模板信息
  if (matchResult.templates.length > 0) {
    prompt += buildTemplateReferenceSection(matchResult.templates);
    
    // 添加匹配分析说明
    prompt += `
<TEMPLATE_MATCH_ANALYSIS>
## 🎯 智能模板匹配分析

**匹配类型**: ${matchResult.matchType}
**匹配置信度**: ${(matchResult.confidence * 100).toFixed(1)}%
**匹配原因**: ${matchResult.reason}
**选中模板数量**: ${matchResult.templates.length}

${matchResult.templates.map((template, index) => 
  `**模板${index + 1}**: ${template.name} (评分: ${template.trustScore}/10)`
).join('\n')}

### 🎨 设计指导原则
基于匹配的参考模板，请**软性借鉴**以下设计精华：
1. **视觉语言**: 学习参考模板的现代化视觉处理（配色温度、层次感、细节处理）
2. **组件质感**: 参考其按钮、卡片、表单等组件的精美设计细节
3. **交互体验**: 借鉴其流畅的过渡动画和悬停效果
4. **布局自由**: 根据产品特性设计最合适的布局，不必拘泥于参考模板结构
5. **创新融合**: 在视觉精美的基础上，为当前产品量身定制最佳体验
</TEMPLATE_MATCH_ANALYSIS>

`;
  } else {
    // 如果没有匹配的模板，使用高质量通用模板
    const fallbackTemplates = getHighQualityTemplates(8);
    if (fallbackTemplates.length > 0) {
      prompt += buildTemplateReferenceSection(fallbackTemplates.slice(0, 2));
      prompt += `
<FALLBACK_TEMPLATE_NOTICE>
## ⚠️ 模板回退策略

由于您的PRD没有找到精确匹配的参考模板，我们采用了高质量通用模板作为设计基础。
这些模板代表了最佳实践，可以确保生成的原型具有专业的视觉质量。

**回退原因**: ${matchResult.reason}
**选用策略**: 采用评分最高的通用模板 + 自适应设计
</FALLBACK_TEMPLATE_NOTICE>

`;
    }
  }

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

### 参考模板融合要求（核心）
1. ✅ **设计系统一致性**：严格使用选定模板的配色、字体、间距系统
2. ✅ **布局结构参考**：采用模板的成熟布局架构和组件组织方式
3. ✅ **视觉风格统一**：保持模板的现代化视觉风格和专业感
4. ✅ **交互模式复用**：学习模板的交互设计和用户体验模式

### CSS框架选择（现代化方案）
1. ✅ **首选**现代化、成熟的Tailwind CSS
2. ✅ 使用稳定的CDN版本 + 自定义配置
3. ✅ 配置基于参考模板的主题颜色
4. ✅ 采用现代化组件设计模式（圆角、阴影、渐变）

### 布局要求（基于参考模板）
1. ✅ 使用 max-w-7xl mx-auto px-4 作为主容器
2. ✅ 使用 grid grid-cols-* 或 flex 进行现代布局
3. ✅ 响应式：sm: md: lg: xl: 断点系统
4. ✅ 间距：gap-* space-y-* p-* m-* 系统
5. ✅ 现代圆角：rounded-xl, rounded-2xl

### 图片使用规范（强制要求 - 已修复）
1. **严格使用Picsum Photos服务**：https://picsum.photos/width/height?random=N
   - ✅ 推荐格式：https://picsum.photos/400/300?random=1
   - ✅ 备用格式：https://picsum.photos/seed/product1/400/300
   - ❌ 禁止使用：via.placeholder.com（网络访问受限）
   - ❌ 禁止使用：placeholder.com（加载不稳定）

2. **图片标签完整实现（必须包含错误处理）**：
\`\`\`html
<img 
  src="https://picsum.photos/400/300?random=1" 
  alt="产品展示图片" 
  class="w-full h-48 object-cover rounded-xl bg-gray-200" 
  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
  loading="lazy"
>
<div class="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-gray-600 hidden">
  <div class="text-center">
    <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
    <p class="text-sm">图片展示</p>
  </div>
</div>
\`\`\`

3. **图片加载优化和iframe兼容性**：
   - 使用 loading="lazy" 属性
   - 使用 object-cover 或 object-contain 类
   - 添加 bg-gray-200 作为加载时的背景色
   - 确保在iframe环境中正常显示
   - 所有图片都有有意义的alt属性（不能是"undefined"）

### 现代化UI要求（基于html-ref参考）
1. ✅ **现代圆角**：使用 rounded-xl, rounded-2xl 替代 rounded-md
2. ✅ **现代阴影**：使用 shadow-sm, shadow-xl 创建层次感
3. ✅ **渐变使用**：适当使用 bg-gradient-to-* 增加视觉吸引力
4. ✅ **现代间距**：使用较大的padding（p-6, p-8）和gap（gap-6, gap-8）
5. ✅ **交互反馈**：hover:shadow-xl, hover:-translate-y-1, transition-all duration-300
6. ✅ **现代字体**：使用较大的字号和合适的字重

### 质量验证清单（必须100%通过）
生成前必须确认：
- ✅ HTML正确引入Tailwind CSS CDN和自定义配置
- ✅ 严格遵循选定参考模板的设计系统
- ✅ 组件使用现代化的设计模式（圆角、阴影、渐变）
- ✅ 响应式布局移动优先，所有断点都正常显示
- ✅ 交互状态完整流畅（hover、focus、active、disabled）
- ✅ 所有图片使用Picsum Photos且包含完整的错误处理
- ✅ 图片在iframe环境中能正常显示且有占位符
- ✅ 所有功能都是真实可用的，不是展示文档

### 🎯 最终目标
用户期望看到的是**基于优秀产品参考的现代化、精美的产品界面**，而不是关于产品的文档展示！

请结合参考模板的设计精髓，创造一个具有专业视觉质量和优秀用户体验的产品原型！
</EXECUTION_INSTRUCTION>
`;

  return prompt;
}
