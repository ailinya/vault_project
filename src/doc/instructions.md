# 第一天
现了梳理业务逻辑，编写docker compose部署配置，pg/mogo初始化脚本，容器启动自动建表，索引，搭建nest 后端，基于nest/typeorm、nest/mogoose实现数据库实体映射，连接mogodb和pregres数据库，一般在app.module中，然后根据业务关系建立表，然后建entity ,写service ，写contrlller,完成文档的CRUD接口开发，测试后端接口是否完成，完成文档从接口传输、业务处理到双库持久化的全流程闭环

postgresql中存文档业务元数据，把正式文档存在mogodb中，通过content_id关联
pg中间那个的id 是document中的documentId,docoment中的_id是pg中的content_id
先往mogodb中插入数据生成_id 再放pg中写入content_id,进行增删改查
# 第二天
一般文章都是各种格式 pdf 、word 、ppt等 我们把这些解析成markdown,成文存入mongodb 元数据放入postgresql,原始文件和提取的图片放在rustfs中，解析后再分快，向量化等，把原始文件和图片一般放在对象存储中restFS或者MinIo中
目前pdf 解析用pdf-parse
xlsx文件用exceljs来解析
docx是mamonth把文档转换成html 然后turndown把html转换成markdown
ppt先解压再 如果解析失败就用officeparser

# 第三天
向量化
学习了消息队列rabbitMQ,用于异步操作 ，把文档进行异步解耦向量化，发布接口之负责持久化文档状态并投递任务，后续的分块等耗时间的交给rabbitMQ消费端异步完成，降低接口延迟
文档发布后 会给rabbitMq发消息  然后有三条消费来链路，
Rag :分块-向量化-es
search:关键词检索
KG:分块-抽取实体-图谱管理查询


producer consumwer queue exchange routing key binding message channel ack 
exchage 通常有4种 direct topic fanout headers 

DocumentPipelinePublisher
  ↓ publish
rag.reindex.exchange
  ↓ routing key: rag.reindex.by_ids
kh.rag.reindex.queue
  ↓ consume
DocumentPipelineConsumer
  ↓
PipelineOrchestrator
用lanchain的递归策略分块

OpenAIEmbeddings 1024向量
把分块的用es保存  ES 存的是每个文档分块后的 chunk es保存chunk是为了把整篇文章检索变成段落语义检索， 整篇文章保存在mogodb中，es主要负责保存文本块 es建立index，相当表，存document 相当于一行数据 然后mapping字段 text 全文搜素，会分词，keyword精确匹配 不分词，es支持关键词搜素和向量搜素


# 第四天
上一天实现了rag向量化这个rabbitMQ的管道，一共要实现三个消息管道
这次是实现es全文检索管道 把全文快照放到es中 建立所用 kh_dicument索引 把全文放在一个里 上面rag向量化是把分块建立索引kh_chunk ，每个分块保存文档

# 第五天

文档发布后我们要把解析后的文档分别存入 向量数据库，全文检索数据库，图数据库 这次我们要实现滴三天rabbitMq消息 存到 neo4j 图谱关联查询，neo4j主要是存接点和关系，用cyper语言来写， 这个图谱是三级结构  这个抽取实体是一篇文章是大节点 文章分为多个chunk chunk之间再抽取实体，这种方便实体溯源，比如工业 法律 医疗都有特定实体  关系，文档新增 删除 会基于这套三级实体模型联动更新知识图谱
# 第6天 
上面实现了文档发布后的三个管道流程 ，但是我们没做文档校验审核  发布就建立三条管道了  ，实际上需要审核，可以建一个开关 控制审核不审核 文档流转有4种状态  草稿、待审核 、已发布、已归档，只有已发布才会建立三套管道索引，新增状态流转的接口 新增kh_document_review 审核记录表，持久化每一条审核的记录

# 第7天
 
本节实现用户模块  注册登录，加入鉴权模块，加入用户表  角色表 等 实现登录 注册等功能 

实现了两个全局的guard  包括jwt登录的guard role 校验的guard
之前的文档模块也接入鉴权
## 第8天
实现用户注册激活邮箱的功能  用redis存tocken 存用户id  redis中适合存这种结构简单 放在内存中快速提取的 ，redis适合放缓存 验证码 临时tocken  session登录状态  这节加上了邮箱验证的功能 用qq邮箱  设置邮箱的Smtp 邮件传输协议
## 第9天
实现权限功能呢 用rbac  基于角色分配权限

鉴权链路分为三种，三层全局guard 流水线 jwtAuthGuard 负责登录身份校验，roleGurad负责角色校验，permissionGuard负责权限校验，三层校验 任何一层校验失败都会拦截

# 第10天
本文实现了全文搜索  和图谱搜素的功能，用ik做中文分词器  全文检索就用es自带的sercher    及es的高亮功能，  图谱检索用cyper语句 用传入的关建词去节点属性里匹配  


# 第11天
这节使用混合检索  用es实现关键词检索和向量检索  用knn算法进行向量检索
rrf融合  rerank重排  ai生成回答  