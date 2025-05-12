# 技术栈文档 (Tech Stack Document)

## 1. 项目技术概览

* **项目类型**: 全栈Web应用，未来可能扩展到移动端
* **技术方向**: 基于Next.js的全栈解决方案，使用PostgreSQL作为主数据库
* **架构决策**:
  - 采用Next.js API路由作为后端服务，简化全栈开发流程
  - 选择PostgreSQL作为关系型数据库，支持复杂查询和事务
  - 使用Next.js内置的SSR/SSG能力优化SEO和首屏性能
  - 采用Monolithic架构简化部署和开发流程，适合MVP阶段

## 2. 所有包和依赖

### 核心框架和平台

* **前端框架**: React 18.2.0 (通过Next.js 13.4+提供)
* **后端框架**: Next.js API Routes (13.4+)
* **数据库**: PostgreSQL 15.3

### 主要依赖库

* **状态管理**: Zustand 4.3.8 (轻量级状态管理)
* **UI组件库**: 
  - Radix UI 1.0.0 (基础组件)
  - Tailwind CSS 3.3.3 (样式工具)
* **路由**: Next.js内置路由系统
* **表单处理**: React Hook Form 7.45.4
* **数据获取**: SWR 2.2.0 (用于客户端数据获取)
* **验证**: Zod 3.21.4 (类型安全的数据验证)
* **工具库**:
  - date-fns 2.30.0 (日期处理)
  - lodash-es 4.17.21 (实用工具)
* **测试框架**:
  - Jest 29.6.2 (单元测试)
  - React Testing Library 14.0.0 (组件测试)
  - Cypress 12.17.3 (E2E测试)

### 特定功能依赖

* **认证**: NextAuth.js 4.23.1 (支持邮箱/密码和GitHub OAuth)
* **文件处理**:
  - AWS SDK v3 (S3存储) 3.398.0
  - Multer 1.4.5 (文件上传中间件)
* **AI集成**: OpenAI API (官方Node.js SDK 4.0.0)
* **实时协作**: Yjs 13.6.9 (用于文档协作编辑)
* **版本控制**: Git-like文档版本控制系统 (自定义实现)

## 3. API文档链接

### 内部API

* **Next.js API路由文档**: 项目内`/pages/api`目录下，使用Swagger UI自动生成文档 (http://localhost:3000/api-docs)
* **API规范**: 遵循RESTful设计原则，使用OpenAPI 3.0规范

### 第三方API

* **GitHub OAuth API**: [https://docs.github.com/en/rest/guides/basics-of-authentication](https://docs.github.com/en/rest/guides/basics-of-authentication)
  - 用于用户通过GitHub账号登录
* **AWS S3 API**: [https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-examples.html)
  - 用于文档和模板的云存储
* **OpenAI API**: [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)
  - 用于AI内容生成功能

## 4. 偏好的库和工具

* **代码风格和格式化**:
  - ESLint 8.48.0 (配置: eslint-config-next, eslint-config-prettier)
  - Prettier 3.0.2 (统一代码格式)
* **构建工具**: Next.js内置构建系统
* **包管理器**: pnpm 8.