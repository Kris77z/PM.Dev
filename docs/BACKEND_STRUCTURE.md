# 后端结构文档 (Backend Structure Document)

## 1. 数据库设计

### 数据库类型与配置
- **数据库类型**: PostgreSQL 14+
- **关键配置**:
  - 字符集: UTF-8
  - 排序规则: en_US.UTF-8
  - 时区: UTC
  - 连接池大小: 10-20 (根据Vercel限制调整)
  - 建议启用行级安全(RLS)策略

### 数据模式 (Schema)

#### 用户表 (users)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  github_id VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  avatar_url VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(100),
  reset_token VARCHAR(100),
  reset_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github_id ON users(github_id);
```

#### 模板表 (templates)
```sql
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT FALSE,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_creator_id ON templates(creator_id);
CREATE INDEX idx_templates_category ON templates(category);
```

#### 文档表 (documents)
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_version INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_template_id ON documents(template_id);
```

#### 文档版本表 (document_versions)
```sql
CREATE TABLE document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, version_number)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
```

#### 协作表 (collaborators)
```sql
CREATE TABLE collaborators (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);

CREATE INDEX idx_collaborators_document_id ON collaborators(document_id);
CREATE INDEX idx_collaborators_user_id ON collaborators(user_id);
```

### 实体关系
- **User-Document**: 一对多关系 (一个用户可以拥有多个文档)
- **Template-Document**: 一对多关系 (一个模板可以用于多个文档)
- **Document-DocumentVersion**: 一对多关系 (一个文档可以有多个版本)
- **Document-Collaborator**: 多对多关系 (通过协作表实现)

## 2. 认证与授权

### 认证机制
- **认证方法**: JWT (JSON Web Tokens)
- **认证流程**:
  1. 用户通过邮箱/密码或GitHub OAuth登录
  2. 后端验证凭据并生成JWT (有效期24小时)
  3. 客户端存储JWT并在后续请求的Authorization头中发送
  4. 每个API请求验证JWT有效性
- **密码存储**:
  - 使用bcrypt (cost factor=12) 哈希密码
  - 禁止存储明文密码
- **OAuth集成**:
  - GitHub OAuth 2.0流程
  - 存储github_id用于后续登录

### 授权规则
- **权限层级**:
  - 所有者(admin): 完全控制(删除、分享、编辑权限)
  - 编辑者(edit): 可以编辑内容但不能更改设置
  - 查看者(view): 只读访问
- **资源访问控制**:
  - 文档访问需要验证用户是否有权限(所有者或协作者)
  - 公开文档可被任何人查看(不需要登录)
  - 模板访问限制: 公共模板或用户自己的模板

## 3. 存储规则

### 文件存储策略
- **存储位置**: Vercel Blob Storage (兼容S3 API)
- **文件类型**:
  - 文档内容: 存储在PostgreSQL的JSONB字段中
  - 用户上传的附件: 存储在Blob Storage中
- **命名约定**:
  - 用户上传文件: `users/{user_id}/attachments/{uuid}_{timestamp}.{ext}`
  - 系统生成文件: `system/{document_id}/exports/{timestamp}.{ext}`
- **访问控制**:
  - 使用预签名URL提供限时访问
  - 每个URL有效期1小时

## 4. API 设计

### REST API 端点

#### 认证相关
```
POST /api/auth/register
权限要求: 无
请求体:
{
  "email": "string",
  "password": "string",
  "name": "string"
}
响应: 201 Created
{
  "id": 1,
  "email": "user@example.com",
  "name": "string"
}

POST /api/auth/login
权限要求: 无
请求体:
{
  "email": "string",
  "password": "string"
}
或
{
  "code": "string" (GitHub OAuth code)
}
响应: 200 OK
{
  "token": "jwt.token.here",
  "user": {用户对象}
}

GET /api/auth/me
权限要求: 已认证用户
响应: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "name": "string"
}
```

