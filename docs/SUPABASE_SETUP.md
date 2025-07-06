# Supabase 集成设置指南

## 🎯 概述

这个指南将帮助您设置 Supabase 数据库，以实现文档数据的云端存储和跨用户共享。

## 📋 前提条件

- 一个 Supabase 账户（免费）
- 基本的数据库操作知识

## 🚀 设置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织（或创建新组织）
4. 填写项目信息：
   - **Name**: pm-assistant-docs
   - **Database Password**: 创建一个强密码
   - **Region**: 选择离您最近的区域
5. 点击 "Create new project"
6. 等待项目创建完成（通常需要 1-2 分钟）

### 2. 获取项目配置

1. 在项目仪表板中，点击左侧菜单的 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` （很长的字符串）

### 3. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件（如果不存在）
2. 添加 Supabase 配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **注意**: 请替换为您实际的项目 URL 和密钥

### 4. 创建数据库表

1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `docs/supabase-setup.sql` 文件的内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行脚本

### 5. 验证设置

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问 `http://localhost:3000/admin/docs`
3. 尝试添加或编辑文档
4. 点击 "发布更新" 按钮
5. 检查浏览器控制台，应该看到 "数据已成功保存到 Supabase" 消息

## 🔍 故障排除

### 常见问题

#### 1. "Supabase 未配置" 错误
- **原因**: 环境变量未正确设置
- **解决**: 检查 `.env.local` 文件中的 URL 和密钥是否正确

#### 2. "获取文档数据失败" 错误
- **原因**: 数据库表未创建或 RLS 策略问题
- **解决**: 重新运行 SQL 设置脚本

#### 3. "保存文档数据失败" 错误
- **原因**: 权限问题或网络连接问题
- **解决**: 检查 RLS 策略和网络连接

### 调试技巧

1. **检查浏览器控制台**: 查看详细的错误信息
2. **查看 Supabase 日志**: 在 Dashboard → Logs 中查看数据库操作日志
3. **使用 localStorage 回退**: 即使 Supabase 失败，数据仍会保存到本地

## 📊 数据库结构

### documents 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键，文档唯一标识符 |
| label | TEXT | 文档标题 |
| level | INTEGER | 文档层级（1或2） |
| parent_id | TEXT | 父文档ID（外键） |
| content | TEXT | 文档内容（Markdown格式） |
| first_heading | TEXT | 第一个标题 |
| second_heading | TEXT | 第二个标题 |
| sub_headings | TEXT[] | 子标题数组 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 🔒 安全考虑

### 当前设置（开发环境）
- 允许所有人读取和写入文档
- 适合原型开发和测试

### 生产环境建议
```sql
-- 删除公开写入策略
DROP POLICY "Allow public write access" ON documents;

-- 创建认证用户写入策略
CREATE POLICY "Allow authenticated users to modify" ON documents
  FOR ALL USING (auth.role() = 'authenticated');
```

## 🎉 完成！

设置完成后，您的 PM Assistant 将：

1. ✅ 自动将文档数据保存到云端
2. ✅ 实现跨用户数据共享
3. ✅ 在 Supabase 连接失败时回退到本地存储
4. ✅ 支持实时数据同步

## 📞 获取帮助

如果您遇到问题：

1. 查看浏览器控制台的错误信息
2. 检查 Supabase Dashboard 的日志
3. 确认环境变量配置正确
4. 验证数据库表和策略已正确创建

---

🎊 **恭喜！** 您已成功集成 Supabase，现在可以享受云端文档管理的便利了！ 