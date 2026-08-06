# Silnav 静航

极简、快速、无后台的个人网址导航。纯 HTML/CSS/JavaScript，无数据库、无账号系统，适合部署在 NAS、Docker 或 GitHub Pages。

## Docker Compose 安装

公开镜像不包含任何个人网址，支持 `linux/amd64` 和 `linux/arm64`。

```text
ghcr.io/xhui999w/silnav:latest
```

建议使用“目录挂载”，可以避免 Docker 在源文件不存在时误创建同名文件夹：

```yaml
services:
  silnav:
    image: ghcr.io/xhui999w/silnav:latest
    container_name: silnav
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./config:/usr/share/nginx/html/config:ro
```

在 `compose.yml` 同级目录创建 `config` 文件夹，把自己的配置保存为 `config/sites.js`，然后启动：

```bash
mkdir -p config
docker compose pull
docker compose up -d
```

浏览器访问 `http://你的NAS-IP:8080`。挂载的 `config/sites.js` 保存在 NAS 本地，更新或重建容器不会覆盖个人网址。

如果不需要预置配置，可删除 `volumes` 两行，启动后直接在页面中添加网址。

## 主要功能

- 纯静态页面，无后台、数据库和大型依赖
- NAS 网址支持 `internal` 内网地址和 `external` 外网地址
- 自动识别访问环境，也可手动切换内网/外网
- 分类折叠、新增、编辑、删除和本地隐藏
- 配置 JSON 导入、导出及异常数据保护
- 默认首字图标，不批量请求外部服务
- 支持在单个网址的编辑界面手动获取 favicon
- 清亮、深色、暖色三套主题
- 桌面、平板和手机响应式布局

## `sites.js` 配置

公开镜像先加载通用空白配置 `/sites.js`，随后加载可选的私人覆盖配置 `/config/sites.js`。私人文件中的 `NAV_CONFIG` 会覆盖通用配置。

NAS 双地址示例：

```js
window.NAV_CONFIG = {
  nas: [
    {
      name: "MoviePilot",
      internal: "http://192.168.1.100:3000",
      external: "https://movie.example.com"
    }
  ]
};
```

普通分类示例：

```js
window.NAV_CONFIG = {
  external: {
    categories: [
      {
        name: "常用网站",
        links: [{ name: "示例", url: "https://example.com" }]
      }
    ]
  }
};
```

主要字段：

- `title` / `logo`：页面标题和左上角标识
- `searchEngine` / `searchEngines`：默认搜索引擎和可选引擎
- `internalHosts` / `internalIpPrefixes`：内网环境识别规则
- `nas`：支持内外网双地址的 NAS 入口
- `internal.categories` / `external.categories`：不同网络环境的普通分类
- `icon`：可选图片地址或 Data URL；留空时显示名称首字

## Docker 命令安装

```bash
docker run -d \
  --name silnav \
  --restart unless-stopped \
  -p 8080:80 \
  -v /你的NAS路径/config:/usr/share/nginx/html/config:ro \
  ghcr.io/xhui999w/silnav:latest
```

## 数据与隐私

- 公开仓库和容器镜像不包含作者的个人网址、内网 IP 或端口
- 页面内新增和修改的数据默认保存在当前浏览器 `localStorage`
- 使用导出功能可以备份或迁移浏览器中的本地配置
- NAS 上的私人 `config/sites.js` 建议只读挂载，不要提交到公开仓库

## 其他部署方式

项目只有静态文件，也可直接部署到任意静态服务器或 GitHub Pages。此时若不需要私人覆盖文件，保留仓库中的空白 `config/sites.js` 即可。
