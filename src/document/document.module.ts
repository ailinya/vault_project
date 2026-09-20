import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import {
  DocumentContent,
  DocumentContentSchema,
} from './schemas/document-content.schema';
import { FileParserService } from './parser/file-parser.service';
/**
 * 是一个 NestJS 的模块类，负责组织文档相关的服务和控制器。
 * - 导入 Mongoose 模块，注册 DocumentContent 的 schema
 * - 提供 DocumentService 服务
 * 声明它需要哪些数据库模型、由谁接收请求、由谁处理业务，以及允许其他模块使用哪些服务
 * 
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentContent.name, schema: DocumentContentSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, FileParserService],
  exports: [DocumentService, FileParserService]
})
export class DocumentModule {}
