import { TreeNode } from '@/components/ui/tree-view';
import { supabase, type DatabaseDocumentItem } from './supabase';

// 文档数据接口
export interface DocumentItem {
  id: string;
  label: string;
  level: 1 | 2;
  parentId?: string;
  content?: string;
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
    id: '1',
    label: '快速开始',
    level: 1
  },
  {
    id: '1-1',
    label: '安装指南',
    level: 2,
    parentId: '1',
    content: `# 安装指南

## 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

## 安装步骤

1. 克隆项目
\`\`\`bash
git clone https://github.com/your-repo/pm-assistant.git
cd pm-assistant
\`\`\`

2. 安装依赖
\`\`\`bash
npm install
\`\`\`

3. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

## 验证安装

打开浏览器访问 http://localhost:3000 查看应用是否正常运行。`,
    firstHeading: '安装指南',
    secondHeading: '系统要求',
    subHeadings: ['安装步骤', '验证安装']
  },
  {
    id: '1-2',
    label: '基本配置',
    level: 2,
    parentId: '1',
    content: `# 基本配置

## 环境变量

创建 \`.env.local\` 文件：

\`\`\`
NEXT_PUBLIC_APP_NAME=PM Assistant
NEXT_PUBLIC_APP_VERSION=1.0.0
\`\`\`

## 配置文件

修改 \`next.config.js\` 文件以适应您的需求。

### 基本设置

- 设置应用名称
- 配置端口号
- 设置环境变量`,
    firstHeading: '基本配置',
    secondHeading: '环境变量',
    subHeadings: ['配置文件', '基本设置']
  },
  {
    id: '2',
    label: '功能介绍',
    level: 1
  },
  {
    id: '2-1',
    label: 'PRD 编写',
    level: 2,
    parentId: '2',
    content: `# PRD 编写功能

## 功能概述

PM Assistant 提供智能化的产品需求文档编写功能，帮助产品经理快速创建专业的PRD。

## 主要特性

### 模板支持
- 多种PRD模板
- 自定义模板
- 模板导入导出

### 智能辅助
- AI内容建议
- 自动格式化
- 内容检查

### 协作功能
- 实时编辑
- 评论系统
- 版本控制`,
    firstHeading: 'PRD 编写功能',
    secondHeading: '功能概述',
    subHeadings: ['主要特性', '模板支持', '智能辅助', '协作功能']
  },
  {
    id: '2-2',
    label: '团队协作',
    level: 2,
    parentId: '2',
    content: `# 团队协作

## 协作模式

支持多种团队协作模式，提升工作效率。

## 权限管理

### 角色定义
- 管理员：完全权限
- 编辑者：编辑权限
- 查看者：只读权限

### 权限控制
- 文档级别权限
- 功能级别权限
- 操作级别权限

## 沟通工具

- 内置聊天
- 评论系统
- 通知提醒`,
    firstHeading: '团队协作',
    secondHeading: '协作模式',
    subHeadings: ['权限管理', '角色定义', '权限控制', '沟通工具']
  },
  {
    id: '3',
    label: '高级功能',
    level: 1
  },
  {
    id: '3-1',
    label: 'API 集成',
    level: 2,
    parentId: '3',
    content: `# API 集成

## REST API

提供完整的 REST API 接口。

## 接口文档

### 认证接口
\`\`\`
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
\`\`\`

### 文档接口
\`\`\`
GET /api/documents
POST /api/documents
PUT /api/documents/:id
DELETE /api/documents/:id
\`\`\`

## SDK 支持

- JavaScript SDK
- Python SDK
- Java SDK

## 示例代码

\`\`\`javascript
const client = new PMAssistantClient({
  apiKey: 'your-api-key'
});

const documents = await client.documents.list();
\`\`\``,
    firstHeading: 'API 集成',
    secondHeading: 'REST API',
    subHeadings: ['接口文档', '认证接口', '文档接口', 'SDK 支持', '示例代码']
  },
  {
    id: '3-2',
    label: '插件开发',
    level: 2,
    parentId: '3',
    content: `# 插件开发

## 插件架构

基于模块化设计的插件系统。

## 开发指南

### 创建插件
1. 创建插件目录
2. 编写插件配置
3. 实现插件逻辑
4. 注册插件

### 插件API
\`\`\`javascript
export default class MyPlugin {
  constructor(config) {
    this.config = config;
  }
  
  async activate() {
    // 插件激活逻辑
  }
  
  async deactivate() {
    // 插件停用逻辑
  }
}
\`\`\`

## 发布插件

- 插件商店
- 版本管理
- 用户评价`,
    firstHeading: '插件开发',
    secondHeading: '插件架构',
    subHeadings: ['开发指南', '创建插件', '插件API', '发布插件']
  }
];

