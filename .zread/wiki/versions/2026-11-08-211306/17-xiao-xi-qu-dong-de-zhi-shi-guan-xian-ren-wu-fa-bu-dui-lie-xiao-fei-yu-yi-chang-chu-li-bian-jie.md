**文档发布成功、消息投递成功、索引构建成功，是三个不同的结果。** 当前实现通过 RabbitMQ 将 RAG、全文搜索与知识图谱拆为三条异步任务链，但没有把三者包装成一个原子操作。本页聚焦任务契约、队列拓扑、消费者生命周期，以及异常如何影响 ACK/NACK；分块、嵌入和图谱写入算法不在本页展开。Sources: [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L22-L50) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L144-L169) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L214)

## 1. 架构模型：业务触发、消息传输与管线执行分层

`MqModule` 是全局模块，导入 `PipelineModule`，同时提供传输服务、发布器和消费者；对外导出 `RabbitMqService` 与 `DocumentPipelinePublisher`。职责分工明确：发布器组装任务，传输服务声明拓扑并处理确认，消费者解析消息并分派，`PipelineOrchestrator` 加载文档、调用具体索引服务，而不直接操作 RabbitMQ。Sources: [mq.module.ts](src/mq/mq.module.ts#L1-L17) [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L40-L69) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L21-L45)

下图中的三条队列是并列任务通道，不是“先向量化、再全文索引、最后建图”的串行流水线。`afterPublish()` 与 `afterUnpublish()` 都通过 `Promise.all` 并行投递，因此一个分支的投递结果不代表其他分支的结果。Sources: [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L34-L50)

```mermaid
flowchart LR
    B["文档业务服务 / 审核服务"] --> P["DocumentPipelinePublisher"]
    P --> R["RabbitMqService"]

    R --> QR["RAG 交换机 / 队列"]
    R --> QS["Search 交换机 / 队列"]
    R --> QK["KG 交换机 / 队列"]

    QR --> C["DocumentPipelineConsumer"]
    QS --> C
    QK --> C

    C --> O["PipelineOrchestrator"]
    O --> D["PostgreSQL 元数据 + MongoDB 正文"]
    O --> V["向量索引服务"]
    O --> S["全文索引服务"]
    O --> G["图谱构建服务"]
```

Sources: [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L34-L50) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L171-L214) [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L27-L65) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L199-L212)

### 业务状态不以投递结果回滚

