# 我的导航 (nav-site)

极简网址导航，纯静态（单个 `index.html` + `sites.js`），无需后端，可挂 GitHub Pages / 内网 NAS。

## 特点
- 内网、外网链接**同屏显示**，无需切换
- 顶部「NAS」分类：每个设备带「内网 / 外网」两个一键登录入口
- 自动抓网站 favicon，失败回退文字图标
- 搜索框：输入实时过滤链接，回车用当前引擎搜网页（按钮切换 百度/必应/Google）
- 分类可点击折叠，状态自动记住

## 使用
只需编辑 `sites.js`：

- `categories` 是分类数组，按顺序显示，**第一个建议放 NAS**
- **NAS 分类**：加 `nas: true`，每个设备填 `internal`（内网地址）+ `external`（外网地址）
  ```js
  { name: "NAS", nas: true, links: [
    { name: "NAS 管理", internal: "http://192.168.1.10:5000", external: "https://nas.example.com" }
  ]}
  ```
- **普通分类**：每个链接只填 `url`
  ```js
  { name: "资讯", links: [ { name: "知乎", url: "https://www.zhihu.com" } ] }
  ```
- `icon`（可选）：填 1 个字强制显示文字图标；不填自动抓 favicon

## 部署
- 外网：GitHub → 仓库 Settings → Pages → 选 `main` 分支
- 内网：把文件夹丢到 NAS / 内网服务器即可

两份部署同一份文件即可，无需区分。
