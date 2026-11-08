本页带你完成一条最短启动路径：**安装依赖 → 配置环境变量 → 启动基础设施 → 运行后端 → 验证 HTTP 响应**。目标是先让本机 NestJS 服务正常响应请求，不在这里展开注册、文档上传、审核发布与知识问答流程。Sources: [package.json](package.json#L8-L21) [main.ts](src/main.ts#L6-L25) [app.controller.ts](src/app.controller.ts#L5-L13)

## 1. 先认识启动方式

本项目采用“**本机运行后端，Docker Compose 运行基础设施**”的开发方式。后端连接 PostgreSQL、MongoDB、Redis、RabbitMQ、Elasticsearch、RustFS 和 Neo4j；Compose 还提供若干管理界面，但首次启动不必把所有管理界面一起运行。Sources: [app.module.ts](src/app.module.ts#L39-L111) [docker-compose.yml](docker-compose.yml#L1-L200) [package.json](package.json#L8-L14)

下图只展示快速启动需要理解的运行边界：命令行访问本机 HTTP 服务，后端再通过映射到宿主机的端口连接容器服务；模型服务通过 API 配置接入。Sources: [main.ts](src/main.ts#L24-L25) [app.module.ts](src/app.module.ts#L63-L103) [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L63) [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L91)

```mermaid
flowchart LR
    Client["浏览器 / curl.exe"] --> API["本机 NestJS 后端<br/>默认端口 3000"]

    subgraph Docker["Docker Compose 基础设施"]
        PG["PostgreSQL"]
        Mongo["MongoDB"]
        Redis["Redis"]
        MQ["RabbitMQ"]
        ES["Elasticsearch + IK"]
        FS["RustFS"]
        Neo["Neo4j"]
    end

    API --> PG
    API --> Mongo
    API --> Redis
    API --> MQ
    API --> ES
    API --> FS
    API --> Neo
    API --> Model["外部模型 API"]
```

Sources: [app.module.ts](src/app.module.ts#L39-L111) [redis.service.ts](src/redis/redis.service.ts#L9-L17) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L47-L64) [search-index.service.ts](src/pipeline/search-index.service.ts#L33-L47) [rustfs.service.ts](src/storage/rustfs.service.ts#L35-L68) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L144-L155)

首次操作只需关注以下文件，无需从业务模块开始阅读源码。Sources: [package.json](package.json#L8-L21) [docker-compose.yml](docker-compose.yml#L1-L20) [main.ts](src/main.ts#L1-L26) [app.module.ts](src/app.module.ts#L39-L104)

```text
vault_project/
├── package.json                  # 安装依赖、启动和构建命令
├── pnpm-lock.yaml                # 依赖锁文件
├── docker-compose.yml            # 本地基础设施
├── elasticsearch/
│   └── Dockerfile                # 构建包含 IK 分词插件的 ES 镜像
├── init-scripts/
│   ├── postgresql/init.sql       # 关系表初始化
│   └── mongodb/init.js            # MongoDB 初始化脚本
└── src/
    ├── main.ts                   # HTTP 启动入口
    ├── app.module.ts             # 模块装配与数据库配置
    └── app.controller.ts         # 根路径验证接口
```

Sources: [README.md](README.md#L28-L35) [docker-compose.yml](docker-compose.yml#L13-L15) [docker-compose.yml](docker-compose.yml#L52-L54) [elasticsearch/Dockerfile](elasticsearch/Dockerfile#L1-L8) [app.controller.ts](src/app.controller.ts#L1-L14)

## 2. 准备终端与依赖

先准备能够运行 Node.js、pnpm 和 Docker Compose 的环境。**仓库没有在 `package.json` 中声明 `engines` 或 `packageManager`**；虽然 README 写了 pnpm `12.4.2`，也声称版本已固定，但当前清单并未包含相应字段，因此不要把这一描述当作已生效的版本约束。Sources: [README.md](README.md#L28-L35) [package.json](package.json#L1-L22) [package.json](package.json#L76-L126)

在 Windows 终端执行以下命令，确认工具可用后安装项目依赖。下面使用 `cmd.exe` 的目录切换语法，后续命令也在仓库根目录执行。Sources: [README.md](README.md#L28-L35) [package.json](package.json#L23-L107) [docker-compose.yml](docker-compose.yml#L1-L15)

```bat
cd /d C:\project\vault_project
node --version
pnpm --version
docker compose version

pnpm install
```

Sources: [README.md](README.md#L28-L35)

## 3. 创建本地配置

在仓库根目录创建 `.env`。项目通过全局 `ConfigModule.forRoot()` 加载配置；本例沿用 Compose 的本地连接参数，并显式设置 Neo4j 密码，因为 **Neo4j 代码默认密码 `password` 与 Compose 的 `12345678` 不一致**。Sources: [app.module.ts](src/app.module.ts#L39-L42) [app.module.ts](src/app.module.ts#L63-L103) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L149-L152) [docker-compose.yml](docker-compose.yml#L191-L200)

下面是一份用于本地启动的配置。将 `DASHSCOPE_API_KEY` 替换为你自己的有效密钥，将 `JWT_SECRET` 替换为自己的随机字符串；其余值与仓库的本地基础设施配置对应。示例没有配置邮件服务，因此本页不验证邮件激活和密码重置。Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L63) [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L91) [auth.module.ts](src/auth/auth.module.ts#L22-L27) [app.module.ts](src/app.module.ts#L43-L58)

```dotenv
PORT=3000
JWT_SECRET=replace-with-your-own-random-secret

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=user
POSTGRES_PASSWORD=123456
POSTGRES_DB=knowledge_hub

MONGO_URI=mongodb://mongo_user:mongo_pass123@localhost:27017/knowledge_hub?authSource=admin

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://guest:guest@localhost:5672

ELASTICSEARCH_ENABLED=true
ELASTICSEARCH_NODE=http://localhost:9200

RUSTFS_ENABLED=true
RUSTFS_ENDPOINT=http://localhost:9000
RUSTFS_ACCESS_KEY=rustfsadmin
RUSTFS_SECRET_KEY=rustfsadmin

NEO4J_ENABLED=true
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=12345678

DASHSCOPE_API_KEY=replace-with-your-real-api-key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen-plus
EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=text-embedding-v3
EMBEDDING_DIMENSION=1024
```

Sources: [main.ts](src/main.ts#L24-L25) [app.module.ts](src/app.module.ts#L63-L103) [redis.service.ts](src/redis/redis.service.ts#L9-L17) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L56) [search-index.service.ts](src/pipeline/search-index.service.ts#L28-L43) [rustfs.service.ts](src/storage/rustfs.service.ts#L35-L55) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L136-L152) [embedding.service.ts](src/pipeline/embedding.service.ts#L21-L63) [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L91)

以下几个配置区别最容易影响首次启动，建议在继续前核对。Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L21-L63) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L149-L152) [chat-long-memory.service.ts](src/ai/chat-long-memory.service.ts#L64-L82)

| 配置项 | 本页使用方式 | 注意事项 |
|---|---|---|
| `DASHSCOPE_API_KEY` | 同时供嵌入与对话模型使用 | 嵌入服务找不到任何可用密钥时，会在构造阶段直接抛错 |
| `OPENAI_BASE_URL` / `MODEL_NAME` | 配置对话模型端点与模型名 | 嵌入服务使用独立的 `EMBEDDING_*` 配置 |
| `EMBEDDING_DIMENSION` | 使用默认值 `1024` | 向量索引也读取此值；首次启动保持一致 |
| `NEO4J_PASSWORD` | 显式设置为 `12345678` | 与 Compose 的初始密码一致 |
| `MEM0_API_KEY` | 暂不配置 | 未配置时跳过长期记忆，不必为首次启动额外开通 |

Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L21-L63) [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L91) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L33-L36) [docker-compose.yml](docker-compose.yml#L191-L200) [chat-long-memory.service.ts](src/ai/chat-long-memory.service.ts#L64-L82)

## 4. 启动基础设施

先启动后端使用的七项基础设施，暂不启动 pgAdmin、mongo-express、RedisInsight 和 Kibana。Elasticsearch 使用本地 Dockerfile 构建，构建过程中会安装仓库内的 IK 分词插件压缩包。Sources: [docker-compose.yml](docker-compose.yml#L1-L200) [elasticsearch/Dockerfile](elasticsearch/Dockerfile#L1-L8)

```bat
docker compose up -d --build postgres mongodb redis rabbitmq es rustfs neo4j
docker compose ps
```

Sources: [docker-compose.yml](docker-compose.yml#L1-L200)

通过 `docker compose ps` 查看容器状态；若某项服务异常，再针对它查看日志。**容器已经启动，不等于所有依赖都已就绪**：项目中的 RabbitMQ 连接会等待并设置超时，Elasticsearch 和 Neo4j 则在模块初始化时检查连接。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L47-L100) [search-index.service.ts](src/pipeline/search-index.service.ts#L33-L53) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L144-L161)

```bat
docker compose logs --tail=100 postgres mongodb rabbitmq es neo4j
```

Sources: [docker-compose.yml](docker-compose.yml#L3-L59) [docker-compose.yml](docker-compose.yml#L115-L148) [docker-compose.yml](docker-compose.yml#L191-L200)

PostgreSQL 和 MongoDB 的初始化目录已挂载进容器。尤其需要注意：后端设置了 `synchronize: false`，**不会依靠 TypeORM 自动创建业务表**，不要忽略数据库初始化失败。Sources: [docker-compose.yml](docker-compose.yml#L13-L15) [docker-compose.yml](docker-compose.yml#L52-L54) [app.module.ts](src/app.module.ts#L63-L94) [init.sql](init-scripts/postgresql/init.sql#L1-L26)

## 5. 启动后端并验证

保持基础设施运行，在仓库根目录启动开发模式。`start:dev` 对应 `nest start --watch`，适合本地修改代码时使用；默认 HTTP 端口是 `3000`。Sources: [package.json](package.json#L8-L14) [main.ts](src/main.ts#L24-L25)

```bat
pnpm run start:dev
```

Sources: [package.json](package.json#L8-L14)

应用启动后，另开一个终端请求根路径。该接口带有 `@Public()` 标记，**不需要登录，也不需要 Bearer Token**。Sources: [app.controller.ts](src/app.controller.ts#L5-L13)

```bat
curl.exe -i http://localhost:3000/
```

Sources: [main.ts](src/main.ts#L24-L25) [app.controller.ts](src/app.controller.ts#L5-L13)

预期响应正文为 `Hello World!`。这说明 HTTP 服务已经能够处理根路径请求，**不代表模型调用、文件上传、异步索引和知识问答已经全部验证成功**；根路径实现只返回固定字符串。Sources: [app.controller.ts](src/app.controller.ts#L9-L13) [app.service.ts](src/app.service.ts#L3-L7)

```text
Hello World!
```

Sources: [app.service.ts](src/app.service.ts#L3-L7)

整个启动过程可以按下面的顺序检查；如果根路径访问失败，先处理启动日志中的配置或依赖错误，而不是直接调试业务接口。Sources: [main.ts](src/main.ts#L6-L25) [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L92-L100)

```mermaid
flowchart TD
    A["确认 Node.js、pnpm、Docker Compose 可用"] --> B["pnpm install"]
    B --> C["创建 .env 并填写真实模型密钥"]
    C --> D["启动七项基础设施"]
    D --> E["检查容器状态与日志"]
    E --> F["pnpm run start:dev"]
    F --> G["请求 GET /"]
    G --> H{"是否返回 Hello World!？"}
    H -- 是 --> I["完成基础启动验证"]
    H -- 否 --> J["核对后端日志、端口和依赖连接"]
    J --> E
```

Sources: [README.md](README.md#L28-L45) [docker-compose.yml](docker-compose.yml#L1-L200) [main.ts](src/main.ts#L6-L25) [app.service.ts](src/app.service.ts#L3-L7)

## 6. 首次启动常见问题

排查时先区分“阻止启动的错误”和“允许启动但跳过某项能力的警告”。例如，缺少嵌入密钥会抛错，而 Elasticsearch、Neo4j 连接失败会记录警告并停用对应客户端。Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [search-index.service.ts](src/pipeline/search-index.service.ts#L44-L53) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L153-L161)

| 现象 | 优先检查 | 处理方向 |
|---|---|---|
| 提示未配置嵌入 API Key | `.env` 中的 `DASHSCOPE_API_KEY` 等密钥配置 | 确保配置不是空值，并重启后端 |
| RabbitMQ 连接超时 | 容器状态、`5672` 端口、连接账号 | 对照 `RABBITMQ_URL` 检查，不要误用管理界面的 `15672` 端口 |
| Neo4j 认证失败 | `NEO4J_PASSWORD` | 本页使用 Compose 中的 `12345678`，而非代码默认值 `password` |
| 出现“跳过搜索索引”警告 | Elasticsearch 是否就绪、`9200` 端口 | 修复连接后重启后端，让初始化逻辑重新执行 |
| 提示跳过长期记忆 | 是否配置 `MEM0_API_KEY` | 本页未配置时属于预期提示 |
| 根路径无法连接 | 后端是否已启动、`PORT` 是否改变 | 使用与实际监听端口一致的 URL |
| 业务访问提示缺表 | PostgreSQL 初始化情况 | 检查初始化日志；后端不会自动同步表结构 |

Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L53-L100) [docker-compose.yml](docker-compose.yml#L120-L125) [docker-compose.yml](docker-compose.yml#L191-L200) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L149-L161) [search-index.service.ts](src/pipeline/search-index.service.ts#L33-L53) [chat-long-memory.service.ts](src/ai/chat-long-memory.service.ts#L64-L75) [main.ts](src/main.ts#L24-L25) [app.module.ts](src/app.module.ts#L93-L94)

Compose 内包含固定开发密码，且 Elasticsearch 配置关闭了安全认证；因此这里的步骤应作为**本地开发启动方案**，不要直接用作公网部署配置。Sources: [docker-compose.yml](docker-compose.yml#L7-L10) [docker-compose.yml](docker-compose.yml#L123-L125) [docker-compose.yml](docker-compose.yml#L140-L145) [docker-compose.yml](docker-compose.yml#L173-L180)

## 下一步

当前位于 **Get Started → Quick Start**。完成根路径验证后，建议按目录顺序继续：先阅读[环境配置指南：数据库、中间件、模型服务与可选能力](3-huan-jing-pei-zhi-zhi-nan-shu-ju-ku-zhong-jian-jian-mo-xing-fu-wu-yu-ke-xuan-neng-li)，补齐邮件服务和其他能力；再进入[首次知识入库：登录、上传、审核发布与检索问答](4-shou-ci-zhi-shi-ru-ku-deng-lu-shang-chuan-shen-he-fa-bu-yu-jian-suo-wen-da)。开始编写客户端时，接着阅读[接口联调入门：认证凭据、参数校验与流式响应](5-jie-kou-lian-diao-ru-men-ren-zheng-ping-ju-can-shu-xiao-yan-yu-liu-shi-xiang-ying)。Sources: [app.module.ts](src/app.module.ts#L43-L58) [app.module.ts](src/app.module.ts#L105-L111) [auth.module.ts](src/auth/auth.module.ts#L38-L49) [main.ts](src/main.ts#L17-L23) [ai-stream.service.ts](src/ai/ai-stream.service.ts#L3-L8)