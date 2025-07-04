import { TreeNode } from '@/components/ui/tree-view';

// 文档数据接口
export interface DocumentItem {
  id: string;
  label: string;
  level: 1 | 2;
  parentId?: string;
  content?: string;
  icon?: string;
  firstHeading?: string;
  secondHeading?: string;
  subHeadings?: string[];
}

// 图标映射
export const iconMap: { [key: string]: string } = {
  IconRocket: 'IconRocket',
  IconBook: 'IconBook',
  IconCode: 'IconCode',
  IconBulb: 'IconBulb',
  IconTarget: 'IconTarget',
  IconHelp: 'IconHelp',
  IconSettings: 'IconSettings'
};

// 默认文档数据
export const defaultDocuments: DocumentItem[] = [
  {
    id: 'getting-started',
    label: '开始使用',
    level: 1,
    icon: 'IconRocket',
    firstHeading: '产品介绍',
    secondHeading: '核心价值',
    subHeadings: ['提升效率', '质量保障', '创新突破']
  },
  {
    id: 'introduction',
    label: '产品介绍',
    level: 2,
    parentId: 'getting-started',
    icon: 'IconBook',
    firstHeading: 'PM Assistant - 智能产品需求文档助手',
    secondHeading: '核心价值',
    subHeadings: ['提升效率', '质量保障', '创新突破'],
    content: `# PM Assistant - 智能产品需求文档助手

PM Assistant 是一个基于AI的产品需求文档(PRD)智能编写助手，专为产品经理设计，帮助快速、高效地创建专业的PRD文档。

## 🚀 核心价值

### 1. 提升效率
- **10倍速度提升**：从传统的数周PRD编写缩短到数小时
- **智能化辅助**：AI自动生成用户场景、竞品分析、技术方案
- **模板化流程**：标准化的PRD模板，确保内容完整性

### 2. 质量保障
- **四层质量检查**：完整性、质量、逻辑一致性、专业程度
- **实时验证**：自动检查必填字段和内容质量
- **专业标准**：符合行业PRD编写标准

### 3. 创新突破
- **参考模板系统**：从"零生成"升级为"参考生成"
- **智能原型生成**：PRD直接生成HTML原型
- **深度研究能力**：基于LangGraph的智能任务规划

## 🎯 适用场景

- **初级产品经理**：快速上手PRD编写
- **资深产品经理**：提升工作效率，专注战略思考
- **创业团队**：快速验证产品想法
- **咨询顾问**：为客户提供专业的产品规划`
  },
  {
    id: 'quick-start',
    label: '快速开始',
    level: 2,
    parentId: 'getting-started',
    icon: 'IconTarget',
    firstHeading: '快速开始指南',
    secondHeading: '5分钟快速上手',
    subHeadings: ['环境准备', '启动项目', '创建第一个PRD'],
    content: `# 快速开始指南

## 🚀 5分钟快速上手

### 第一步：环境准备
1. **获取API密钥**
   - GPT-4o API Key (必需)
   - Claude API Key (可选)
   - Gemini API Key (可选)

2. **配置环境变量**
\`\`\`bash
# 复制环境变量文件
cp env.example .env.local

# 编辑配置文件
GPT4O_API_KEY=your_gpt4o_api_key_here
GPT4O_BASE_URL=https://your-gpt4o-proxy.example.com/v1
\`\`\`

### 第二步：启动项目
\`\`\`bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
\`\`\`

### 第三步：创建第一个PRD
1. 访问 http://localhost:3000
2. 点击"创建新PRD"
3. 填写基本信息
4. 使用AI助手功能完善内容
5. 生成完整PRD文档`
  },
  {
    id: 'features',
    label: '功能特性',
    level: 1,
    icon: 'IconBulb',
    firstHeading: 'AI助手功能',
    secondHeading: '用户场景AI扩展',
    subHeadings: ['智能竞品分析', '内容质量审查', '智能PRD生成']
  },
  {
    id: 'ai-features',
    label: 'AI助手功能',
    level: 2,
    parentId: 'features',
    icon: 'IconCode',
    firstHeading: 'AI助手功能 🤖',
    secondHeading: '用户场景AI扩展',
    subHeadings: ['功能介绍', '工作原理', '使用示例'],
    content: `# AI助手功能 🤖

## 🔍 用户场景AI扩展

### 功能介绍
基于需求介绍，自动生成多个用户使用场景，帮助产品经理全面理解用户需求。

### 工作原理
1. **输入**：需求介绍内容
2. **AI分析**：理解用户需求和业务场景
3. **输出**：结构化的用户场景数据
   - 用户类型分析
   - 具体使用场景
   - 痛点和需求分析`
  },
  {
    id: 'vibe-coding',
    label: 'Vibe Coding',
    level: 1,
    icon: 'IconCode',
    firstHeading: 'Vibe Coding 使用指南',
    secondHeading: '什么是Vibe Coding？',
    subHeadings: ['核心原则', '实用提示词模板', '最佳实践']
  },
  {
    id: 'vibe-coding-guide',
    label: '使用指南',
    level: 2,
    parentId: 'vibe-coding',
    icon: 'IconBook',
    firstHeading: 'Vibe Coding 使用指南',
    secondHeading: '什么是Vibe Coding？',
    subHeadings: ['核心原则', '实用提示词模板', '最佳实践'],
    content: `# Vibe Coding 使用指南

## 什么是Vibe Coding？

Vibe Coding是一种AI驱动的编程方法论，专为提高开发效率和代码质量而设计。`
  }
];

// 将DocumentItem数组转换为TreeNode数组
export const convertToTreeNodes = (documents: DocumentItem[]): TreeNode[] => {
  const level1Docs = documents.filter(doc => doc.level === 1);
  
  return level1Docs.map(doc => {
    const children = documents
      .filter(child => child.parentId === doc.id)
      .map(child => ({
        id: child.id,
        label: child.label,
        icon: getIconComponent(child.icon || 'IconBook'),
        data: {
          title: child.label,
          content: child.content || ''
        }
      }));

    return {
      id: doc.id,
      label: doc.label,
      icon: getIconComponent(doc.icon || 'IconBook'),
      children: children.length > 0 ? children : undefined,
      data: children.length === 0 ? {
        title: doc.label,
        content: doc.content || ''
      } : undefined
    };
  });
};

// 获取图标组件的函数（需要在使用的地方导入具体图标）
function getIconComponent(iconName: string) {
  // 这里返回一个占位符，实际使用时需要在组件中替换
  return `<${iconName} className="w-5 h-5" />`;
}

// 数据存储和获取函数
export const getDocumentData = (): DocumentItem[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pm-assistant-documents');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored documents:', e);
      }
    }
  }
  return defaultDocuments;
};

export const saveDocumentData = (documents: DocumentItem[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pm-assistant-documents', JSON.stringify(documents));
  }
}; 