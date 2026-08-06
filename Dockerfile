FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY server ./server
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /silnav ./server

FROM alpine:3.21
RUN addgroup -S silnav && adduser -S -G silnav silnav
WORKDIR /app
COPY --from=build /silnav /usr/local/bin/silnav
COPY index.html sites.js ./public/
COPY config/sites.js ./public/config/sites.js
RUN mkdir -p /data && chown -R silnav:silnav /data

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["silnav"]
