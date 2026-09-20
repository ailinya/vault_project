# 官方 ES 基础镜像
FROM elasticsearch:8.17.0

# 使用构建上下文中的本地 IK 分词压缩包，避免构建时访问外网
COPY --chown=elasticsearch:root elasticsearch-analysis-ik-8.17.0.zip /tmp/elasticsearch-analysis-ik-8.17.0.zip
RUN elasticsearch-plugin install --batch \
    file:///tmp/elasticsearch-analysis-ik-8.17.0.zip \
    && rm -f /tmp/elasticsearch-analysis-ik-8.17.0.zip
