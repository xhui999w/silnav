// ============================================================
//  Silnav静航 - 通用默认配置
//  公开仓库与容器镜像不包含任何个人网址。
//  NAS 部署时可将自己的 sites.js 挂载到容器内覆盖本文件。
// ============================================================
window.NAV_CONFIG = {
  "title": "Silnav静航",
  "logo": "静",
  "searchEngine": "必应",
  "searchEngines": [
    { "name": "百度", "url": "https://www.baidu.com/s?wd=" },
    { "name": "必应", "url": "https://www.bing.com/search?q=" },
    { "name": "Google", "url": "https://www.google.com/search?q=" }
  ],
  "useFavicon": false,
  "internalHosts": ["localhost", "127.0.0.1", "nas.local", "router.local"],
  "internalIpPrefixes": [
    "192.168.", "10.", "172.16.", "172.17.", "172.18.", "172.19.",
    "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
    "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."
  ],
  "nas": [],
  "internal": { "categories": [] },
  "external": { "categories": [] }
};
