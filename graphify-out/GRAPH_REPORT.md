# Graph Report - vault_project  (2026-11-08)

## Corpus Check
- 181 files · ~51,741 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1291 file(s) not represented in the graph (top: (none) 1266, .map 5, .wt 4)
- WARNING: 1291 of 1472 files seen (88%) have no supported extractor and are missing from this graph entirely. It may look complete while representing only part of the codebase.

## Summary
- 1879 nodes · 4445 edges · 130 communities (74 shown, 56 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 270 edges (avg confidence: 0.86)
- Token cost: unavailable (host agent tool does not expose semantic token usage)

## Community Hubs (Navigation)
- Role Permission Management
- Document Review Lifecycle
- RabbitMQ Message Pipeline
- Runtime Package Dependencies
- Document Access Infrastructure
- User Persistence Modules
- Development Tool Dependencies
- Document Social Engagement
- PostgreSQL Initialization Schema
- Streaming Chat Orchestration
- Document Category Management
- Team Member Management
- Publication API Examples
- Conversation Memory Modules
- Document Permission Endpoints
- Notification Delivery Management
- Authentication Module Dependencies
- User Account Operations
- Request Validation Types
- AI Package Integrations
- Markdown Document Parsing
- Document Pipeline Modules
- Application Entity Registration
- Document Sharing Endpoints
- Chat Session Request Types
- Agent Runtime Evaluation
- RAG Quality Evaluators
- Team Persistence Modules
- Query Intent Rewriting
- Agent Retrieval Contracts
- Knowledge Entity Extraction
- User Role Endpoints
- Hybrid Vector Index
- TypeScript Compiler Options
- Chat Session Endpoints
- Chat Turn Execution
- Authentication Token Lifecycle
- Document Index Orchestration
- RustFS File Storage
- Email Activation Tokens
- Knowledge Graph Construction
- MongoDB Administration Services
- Langfuse Experiment Tracing
- Authenticated Controller Modules
- Public Authentication Endpoints
- Graph Access Endpoints
- RustFS Container Settings
- Role Permission Constants
- Document Search Operations
- PowerPoint Document Parsing
- Project Command Scripts
- Authentication Request Types
- MinerU Archive Processing
- File Upload Parsing
- Document Retrieval Design
- Password Reset Workflow
- Graph Query Types
- Team Request Types
- Container Service Network
- Container Health Checks
- Application Setup History
- MinerU Remote Parsing
- Redis Administration Services
- MongoDB Container Settings
- PostgreSQL Container Settings
- Embedding Generation Service
- Application Health Endpoint
- Review Request Types
- Document Share Operations
- Conversation Retrieval Fixtures
- PgAdmin Container Settings
- RabbitMQ Container Settings
- Jest Test Configuration
- Document Query Validation
- Kibana Container Settings
- Database Planning History
- Package Build Permissions
- TypeScript Build Configuration
- Chat Request Validation
- RAG Request Validation
- Registration Email Delivery
- Category Entity Persistence
- Search Request Validation
- Elasticsearch Container Settings
- Neo4j Container Settings
- Oxlint Rule Configuration
- Plain Text Parsing
- User Creation Validation
- User Query Validation
- Afforestation Hydrology Research
- Conversation Memory Design
- RAG Resume Examples
- Agent Resume Examples
- Nest Build Configuration
- Chat Session Entity
- Document Chunk Generation
- Snowflake Identifier Types
- Application Integration Tests
- JWT Authentication Guard
- Upload Request Validation
- Document Comment Entity
- Document Favorite Entity
- Document Like Entity
- Document Review Entity
- Document Share Entity
- Document Version Entity
- Notification Persistence Entity
- User Update Validation
- Production Release Policy
- Elasticsearch Search Dependencies
- Document Storage Design
- Permission Enforcement Guard
- Attendance Sample Schema
- LangChain Package Dependency
- Langfuse Telemetry Dependency
- OpenTelemetry SDK Dependency
- Passport Package Dependency
- PostgreSQL Driver Dependency
- UUID Package Dependency
- Global Types Dependency
- Nest CLI Dependency
- AMQP Types Dependency
- Express Types Dependency
- Multer Types Dependency
- PostgreSQL Types Dependency
- TypeScript ESLint Dependency
- Incremental Build Repair

## God Nodes (most connected - your core abstractions)
1. `AuthUser` - 115 edges
2. `@nestjs/common` - 81 edges
3. `RequirePermission()` - 74 edges
4. `CurrentUser` - 56 edges
5. `typeorm` - 35 edges
6. `Roles()` - 35 edges
7. `nextSnowflakeId()` - 35 edges
8. `UserService` - 34 edges
9. `DocumentEntity` - 31 edges
10. `DocumentService` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Deep Research Multi-Agent Assistant` --semantically_similar_to--> `ERP Procurement Multi-Agent System`  [INFERRED] [semantically similar]
  graphify-out/converted/梁多强_Agent开发_17601230573_d7e07042.md → test-files/李先生_28岁_76761.pdf
- `Vector Keyword Graph Retrieval` --semantically_similar_to--> `Multimodal RAG Retrieval`  [INFERRED] [semantically similar]
  graphify-out/converted/梁多强_Agent开发_17601230573_d7e07042.md → test-files/李先生_28岁_76761.pdf
- `SQLGlot Execution Guard` --semantically_similar_to--> `Financial Agent Human Approval`  [INFERRED] [semantically similar]
  graphify-out/converted/梁多强_Agent开发_17601230573_d7e07042.md → test-files/李先生_28岁_76761.pdf
- `Upload and parse document` --conceptually_related_to--> `DocumentController`  [INFERRED]
  curl-document-status.md → src/document/document.controller.ts
- `POST /ai/chat retrieval and generation` --conceptually_related_to--> `AiChatService`  [INFERRED]
  curl-rag.md → src/ai/ai-chat.service.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Published-document indexing fan-out** — src_doc_instructions_review_workflow, src_doc_instructions_rabbitmq_pipeline, src_doc_instructions_rag_index, src_doc_instructions_fulltext_index, src_doc_instructions_knowledge_graph [EXTRACTED 1.00]
- **Memory and retrieval answer context** — src_doc_instructions_short_term_memory, src_doc_instructions_long_term_memory, src_doc_instructions_hybrid_retrieval [EXTRACTED 1.00]
- **Agent experiment quality dimensions** — src_doc_instructions_langfuse_evaluation, src_doc_instructions_retrieval_metrics, src_doc_instructions_answer_metrics, src_doc_instructions_agentic_rag [EXTRACTED 1.00]
- **Approval controlled document visibility** — curl_document_status_draft, curl_document_status_pendingreview, curl_document_status_published, curl_document_status_index_lifecycle [EXTRACTED 1.00]
- **Cross-document release and incident role validation** — curl_rag_canary_document, curl_rag_incident_document, curl_rag_role_disambiguation, curl_rag_chat_endpoint [EXTRACTED 1.00]
- **Published document dual search indexes** — curl_read_publication_search_flow, curl_read_message_pipeline, curl_read_elasticsearch_search, curl_read_neo4j_search [EXTRACTED 1.00]
- **Hydrologic Attribution and Validation** — test_files_example_climate_adjustment, test_files_example_flow_duration_curve, test_files_example_ten_catchments, test_files_example_model_efficiency, test_files_example_zero_flow_days [EXTRACTED 1.00]
- **Production Release Control Lifecycle** — test_files_02_production_release_sop_preflight, test_files_02_production_release_sop_canary, test_files_02_production_release_sop_monitoring, test_files_02_production_release_sop_rollback [EXTRACTED 1.00]

## Communities (130 total, 56 thin omitted)

### Community 0 - "Role Permission Management"
Cohesion: 0.05
Nodes (9): CreateRoleDto, UpdateRoleDto, CreatePermissionDto, QueryPermissionDto, UpdatePermissionDto, PermissionController, PermissionService, RoleController (+1 more)

### Community 1 - "Document Review Lifecycle"
Cohesion: 0.08
Nodes (4): DocumentReviewService, DocumentService, DocumentVersionService, DocumentPipelinePublisher

### Community 2 - "RabbitMQ Message Pipeline"
Cohesion: 0.09
Nodes (23): amqplib, DocumentPipelineConsumer, KgBuildMessage, KgBuildType, ReindexMessage, ReindexType, SearchIndexMessage, SearchIndexType (+15 more)

### Community 3 - "Runtime Package Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, amqp-connection-manager@^5.0.0, amqplib@^2.0.1, @aws-sdk/client-s3@^3.1090.0, class-transformer@^0.5.1, class-validator@^0.15.1, ioredis@^5.11.1, @langchain/core@^1.2.9 (+35 more)

### Community 4 - "Document Access Infrastructure"
Cohesion: 0.11
Nodes (20): nextSnowflakeId(), snowflake, canReadDocument(), canWriteDocument(), canArchive(), canEditContent(), canPublishFrom(), canSubmitReview() (+12 more)

### Community 5 - "User Persistence Modules"
Cohesion: 0.08
Nodes (10): bcryptjs@^3.0.3, bcryptjs, @nestjs/typeorm, ADMIN_OPERATION_PERMISSIONS, ADMIN_ROLES, PermissionEntity, RoleEntity, RolePermissionEntity (+2 more)

### Community 6 - "Development Tool Dependencies"
Cohesion: 0.05
Nodes (41): devDependencies, eslint@^9.18.0, eslint-config-prettier@^10.0.1, @eslint/eslintrc@^3.2.0, @eslint/js@^9.18.0, eslint-plugin-prettier@^5.2.2, jest@^30.0.0, @nestjs/schematics@^11.0.0 (+33 more)

### Community 7 - "Document Social Engagement"
Cohesion: 0.13
Nodes (4): AuthUser, DocumentEngagementController, FavoriteController, DocumentSocialService

### Community 8 - "PostgreSQL Initialization Schema"
Cohesion: 0.10
Nodes (34): idx_kh_ai_message_session_id, idx_kh_ai_session_user_updated, idx_kh_category_parent, idx_kh_comment_document, idx_kh_document_favorite_user, idx_kh_document_review_document_id, idx_kh_document_review_pending, idx_kh_document_share_document (+26 more)

### Community 9 - "Streaming Chat Orchestration"
Cohesion: 0.10
Nodes (8): AiStreamService, lastUserText(), titleFromQuestion(), ChatLongMemoryService, ChatSessionService, titleFromQuestion(), HybridRetrievalService, WebSearchService

### Community 10 - "Document Category Management"
Cohesion: 0.10
Nodes (4): CategoryController, CategoryService, CreateCategoryDto, UpdateCategoryDto

### Community 12 - "Publication API Examples"
Cohesion: 0.08
Nodes (25): Direct publication example, Elasticsearch kh_chunk inspection, Markdown chunks to kh_chunk dense vectors, Document CRUD API examples, DOCUMENT_REQUIRE_APPROVAL bypass, Archived status 2, Draft status 0, JWT and reviewer authorization (+17 more)

### Community 13 - "Conversation Memory Modules"
Cohesion: 0.13
Nodes (12): @langchain/core, @langchain/openai, @nestjs/config, ChatOptions, ChatResult, AiModule, LongMemoryHits, memorySchema (+4 more)

### Community 14 - "Document Permission Endpoints"
Cohesion: 0.18
Nodes (3): CurrentUser, RequirePermission(), DocumentController

### Community 15 - "Notification Delivery Management"
Cohesion: 0.08
Nodes (3): NotificationController, BroadcastNotificationDto, NotificationService

### Community 16 - "Authentication Module Dependencies"
Cohesion: 0.12
Nodes (15): @nestjs/common, @nestjs/core, @nestjs/jwt, @nestjs-modules/mailer, @nestjs/passport, AuthModule, LoginResult, TokenPayload (+7 more)

### Community 18 - "Request Validation Types"
Cohesion: 0.12
Nodes (6): class-transformer, class-validator, AssignRolesDto, ChangePasswordDto, ResetPasswordDto, UpdateProfileDto

### Community 19 - "AI Package Integrations"
Cohesion: 0.07
Nodes (26): author, ai@^7.0.93, @ai-sdk/langchain@^3.0.93, @langfuse/client@^5.13.0, neo4j-driver@^6.2.0, @nestjs/platform-express@^11.0.1, nodemailer@^9.0.5, passport-jwt@^4.0.1 (+18 more)

### Community 20 - "Markdown Document Parsing"
Cohesion: 0.13
Nodes (21): exceljs@^4.4.0, mammoth@^1.12.0, pdf-parse@^2.4.5, turndown@^7.2.4, exceljs, mammoth, pdf-parse, turndown (+13 more)

### Community 21 - "Document Pipeline Modules"
Cohesion: 0.13
Nodes (9): mongoose, @nestjs/mongoose, DocumentModule, DocumentContent, DocumentContentDocument, DocumentContentSchema, GraphModule, PipelineModule (+1 more)

### Community 22 - "Application Entity Registration"
Cohesion: 0.23
Nodes (6): typeorm, bigintTransformer, ReviewResult, Approved, Rejected, NotificationModule

### Community 23 - "Document Sharing Endpoints"
Cohesion: 0.12
Nodes (4): AccessShareDto, CreateCommentDto, CreateShareDto, ShareController

### Community 24 - "Chat Session Request Types"
Cohesion: 0.11
Nodes (4): ChatStreamDto, CreateSessionDto, QuerySessionDto, UpdateSessionDto

### Community 25 - "Agent Runtime Evaluation"
Cohesion: 0.13
Nodes (18): RetrieveEval, AgentEvalTrace, attachDashScopeReasoning(), excerpt(), formatWebSnippet(), KhUIMessage, lastAssistantText(), mapReasoningStream() (+10 more)

### Community 26 - "RAG Quality Evaluators"
Cohesion: 0.12
Nodes (19): completeness(), completenessSchema, EvalArgs, EvalScore, EvaluatorFn, falseHit(), formatKbContext(), getJudgeLlm() (+11 more)

### Community 27 - "Team Persistence Modules"
Cohesion: 0.11
Nodes (4): TeamEntity, TeamMemberEntity, TeamModule, UserEntity

### Community 28 - "Query Intent Rewriting"
Cohesion: 0.14
Nodes (14): zod, compactRewriteContext(), messageText(), CHAT_INTENTS, ChatQueryRewriteService, distinctQuery(), gradeSchema, INTENT_LABEL (+6 more)

### Community 29 - "Agent Retrieval Contracts"
Cohesion: 0.14
Nodes (13): EMPTY_GRADE, GradedRetrieve, retrieveAndGrade(), RetrieveEvalReason, RetrieveLoopResult, retrieveUntilRelevant(), toEval(), HitGrade (+5 more)

### Community 30 - "Knowledge Entity Extraction"
Cohesion: 0.16
Nodes (15): ExtractionService, buildExtractionSystemPrompt(), ENTITY_TYPE_SET, KG_ENTITY_TYPES, KG_RELATION_TYPES, KgEntityType, kgExtractedEntitySchema, kgExtractedRelationSchema (+7 more)

### Community 32 - "Hybrid Vector Index"
Cohesion: 0.19
Nodes (5): ES_CHUNK_VISIBILITY_FIELDS, esVisibilityFilter(), wrapEsQuery(), DocumentChunk, VectorIndexService

### Community 33 - "TypeScript Compiler Options"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+11 more)

### Community 35 - "Chat Turn Execution"
Cohesion: 0.16
Nodes (6): AiChatService, toEvalHit(), ChatIntent, ChatSource, AiMessageEntity, WebSearchResult

### Community 38 - "RustFS File Storage"
Cohesion: 0.15
Nodes (6): formatDatePath(), guessExt(), RustfsService, sanitizeBaseName(), UploadBytesOptions, StorageModule

### Community 40 - "Knowledge Graph Construction"
Cohesion: 0.23
Nodes (6): DocumentAccessScope, neo4jAccessParams(), neo4jDocumentAccessWhere(), GraphBuildService, GraphChatHit, splitGraphKeywords()

### Community 41 - "MongoDB Administration Services"
Cohesion: 0.12
Nodes (17): mongodb, ME_CONFIG_BASICAUTH_ENABLED, ME_CONFIG_BASICAUTH_PASSWORD, ME_CONFIG_BASICAUTH_USERNAME, ME_CONFIG_MONGODB_ADMINPASSWORD, ME_CONFIG_MONGODB_ADMINUSERNAME, ME_CONFIG_MONGODB_ENABLE_ADMIN, ME_CONFIG_MONGODB_SERVER (+9 more)

### Community 42 - "Langfuse Experiment Tracing"
Cohesion: 0.22
Nodes (13): GoldenExpected, GoldenItem, AGENT_EVALUATORS, GOLDEN_DATASET, evalUser(), logger, main(), bootstrap() (+5 more)

### Community 43 - "Authenticated Controller Modules"
Cohesion: 0.20
Nodes (7): PERMISSIONS_KEY, PermissionCode, PermissionType, Api, Button, Menu, pageOf()

### Community 46 - "RustFS Container Settings"
Cohesion: 0.13
Nodes (15): RUSTFS_ACCESS_KEY, RUSTFS_ADDRESS, RUSTFS_CONSOLE_ADDRESS, RUSTFS_CONSOLE_ENABLE, RUSTFS_CORS_ALLOWED_ORIGINS, RUSTFS_SECRET_KEY, RUSTFS_UNSAFE_BYPASS_DISK_CHECK, RUSTFS_VOLUMES (+7 more)

### Community 47 - "Role Permission Constants"
Cohesion: 0.24
Nodes (5): ROLES_KEY, RolesGuard, RoleCode, RoleCodeValue, AssignPermissionIdsDto

### Community 49 - "PowerPoint Document Parsing"
Cohesion: 0.25
Nodes (13): jszip@^3.10.1, officeparser@^7.3.0, jszip, officeparser, decodeXml(), extractParagraphTexts(), extractPlaceholderTexts(), extractRunsText() (+5 more)

### Community 50 - "Project Command Scripts"
Cohesion: 0.14
Nodes (14): scripts, build, eval:rag, format, lint, start, start:debug, start:dev (+6 more)

### Community 51 - "Authentication Request Types"
Cohesion: 0.23
Nodes (5): LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordByEmailDto, SendResetCodeDto

### Community 52 - "MinerU Archive Processing"
Cohesion: 0.20
Nodes (12): BatchCreated, BatchResult, ExtractItem, IMAGE_CONTENT_TYPES, isImageExtension(), isZipImage(), MineruEnvelope, MineruParseInput (+4 more)

### Community 53 - "File Upload Parsing"
Cohesion: 0.21
Nodes (6): PDF upload and document detail example, RustFS original and embedded image storage, Multi-format upload to Markdown draft, FileParserService, decodeUploadFilename(), titleFromFilename()

### Community 54 - "Document Retrieval Design"
Cohesion: 0.19
Nodes (9): Refusal completeness and groundedness metrics, JWT role and permission guard chain, Redis-backed email activation, Elasticsearch full-document search index, Cypher graph retrieval tool, Keyword vector RRF and reranking, Langfuse agent experiments and evaluation, RAG chunk embedding index (+1 more)

### Community 56 - "Graph Query Types"
Cohesion: 0.39
Nodes (3): GraphOverviewDto, GraphQueryDto, GraphSearchDto

### Community 57 - "Team Request Types"
Cohesion: 0.33
Nodes (3): CreateTeamDto, QueryTeamDto, UpdateTeamDto

### Community 58 - "Container Service Network"
Cohesion: 0.18
Nodes (10): name, networks, default, container_name, image, ports, restart, volumes (+2 more)

### Community 59 - "Container Health Checks"
Cohesion: 0.45
Nodes (11): interval, retries, start_period, test, timeout, healthcheck, healthcheck, healthcheck (+3 more)

### Community 60 - "Application Setup History"
Cohesion: 0.18
Nodes (8): Completed NestJS Observe removal record, Historical pnpm migration plan, MailerModule async configuration fix, NestJS TypeScript starter, NestJS Observe documentation recommendation, pnpm 12.4.2 package management, Build, run and test commands, AppModule

### Community 62 - "Redis Administration Services"
Cohesion: 0.20
Nodes (10): redis, condition, container_name, depends_on, environment, image, ports, restart (+2 more)

### Community 63 - "MongoDB Container Settings"
Cohesion: 0.20
Nodes (10): MONGO_INITDB_DATABASE, MONGO_INITDB_ROOT_PASSWORD, MONGO_INITDB_ROOT_USERNAME, container_name, environment, image, ports, restart (+2 more)

### Community 64 - "PostgreSQL Container Settings"
Cohesion: 0.20
Nodes (10): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, ports, restart (+2 more)

### Community 69 - "Conversation Retrieval Fixtures"
Cohesion: 0.31
Nodes (8): Published and indexed memory test corpus, Production release SOP test fixture, Travel expense policy test fixture, Intent tool loop and retrieval metrics, Business Travel Approval, Invoice Management Rules, Travel Expense Policy 2026, Expense Reimbursement Workflow

### Community 70 - "PgAdmin Container Settings"
Cohesion: 0.22
Nodes (9): PGADMIN_DEFAULT_EMAIL, PGADMIN_DEFAULT_PASSWORD, container_name, depends_on, environment, image, ports, volumes (+1 more)

### Community 71 - "RabbitMQ Container Settings"
Cohesion: 0.22
Nodes (9): RABBITMQ_DEFAULT_PASS, RABBITMQ_DEFAULT_USER, container_name, environment, image, ports, restart, volumes (+1 more)

### Community 72 - "Jest Test Configuration"
Cohesion: 0.22
Nodes (9): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+1 more)

### Community 74 - "Kibana Container Settings"
Cohesion: 0.25
Nodes (8): container_name, depends_on, environment, image, ports, restart, volumes, kibana

### Community 75 - "Database Planning History"
Cohesion: 0.39
Nodes (4): Historical dual-database connection proposal, Proposed MongoClient service, Proposed PostgreSQL Pool service, Historical NestJS dual-database research

### Community 76 - "Package Build Permissions"
Cohesion: 0.25
Nodes (7): allowBuilds, better-sqlite3, core-js, @parcel/watcher, protobufjs, tesseract.js, unrs-resolver

### Community 77 - "TypeScript Build Configuration"
Cohesion: 0.25
Nodes (7): ./tsconfig.json, compilerOptions, rootDir, tsBuildInfoFile, exclude, extends, include

### Community 83 - "Elasticsearch Container Settings"
Cohesion: 0.29
Nodes (7): build, container_name, environment, ports, restart, volumes, es

### Community 84 - "Neo4j Container Settings"
Cohesion: 0.29
Nodes (7): container_name, environment, image, ports, restart, volumes, neo4j

### Community 85 - "Oxlint Rule Configuration"
Cohesion: 0.29
Nodes (6): env, node, rules, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises, $schema

### Community 86 - "Plain Text Parsing"
Cohesion: 0.33
Nodes (5): LOCAL_TEXT_EXTENSIONS, MINERU_EXTENSIONS, ParseInput, SUPPORTED_EXTENSIONS, parsePlainText()

### Community 89 - "Afforestation Hydrology Research"
Cohesion: 0.43
Nodes (5): Flow Duration Curves and Afforestation, Flow Duration Curve, Nash Sutcliffe Model Efficiency, Afforestation Response Groups, Ten Southern Hemisphere Catchments

### Community 91 - "RAG Resume Examples"
Cohesion: 0.40
Nodes (3): Book Chat RAG System, Medical Document RAG System, Multimodal RAG Retrieval

### Community 92 - "Agent Resume Examples"
Cohesion: 0.33
Nodes (4): Conversational BI Dashboard, Deep Research Multi-Agent Assistant, ERP Procurement Multi-Agent System, Financial Agent Human Approval

### Community 93 - "Nest Build Configuration"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 96 - "Snowflake Identifier Types"
Cohesion: 0.33
Nodes (3): snowflake-id, SnowflakeId, SnowflakeIdOptions

### Community 97 - "Application Integration Tests"
Cohesion: 0.40
Nodes (4): @nestjs/testing@^11.0.1, supertest@^7.0.0, @nestjs/testing, supertest

### Community 108 - "Production Release Policy"
Cohesion: 0.50
Nodes (5): Kubernetes Canary Release, Prometheus Grafana Release Monitoring, Release Preflight Checks, Production Release SOP, Helm Rollback Procedure

### Community 109 - "Elasticsearch Search Dependencies"
Cohesion: 0.50
Nodes (3): @elastic/elasticsearch@^8.17.0, @elastic/elasticsearch, ES_DOC_VISIBILITY_FIELDS

### Community 111 - "Document Storage Design"
Cohesion: 0.50
Nodes (3): knowledge_hub database initialization schema, Multi-format documents to Markdown, RustFS original file and image storage

## Knowledge Gaps
- **31 isolated node(s):** `Menu`, `Button`, `Api`, `Draft`, `Published` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 596 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthUser` connect document review, social engagement, streaming chat, and graph access?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **How does `RequirePermission()` connect document endpoints, role management, and graph access?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `Role Permission Management` be split into smaller, more focused modules?**
  _Cohesion score 0.05030181086519115 - nodes in this community are weakly interconnected._
## Extraction notes

Semantic token usage is unavailable from this host agent tool; zero placeholders are not measured token costs.

Skipped: test-files/~$强_Agent开发_17601230573.docx (Office temporary file could not be converted).

`graphify-out/` was written into the Git working tree. Add it to `.gitignore`, or commit only the outputs your team should share.

Graph integrity diagnostics are recorded in `graph_health.json`; collapsed edges can combine multiple relations in the undirected graph.

Health warning: 3 self-loop edges; 326 undirected same-endpoint edges collapsed.
