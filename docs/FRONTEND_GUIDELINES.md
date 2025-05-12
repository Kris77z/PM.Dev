# 前端规范文档 (Frontend Guidelines)

## 1. 设计理念与视觉风格

**设计理念**：打造一个专业、高效且协作友好的文档编辑平台，强调清晰的信息层级和流畅的交互体验。

**视觉风格**：
- 现代简约风格，减少视觉噪音
- 高对比度的内容区域
- 微妙的阴影和层次感
- 一致的圆角设计
- 注重可读性和可操作性

**核心原则**：
1. **一致性**：所有界面元素遵循统一的设计语言
2. **效率**：优化工作流程，减少不必要的操作
3. **可扩展**：设计系统能够适应未来功能扩展
4. **无障碍**：满足WCAG 2.1 AA级标准

## 2. 颜色体系

```css
/* 主色调 - 品牌蓝 */
--primary: #4F46E5;
--primary-rgb: 79, 70, 229;
--primary-hsl: 245, 75%, 59%;
--primary-light: #6366F1;
--primary-dark: #4338CA;
--primary-bg: #EEF2FF;

/* 辅助色 - 品牌紫 */
--secondary: #7C3AED;
--secondary-light: #8B5CF6;
--secondary-dark: #6D28D9;
--secondary-bg: #F5F3FF;

/* 功能色 - 成功 */
--success: #10B981;
--success-light: #D1FAE5;
--success-dark: #065F46;

/* 功能色 - 警告 */
--warning: #F59E0B;
--warning-light: #FEF3C7;
--warning-dark: #92400E;

/* 功能色 - 错误 */
--error: #EF4444;
--error-light: #FEE2E2;
--error-dark: #991B1B;

/* 功能色 - 信息 */
--info: #3B82F6;
--info-light: #DBEAFE;
--info-dark: #1E40AF;

/* 中性色 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

**颜色使用规则**：
- 主色用于主要按钮、重要操作和品牌元素
- 辅助色用于次要按钮和强调元素
- 功能色严格用于对应状态反馈
- 中性色用于文本、背景和边框
- 浅色背景用于主要内容区域
- 深色文本用于主要阅读内容

## 3. 字体规范

```css
/* 字体族 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'Roboto Mono', monospace;

/* 字重 */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* 字号系统 */
--text-xs: 0.75rem;  /* 12px - 辅助文本 */
--text-sm: 0.875rem; /* 14px - 正文小 */
--text-base: 1rem;   /* 16px - 正文 */
--text-lg: 1.125rem; /* 18px - 正文大 */
--text-xl: 1.25rem;  /* 20px - 小标题 */
--text-2xl: 1.5rem;  /* 24px - 标题 */
--text-3xl: 1.875rem;/* 30px - 大标题 */
--text-4xl: 2.25rem; /* 36px - 超大标题 */

/* 行高 */
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* 字体颜色 */
--text-primary: var(--gray-900);
--text-secondary: var(--gray-600);
--text-tertiary: var(--gray-400);
--text-inverse: white;
--text-link: var(--primary);
--text-disabled: var(--gray-400);
```

## 4. 间距与布局系统

```css
/* 间距系统 - 4px 基础单位 */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */

/* 容器宽度 */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* 响应式断点 */
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;

/* 圆角 */
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */
--radius-full: 9999px;

/* 阴影 */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
```

## 5. 组件样式指南

### 按钮

```css
/* 基础按钮样式 */
.button {
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;
}

/* 按钮尺寸 */
.button-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
}

.button-md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.button-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
  line-height: var(--leading-normal);
}

/* 按钮变体 */
.button-primary {
  background-color: var(--primary);
  color: white;
  border: 1px solid var(--primary-dark);
}

.button-primary:hover {
  background-color: var(--primary-dark);
}

.button-secondary {
  background-color: var(--secondary);
  color: white;
  border: 1px solid var(--secondary-dark);
}

.button-secondary:hover {
  background-color: var(--secondary-dark);
}

.button-ghost {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--gray-300);
}

.button-ghost:hover {
  background-color: var(--gray-100);
}

.button-link {
  background-color: transparent;
  color: var(--text-link);
  text-decoration: underline;
  border: none;
}

.button-link:hover {
  color: var(--primary-dark);
}

/* 按钮状态 */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 表单元素

```css
/* 输入框 */
.input {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  background-color: white;
  transition: border-color 0.2s ease;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.input-error {
  border-color: var(--error);
}

.input-error:focus {
  box-shadow: 0 0 0 2px var(--error-light);
}

/* 选择框 */
.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  background-size: 1rem;
  padding-right: var(--space-8);
}

/* 复选框和单选按钮 */
.checkbox, .radio {
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--gray-300);
  appearance: none;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  background-color: white;
  background-origin: border-box;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.checkbox {
  border-radius: var(--radius-sm);
}

.radio {
  border-radius: 50%;
}

.checkbox:checked, .radio:checked {
  background-color: var(--primary);
  border-color: var(--primary);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0.75rem;
}

/* 表单标签 */
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

/* 表单帮助文本 */
.help-text {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

/* 表单错误文本 */
.error-text {
  font-size: var(--text-xs);
  color: var(--error);
  margin-top: var(--space-1);
}
```

### 卡片与容器

```css
/* 基础卡片 */
.card {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: var(--space-4);
}

.card-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

/* 面板 */
.panel {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.panel-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

.panel-body {
  padding: var(--space-4);
}

/* 分割线 */
.divider {
  height: 1px;
  background-color: var(--gray-200);
  margin: var(--space-4) 0;
  border: none;
}
```

### 导航元素

```css
/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
}

.navbar-brand {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-right: var(--space-6);
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-right: var(--space-4);
}

.nav-link {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-2) 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* 选项卡 */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
}

.tab {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
```

## 6. 图标系统

**图标库**：Lucide React (https://lucide.dev/)

**图标尺寸**：
- 小图标：16px (1rem)
- 中图标：20px (1.25rem)
- 大图标：24px (1.5rem)
- 超大图标：32px (2rem)

**图标颜色**：
- 默认：currentColor (继承父元素颜色)
- 主色：var(--primary)
- 次要：var(--gray-500)
- 禁用：var(--gray-400)

**使用示例**：
```jsx
import { FileText, Settings, User, Plus } from 'lucide-react';

// 小图标
<FileText size={16} className="text-gray-500" />

// 中图标 - 主色
<Settings size={20} className="text-primary" />

// 大图标
<User size={24} className="text-gray-700" />

// 按钮中的图标
<button className="button button-primary">
  <Plus size={20} className="mr-2" />
  新建文档
</button>
```

## 7. 动效与过渡

```css
/* 过渡时间 */
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;

/* 缓动函数 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 动效规则 */
- 微交互使用 100-200ms 的过渡时间
- 页面过渡使用 300ms 的过渡时间
- 悬停效果使用 ease-out 缓动
- 点击反馈使用 ease-in 缓动
- 模态框出现使用 ease-in-out 缓动

/* 推荐动效 */
.fade-in {
  animation: fadeIn var(--