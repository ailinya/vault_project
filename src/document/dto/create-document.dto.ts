
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from '../entities/document.entity';
/** 创建文档 DTO
 * DTO
 * DTO 用来规定“前端可以传什么数据给后端
 * 同时配合使用 class-validator 可以对前端传过来的数据进行验证
 * 例如：前端传过来的数据是一个对象，里面有 title、content、summary、categoryId、teamId、authorId、coverImage、tags、status、remark、isPublic、createBy 等属性
 * DTO 就规定了这些属性的类型和是否可选
 * 
 */
/** 创建文档 */
export class CreateDocumentDto {
  /** 标题 */
  @IsString()
  title: string;

  /** Markdown 正文 */
  @IsString()
  content: string;

  /** 摘要 */
  @IsOptional()
  @IsString()
  summary?: string;

  /** 分类 ID */
  @IsOptional()
  @IsString()
  categoryId?: string;

  /** 团队 ID */
  @IsOptional()
  @IsString()
  teamId?: string;

  /** 作者 ID */
  @IsOptional()
  @IsString()
  authorId?: string;

  /** 封面图 URL */
  @IsOptional()
  @IsString()
  coverImage?: string;

  /** 标签（逗号分隔） */
  @IsOptional()
  @IsString()
  tags?: string;

  /** 状态 */
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  /** 备注 */
  @IsOptional()
  @IsString()
  remark?: string;

  /** 是否公开 */
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  /** 创建人 ID */
  @IsOptional()
  @IsString()
  createBy?: string;
}
