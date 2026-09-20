# NestJS 双数据库接入研究

## 已确认的现状

- NestJS 12、Node.js 24.10.0、TypeScript 6，项目使用 ESM 和 .js 相对导入。
- src/app.module.ts 注册 DocumentModule；src/main.ts 尚未启用 shutdown hooks。
- package.json 尚无数据库驱动、ORM 或配置模块。
- Docker 中 PostgreSQL 16 和 MongoDB 7 在上一轮检查中均 healthy，本机映射端口分别是 5432、27017。
- 两个数据库都使用 knowledge_hub。PostgreSQL 初始化脚本定义 kh_document；MongoDB 初始化脚本定义 document_content 和业务账号。初始化脚本内容不能证明现有数据库已执行这些初始化。
- 当前 DocumentService 是生成的 CRUD 占位实现。本次请求是建立连接，不包含文档持久化。
- 已有 Controller 单元测试和 HTTP e2e 测试，e2e 直接导入 AppModule。

## 方案判断

使用 pg Pool 和 MongoClient，由 Nest provider 管理生命周期。官方驱动满足本次连接需求，不必先建立 ORM 实体映射；代价是后续业务需要自行编写 SQL 和 MongoDB 查询。

使用 @nestjs/config 加载和校验环境变量。连接配置不带默认密码；缺少配置则在启动时清楚报错。示例文件只提供占位符，不复制仓库中已有密码。

2026-09-17 从 npm 官方仓库确认：pg 8.23.0、mongodb 7.6.0、@nestjs/config 12.0.0、@types/pg 8.23.1。驱动 Node engines 满足本机版本；@nestjs/config 支持 NestJS 12。实施时核对安装后的声明/API。

## 官方依据

- https://node-postgres.com/features/pooling
- https://node-postgres.com/features/connecting
- https://www.mongodb.com/docs/drivers/node/current/connect/
- https://docs.nestjs.com/techniques/configuration

## 影响与验证重点

接入后，数据库不可用会阻止服务成功启动，必须设置连接超时并清理已建立的连接。e2e 使用替代 provider，避免日常接口测试依赖本地数据库；另用只读连接检查验证真实 PostgreSQL SELECT 1 和 MongoDB ping。不建表、不修改现有数据、不执行迁移。
