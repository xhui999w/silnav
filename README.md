# Silnav 静航

极简、快速的个人网址导航。前端保持纯 HTML/CSS/JavaScript，无数据库、无账号系统；Docker 版附带一个轻量配置接口，用于把拖动排序保存到 NAS。

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
    # 可选：取消注释后，首次保存排序需要输入令牌
    # environment:
    #   SILNAV_ADMIN_TOKEN: "请改成自己的长随机令牌"
    volumes:
      - ./config:/config:ro
      - ./data:/data
```

在 `compose.yml` 同级目录创建 `config` 和 `data` 文件夹，把自己的配置保存为 `config/sites.js`。如果页面会被不受信任的人访问，建议取消注释并设置管理令牌：

```bash
mkdir -p config data
docker compose pull
docker compose up -d
```

浏览器访问 `http://你的NAS-IP:8080`。挂载的 `config/sites.js` 和 `data/order.json` 保存在 NAS 本地，更新或重建容器不会覆盖个人网址和排序。

为兼容旧版 Compose，镜像也会自动读取旧路径 `/usr/share/nginx/html/config/sites.js`；建议仍使用上面的新路径，以同时持久化拖动排序。

如果不需要预置配置，可删除 `volumes` 两行，启动后直接在页面中添加网址。

## 主要功能

- 静态前端，无数据库和大型依赖
- NAS 网址支持 `internal` 内网地址和 `external` 外网地址
- 自动识别访问环境，也可手动切换内网/外网
- 分类折叠、新增、编辑、删除和本地隐藏
- 配置 JSON 导入、导出及异常数据保护
- 默认首字图标，不批量请求外部服务
- 支持在单个网址的编辑界面手动获取 favicon
- 本地图标自动缩放压缩，Base64 数据不进入文本框，避免移动端编辑卡顿
- 编辑模式下支持拖动网址排序；桌面和手机均可直接拖动，手机长按也可启动
- Docker 版将排序写入 NAS，所有设备共享同一顺序
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
  -v /你的NAS路径/config:/config:ro \
  -v /你的NAS路径/data:/data \
  ghcr.io/xhui999w/silnav:latest
```

需要令牌保护时，在命令中额外加入 `-e SILNAV_ADMIN_TOKEN='请改成自己的长随机令牌'`。

## 数据与隐私

- 公开仓库和容器镜像不包含作者的个人网址、内网 IP 或端口
- 页面内新增和修改的数据默认保存在当前浏览器 `localStorage`
- 使用导出功能可以备份或迁移浏览器中的本地配置
- NAS 上的私人 `config/sites.js` 建议只读挂载，不要提交到公开仓库
- 拖动排序保存在 `data/order.json`；设置 `SILNAV_ADMIN_TOKEN` 后写入接口受令牌保护，不设置则直接保存

## 其他部署方式

前端文件仍可部署到任意静态服务器或 GitHub Pages，但静态部署无法把拖动排序写回服务器；Docker 部署才支持 NAS 持久化排序。
