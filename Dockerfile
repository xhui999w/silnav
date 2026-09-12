FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY server ./server
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /silnav ./server

FROM alpine:3.21
RUN apk add --no-cache ca-certificates su-exec \
    && addgroup -S -g 1000 silnav \
    && adduser -S -D -H -u 1000 -G silnav silnav
WORKDIR /app
COPY --from=build /silnav /usr/local/bin/silnav
COPY index.html sites.js favicon.svg ./public/
COPY config/sites.js ./public/config/sites.js
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# entrypoint 必须是 LF 换行。
# 在 Windows 上克隆或打包时（core.autocrlf=true），脚本会带上 CR，
# shebang 变成 "#!/bin/sh\r"，内核就会去找不存在的 /bin/sh\r，
# 容器启动直接报：exec /usr/local/bin/docker-entrypoint.sh: no such file or directory
# 这里显式清除 CR，并用 shebang 断言兜底：清不干净就让构建失败，绝不带病发布。
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && grep -q '^#!/bin/sh$' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /data && chown -R silnav:silnav /data

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${SILNAV_PORT:-80}/healthz" || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["silnav"]
