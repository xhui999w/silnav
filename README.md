# Silnav静航

极简网址导航，纯静态（单个 `index.html` + `sites.js`），无需后端，可挂 GitHub Pages / 内网 NAS。

> 数据可从 sun-Panel 等来源导入，支持内网 / 外网分组。

## 特点
- **按访问地址自动切换内/外网**：页面读取自身被访问的网址（内网 IP 段 → 内网模式，否则外网模式），自动显示对应那一组链接，无切换按钮、不同时显示两套
- 支持 NAS 设备双地址（内网 + 外网），点击图标按当前环境自动选地址（内网打开走内网、外网打开走外网）—— 仅在私有 / 内网部署时配置使用
- 自动抓网站 favicon（多源容错：iowen.cn / favicon.im / DuckDuckGo / Google 依次兜底，适配国内网络），失败回退文字图标；内网 IP 无图标，自动显示文字首字
- 搜索框：输入实时过滤链接，回车用当前引擎搜网页（按钮切换 百度/必应/Google，默认 **必应**）
- 顶部带「搜索」分类（百度 / Bing / 谷歌），内外网模式均显示，一键直达
- 分类可点击折叠，状态自动记住

## 使用
- **右键分类快速添加**：在任意分类标题上**右键** → 直接弹出「添加网址」并**自动选中该分类**（填网址即可）；链接上「×」可删。链接存浏览器本地，图标自动抓。
- **高级 / 批量**：直接编辑 `sites.js`：

- `title` / `logo`：页面标题与左上角图标文字
- `searchEngine`：默认搜索引擎名（对应 `searchEngines` 里的 `name`，默认「必应」）
- `internalHosts` / `internalIpPrefixes`：哪些网址算内网（导航页自身被访问时用来判断）
- `nas`（可选，仅私有 / 内网部署使用）：顶部 NAS 设备，每个填 `internal`（内网地址）+ `external`（外网地址）
  ```js
  { "name": "MoviePilot-V2", "internal": "http://192.168.1.100:3004", "external": "https://mp-v2.example.com" }
  ```
- `internal.categories` / `external.categories`：各自环境下显示的普通分类（含「搜索」分类，每个链接填 `url`）
- `icon`（可选）：填 1 个字强制显示文字图标；不填自动抓 favicon

## 从 sun-Panel 导入
`sites.js` 中的链接由 sun-Panel 的 SQLite 数据库（`item_icon_group` 分组 + `item_icon` 网址，`deleted_at` 为空视为有效）导出：
- 同时带内网(`lan_url`)与外网(`url`)的 homelab 服务 → 导入为顶部 NAS（双地址）
- 纯外网网址 → 导入为对应分组分类（如「常用网站」）

## 部署
- 内网和外网各部署一份同一份文件：
  - **内网**：NAS / 内网服务器（如 `http://192.168.1.100:9999`）→ 打开自动内网模式
  - **外网**：GitHub Pages 或公网域名 → 打开自动外网模式

> 只部署一边也完全能用，只是那一边只显示对应环境的分类。
