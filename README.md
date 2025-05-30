# PM Assistant - 产品经理 UI 微调助手

## 项目概述

PM Assistant 是一个专为产品经理设计的 UI 微调指令生成工具。通过可视化的方式，PM 可以选择页面、定义高亮区域，并生成结构化的 UI 微调指令，提高与开发团队的沟通效率。

## 核心功能

### 1. UI 微调表单 (`/`)
- **功能**：完整的 UI 微调指令生成流程
- **特点**：
  - 多步骤表单引导
  - 页面选择（基于 bbx-project-analysis.json）
  - 元素选择和描述
  - 微调类型和优先级设置
  - 结构化输出生成

### 2. BBX 预览测试 (`/bbx-preview-test`)
- **功能**：实时预览 BBX 页面并测试 postMessage 通信
- **特点**：
  - 左侧页面选择器
  - 右侧 iframe 预览（支持本地 BBX 项目）
  - 底部消息监听显示
  - 支持真实页面交互测试

### 3. 截图标注工具 (`/screenshot-annotator`) ⭐ 新增
- **功能**：为页面截图定义高亮区域，生成配置文件
- **使用方法**：
  1. 选择要标注的截图
  2. 在截图上拖拽鼠标选择区域
  3. 设置区域名称、类型、描述和优先级
  4. 点击已有区域进行编辑
  5. 导出 JSON 配置文件

#### 配置管理功能：
- **自动保存**：标注的区域会自动保存到浏览器本地存储
- **配置状态显示**：页面选择器显示每个页面的配置状态（✅已配置 / ⚪未配置）
- **配置统计**：顶部显示已配置页面数量统计
- **导入导出**：
  - 导出当前页面配置
  - 导出所有页面配置
  - 导入单个或批量配置文件
- **配置清理**：支持清空当前页面或所有页面的配置

#### 区域类型说明：
- **navigation**：导航相关元素（菜单、导航栏等）
- **content**：内容区域（文章、列表、卡片等）
- **action**：操作元素（按钮、链接等）
- **form**：表单元素（输入框、选择器等）

#### 配置文件格式：
```json
{
  "pageName": "页面名称",
  "screenshot": "截图文件名.png",
  "regions": [
    {
      "id": "唯一标识",
      "name": "区域名称",
      "type": "区域类型",
      "coordinates": {
        "x": 100,
        "y": 200,
        "width": 300,
        "height": 150
      },
      "description": "区域功能描述",
      "priority": 5
    }
  ]
}
```

## 技术架构

### 前端框架
- **Next.js 14**：React 全栈框架
- **TypeScript**：类型安全
- **Tailwind CSS**：样式框架

### 核心技术
- **iframe + postMessage**：跨域页面通信
- **Canvas 坐标计算**：精确的区域定位
- **JSON 配置管理**：结构化数据存储

### 项目结构
```
pm-assistant/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 主表单页面
│   │   ├── bbx-preview-test/           # BBX 预览测试
│   │   └── screenshot-annotator/       # 截图标注工具
│   ├── components/
│   │   ├── ui/                         # UI 组件库
│   │   └── SimpleUIMicroAdjustmentForm.tsx
│   └── data/
│       └── bbx-project-analysis.json   # 页面配置数据
├── public/
│   └── screenshots/                    # 页面截图存储
└── README.md
```

## 使用指南

### 开发环境启动
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问应用
http://localhost:3000
```

### BBX 项目集成
1. 确保 BBX 项目在 `http://localhost:3001` 运行
2. 访问 `/bbx-preview-test` 页面
3. 选择对应页面进行预览和测试

### 截图标注流程
1. 将页面截图放入 `public/screenshots/` 目录
2. 访问 `/screenshot-annotator` 页面
3. 选择截图并开始标注
4. 导出配置文件用于后续开发

## 数据格式

### 页面配置 (bbx-project-analysis.json)
```json
{
  "pages": [
    {
      "label": "分组名称",
      "options": [
        {
          "value": "page_key",
          "label": "页面名称",
          "disabled": false
        }
      ]
    }
  ]
}
```

### 高亮区域配置
- **坐标系统**：基于截图像素坐标
- **区域类型**：navigation | content | action | form
- **优先级**：1-10（数字越大优先级越高）

## 开发计划

### 已完成 ✅
- [x] 基础表单流程
- [x] BBX 页面预览集成
- [x] 截图标注工具
- [x] postMessage 通信机制
- [x] 配置文件导出功能

### 进行中 🚧
- [ ] stagewise 元素选择器集成
- [ ] 真实页面高亮与采集
- [ ] 配置文件管理系统

### 计划中 📋
- [ ] AI 辅助区域识别
- [ ] 批量标注功能
- [ ] 配置文件版本管理
- [ ] 与开发工具集成

## 注意事项

1. **截图文件**：建议使用 PNG 格式，文件名避免特殊字符
2. **坐标精度**：标注时尽量精确选择区域边界
3. **区域命名**：使用有意义的名称，便于后续识别
4. **配置备份**：定期备份导出的配置文件

## 技术支持

如有问题或建议，请通过以下方式联系：
- 项目 Issues
- 开发团队内部沟通渠道 