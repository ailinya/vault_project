# 当前任务：允许相对 import 省略扩展名

状态：用户已 GO，配置调整完成；完整构建被原有 snowflake-id 类型缺失阻挡。以下历史方案不属于本次执行范围。

研究结论：package.json 的 type 为 module，tsconfig.json 使用 NodeNext，导致相对 ESM import 必须有扩展名。Nest 使用默认编译流程；src/main.ts 有顶层 await；Vitest 配置使用 ESM import。推荐应用切换 CommonJS，保留 NodeNext 的现代包解析能力，不增加依赖。

- [x] package.json：将 type 改为 commonjs；将 test:e2e 的配置路径同步为 vitest.config.e2e.mts。
- [x] tsconfig.json：保留 module/moduleResolution 为 nodenext，依据 package.json 输出 CommonJS，不切换到需要额外打包流程的 bundler。
- [x] src/main.ts：将顶层 await bootstrap() 改为带明确错误日志和失败退出码的 bootstrap().catch(...)，兼容 CommonJS。
- [x] vitest.config.ts、vitest.config.e2e.ts：分别重命名为 .mts，保持测试配置为 ESM；同步检查所有配置文件引用。
- [x] 保留已有带 .js 的 import（仍可解析），已有不带扩展名的 bigint.transformer import 用作实际验证；不批量重写业务代码。
- [x] 运行 TypeScript 检查、构建、单元测试和 e2e；构建成功后验证编译产物能启动。已有 snowflake-id 类型声明缺失单独记录，不用宽泛 any 掩盖问题；若阻碍验证，报告并另行确认处理范围。

影响：应用产物变为 CommonJS，后续业务文件不能使用顶层 await/import.meta；测试配置通过 .mts 保持 ESM。HTTP 接口不变，不安装依赖，不执行 Git 提交。

---

验证结果：TypeScript 检查和构建仅剩 snowflake-id 的 TS7016，bigint.transformer 无扩展名导入错误已消失。单元测试、e2e 各 1 项通过（沙箱 spawn EPERM 后在沙箱外重跑通过）。lint 通过，保留 document.service.ts 原有的两个未使用参数警告。由于完整构建未通过，未执行编译产物启动验证。未安装依赖、未修改业务接口、未提交 Git。

# 历史任务：迁移 pnpm

用户已明确要求按照上一条回复的安装、导入、安装依赖、验证步骤执行。

- [ ] 使用官方安装器 get-pnpm@0.0.5 安装 pnpm，目标版本 12.4.2。
- [ ] 执行 pnpm import，从现有 package-lock.json 转换 pnpm-lock.yaml，再执行 pnpm install；尽量保持现有锁定版本。
- [ ] package.json 增加 packageManager 固定实际使用的 pnpm 版本；README.md 的项目安装、运行和测试说明改为 pnpm。
- [ ] 运行构建、lint、单元测试、e2e 和临时端口的开发启动检查；结束自己启动的测试进程。
- [ ] 验证成功后移除 package-lock.json，保留 pnpm-lock.yaml。清理或迁移仅涉及本项目依赖目录，不操作数据库 volumes 或其他已有改动。
- [ ] 汇报结果。本次不安装数据库依赖、不执行数据库接入、不提交 Git。

风险：依赖目录布局变化可能暴露未声明依赖；若出现则定位原因后仅做迁移必要修复。若安装脚本需要批准，仅放行确认必要的包，不整体关闭脚本保护。

---

# 待办：NestJS 连接 PostgreSQL 和 MongoDB 实施方案

状态：等待用户 GO。研究依据见 research.md。以下为当前任务；原 Observe 方案保留在文末。

## 目标和设计

应用启动时验证 PostgreSQL 和 MongoDB 可连接，连接对象通过 Nest 依赖注入提供给业务模块使用，应用关闭时释放资源。

采用 pg Pool、MongoClient 和 @nestjs/config。数据库模块导出 PostgreSQLService、MongoDBService；业务模块需要使用时显式 imports DatabaseModule，不设为全局模块。AppModule 导入 DatabaseModule 以在启动时初始化两个服务。

## 新增依赖（本方案确认后才安装）

```bash
npm install --save-exact pg@8.23.0 mongodb@7.6.0 @nestjs/config@12.0.0
npm install --save-dev --save-exact @types/pg@8.23.1
```

pg 用于 PostgreSQL 连接池，mongodb 是 MongoDB 官方驱动，@nestjs/config 用于环境配置和启动校验，@types/pg 提供 TypeScript 类型。版本已查询 npm 官方仓库并核对基本兼容要求。

## 文件清单与执行步骤