业务层通过 `safePublish()`、`safeUnpublish()` 包裹发布器调用，捕获异常后记录日志；传输层也把发布异常转换为 `false`，而不是继续抛出。由此形成**文档状态与索引任务解耦**的边界：任务投递失败不会回滚文档状态，但代码中的这些调用也没有提供持久化补偿或同步执行索引的回退路径。Sources: [document.service.ts](src/document/document.service.ts#L705-L733) [document-review.service.ts](src/document/document-review.service.ts#L220-L239) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L144-L169)

并非所有索引变化都走消息队列。例如，已发布文档仅调整公开性或所属团队时，业务服务直接调用 `PipelineOrchestrator.updateVisibility()`；该方法并行调用三套索引的可见性更新。因此不能把当前 MQ 消费者视为所有索引变更的统一入口。Sources: [document.service.ts](src/document/document.service.ts#L652-L681) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L78-L96)

## 2. 任务契约：传标识，不传正文快照

三类消息都包含 `taskId` 和 `type`，但文档标识的基数不同：RAG、KG 使用可选的 `documentIds` 数组，Search 使用单个 `documentId`。发布器为每个分支分别生成 UUID，因此同一次发布的三个任务并不共享一个 `taskId`。消息没有携带正文、文档版本或发布时间快照。Sources: [pipeline.messages.ts](src/mq/messages/pipeline.messages.ts#L1-L26) [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L52-L130)

| 任务通道 | 构建类型 | 清理类型 | 标识字段 | 消费入口 |
|---|---|---|---|---|
| RAG | `BY_DOC_IDS` | `DELETE_BY_DOC_IDS` | `documentIds?: string[]` | `handleRagReindex()` |
| Search | `INDEX` | `DELETE` | `documentId: string` | `handleSearchIndex()` |
| KG | `BUILD_BY_DOC_IDS`、`BUILD_ALL` | `DELETE_BY_DOC_IDS` | `documentIds?: string[]` | `handleKgBuild()` |

Sources: [pipeline.messages.ts](src/mq/messages/pipeline.messages.ts#L1-L26) [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L40-L65)

**消费时重新读取数据，意味着任务表达“对这些文档执行操作”，而不是“处理发布瞬间的不可变内容”。** 按 ID 加载时，编排器查询 `id` 与 `deleted: false`，再读取对应的未删除 Mongo 正文；这里没有限制 `status = Published`。只有 `BUILD_ALL` 的全量加载路径显式筛选已发布文档。因此，评估延迟消息或重建与清理消息交错时，不能假设按 ID 的构建入口会再次验证发布状态。Sources: [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L199-L227)

`BUILD_ALL` 虽然存在于 KG 类型定义和编排器分支中，但当前发布器只生成 `BUILD_BY_DOC_IDS` 与删除任务，拓扑中也没有单独的全量构建路由键。应区分“消费者能处理的类型”和“现有发布器实际产生的任务”。Sources: [pipeline.messages.ts](src/mq/messages/pipeline.messages.ts#L19-L26) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L128-L149) [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L107-L130) [mq.constants.ts](src/mq/mq.constants.ts#L20-L26)

## 3. 队列拓扑与发布语义

系统声明三个 `topic` 交换机和三个持久化队列，每条队列同时接收本领域的构建与清理任务。构建、清理共享队列，但消费者实际依据消息体中的 `type` 分派，不依据 routing key 再次校验业务类型。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L171-L193) [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L40-L65)

| 交换机 | 队列 | 构建 routing key | 清理 routing key |
|---|---|---|---|
| `rag.reindex.exchange` | `kh.rag.reindex.queue` | `rag.reindex.by_ids` | `rag.reindex.delete` |
| `search.index.exchange` | `kh.search.index.queue` | `search.index.document` | `search.index.delete` |
| `kg.graph.exchange` | `kh.kg.graph.queue` | `kg.graph.build.by_ids` | `kg.graph.delete` |

Sources: [mq.constants.ts](src/mq/mq.constants.ts#L8-L26) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L171-L193)

传输服务创建 JSON 模式的 `ChannelWrapper`，发布时设置 `contentType: application/json` 与 `persistent: true`，等待 `channel.publish()` 完成后返回 `true`。这个布尔值表示发布调用完成，**不是消费者完成索引的回执**；发布参数也没有设置 `mandatory`，该封装没有检查任务是否已被具体队列消费。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L83-L90) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L144-L169)

构建任务会记录文档 ID、任务 ID 以及“已投递/投递失败”；删除任务虽然同样生成 UUID，却没有在发布器内检查返回值或输出同等级的任务关联日志。排查清理消息投递失败时，传输层日志只包含交换机、routing key 和错误信息，不能期待所有任务都有完整的生产端 `taskId` 日志。Sources: [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L52-L130) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L149-L167)

## 4. 消费生命周期与并发边界

消费者在构造函数中注册三个 handler，保证注册先于 `RabbitMqService.onModuleInit()` 中的绑定操作。`registerHandler()` 本身只是向 `Map` 写入处理器；真正的 `ch.consume()` 位于 channel setup 调用的 `bindConsumers()` 内。因此，虽然方法注释允许初始化前后注册，**运行中向 Map 注册不等于立即绑定新的消费者**。Sources: [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L16-L38) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L83-L89) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L139-L142) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L214)

消费回调对每条消息执行 `await handler(msg)`，正常返回后 ACK，异常逃逸后 NACK。但绑定代码没有调用 `prefetch()`，也没有显式的并发池、按文档锁或任务去重检查；不能把回调内部的 `await` 理解为整个队列只会串行处理一条消息。RAG 与 KG 的单个批次内部使用顺序循环，也不构成不同消息之间的互斥。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L214) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L65-L75) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L291-L301)

| 配置项 | 默认值 | 实际边界 |
|---|---|---|
| `RABBITMQ_ENABLED` | `'true'` | 只有字符串 `'false'` 会禁用 MQ；禁用后发布返回 `false` |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | 连接地址；日志输出时隐藏密码 |
| `RABBITMQ_CONNECT_TIMEOUT_MS` | `'15000'` | 初始化等待超时；不是单条任务执行超时 |

Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L38-L60) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L92-L119) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L144-L154)

MQ 被显式禁用时，初始化直接返回；MQ 已启用但初始化连接失败或超时时，服务关闭连接、清空引用并重新抛出异常。也就是说，**启动连接失败不是自动切换到无 MQ 模式**。应用销毁时则关闭 channel 和 connection。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L47-L51) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L92-L113) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L134-L137)

## 5. 异常边界：ACK 只说明处理器正常返回

下面的流程图强调一个关键区别：确认动作由最外层消费回调决定，但业务失败可能已被更内层捕获。因此“有失败日志”和“消息被 NACK”并不是同一件事。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L210) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L68-L75) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L291-L301)

```mermaid
flowchart TD
    A["收到队列消息"] --> B["JSON.parse"]
    B --> C["按通道调用编排器"]
    C --> D{"处理器是否正常返回？"}
    D -->|是| E["ACK"]
    D -->|否：异常逃逸| F["记录消费失败"]
    F --> G["NACK：不批量、不重新入队"]

    C --> H["内部捕获错误 / 跳过任务"]
    H --> D
```

