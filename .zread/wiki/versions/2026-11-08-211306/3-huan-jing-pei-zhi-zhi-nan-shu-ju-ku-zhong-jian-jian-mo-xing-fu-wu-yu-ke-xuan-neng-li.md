本页位于 **Get Started → 环境配置指南**，帮助你为本地开发配置数据库、消息队列、检索服务和模型凭据，并明确哪些能力可以关闭。最需要先记住的是：**容器启动成功不等于应用能力齐全**——嵌入模型缺少密钥会阻止应用初始化，RabbitMQ 默认需要连接成功，而 Elasticsearch、Neo4j 的连接失败可以表现为跳过索引写入。Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L92-L113) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L39-L61) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L144-L161)

## 1. 先理解配置分为哪几层

项目使用全局 `ConfigModule` 读取应用配置；根目录的 `docker-compose.yml` 则定义基础设施容器及其账号、端口和数据目录。**修改应用连接密码时，要同时检查服务端密码是否一致**：例如 `POSTGRES_PASSWORD` 是应用读取的配置项，而 Compose 中 PostgreSQL 的密码当前直接写为 `123456`，并不是 `${POSTGRES_PASSWORD}` 形式的变量引用。Sources: [app.module.ts](src/app.module.ts#L39-L71) [docker-compose.yml](docker-compose.yml#L3-L15)

下图展示环境配置的依赖范围，不表示请求执行顺序。应用连接 PostgreSQL、MongoDB 和 Redis；文档发布后的索引任务通过 RabbitMQ 投递，全文与向量索引使用 Elasticsearch，图谱使用 Neo4j；文件解析、对象存储及模型调用分别需要对应服务配置。Sources: [app.module.ts](src/app.module.ts#L39-L111) [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L22-L40) [file-parser.service.ts](src/document/parser/file-parser.service.ts#L41-L45)

```mermaid
flowchart TB
    A["NestJS 后端配置"] --> B["PostgreSQL：关系数据"]
    A --> C["MongoDB：文档正文"]
    A --> D["Redis：临时数据"]
    A --> E["RabbitMQ：索引任务"]
    E --> F["Elasticsearch：全文与向量索引"]
    E --> G["Neo4j：知识图谱"]
    A --> H["模型 API：对话、嵌入、精排"]
    A --> I["MinerU：PDF / 图片 / Office 解析"]
    A --> J["RustFS：原文件与图片"]
    A -. "按需配置" .-> K["Bocha / Mem0 / Langfuse"]
```

配置时主要查看以下位置；数据库初始化脚本负责建表或创建集合，不能用应用启动替代 PostgreSQL 建表，因为 TypeORM 已设置 `synchronize: false`。Sources: [docker-compose.yml](docker-compose.yml#L13-L15) [docker-compose.yml](docker-compose.yml#L52-L54) [app.module.ts](src/app.module.ts#L63-L104) [init.sql](init-scripts/postgresql/init.sql#L1-L26) [init.js](init-scripts/mongodb/init.js#L1-L12)

```text
项目根目录
├── .env                         # 本地应用配置，自行创建，不提交凭据
├── docker-compose.yml           # 基础设施容器、端口、账号、数据挂载
├── elasticsearch/
│   └── Dockerfile               # Elasticsearch 8.17.0 + IK
├── init-scripts/
│   ├── postgresql/init.sql      # 关系表初始化
│   └── mongodb/init.js          # MongoDB 用户、集合及索引
└── src/
    ├── app.module.ts            # 数据库与 SMTP 配置入口
    ├── pipeline/                # 嵌入、检索索引、图谱
    ├── storage/                 # RustFS
    └── observability/           # Langfuse
```

Sources: [.gitignore](.gitignore#L41-L46) [Dockerfile](elasticsearch/Dockerfile#L1-L8) [app.module.ts](src/app.module.ts#L39-L104)

## 2. 选择本次需要的环境范围

初次配置建议保留完整的知识入库与问答依赖，只把管理界面和外部增强能力按需加入。下表中的“可关闭”表示代码提供了关闭或跳过机制，**不代表关闭后原功能仍可使用**。Sources: [pipeline.module.ts](src/pipeline/pipeline.module.ts#L21-L35) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L50) [rustfs.service.ts](src/storage/rustfs.service.ts#L35-L42)

| 类别 | 服务 | 配置判断 |
|---|---|---|
| 基础数据 | PostgreSQL、MongoDB | 应用直接注册连接，没有本页所述的启停开关 |
| 临时数据 | Redis | 客户端直接创建，没有启停开关 |
| 异步索引 | RabbitMQ | 默认启用；连接失败会导致初始化抛错；可显式关闭 |
| 检索 | Elasticsearch | 默认启用；不可用时索引服务跳过写入 |
| 图谱 | Neo4j | 默认启用；可关闭，连接失败时跳过图谱写入 |
| 文件存储 | RustFS | 默认启用；可关闭，但直接调用上传会报服务不可用 |
| 模型 | 嵌入 API | 缺少全部候选密钥会在构造阶段抛错 |
| 外部增强 | 精排、Bocha、Mem0、Langfuse | 可不配置；具体影响见后文 |
| 管理界面 | pgAdmin、mongo-express、RedisInsight、Kibana | 用于查看服务，不是后端连接地址 |

Sources: [app.module.ts](src/app.module.ts#L63-L104) [redis.service.ts](src/redis/redis.service.ts#L9-L17) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L56) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L106-L113) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L39-L61) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L141-L161) [rustfs.service.ts](src/storage/rustfs.service.ts#L85-L94) [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [docker-compose.yml](docker-compose.yml#L22-L39)

## 3. 第一步：启动需要的基础设施

以下步骤以“**后端在 Windows 主机运行，基础设施在 Docker 中运行**”为配置目标，因此应用连接地址使用 `localhost` 和 Compose 暴露的宿主机端口。Compose 文件不包含后端服务；其中 `mongodb`、`es` 等名称用于容器之间的连接，例如 mongo-express 连接 `mongodb`，Kibana 连接 `http://es:9200`。Sources: [docker-compose.yml](docker-compose.yml#L1-L210) [app.module.ts](src/app.module.ts#L67-L102)

按“启动服务 → 写入配置 → 检查匹配关系 → 启动后端 → 核对日志”的顺序执行，可以先排除基础设施问题，再检查外部 API。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L53-L105) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L39-L61) [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L63)

```mermaid
flowchart LR
    A["启动基础设施容器"] --> B["创建根目录 .env"]
    B --> C["核对账号、端口、密钥和模型维度"]
    C --> D["启动后端"]
    D --> E{"连接与初始化日志正常？"}
    E -- "否" --> F["按服务排查配置"]
    F --> C
    E -- "是" --> G["按需启用外部增强能力"]
```

在项目根目录执行以下命令，启动不含独立管理界面的主要服务；`--build` 用于构建带 IK 插件的 Elasticsearch 镜像。RabbitMQ 和 RustFS 的管理端口随各自服务一起提供。Sources: [docker-compose.yml](docker-compose.yml#L115-L199) [Dockerfile](elasticsearch/Dockerfile#L1-L8)

```powershell
docker compose up -d --build postgres mongodb redis rabbitmq es rustfs neo4j
docker compose ps
```

| 服务 | 后端使用的主机地址 | Compose 开发账号或说明 |
|---|---|---|
| PostgreSQL | `localhost:5432` | `user` / `123456`，数据库 `knowledge_hub` |
| MongoDB | `localhost:27017` | 根账号 `mongo_user` / `mongo_pass123` |
| Redis | `localhost:6379` | Compose 未配置密码 |
| RabbitMQ | `localhost:5672` | `guest` / `guest` |
| Elasticsearch | `http://localhost:9200` | 开发配置关闭安全认证和 TLS |
| RustFS | `http://localhost:9000` | `rustfsadmin` / `rustfsadmin` |
| Neo4j | `bolt://localhost:7687` | `neo4j` / `12345678` |

Sources: [docker-compose.yml](docker-compose.yml#L3-L15) [docker-compose.yml](docker-compose.yml#L42-L54) [docker-compose.yml](docker-compose.yml#L85-L98) [docker-compose.yml](docker-compose.yml#L115-L145) [docker-compose.yml](docker-compose.yml#L164-L199)

数据目录默认位于项目的 `volumes/` 下，也可以通过 Compose 使用的 `DOCKER_VOLUME_DIRECTORY` 改变挂载根目录。PostgreSQL 和 MongoDB 的初始化脚本挂载到容器的 `/docker-entrypoint-initdb.d`；排查已有环境时，应先确认数据库现状，不要把删除数据目录当作常规修复手段。另一个需要注意的配置差异是：PostgreSQL 健康检查写的是 `hello_pg`，而实际创建、应用默认连接的数据库是 `knowledge_hub`，因此不要仅凭健康检查状态判断目标数据库及业务表正确。Sources: [docker-compose.yml](docker-compose.yml#L7-L20) [docker-compose.yml](docker-compose.yml#L46-L56) [app.module.ts](src/app.module.ts#L67-L71)

## 4. 第二步：创建数据库与中间件配置

在项目根目录创建 `.env`，填入以下本地主机配置。项目已将 `.env` 加入忽略规则；示例中的 JWT 密钥必须替换，Compose 的默认密码也只应作为本地开发起点。Sources: [app.module.ts](src/app.module.ts#L41-L41) [.gitignore](.gitignore#L41-L46) [auth.module.ts](src/auth/auth.module.ts#L22-L27)

```dotenv
PORT=3000
APP_PUBLIC_URL=http://localhost:3000
JWT_SECRET=请替换为你生成的随机长密钥

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=user
POSTGRES_PASSWORD=123456
POSTGRES_DB=knowledge_hub

MONGO_URI=mongodb://mongo_user:mongo_pass123@localhost:27017/knowledge_hub?authSource=admin

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_CONNECT_TIMEOUT_MS=15000

ELASTICSEARCH_ENABLED=true
ELASTICSEARCH_NODE=http://localhost:9200

NEO4J_ENABLED=true
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=12345678
```

Sources: [main.ts](src/main.ts#L24-L24) [email.service.ts](src/auth/email.service.ts#L17-L21) [app.module.ts](src/app.module.ts#L63-L104) [redis.service.ts](src/redis/redis.service.ts#L9-L17) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L60) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L33-L49) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L141-L152)

**Neo4j 密码必须显式对齐**：应用代码默认密码为 `password`，Compose 则设置为 `12345678`。MongoDB 还提供了另一种连接方式：初始化脚本创建业务用户 `knowledge_hub_user` / `knowledge_hub_password`，其认证库是 `knowledge_hub`，不要与根账号使用的 `authSource=admin` 混淆。Sources: [graph-build.service.ts](src/pipeline/graph-build.service.ts#L149-L152) [docker-compose.yml](docker-compose.yml#L191-L199) [init.js](init-scripts/mongodb/init.js#L1-L7) [app.module.ts](src/app.module.ts#L99-L102)

| 配置场景 | 修改前 | 修改后 |
|---|---|---|
| 对齐 Compose 的 Neo4j 密码 | 不设置 `NEO4J_PASSWORD`，使用代码默认 `password` | `NEO4J_PASSWORD=12345678` |
| 改用 MongoDB 业务用户 | `mongodb://mongo_user:mongo_pass123@localhost:27017/knowledge_hub?authSource=admin` | `mongodb://knowledge_hub_user:knowledge_hub_password@localhost:27017/knowledge_hub?authSource=knowledge_hub` |
| 修改 PostgreSQL 宿主机端口 | Compose：`5432:5432`；应用：`POSTGRES_PORT=5432` | 例如 Compose：`15432:5432`；应用：`POSTGRES_PORT=15432` |

Sources: [graph-build.service.ts](src/pipeline/graph-build.service.ts#L149-L152) [init.js](init-scripts/mongodb/init.js#L1-L7) [docker-compose.yml](docker-compose.yml#L11-L15)

## 5. 第三步：配置模型服务

### 5.1 先配置嵌入，再配置对话模型

嵌入模型将文本转换为向量，对话模型负责生成回答，两者配置互相独立。当前 `PipelineModule` 始终注册 `EmbeddingService`，因此即使设置 `ELASTICSEARCH_ENABLED=false`，也不能绕过嵌入服务构造时的密钥检查。Sources: [pipeline.module.ts](src/pipeline/pipeline.module.ts#L21-L35) [embedding.service.ts](src/pipeline/embedding.service.ts#L21-L45)

以代码默认使用的 DashScope 为例，向 `.env` 追加下列配置，并将占位符替换为真实密钥。只设置 `DASHSCOPE_API_KEY` 就能被嵌入、对话和精排服务作为候选密钥读取；首次配置时也可以显式关闭精排，避免把它的调用问题与基础模型连通性混在一起。Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L63) [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L90) [reranker.service.ts](src/ai/reranker.service.ts#L29-L46)

```dotenv
DASHSCOPE_API_KEY=替换为真实密钥

OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen-plus
AI_CHAT_TIMEOUT_MS=60000

EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=text-embedding-v3
EMBEDDING_DIMENSION=1024
EMBEDDING_BATCH_SIZE=10

RAG_RERANK_ENABLED=false
```

Sources: [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L90) [embedding.service.ts](src/pipeline/embedding.service.ts#L21-L63) [reranker.service.ts](src/ai/reranker.service.ts#L29-L42)

| 配置组 | 读取优先级或默认值 | 注意事项 |
|---|---|---|
| 对话密钥 | `OPENAI_API_KEY` → `LLM_API_KEY` → `DASHSCOPE_API_KEY` | 优先读取第一个非空值 |
| 对话地址 | `OPENAI_BASE_URL` → `LLM_BASE_URL` → DashScope 兼容地址 | 变量名含 `OPENAI` 不代表固定调用 OpenAI |
| 对话模型 | `MODEL_NAME` → `LLM_MODEL` → `qwen-plus` | 应与所选服务支持的模型一致 |
| 嵌入密钥 | `EMBEDDING_API_KEY` → `DASHSCOPE_API_KEY` → `OPENAI_API_KEY` | **不会读取 `LLM_API_KEY`** |
| 嵌入地址与模型 | `EMBEDDING_BASE_URL`；`EMBEDDING_MODEL` 默认 `text-embedding-v3` | 不跟随对话模型地址自动切换 |
| 嵌入维度 | `EMBEDDING_DIMENSION=1024` | 同时用于模型请求与 ES 向量字段配置 |
| 嵌入批量 | `EMBEDDING_BATCH_SIZE=10` | 当前实现会将超过 10 的值限制为 10 |

Sources: [ai-chat.service.ts](src/ai/ai-chat.service.ts#L65-L91) [embedding.service.ts](src/pipeline/embedding.service.ts#L21-L63) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L33-L36)

**不要把“模型兼容”理解为仅修改密钥。** 切换服务商时，应分别检查对话地址、对话模型、嵌入地址、嵌入模型及维度；图谱抽取还使用 `withStructuredOutput`，需要模型支持对应的结构化输出。缺少图谱抽取密钥不会在其构造阶段抛错，但实际抽取时会报错。Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L47-L63) [extraction.service.ts](src/pipeline/extraction.service.ts#L35-L70) [extraction.service.ts](src/pipeline/extraction.service.ts#L94-L102)

### 5.2 精排不是通用聊天接口

精排默认使用 `qwen3-rerank`，密钥顺序为 `RERANK_API_KEY` → `DASHSCOPE_API_KEY` → `OPENAI_API_KEY`。`RERANK_BASE_URL` 默认是主机根地址 `https://dashscope.aliyuncs.com`，代码会追加 `/api/v1/services/rerank/text-rerank/text-rerank`，因此不要直接填入聊天接口的 `/compatible-mode/v1` 地址。未启用、缺少密钥或调用失败时，精排返回 `null`，交由上层降级为融合排序结果。Sources: [reranker.service.ts](src/ai/reranker.service.ts#L16-L46) [reranker.service.ts](src/ai/reranker.service.ts#L53-L112)

## 6. 第四步：配置文件存储、解析和邮件

### 6.1 RustFS 与 MinerU

RustFS 的连接地址和返回给客户端的文件地址是两个概念：`RUSTFS_ENDPOINT` 用于后端访问 S3 API，`RUSTFS_PUBLIC_URL` 用于拼接文件 URL；后者未配置时回退到 endpoint。返回链接形式为 `{publicBase}/{bucket}/{key}`，所以它应当是浏览器能够访问的地址，而不是只能在容器网络内解析的服务名。Sources: [rustfs.service.ts](src/storage/rustfs.service.ts#L45-L68) [rustfs.service.ts](src/storage/rustfs.service.ts#L85-L118)

```dotenv
RUSTFS_ENABLED=true
RUSTFS_ENDPOINT=http://localhost:9000
RUSTFS_PUBLIC_URL=http://localhost:9000
RUSTFS_ACCESS_KEY=rustfsadmin
RUSTFS_SECRET_KEY=rustfsadmin
RUSTFS_REGION=us-east-1
RUSTFS_BUCKET=knowledge-hub
```

Sources: [rustfs.service.ts](src/storage/rustfs.service.ts#L35-L58)

服务会检查 bucket 是否存在，不存在时尝试创建；初始化失败只记录警告，首次上传时会再次尝试。**“RustFS 已配置”日志不表示 bucket 初始化或上传已经成功**，也不表示生成的链接已经验证可由浏览器读取。Sources: [rustfs.service.ts](src/storage/rustfs.service.ts#L70-L78) [rustfs.service.ts](src/storage/rustfs.service.ts#L96-L118) [rustfs.service.ts](src/storage/rustfs.service.ts#L121-L140)

当前文件解析入口中，`txt`、`md` 本地读取，PDF、图片和 Office 文件则转交 MinerU；不能因为仓库存在其他解析器文件，就假定未配置 MinerU 时会自动降级。只测试文本解析时可以不配置 MinerU，测试 PDF、图片或 Office 时必须提供 `MINERU_API_TOKEN`。Sources: [file-parser.service.ts](src/document/parser/file-parser.service.ts#L6-L28) [file-parser.service.ts](src/document/parser/file-parser.service.ts#L69-L85) [mineru.parser.ts](src/document/parser/mineru.parser.ts#L269-L280)

| MinerU 参数 | 默认值 | 用途 |
|---|---|---|
| `MINERU_API_TOKEN` | 无 | 外部服务令牌，调用解析时检查 |
| `MINERU_API_BASE` | `https://mineru.net` | API 根地址 |
| `MINERU_MODEL_VERSION` | `vlm` | 解析模型版本 |
| `MINERU_LANGUAGE` | `ch` | 解析语言 |
| `MINERU_ENABLE_FORMULA` | `true` | 公式解析 |
| `MINERU_ENABLE_TABLE` | `true` | 表格解析 |
| `MINERU_POLL_INTERVAL_MS` | `3000` | 轮询间隔，毫秒 |
| `MINERU_POLL_TIMEOUT_MS` | `600000` | 轮询总超时，毫秒 |

Sources: [mineru.parser.ts](src/document/parser/mineru.parser.ts#L88-L123) [mineru.parser.ts](src/document/parser/mineru.parser.ts#L269-L293)

### 6.2 SMTP 与邮件链接

SMTP 配置没有代码默认值，需要填写服务商提供的 `MAIL_HOST`、`MAIL_PORT`、`MAIL_USER`、`MAIL_PASS` 和 `MAIL_FROM`；`MAIL_SECURE` 只有值严格等于 `true` 时才启用。`APP_PUBLIC_URL` 用于生成账号激活链接，如果修改后端端口或访问域名，也应同步调整它，避免邮件仍指向 `http://localhost:3000`。Sources: [app.module.ts](src/app.module.ts#L43-L58) [email.service.ts](src/auth/email.service.ts#L17-L32)

```dotenv
MAIL_HOST=你的SMTP服务器
MAIL_PORT=服务商要求的端口
MAIL_SECURE=false
MAIL_USER=你的SMTP账号
MAIL_PASS=你的SMTP密码或授权码
MAIL_FROM=你的发件人地址
APP_PUBLIC_URL=http://localhost:3000
```

Sources: [app.module.ts](src/app.module.ts#L46-L57) [email.service.ts](src/auth/email.service.ts#L17-L21)

## 7. 第五步：按需启用可选能力

下列能力不必在第一次启动时全部开通。建议先验证数据库、消息队列、检索和模型调用，再逐项加入外部服务，便于定位凭据或网络问题。Sources: [web-search.service.ts](src/ai/web-search.service.ts#L24-L34) [chat-long-memory.service.ts](src/ai/chat-long-memory.service.ts#L64-L82) [langfuse.ts](src/observability/langfuse.ts#L13-L28)

| 能力 | 主要配置 | 不配置或关闭后的行为 |
|---|---|---|
| 联网搜索 | `BOCHA_API_KEY` | 返回空条目及未配置错误说明 |
| 长期记忆 | `MEM0_API_KEY`；可选 `MEM0_HOST`、`MEM0_TOP_K=5` | 无密钥时跳过长期记忆，检索返回空结果 |
| 模型追踪 | `LANGFUSE_PUBLIC_KEY`、`LANGFUSE_SECRET_KEY`；可选 `LANGFUSE_BASE_URL` | 公私钥未同时配置时不启动追踪 |
| 图谱 | `NEO4J_ENABLED=false` | 不创建 Neo4j 连接，跳过图谱构建 |
| 全文及向量索引 | `ELASTICSEARCH_ENABLED=false` | 两类索引服务跳过初始化与写入；嵌入密钥仍需配置 |
| 消息队列 | `RABBITMQ_ENABLED=false` | 跳过 RabbitMQ 初始化；不能据此期待发布后的索引任务正常执行 |
| 对象存储 | `RUSTFS_ENABLED=false` | 不初始化 S3 客户端，直接上传调用会报错 |

Sources: [web-search.service.ts](src/ai/web-search.service.ts#L24-L31) [chat-long-memory.service.ts](src/ai/chat-long-memory.service.ts#L64-L82) [chat-long-memory.service.ts](src/ai/chat-long-memory.service.ts#L109-L115) [langfuse.ts](src/observability/langfuse.ts#L13-L28) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L141-L175) [search-index.service.ts](src/pipeline/search-index.service.ts#L28-L53) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L33-L61) [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L50) [rustfs.service.ts](src/storage/rustfs.service.ts#L35-L42) [rustfs.service.ts](src/storage/rustfs.service.ts#L85-L94)

多数基础设施开关按字符串 `!== 'false'` 判断，建议在 `.env` 中统一写小写 `true` 或 `false`，不要用 `0` 代替关闭。尤其要区分：关闭外部能力是明确的功能取舍，不是自动获得另一条等价实现路径。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L40) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L141-L146) [vector-index.service.ts](src/pipeline/vector-index.service.ts#L33-L41) [reranker.service.ts](src/ai/reranker.service.ts#L29-L31)

如果需要图形界面，可以额外启动以下服务。它们的登录账号与数据库账号不一定相同，例如 mongo-express 页面账号为 `me_admin`，而不是 MongoDB 根账号。Sources: [docker-compose.yml](docker-compose.yml#L22-L39) [docker-compose.yml](docker-compose.yml#L61-L83)

```powershell
docker compose up -d pgadmin mongo-express redisinsight kibana
```

| 管理界面 | 浏览器地址 | Compose 页面凭据 |
|---|---|---|
| pgAdmin | `http://localhost:8088` | `admin@admin.com` / `admin` |
| mongo-express | `http://localhost:8081` | `me_admin` / `me_123456` |
| RedisInsight | `http://localhost:5540` | Compose 未设置页面账号 |
| RabbitMQ 管理台 | `http://localhost:15672` | `guest` / `guest` |
| Kibana | `http://localhost:5601` | Compose 未配置认证 |
| RustFS 控制台 | `http://localhost:9001` | 配置的访问密钥为 `rustfsadmin` / `rustfsadmin` |
| Neo4j 浏览器 | `http://localhost:7474` | `neo4j` / `12345678` |

Sources: [docker-compose.yml](docker-compose.yml#L22-L39) [docker-compose.yml](docker-compose.yml#L61-L77) [docker-compose.yml](docker-compose.yml#L100-L113) [docker-compose.yml](docker-compose.yml#L115-L125) [docker-compose.yml](docker-compose.yml#L150-L179) [docker-compose.yml](docker-compose.yml#L191-L199)

## 8. 启动后端并排查配置问题

配置完成后执行开发启动命令，默认监听端口为 `3000`，可由 `PORT` 修改。核对日志时，既要看服务是否启动，也要看是否出现“不可用，将跳过写入”之类降级提示；Elasticsearch 和 Neo4j 出现这类提示时，应用可能仍在运行，但对应能力尚未就绪。Sources: [package.json](package.json#L8-L14) [main.ts](src/main.ts#L24-L26) [search-index.service.ts](src/pipeline/search-index.service.ts#L44-L53) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L153-L161)

```powershell
pnpm run start:dev
```

| 现象 | 优先检查 | 处理方向 |
|---|---|---|
| 提示未配置嵌入 API Key | 三个嵌入候选密钥是否全部为空 | 配置 `EMBEDDING_API_KEY`、`DASHSCOPE_API_KEY` 或 `OPENAI_API_KEY`；仅设置 `LLM_API_KEY` 不够 |
| RabbitMQ 初始化超时 | `5672`、连接 URL、账号密码 | 默认超时 15000 毫秒；修复连接，或明确关闭并接受索引任务不可用 |
| Neo4j 不可用 | 密码是否误用代码默认 `password` | 对齐 Compose 的 `12345678` |
| Elasticsearch 不可用 | `ELASTICSEARCH_NODE`、容器状态、本地镜像构建 | 使用仓库带 IK 的镜像；核对启动日志 |
| 数据库提示关系表不存在 | 初始化脚本是否执行，连接库是否正确 | 检查 `knowledge_hub` 和业务表；TypeORM 不会自动同步建表 |
| PDF / Office 解析失败并提示缺令牌 | `MINERU_API_TOKEN` | 配置令牌；文本解析无需该服务 |
| RustFS 初始化 bucket 失败 | endpoint、访问密钥、服务连通性 | 首次上传会重试，不要把初始化警告视为上传成功 |
| 激活邮件链接指向错误地址 | `APP_PUBLIC_URL` | 改为收件人实际可访问的后端地址 |
| 精排调用失败但问答仍继续 | 精排密钥、模型、根地址 | 精排具有降级逻辑，应单独检查，不等同于主模型正常 |

Sources: [embedding.service.ts](src/pipeline/embedding.service.ts#L37-L45) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L53-L112) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L149-L161) [docker-compose.yml](docker-compose.yml#L191-L199) [Dockerfile](elasticsearch/Dockerfile#L1-L8) [app.module.ts](src/app.module.ts#L67-L93) [mineru.parser.ts](src/document/parser/mineru.parser.ts#L269-L280) [rustfs.service.ts](src/storage/rustfs.service.ts#L74-L78) [email.service.ts](src/auth/email.service.ts#L17-L21) [reranker.service.ts](src/ai/reranker.service.ts#L85-L112)

**最后确认开发配置的安全边界。** 当前 Compose 包含默认密码、公开映射端口、关闭认证的 Elasticsearch，以及允许所有来源的 RustFS CORS；这些设置用于降低本地联调门槛，不应原样暴露到公网。JWT 也存在开发默认密钥，应在 `.env` 中显式替换。Sources: [docker-compose.yml](docker-compose.yml#L138-L145) [docker-compose.yml](docker-compose.yml#L170-L181) [auth.module.ts](src/auth/auth.module.ts#L25-L27)

## 下一步

如果还没有完成依赖安装和首次启动，可先回到 [Quick Start](2-quick-start)；环境连接检查完成后，继续阅读 [首次知识入库：登录、上传、审核发布与检索问答](4-shou-ci-zhi-shi-ru-ku-deng-lu-shang-chuan-shen-he-fa-bu-yu-jian-suo-wen-da)。需要处理部署安全和运行维护时，再阅读 [开发与运维检查：测试配置差异、构建部署、依赖健康及安全加固](30-kai-fa-yu-yun-wei-jian-cha-ce-shi-pei-zhi-chai-yi-gou-jian-bu-shu-yi-lai-jian-kang-ji-an-quan-jia-gu)。本页到此只完成环境准备，不展开上传、审核或问答接口流程。Sources: [README.md](README.md#L28-L49) [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L22-L40) [docker-compose.yml](docker-compose.yml#L138-L145)