// 将DocumentItem数组转换为TreeNode数组
export const convertToTreeNodes = (documents: DocumentItem[]): TreeNode[] => {
  const level1Items = documents.filter(doc => doc.level === 1);
  
  return level1Items.map(level1 => {
    const children = documents
      .filter(doc => doc.level === 2 && doc.parentId === level1.id)
      .map(level2 => ({
        id: level2.id,
        label: level2.label,
        content: level2.content,
        firstHeading: level2.firstHeading,
        secondHeading: level2.secondHeading,
        subHeadings: level2.subHeadings
      }));
    
    return {
      id: level1.id,
      label: level1.label,
      children: children.length > 0 ? children : undefined
    };
  });
};

// 数据库到应用数据的转换
const convertFromDatabase = (dbItems: DatabaseDocumentItem[]): DocumentItem[] => {
  return dbItems.map(item => ({
    id: item.id,
    label: item.label,
    level: item.level as 1 | 2,
    parentId: item.parent_id || undefined,
    content: item.content || undefined,
    firstHeading: item.first_heading || undefined,
    secondHeading: item.second_heading || undefined,
    subHeadings: item.sub_headings || undefined
  }));
};

// 应用数据到数据库的转换
const convertToDatabase = (items: DocumentItem[]): Omit<DatabaseDocumentItem, 'created_at' | 'updated_at'>[] => {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    level: item.level,
    parent_id: item.parentId || null,
    content: item.content || null,
    first_heading: item.firstHeading || null,
    second_heading: item.secondHeading || null,
    sub_headings: item.subHeadings || null
  }));
};

// localStorage 回退函数
const getLocalStorageData = (): DocumentItem[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pm-assistant-documents');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('解析本地存储数据失败:', e);
      }
    }
  }
  return defaultDocuments;
};

const saveLocalStorageData = (documents: DocumentItem[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pm-assistant-documents', JSON.stringify(documents));
  }
};

// 从 Supabase 获取文档数据（异步）
export const getDocumentData = async (): Promise<DocumentItem[]> => {
  // 检查是否配置了 Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase 未配置，使用本地存储');
    return getLocalStorageData();
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('level', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取文档数据失败:', error);
      console.log('回退到本地存储');
      return getLocalStorageData();
    }

    if (!data || data.length === 0) {
      console.log('数据库为空，返回默认数据');
      return defaultDocuments;
    }

    return convertFromDatabase(data);
  } catch (error) {
    console.error('Supabase 连接失败:', error);
    console.log('回退到本地存储');
    return getLocalStorageData();
  }
};

// 同步版本（用于向后兼容）
export const getDocumentDataSync = (): DocumentItem[] => {
  return getLocalStorageData();
};

// 保存文档数据到 Supabase（异步）
export const saveDocumentData = async (documents: DocumentItem[]): Promise<boolean> => {
  // 总是先保存到本地存储作为备份
  saveLocalStorageData(documents);

  // 检查是否配置了 Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase 未配置，仅保存到本地存储');
    return true;
  }

  try {
    // 删除现有数据
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '');

    if (deleteError) {
      console.error('删除现有数据失败:', deleteError);
      return false;
    }

    // 插入新数据
    const dbData = convertToDatabase(documents);
    const { error: insertError } = await supabase
      .from('documents')
      .insert(dbData);

    if (insertError) {
      console.error('保存文档数据失败:', insertError);
      return false;
    }

    console.log('数据已成功保存到 Supabase');
    return true;
  } catch (error) {
    console.error('Supabase 保存失败:', error);
    return false;
  }
};

// 同步版本（用于向后兼容）
export const saveDocumentDataSync = (documents: DocumentItem[]): void => {
  saveLocalStorageData(documents);
};

// 重置为默认数据
export const resetToDefaultData = async (): Promise<DocumentItem[]> => {
  const success = await saveDocumentData(defaultDocuments);
  if (!success) {
    saveLocalStorageData(defaultDocuments);
  }
  return defaultDocuments;
};

// 初始化数据库（仅在数据库为空时插入默认数据）
export const initializeDatabase = async (): Promise<void> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (error) {
      console.error('检查数据库状态失败:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('数据库为空，插入默认数据');
      await saveDocumentData(defaultDocuments);
    }
  } catch (error) {
    console.error('初始化数据库失败:', error);
  }
}; 