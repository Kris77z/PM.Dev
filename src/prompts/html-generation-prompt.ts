// 精美HTML生成提示词 - 专注于PRD数据转换
import { PRDGenerationData } from '@/lib/prd-generator';

export const generateHTMLPrompt = (prdData: PRDGenerationData | Record<string, unknown>) => {
  return `# 将PRD转换为精美的HTML页面

## 核心要求
基于以下PRD数据，生成一个**现代、精美、专业**的HTML页面。请参考最佳的现代网页设计实践。

## PRD数据
\`\`\`json
${JSON.stringify(prdData, null, 2)}
\`\`\`

## 设计风格要求

### 1. 现代精美布局
- 使用现代CSS Grid/Flexbox布局
- 响应式设计，支持多设备
- 优雅的间距和排版
- 流畅的视觉层次

### 2. 精美的视觉元素
- 渐变背景或精美的单色背景
- 高质量的占位图片（使用placeholder.com或类似服务）
- 优雅的阴影和圆角
- 精美的按钮和交互元素

### 3. 专业的色彩方案
- 主色调：现代蓝色系（如#2563eb, #1d4ed8）或品牌色
- 辅助色：灰色调（如#64748b, #475569）
- 背景：白色或浅灰渐变
- 高对比度文本确保可读性

### 4. 优质字体和排版
- 使用Google Fonts（如Inter, Poppins, Roboto）
- 清晰的标题层次（h1, h2, h3）
- 合适的行高和字间距
- 重要信息使用粗体突出

### 5. 精美组件
- Hero区域：大标题 + 副标题 + CTA按钮
- 特性展示：图标 + 标题 + 描述
- 统计数据：大数字 + 标签
- 用户推荐：头像 + 姓名 + 评价
- 联系表单：现代输入框样式

## 具体实现要求

### HTML结构
\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>产品原型页面</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* 在这里包含所有CSS样式 */
    </style>
</head>
<body>
    <!-- 完整的HTML内容 -->
</body>
</html>
\`\`\`

### CSS样式要求
- 使用现代CSS技术（Grid, Flexbox, CSS变量）
- 包含响应式断点（mobile, tablet, desktop）
- 优雅的transition和hover效果
- 使用box-shadow和border-radius
- 渐变背景和精美配色

### 图片要求（重要）
- **强制使用Picsum Photos**：https://picsum.photos/width/height
- **禁止使用其他图片服务**：via.placeholder.com、placeholder.com等可能无法访问
- **标准URL格式**：https://picsum.photos/800/400、https://picsum.photos/400/300等
- **必须包含有意义的alt属性**：不能使用"undefined"，要用描述性文字
- **示例**：<img src="https://picsum.photos/400/300" alt="产品展示图" class="w-full h-48 object-cover">
- 图片尺寸要合适且加载快速，建议宽度不超过1200px

### 交互效果
- 按钮hover效果
- 平滑滚动
- 淡入动画
- 响应式导航

## 重要提醒
1. **完整性**：生成完整可用的HTML文件，包含所有CSS和基础JavaScript
2. **现代感**：使用2024年最新的设计趋势和技术
3. **精美度**：确保每个元素都有精心设计的视觉效果
4. **实用性**：基于PRD数据生成真实有用的内容
5. **性能**：确保代码简洁高效，加载速度快
6. **图片质量**：所有图片必须使用可靠的图片服务，确保能正常加载显示

请生成一个完整的HTML文件：`;
};

// 导出生成器函数
export const createHTMLGenerationPrompt = generateHTMLPrompt; 