/**
 * 质量执行指令 - Phase F.2
 * 指导AI在代码生成过程中如何执行质量检查和自动修复
 */

export const QUALITY_EXECUTION_INSTRUCTIONS = `
# 🚀 质量执行指令 (Quality Execution Instructions)

## 📋 生成流程中的质量检查点

### 第一步：预生成分析
<PRE_GENERATION_CHECK>
在开始编写代码之前，必须：
1. 分析PRD需求的产品类型和核心功能
2. 确定必须实现的交互功能清单
3. 规划响应式布局策略
4. 设计数据结构和模拟数据

检查项：
✅ 功能清单是否完整覆盖PRD需求
✅ 交互设计是否符合产品类型标准
✅ 技术实现方案是否可行
✅ 质量标准是否明确设定
</PRE_GENERATION_CHECK>

### 第二步：代码生成过程检查
<GENERATION_PROCESS_CHECK>
在编写HTML/CSS/JavaScript时，实时检查：

每写完一个组件就检查：
- 该组件是否有完整的交互功能？
- 响应式样式是否已添加？
- 数据绑定是否正确？
- 错误处理是否完善？

每写完一个功能模块就检查：
- 与其他模块的集成是否正常？
- 数据流是否畅通？
- 用户体验是否流畅？

强制要求：
- 绝不允许写无功能的占位按钮
- 绝不允许写无效果的表单
- 绝不允许写无响应的交互元素
</GENERATION_PROCESS_CHECK>

### 第三步：完成后全面检查
<POST_GENERATION_CHECK>
代码完成后，必须逐一验证：

1. **功能完整性验证**
   - 运行功能检查脚本
   - 测试所有按钮和表单
   - 验证数据操作功能
   
2. **交互体验验证**
   - 检查操作反馈
   - 验证错误处理
   - 测试动画效果
   
3. **响应式验证**
   - 模拟不同屏幕尺寸
   - 检查布局适配性
   - 验证字体和元素大小
   
4. **数据质量验证**
   - 检查模拟数据丰富性
   - 验证数据持久化
   - 测试边界情况

如果任何检查不通过，立即执行对应的修复措施！
</POST_GENERATION_CHECK>

## 🔧 自动修复执行流程

### 发现问题时的处理步骤
<ISSUE_RESOLUTION_FLOW>
1. **问题识别**
   \`\`\`javascript
   const issues = runQualityCheck();
   const severityLevels = categorizeIssues(issues);
   \`\`\`

2. **分级处理**
   \`\`\`javascript
   if (severityLevels.severe.length > 0) {
     // 严重问题：重新生成相关部分
     regenerateComponent(severityLevels.severe);
   } else if (severityLevels.medium.length > 0) {
     // 中等问题：补充缺失功能
     addMissingFeatures(severityLevels.medium);
   } else if (severityLevels.minor.length > 0) {
     // 轻微问题：即时修复
     applyQuickFixes(severityLevels.minor);
   }
   \`\`\`

3. **修复验证**
   \`\`\`javascript
   const afterFixIssues = runQualityCheck();
   if (afterFixIssues.length > 0) {
     // 如果还有问题，重复修复流程
     continueFixing(afterFixIssues);
   }
   \`\`\`
</ISSUE_RESOLUTION_FLOW>

## 📊 质量标准执行检查表

### 必须达到的最低标准
<MINIMUM_STANDARDS_CHECKLIST>
交互功能检查：
□ 所有按钮都有点击功能
□ 所有表单都能提交和验证
□ 所有输入框都有合理的验证
□ 数据的增删改查功能完整
□ 搜索和过滤功能可用
□ 导航功能正常

响应式检查：
□ 移动端（≤768px）完全可用
□ 平板端（768px-1024px）体验良好
□ 桌面端（≥1024px）功能完整
□ 所有文字大小合适
□ 所有按钮大小适中
□ 导航菜单移动端友好

用户体验检查：
□ 操作有即时反馈
□ 错误信息友好明确
□ 成功操作有确认提示
□ 加载状态有显示
□ 交互流程直观
□ 界面美观现代

数据质量检查：
□ 模拟数据真实丰富（每类至少5-10条）
□ 数据结构合理完整
□ 支持数据持久化（localStorage）
□ 处理空数据状态
□ 处理错误数据情况
</MINIMUM_STANDARDS_CHECKLIST>

## ⚡ 质量保障执行原则

### 零容忍原则
<ZERO_TOLERANCE_EXECUTION>
如果发现以下任何问题，必须立即停止并重新生成：
❌ 按钮点击无任何反应
❌ 表单提交无任何处理
❌ 页面在手机上无法正常显示
❌ 数据无法保存或丢失
❌ 搜索功能完全不工作
❌ 页面布局严重错乱

执行动作：
1. 立即停止当前生成
2. 分析问题根本原因
3. 重新规划技术实现
4. 重新生成完整代码
5. 再次执行质量检查
</ZERO_TOLERANCE_EXECUTION>

### 持续改进原则
<CONTINUOUS_IMPROVEMENT>
每次生成完成后：
1. 记录发现的问题和解决方案
2. 总结可优化的技术实现
3. 更新最佳实践指南
4. 提升下次生成质量

目标：每次生成都比上次更好！
</CONTINUOUS_IMPROVEMENT>

记住：质量不是可选项，而是生成HTML原型的基本要求！
`;

export default QUALITY_EXECUTION_INSTRUCTIONS; 