- [ ] 新增 src/database/database.config.ts：定义配置类型和校验函数。读取 PGHOST、PGPORT、PGDATABASE、PGUSER、PGPASSWORD、MONGODB_URI、MONGODB_DATABASE。主机/端口/库名可在示例中提供本地值，密码和 URI 中的凭据不得在源码中提供默认值。空配置、非整数或越界端口、非法 MongoDB URI 启动失败；错误消息不包含凭据。连接超时定义为常量 5000 ms，PostgreSQL 池上限定义为常量 10。
- [ ] 新增 src/database/database.module.ts：加载 ConfigModule.forRoot 的配置，注册并导出两个数据库服务。
- [ ] 新增 src/database/postgresql.service.ts：管理唯一 Pool，提供类型化 query 方法；onModuleInit 执行 SELECT 1，注册 idle pool error 日志，失败清理后抛出脱敏错误；onModuleDestroy 调用 pool.end()。
- [ ] 新增 src/database/mongodb.service.ts：管理唯一 MongoClient，提供 Db 访问入口；onModuleInit 执行 connect 和 ping，失败关闭客户端并抛出脱敏错误；onModuleDestroy 调用 close()。
- [ ] 修改 src/app.module.ts：导入 DatabaseModule，保留现有 DocumentModule 和其他组件。
- [ ] 修改 src/main.ts：启用 app.enableShutdownHooks()；启动失败时关闭已创建的应用资源并退出，避免一个数据库失败后另一个留下活动连接。核对 Nest 生命周期行为后实现清理。
- [ ] 新增 .env.example：仅提供本地地址、端口、库名、账号及密码占位符；修改 README.md，说明复制模板并由用户在本机填写凭据。现有 .gitignore 已排除 .env。助手不写入或打印实际密码；真实验证可从现有配置临时传给子进程，不持久化凭据。
- [ ] 修改 package.json、package-lock.json：加入上述固定版本依赖，不升级无关依赖。

## 测试与验收

- [ ] 先新增 src/database/database.config.spec.ts：合法输入通过；缺失密码、空 MongoDB URI、非法端口失败，错误消息不泄露输入中的凭据。
- [ ] 先新增两个 service 的 .spec.ts：用驱动 mock 测试连接成功、认证/连接失败传播、失败时释放资源、正常关闭释放资源、PostgreSQL idle error 有脱敏日志。先观察测试失败，再实现对应行为。
- [ ] 修改 test/app.e2e-spec.ts：覆盖数据库服务和测试配置，保留 GET / 返回 200 和 Hello World! 的断言；确保测试无需真实数据库，也不使用真实凭据。
- [ ] 运行 npm run build、npm run lint、npm test、npm run test:e2e。若发现已有失败，记录基线并区分本次回归，不顺带改业务。
- [ ] 使用真实本地连接运行 SELECT 1 和 MongoDB ping，验证认证成功；验证结束关闭连接。使用现有初始化脚本中的配置只在进程内临时读取，不输出凭据、不写库。若业务账号不存在，报告具体原因，不自行创建用户。
- [ ] 更新本方案的完成状态并报告结果；不主动执行 commit、push 或修改已有数据。

## 影响范围

- 服务启动现在要求两个数据库均可连接；最长等待受明确超时约束。
- 不改变现有 HTTP 接口及 DocumentService 返回内容，不创建 ORM 实体或同步数据库结构。
- 数据库账户和容器配置保持现状；双库写入一致性留待文档业务设计时处理。

---

# 已完成：移除 NestJS Observe 实施方案

目标：移除当前项目的 Observe 采集和上报，应用继续正常启动并提供现有接口。

依据：用户要求“先把监控去掉”。已确认源代码中的 Observe 引用仅位于 src/app.module.ts 和 src/main.ts；依赖声明位于 package.json 和 package-lock.json。

## 改动与影响

- src/app.module.ts：删除 createObserveModule 导入、ObserveModule/ObserveInstrument 导出、ObserveModule.forRoot 注册及其说明注释；保留 imports: []、controllers 和 providers。
- src/main.ts：只导入 AppModule，将初始化改为 `NestFactory.create(AppModule)`，移除 instrument 配置。这里是 ObserveInstrument 唯一已发现的调用方。
- package.json、package-lock.json：使用 `npm uninstall @nestjs/observe --ignore-scripts` 同步移除依赖及其不再使用的传递依赖，不引入新依赖。
- 移除后不再向 Observe 上报数据。现有 HTTP 接口、日志和端口配置保持现有行为。TLS 环境变量警告属于独立问题，本次不调整环境变量。

## 执行与验证

- [x] 用户回复 GO 后执行上述修改。
- [x] 运行 `npm run build`、`npm run lint`、`npm test`、`npm run test:e2e`，全部通过；单元测试和端到端测试各通过 1 项。首次测试因沙箱 spawn EPERM 未能启动，授权在沙箱外重跑后通过。
- [x] rg 确认 src、test、package.json、package-lock.json 无 Observe 引用；npm 卸载 2 个包。项目文件原为 untracked，Git diff 无法提供文件基线，已按读取的原文件核对源码改动。
- [x] 汇报结果并提醒重启现有应用进程以应用改动。本任务不主动提交或推送 Git；若后续要求提交，按项目规则同步更新 process.txt。

这是已有接入的移除任务，使用现有单元测试和端到端接口测试验证，无需增加仅检查代码形态的测试。