Sources: [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L40-L69) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L210)

### 不同失败位置对应不同确认结果

| 失败位置或条件 | 异常处理方式 | 最外层确认结果 |
|---|---|---|
| JSON 语法错误 | `JSON.parse()` 抛出，消费者不捕获 | NACK，不重新入队 |
| RAG 按 ID 加载文档失败 | 位于单文档 `try/catch` 之外 | NACK，不重新入队 |
| RAG 单文档重建失败 | 编排器记录错误并继续 | ACK |
| Search `INDEX` 的 ES 写入异常 | `indexDocument()` 不捕获写入异常 | NACK，不重新入队 |
| Search ES 客户端不可用 | 记录警告后返回 | ACK |
| Search 删除异常 | 删除服务捕获异常 | ACK |
| KG 单文档构建失败 | `buildBatch()` 捕获并继续 | ACK |
| KG 驱动不可用或正文为空 | 返回 `0`，跳过构建 | ACK |
| 未支持类型、部分空任务 | 编排器警告后返回 | ACK |

Sources: [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L67-L69) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L52-L75) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L103-L149) [search-index.service.ts](src/pipeline/search-index.service.ts#L63-L83) [search-index.service.ts](src/pipeline/search-index.service.ts#L116-L139) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L172-L180) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L291-L301)

**当前代码没有建立自动重试闭环。** 外层异常执行的是 `ch.nack(msg, false, false)`，明确不重新入队；拓扑声明没有配置死信交换机、重试队列或消息 TTL。仅依据这套应用声明，不能承诺失败任务会进入死信队列或随后自动重试；Broker 侧是否另有策略不在这些代码的证据范围内。Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L171-L193) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L210)

消息解析也没有运行时契约验证：`JSON.parse(...) as T` 只是类型断言，不会检查 `taskId`、`type` 或 ID 字段是否满足接口。未知类型可能进入“忽略并正常返回”的分支，而不是统一成为可追踪的无效任务。`taskId` 在当前消费入口用于日志，没有作为去重键传给编排器。Sources: [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L40-L69) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L52-L63) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L103-L149)

## 6. 排障时按边界取证，而不是只看队列是否清空

排查时应分别回答“是否生成任务”“是否完成发布”“是否进入消费者”“是否真正完成索引操作”。构建任务的生产端与消费端都有 `taskId` 日志，但编排器调用只接收类型与文档 ID，后续日志主要依靠 `documentId` 关联。队列消息被 ACK，只能证明处理器正常返回，不能替代最终索引状态核验。Sources: [document-pipeline.publisher.ts](src/mq/document-pipeline.publisher.ts#L52-L121) [document-pipeline.consumer.ts](src/mq/document-pipeline.consumer.ts#L40-L65) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L210)

| 现象 | 优先核查 | 不能直接得出的结论 |
|---|---|---|
| 文档已发布，但没有索引 | 发布器投递日志、MQ 是否禁用、下游是否跳过写入 | 文档发布成功不代表任务投递成功 |
| 队列已消费，但 RAG/KG 缺失 | 单文档失败日志、正文为空、下游客户端不可用 | ACK 不代表索引构建完整 |
| 出现“消费失败”后没有重试 | `nack(..., false, false)` 与 Broker 策略 | 当前代码不保证自动重试 |
| 重建读取到不同于触发时的内容 | 消息只带 ID，正文在消费时加载 | 消息不是内容版本快照 |

Sources: [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L144-L169) [rabbitmq.service.ts](src/mq/rabbitmq.service.ts#L198-L210) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L68-L75) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L153-L160) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L199-L212) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L172-L180) [graph-build.service.ts](src/pipeline/graph-build.service.ts#L291-L301)

继续阅读时，若要理解 RAG 任务内部的执行成本与重建步骤，转到[文档分块与向量化：上下文组织、批量嵌入与索引重建](18-wen-dang-fen-kuai-yu-xiang-liang-hua-shang-xia-wen-zu-zhi-pi-liang-qian-ru-yu-suo-yin-zhong-jian)；若要分析发布、下架、删除及可见性更新之间的整体一致性，转到[跨索引同步：发布重建、删除清理与可见性更新](21-kua-suo-yin-tong-bu-fa-bu-chong-jian-shan-chu-qing-li-yu-ke-jian-xing-geng-xin)。这两部分分别承接本页的执行服务边界与业务同步边界。Sources: [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L78-L96) [pipeline.orchestrator.ts](src/pipeline/pipeline.orchestrator.ts#L152-L186) [document.service.ts](src/document/document.service.ts#L652-L681)