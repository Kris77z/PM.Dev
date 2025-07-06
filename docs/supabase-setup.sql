-- PM Assistant - Supabase 数据库设置脚本
-- 请在 Supabase SQL 编辑器中运行此脚本

-- 创建 documents 表
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2)),
  parent_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT,
  first_heading TEXT,
  second_heading TEXT,
  sub_headings TEXT[], -- PostgreSQL 数组类型
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_documents_level ON documents(level);
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Allow public read access" ON documents;
DROP POLICY IF EXISTS "Allow public write access" ON documents;

-- 创建策略：允许所有人读取
CREATE POLICY "Allow public read access" ON documents
  FOR SELECT USING (true);

-- 创建策略：允许所有人插入、更新、删除（生产环境中应该限制权限）
CREATE POLICY "Allow public write access" ON documents
  FOR ALL USING (true);

-- 注意：在生产环境中，您应该创建更严格的安全策略
-- 例如，只允许认证用户进行写操作：
-- DROP POLICY "Allow public write access" ON documents;
-- CREATE POLICY "Allow authenticated users to modify" ON documents
--   FOR ALL USING (auth.role() = 'authenticated');

-- 插入一些示例数据（可选）
-- 如果您想要预填充一些数据，可以取消注释以下部分：

/*
INSERT INTO documents (id, label, level, parent_id, content, first_heading, second_heading, sub_headings) VALUES
('1', '快速开始', 1, NULL, NULL, NULL, NULL, NULL),
('1-1', '安装指南', 2, '1', '# 安装指南

## 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

## 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-repo/pm-assistant.git
cd pm-assistant
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 验证安装

打开浏览器访问 http://localhost:3000 查看应用是否正常运行。', '安装指南', '系统要求', ARRAY['安装步骤', '验证安装']);
*/

-- 验证表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position; 