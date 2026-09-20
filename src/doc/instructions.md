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
