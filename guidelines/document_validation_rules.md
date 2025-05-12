# 文档验证规则及逻辑说明 (已升级)

## 概述

本文档详细说明了产品助手系统中用于验证生成文档结构完整性的规则和逻辑。这些规则用于确定AI生成的各类产品文档是否包含所有必要的章节和内容。该验证逻辑已经过升级，支持多语言和更精确的标题识别。

## 当前验证逻辑 (已升级)

我们已将验证逻辑从简单的字符串匹配升级为更复杂的多级检查：

```typescript
// 验证文档结构是否符合预期
const validateDocument = (content: string, documentType: DocType): ValidationResult => {
  const rules = documentValidationRules[documentType] || [];
  const missingRules: string[] = [];
  const foundRules: string[] = [];
  const debugInfo: string[] = [];
  
  rules.forEach(rule => {
    // 获取所有可能的关键词（主关键词和别名）
    const ruleTerms = [rule.key, ...(rule.aliases || [])];
    
    // 1. 检查简单文本匹配 (作为后备)
    const simpleTextMatch = ruleTerms.some(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
    
    // 2. 检查Markdown标题格式 (更精确)
    // 支持多种格式: ## 标题, ## 1. 标题, ## 1.1 标题
    const titleMatches = ruleTerms.some(term => {
      const titleRegex = new RegExp(`(^|\\n)\\s*#+\\s*(\\d+\\.?\\s*)?([\\d\\.]*\\s*)?${escapeRegExp(term)}\\b`, 'i');
      return titleRegex.test(content);
    });
    
    // 优先使用标题匹配结果，如果没有找到标题匹配再使用简单文本匹配
    const sectionExists = titleMatches || simpleTextMatch;
    
    if (sectionExists) {
      foundRules.push(rule.key);
    } else if (rule.required) {
      missingRules.push(rule.key);
    }
  });
  
  return {
    documentType,
    isValid: missingRules.length === 0,
    missingSections: missingRules,
    hasSections: foundRules,
    debugInfo: debugInfo.join('\n')
  };
};
```

### 升级后的验证逻辑特点

1. **多语言支持**：每个规则现在支持中英文关键词和多个同义词别名
2. **Markdown标题识别**：使用正则表达式识别不同格式的Markdown标题
3. **多级检查**：先检查标题格式，再回退到简单文本匹配
4. **详细调试信息**：记录每个步骤的匹配结果，便于问题诊断

## 文档类型及验证规则 (已扩展)

系统支持以下五种文档类型，每种类型现在有扩展的验证规则和别名：

### 1. 产品定义文档 (PRODUCT_DEFINITION)

**文件名**：`PRODUCT_DEFINITION.md`

**验证规则**：
- ✅ **产品概述** (必需)
  - 别名：产品概念, App Overview, Product Overview, 应用概述
- ✅ **用户画像** (必需)
  - 别名：目标用户, Target Users, User Persona, 用户分析
- ✅ **核心功能** (必需)
  - 别名：Core Features, 主要功能, Key Features, 功能列表
- ✅ **竞品分析** (必需)
  - 别名：Competitive Analysis, 市场竞争, 竞争对手, Market Analysis
- ✅ **商业模式** (必需)
  - 别名：Business Model, 盈利模式, 变现策略

### 2. 技术栈文档 (TECH_STACK)

**文件名**：`TECH_STACK.md`

**验证规则**：
- ✅ **前端技术栈** (必需)
  - 别名：Frontend Stack, 前端框架, UI Framework, 前端技术
- ✅ **后端技术栈** (必需)
  - 别名：Backend Stack, 后端框架, Server Technology, 后端技术
- ✅ **数据库选择** (必需)
  - 别名：Database, 数据库, Database Selection, 数据存储
- ✅ **第三方服务** (可选)
  - 别名：Third-party Services, API Integration, 外部服务
- ✅ **部署方案** (必需)
  - 别名：Deployment, 部署策略, 服务器部署, Hosting

### 3. 后端结构文档 (BACKEND_STRUCTURE)

**文件名**：`BACKEND_STRUCTURE.md`

**验证规则**：
- ✅ **API 设计** (必需)
  - 别名：API Design, API 接口, API 规范, Endpoints
- ✅ **数据模型** (必需)
  - 别名：Data Model, 数据结构, Schema, 模型设计
- ✅ **认证与授权** (必需)
  - 别名：Authentication, Authorization, 权限控制, Security
- ✅ **业务逻辑** (必需)
  - 别名：Business Logic, 核心逻辑, Service Layer, 服务逻辑

### 4. 前端结构文档 (FRONTEND_STRUCTURE)

**文件名**：`FRONTEND_GUIDELINES.md` (注意文件名与类型不同)

**验证规则**：
- ✅ **页面结构** (必需)
  - 别名：Page Structure, 页面组织, Screens, 视图结构
- ✅ **组件设计** (必需)
  - 别名：Component Design, UI Components, 界面组件, 组件结构
- ✅ **状态管理** (必需)
  - 别名：State Management, 数据流, Data Flow, 状态设计
- ✅ **路由设计** (必需)
  - 别名：Routing, 导航设计, Navigation, 路由结构

### 5. 应用流程文档 (APP_FLOW)

**文件名**：`APP_FLOW.md`

**验证规则**：
- ✅ **用户旅程** (必需)
  - 别名：User Journey, User Flow, 用户体验流程, 交互流程
- ✅ **关键流程** (必需)
  - 别名：Key Processes, Core Flows, 主要流程, 业务流程
- ✅ **异常处理** (必需)
  - 别名：Error Handling, 错误处理, Edge Cases, 边界情况

## 标题识别正则表达式说明

新的验证逻辑使用正则表达式识别多种格式的Markdown标题：

```typescript
const titleRegex = new RegExp(`(^|\\n)\\s*#+\\s*(\\d+\\.?\\s*)?([\\d\\.]*\\s*)?${escapeRegExp(term)}\\b`, 'i');
```

该正则表达式能够匹配以下格式：

1. 简单标题: `## 用户画像`
2. 带数字编号的标题: `## 2. 用户画像`
3. 带小数点编号的标题: `### 2.1 用户画像`
4. 缩进标题: `  ## 用户画像`

## 改进后的效果

1. **更高精度**：通过识别标准Markdown标题格式，减少误判
2. **多语言支持**：同时支持中英文标题和各种常见别名
3. **兼容性更好**：能够识别不同风格的文档结构
4. **详细调试**：提供详细日志帮助定位验证问题

## 下一步可能的改进

1. **内容质量验证**：检查章节内容的长度和完整性
2. **章节层级识别**：检测标题的层级结构是否合理
3. **自定义验证规则**：允许用户针对特定文档类型定制验证规则
4. **智能修复建议**：针对缺失章节提供智能补充建议 