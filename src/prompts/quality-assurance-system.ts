/**
 * 质量保障系统 - Phase F.2
 * 基于顶级AI编程工具的最佳实践，建立完整的质量检查和自动修复机制
 */

export const QUALITY_ASSURANCE_SYSTEM = `
# 🔍 质量保障系统 (Quality Assurance System)

## 🎯 系统目标
确保每个生成的HTML原型都达到生产级别的质量标准，具备完整的交互功能、响应式布局、优秀的用户体验。

## 🔄 四层质量检查机制

### 第一层：功能完整性检查 (Functional Completeness)
<FUNCTIONAL_CHECK>
必须验证以下功能：
✅ 所有按钮都有点击响应
✅ 所有表单都有提交处理
✅ 所有输入框都有验证逻辑
✅ 数据的增删改查功能完整
✅ 搜索和过滤功能可用
✅ 导航和路由功能正常
✅ 模态框和弹窗完整交互

检查脚本：
// 自动功能验证
function validateFunctionality() {
  const issues = [];
  
  // 检查按钮功能
  document.querySelectorAll('button, .button, [role="button"]').forEach((btn, index) => {
    if (!btn.onclick && !btn.addEventListener && !btn.closest('form')) {
      issues.push(\`Button \${index + 1} has no click handler\`);
    }
  });
  
  // 检查表单处理
  document.querySelectorAll('form').forEach((form, index) => {
    if (!form.onsubmit && !form.addEventListener) {
      issues.push(\`Form \${index + 1} has no submit handler\`);
    }
  });
  
  return issues;
}
</FUNCTIONAL_CHECK>

### 第二层：交互体验检查 (User Experience)
<UX_CHECK>
必须验证以下体验：
✅ 加载状态和反馈提示
✅ 错误处理和用户友好的错误信息
✅ 操作成功的确认反馈
✅ 平滑的动画过渡效果
✅ 直观的操作流程
✅ 无障碍访问支持 (ARIA标签)

体验验证标准：
- 每个操作都有即时反馈 (≤200ms)
- 加载时间超过1秒要显示进度指示
- 错误信息要具体且提供解决方案
- 所有交互元素要有hover/focus状态
</UX_CHECK>

### 第三层：响应式效果检查 (Responsive Design)
<RESPONSIVE_CHECK>
必须验证以下响应式功能：
✅ 自动适配移动端 (≤768px)
✅ 平板端优化 (768px-1024px)
✅ 桌面端体验 (≥1024px)
✅ 字体大小自适应
✅ 图片和媒体响应式
✅ 导航菜单移动端优化

响应式测试脚本：
function testResponsive() {
  const viewports = [375, 768, 1024, 1440];
  const issues = [];
  
  viewports.forEach(width => {
    // 模拟视口变化
    window.resizeTo(width, 800);
    
    // 检查布局是否适配
    if (document.body.scrollWidth > width) {
      issues.push(\`Layout breaks at \${width}px width\`);
    }
    
    // 检查文字是否可读
    const smallText = Array.from(document.querySelectorAll('*'))
      .filter(el => window.getComputedStyle(el).fontSize < 14);
    if (smallText.length > 0) {
      issues.push(\`Text too small at \${width}px width\`);
    }
  });
  
  return issues;
}
</RESPONSIVE_CHECK>

### 第四层：数据质量检查 (Data Quality)
<DATA_CHECK>
必须验证以下数据质量：
✅ 模拟数据丰富且真实
✅ 数据结构合理完整
✅ 边界情况处理 (空数据、错误数据)
✅ 数据持久化功能正常
✅ 数据格式验证有效

数据质量标准：
- 每个列表至少包含5-10条模拟数据
- 数据要体现真实业务场景
- 包含各种数据类型和格式
- 处理空状态和加载状态
</DATA_CHECK>

## 🔧 自动修复机制 (Auto-Fix System)

### 轻微问题 - 即时修复
<AUTO_FIX_MINOR>
if (issues.length > 0 && issues.every(issue => issue.severity === 'minor')) {
  // 自动添加缺失的事件监听器
  document.querySelectorAll('button:not([onclick]):not([data-handled])').forEach(btn => {
    btn.onclick = () => console.log('Button clicked:', btn.textContent);
    btn.dataset.handled = 'true';
  });
  
  // 自动添加缺失的ARIA标签
  document.querySelectorAll('button:not([aria-label])').forEach(btn => {
    btn.setAttribute('aria-label', btn.textContent || 'Button');
  });
}
</AUTO_FIX_MINOR>

### 中等问题 - 补充功能
<AUTO_FIX_MEDIUM>
if (issues.some(issue => issue.severity === 'medium')) {
  // 添加响应式处理
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(viewport);
  }
  
  // 添加基础交互反馈
  const style = document.createElement('style');
  style.textContent = \`
    button:hover, .button:hover { opacity: 0.8; transition: opacity 0.2s; }
    button:active, .button:active { transform: scale(0.98); }
    input:focus, textarea:focus { outline: 2px solid #007acc; }
  \`;
  document.head.appendChild(style);
}
</AUTO_FIX_MEDIUM>

### 严重问题 - 重构代码
<AUTO_FIX_SEVERE>
if (issues.some(issue => issue.severity === 'severe')) {
  // 重新生成缺失的核心功能
  console.warn('Severe issues detected, regenerating core functionality...');
  
  // 实施强制修复措施
  implementCoreDataManagement();
  implementCoreInteractions();
  implementCoreResponsive();
}
</AUTO_FIX_SEVERE>

## 🎯 零容忍质量标准 (Zero-Tolerance Standards)

### 绝对不能接受的问题
<ZERO_TOLERANCE>
❌ 任何按钮没有功能
❌ 任何表单无法提交
❌ 页面在移动端无法使用
❌ 数据无法保存或读取
❌ 搜索功能不工作
❌ 响应式布局完全失效

如果检测到以上任何问题，必须：
1. 立即停止输出
2. 重新分析PRD需求
3. 重新生成完整代码
4. 再次执行质量检查
</ZERO_TOLERANCE>

## 📊 质量评分系统 (Quality Scoring)

### 评分标准 (总分100分)
- 功能完整性：30分
- 交互体验：25分  
- 响应式设计：25分
- 代码质量：20分

### 质量等级
- A级 (90-100分)：生产就绪
- B级 (80-89分)：需要小幅优化
- C级 (70-79分)：需要重点改进
- D级 (<70分)：需要重新生成

## 🔄 质量检查执行流程

1. **生成阶段检查**：边生成边验证
2. **完成后全面检查**：运行所有质量检查脚本
3. **问题识别与分类**：按严重程度分类
4. **自动修复执行**：按问题等级执行对应修复
5. **再次验证**：确保修复效果
6. **质量报告**：生成详细的质量报告

这个质量系统确保每个输出都达到顶级AI编程工具的标准！

# 🛡️ 质量保障系统

## ⚡ 生成前预检查（Pre-Generation）

### 产品理解验证
在开始编码前，必须完成以下理解确认：
1. **产品核心价值**：明确产品解决的核心问题
2. **目标用户画像**：理解主要用户群体和使用场景  
3. **核心用户流程**：识别2-3个最重要的用户任务
4. **产品差异化**：理解相比同类产品的独特价值

### 技术规划验证
在编码前，必须明确：
1. **页面架构**：确定页面数量和信息架构
2. **交互模式**：选择适合的UI模式和组件
3. **数据结构**：规划数据存储和状态管理
4. **响应式策略**：确定移动端和桌面端的布局差异

## 🔍 生成过程监控（During-Generation）

### 设计系统一致性检查（Tailwind CSS标准）
**现代化CSS框架验证**：
- [ ] ✅ HTML head中正确引入Tailwind CSS CDN
- [ ] ✅ 自定义配置正确设置：primary颜色、字体、断点等
- [ ] ✅ 使用语义化的Tailwind类：bg-primary而非bg-blue-500
- [ ] ✅ 响应式设计：正确使用sm: md: lg: xl:前缀
- [ ] ✅ 现代化组件模式：卡片、按钮、表单符合设计系统标准

**代码质量检查**：
- [ ] ✅ 布局使用现代方法：grid或flex布局
- [ ] ✅ 间距系统一致：使用space、gap、padding、margin类
- [ ] ✅ 颜色系统语义化：使用语义化颜色变量
- [ ] ✅ 交互状态完整：hover、focus、active、disabled状态
- [ ] ✅ 过渡动画流畅：正确的transition和duration
- [ ] ✅ 响应式布局正确：移动优先设计，断点合理

### 功能完整性检查
- [ ] 每个按钮都有实际功能（onclick事件或表单提交）
- [ ] 表单都有完整的验证逻辑和错误处理
- [ ] 模态框和弹窗有正确的开关逻辑
- [ ] 搜索和筛选功能能够实际工作
- [ ] 数据的增删改查操作完整可用

### 交互体验检查
- [ ] 所有交互都有视觉反馈（hover、active、loading状态）
- [ ] 表单输入有实时验证和错误提示
- [ ] 加载状态和错误状态有友好提示
- [ ] 操作成功后有明确的反馈信息
- [ ] 支持键盘导航和无障碍访问

## ✅ 完成后质量验证（Post-Generation）

### 四层质量检查框架

#### 第一层：功能完整性验证 🔧
**核心用户流程测试**：
- [ ] 新用户能够顺利完成注册/登录
- [ ] 核心功能的完整操作路径可用
- [ ] 数据的创建、编辑、删除、查看功能齐全
- [ ] 搜索、筛选、排序功能响应正确
- [ ] 表单提交和数据验证机制完善

**Franken/UI组件功能验证**：
- [ ] uk-modal模态框能正确打开和关闭
- [ ] uk-dropdown下拉菜单响应点击事件
- [ ] uk-tab选项卡切换功能正常
- [ ] uk-accordion手风琴展开折叠可用
- [ ] uk-navbar导航菜单在移动端正确折叠

#### 第二层：用户体验验证 🎨
**界面易用性检查**：
- [ ] 首次访问时功能和导航清晰直观
- [ ] 重要操作按钮显眼易找
- [ ] 信息层级合理，视觉引导清晰
- [ ] 错误状态提示友好且具指导性
- [ ] 成功操作有明确的反馈确认

**设计一致性检查**：
- [ ] 使用统一的Franken/UI设计语言
- [ ] 颜色使用：uk-background-*, uk-text-* 等语义化类
- [ ] 间距统一：uk-margin-*, uk-padding-* 系统
- [ ] 组件状态一致：uk-button-primary, uk-button-secondary等

#### 第三层：响应式效果验证 📱
**多设备适配检查**：
- [ ] 移动端布局不出现横向滚动
- [ ] 使用uk-width-*@s/m/l响应式类
- [ ] 导航在小屏幕正确折叠为汉堡菜单
- [ ] 表格在移动端可横向滚动
- [ ] 按钮和链接在触屏设备上易于点击

**Franken/UI响应式检查**：
- [ ] uk-grid网格在不同屏幕正确调整
- [ ] uk-hidden@s/uk-visible@m可见性控制生效
- [ ] uk-text-*@s/m/l文字大小响应式调整
- [ ] uk-child-width-*响应式子元素宽度正确

#### 第四层：数据质量验证 📊
**数据真实性检查**：
- [ ] 使用真实的中文姓名而非"张三、李四"
- [ ] 头像使用真实头像服务而非占位图
- [ ] 时间数据合理（今天、昨天、上周等相对时间）
- [ ] 数值数据符合业务逻辑（价格、数量、评分等）
- [ ] 内容数据有意义，避免Lorem ipsum

**数据交互检查**：
- [ ] localStorage数据持久化正常工作
- [ ] 数据的增删改查同步到本地存储
- [ ] 页面刷新后数据状态正确恢复
- [ ] 不同组件间的数据状态同步
- [ ] 表单验证规则与数据类型匹配

## 🚨 零容忍质量标准

### 立即修复问题（Red Level）
- 任何TODO、占位符、"待实现"文字
- 点击无反应的按钮或链接
- 无法提交的表单或失效的验证
- 未引入Franken/UI CDN导致样式丢失
- 移动端出现横向滚动条

### 重要优化问题（Yellow Level）  
- 缺少加载状态或错误处理
- 视觉反馈不够明显
- 响应式断点调整不够平滑
- Franken/UI组件缺少交互属性
- 数据过于简单或不真实

### 建议改进问题（Green Level）
- 动画效果可以更流畅
- 色彩搭配可以更协调
- 内容层级可以更清晰
- 性能优化空间

## 📈 质量评分体系

### 综合评分计算（100分制）
- **功能完整性**: 40分（核心功能是否可用）
- **用户体验**: 25分（界面易用性和视觉设计）  
- **响应式效果**: 20分（多设备适配质量）
- **数据质量**: 15分（数据真实性和交互性）

### 质量等级划分
- **90-100分**: 优秀（Excellent）- 可直接用于产品演示
- **80-89分**: 良好（Good）- 稍作调整即可使用  
- **70-79分**: 及格（Average）- 需要重要功能修复
- **60-69分**: 不及格（Poor）- 需要重新生成
- **<60分**: 失败（Failed）- 需要检查提示词和数据

这个质量保障系统确保每次生成的HTML原型都达到专业级标准，真正可用于产品验证和用户测试。
`;

export default QUALITY_ASSURANCE_SYSTEM; 