#### 文档相关
```
POST /api/documents
权限要求: 已认证用户
请求体:
{
  "title": "string",
  "templateId": number,
  "content": {}
}
响应: 201 Created
{
  "id": 1,
  "title": "string",
  "content": {}
}

GET /api/documents/:id
权限要求: 文档所有者或协作者
响应: 200 OK
{
  "id": 1,
  "title": "string",
  "content": {},
  "permission": "admin|edit|view"
}

PUT /api/documents/:id
权限要求: 文档所有者或编辑权限协作者
请求体:
{
  "title": "string",
  "content": {}
}
响应: 200 OK
{
  "id": 1,
  "title": "string",
  "content": {}
}

GET /api/documents/:id/versions
权限要求: 文档所有者或协作者
响应: 200 OK
[
  {
    "id": 1,
    "version_number": 1,
    "created_at": "timestamp"
  }
]

POST /api/documents/:id/share
权限要求: 文档所有者
请求体:
{
  "email": "string",
  "permission": "view|edit"
}
响应: 200 OK
{
  "id": 1,
  "email": "string",
  "permission": "view|edit"
}
```

#### 模板相关
```
GET /api/templates
权限要求: 已认证用户
查询参数:
  - category: string (可选)
  - isPublic: boolean (默认true)
响应: 200 OK
[
  {
    "id": 1,
    "name": "string",
    "description": "string"
  }
]

POST /api/templates
权限要求: 已认证用户
请求体:
{
  "name": "string",
  "description": "string",
  "content": {},
  "isPublic": boolean
}
响应: 201 Created
{
  "id": 1,
  "name": "string"
}
```

### API 错误处理
标准错误响应格式:
```json
{
  "error": {
    "code": "错误代码",
    "message": "可读的错误信息",
    "details": {} // 可选，额外错误详情
  }
}
```

常见错误代码:
- 400: 请求参数无效
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 409: 资源冲突(如邮箱已注册)
- 500: 服务器内部错误

## 5. 关键业务逻辑

### 文档版本控制
1. 每次文档更新时:
   - 自动创建新版本
   - 版本号自增
   - 保留完整历史内容
2. 版本回滚:
   - 通过指定版本号恢复历史版本
   - 恢复操作会创建新版本(而非覆盖)

### 多人协作编辑
1. 实时协作:
   - 使用WebSocket实现实时更新
   - 操作转换(OT)算法处理并发编辑
   - 每个操作分配时间戳和用户ID
2. 冲突解决:
   - 最后写入胜出(LWW)策略
   - 保留冲突版本供用户选择

### AI内容生成
1. 集成流程:
   - 用户选择AI生成功能
   - 发送当前文档上下文到AI服务
   - 处理并返回生成内容
   - 生成内容作为建议插入文档
2. 安全考虑:
   - 不发送敏感数据到AI服务
   - 内容审核过滤不当内容

## 6. 安全考虑

### API安全
1. 所有API端点(除公共文档和登录注册外)需要JWT认证
2. 使用Helmet中间件增强HTTP头安全
3. 实施速率限制防止暴力攻击

### 数据验证
1. 所有输入数据验证:
   - 类型检查
   - 长度限制
   - 内容过滤(XSS防护)
2. 使用Zod进行模式验证

### 敏感数据处理
1. 密码:
   - 不记录明文密码
   - 使用bcrypt强哈希
2. 个人数据:
   - 邮箱加密存储
   - GDPR合规考虑

### 防注入
1. 使用参数化查询防止SQL注入
2. 内容安全策略(CSP)防止XSS
3. 文件上传限制:
   - 文件类型白名单
   - 病毒扫描
   - 大小限制(10MB)

### 审计日志
1. 记录关键操作:
   - 登录尝试
   - 文档修改
   - 权限变更
2. 日志保留6个月

## 部署与扩展考虑

1. **Vercel配置**:
   - 使用Next.js API路由
   - 配置环境变量保护敏感信息
   - 设置适当的冷启动超时(10s)

2. **扩展性**:
   - 数据库连接池管理
   - 无状态API设计便于水平扩展
   - 未来考虑将实时协作服务拆分为微服务

3. **监控**:
   - Vercel Analytics监控API性能
   - 自定义日志记录错误和关键业务指标
   - 错误跟踪集成(Sentry)

此文档为后端实现提供了全面指导，确保开发团队能够构建安全、可扩展且符合业务需求的后端系统。