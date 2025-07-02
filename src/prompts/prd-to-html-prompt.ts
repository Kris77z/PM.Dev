import { PRDGenerationData } from '@/lib/prd-generator';
import { ENHANCED_INTERACTION_PROMPT } from './prd-to-html-enhanced-interaction';
import { QUALITY_ASSURANCE_SYSTEM } from './quality-assurance-system';
import { QUALITY_EXECUTION_INSTRUCTIONS } from './quality-execution-instructions';
import { STANDARD_DATA_MANAGEMENT_TOOLS } from './standard-data-management-tools';
import { RESPONSIVE_DESIGN_TOOLS } from './responsive-design-tools';
import { PRD_ENHANCEMENT_SYSTEM } from './prd-enhancement-system';

export interface PRDToHTMLPromptData {
  prdData: PRDGenerationData;
  userQuery?: string;
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

#### 2. 配色系统参考
- **主色调**：深蓝 (#1e40af) 或科技蓝 (#2563eb)
- **辅助色**：紫色 (#7c3aed) 或深紫 (#5b21b6)
- **背景色**：纯白 (#ffffff) 或浅灰 (#f8fafc)
- **文字色**：深灰 (#1e293b) 和中灰 (#64748b)
- **强调色**：绿色 (#10b981) 或橙色 (#f59e0b)

#### 3. 布局和组件
- **导航栏**：固定顶部，背景模糊，品牌logo左侧
- **英雄区域**：大标题，副标题，CTA按钮，配图
- **特性展示**：3-4列网格，图标+标题+描述
- **用户证言**：头像+姓名+公司+评价
- **数据展示**：统计数字+标签，卡片布局
- **表单设计**：现代输入框，清晰标签，验证提示

#### 4. 动效和交互
- **悬停效果**：按钮阴影变化，卡片轻微上浮
- **滚动动画**：元素淡入，视差滚动
- **加载状态**：骨架屏，进度指示
- **响应式**：移动端友好，触摸优化
`;
}

export const PRD_TO_HTML_SYSTEM_PROMPT = `
## 🎯 PRD数据转HTML原型生成系统

### 核心目标
将结构化的PRD数据转换为精美、现代化、可交互的HTML产品原型页面。

### 设计原则

#### 1. 现代化设计语言
- **视觉风格**：简洁、专业、现代
- **配色方案**：蓝色科技风或紫色创新风
- **排版系统**：清晰的层次结构
- **组件设计**：圆角、阴影、渐变等现代元素

#### 2. 用户体验优先
- **响应式设计**：🚨 **强制要求** - 必须支持桌面、平板、手机三种设备
- **移动优先策略**：所有布局必须从手机端开始设计，向上适配
- **交互反馈**：悬停、点击、加载状态
- **性能优化**：快速加载、流畅动画
- **可访问性**：语义化标签、键盘导航

### 现代化组件设计模式

**按钮系统**：
- 主要按钮：\`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md\`
- 次要按钮：\`bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-200\`
- 危险按钮：\`bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200\`
- 幽灵按钮：\`border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200\`

**卡片系统**：
- 基础卡片：\`bg-white rounded-2xl border border-gray-100 shadow-sm\`
- 交互卡片：\`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300\`
- 突出卡片：\`bg-white rounded-2xl border border-gray-100 shadow-xl\`
- 渐变卡片：\`bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 shadow-sm\`

**表单系统**：
- 输入框：\`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200\`
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

### 🚨 响应式断点系统（强制要求 - 移动优先）
- **默认**: 320px+ (手机) - 所有样式的基础
- **sm**: 640px+ (大手机) - 使用 sm: 前缀
- **md**: 768px+ (平板竖屏) - 使用 md: 前缀
- **lg**: 1024px+ (桌面) - 使用 lg: 前缀
- **xl**: 1280px+ (大桌面) - 使用 xl: 前缀
- **2xl**: 1536px+ (超大屏) - 使用 2xl: 前缀

**响应式实现示例**（必须按此模式）：
\`\`\`html
<!-- 网格布局 - 手机1列，平板2列，桌面3列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 内容 -->
</div>

<!-- 容器宽度 - 手机全宽，桌面限制宽度 -->
<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- 内容 -->
</div>

<!-- 文字大小 - 手机较小，桌面较大 -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">标题</h1>
\`\`\`

### 现代配色系统（语义化 + 美学）
- **主色调**: \`bg-blue-500\`, \`text-blue-600\`, \`border-blue-300\`
- **中性色**: \`bg-gray-50\`, \`bg-gray-100\`, \`bg-gray-900\`, \`text-gray-600\`, \`text-gray-900\`
- **状态色**: \`bg-green-500\`(成功), \`bg-yellow-500\`(警告), \`bg-red-500\`(错误), \`bg-blue-500\`(信息)
- **背景**: \`bg-white\`, \`bg-gray-50\`, \`bg-gradient-to-br from-gray-50 to-gray-100\`

### 交互状态系统（现代化反馈）
- **悬停**: \`hover:bg-gray-50\`, \`hover:text-blue-600\`, \`hover:shadow-xl\`, \`hover:-translate-y-1\`
- **焦点**: \`focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500\`
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

### 图片使用规范（强制要求）
1. **严格使用Picsum Photos服务**：https://picsum.photos/width/height?random=N
   - ✅ 推荐格式：https://picsum.photos/400/300?random=1
   - ✅ 备用格式：https://picsum.photos/seed/product1/400/300

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
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path>
    </svg>
    <p class="text-sm">图片展示</p>
  </div>
</div>
\`\`\`

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
现在请基于以上要求，构建一个高质量的、可交互的产品应用原型。

## 🚨 最终执行要求（必须严格遵守）

### CSS框架选择（现代化方案）
1. ✅ **首选**现代化、成熟的Tailwind CSS
2. ✅ 使用稳定的CDN版本
3. ✅ 采用现代化组件设计模式（圆角、阴影、渐变）

### 布局要求
1. ✅ 使用 max-w-7xl mx-auto px-4 作为主容器
2. ✅ 使用 grid grid-cols-* 或 flex 进行现代布局
3. ✅ 响应式：sm: md: lg: xl: 断点系统
4. ✅ 间距：gap-* space-y-* p-* m-* 系统
5. ✅ 现代圆角：rounded-xl, rounded-2xl

### 设计质量要求
1. ✅ **视觉精美**：现代化配色、优雅间距、流畅动画
2. ✅ **组件质感**：高质量按钮、卡片、表单组件
3. ✅ **布局合理**：根据产品特性设计最适合的布局
4. ✅ **交互体验**：悬停效果、加载状态、错误处理
5. 🚨 **响应式设计（强制要求）**：
   - 必须在手机(320px)、平板(768px)、桌面(1024px)三种尺寸下完美显示
   - 必须使用移动优先的设计策略
   - 必须为不同设备优化文字大小、间距、布局
   - 必须确保触摸友好的交互元素(最小44px触摸区域)

### 最终提醒
**绝对禁止**：不要创建任何形式的PRD文档展示、用户画像卡片展示、竞品对比表格。

**必须做到**：构建一个真实的、可操作的产品原型，用户可以实际体验核心功能。
</EXECUTION_INSTRUCTION>
`;

  return prompt;
}
