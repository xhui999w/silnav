// ============================================================
//  Silnav静航 - 链接配置（只改这个文件即可，不用动 index.html）
//  数据已从 sun-Panel 导入（24 个内网服务 + 1 个外部分类）
// ============================================================
//  规则：
//  1. 页面读取【导航页自身被访问的网址】自动判断内/外网：
//      命中 internalHosts 或 internalIpPrefixes（如 192.168.*）→ 内网模式
//      否则 → 外网模式。普通分类只显示当前环境对应的那一组。
// ============================================================

window.NAV_CONFIG = {
  "title": "Silnav静航",
  "logo": "静",
  "searchEngine": "必应",
  "searchEngines": [
    {
      "name": "百度",
      "url": "https://www.baidu.com/s?wd="
    },
    {
      "name": "必应",
      "url": "https://www.bing.com/search?q="
    },
    {
      "name": "Google",
      "url": "https://www.google.com/search?q="
    }
  ],
  "useFavicon": true,
  "internalHosts": [
    "localhost",
    "127.0.0.1",
    "nas.local",
    "router.local"
  ],
  "internalIpPrefixes": [
    "192.168.",
    "10.",
    "172.16.",
    "172.17.",
    "172.18.",
    "172.19.",
    "172.20.",
    "172.21.",
    "172.22.",
    "172.23.",
    "172.24.",
    "172.25.",
    "172.26.",
    "172.27.",
    "172.28.",
    "172.29.",
    "172.30.",
    "172.31."
  ],
  "internal": {
    "categories": [
      {
        "name": "常用网站",
        "links": [
          {
            "name": "kimi",
            "url": "https://kimi.moonshot.cn"
          },
          {
            "name": "cloudflare",
            "url": "https://dash.cloudflare.com"
          }
        ]
      },
      {
        "name": "搜索",
        "links": [
          {
            "name": "百度",
            "url": "https://www.baidu.com"
          },
          {
            "name": "Bing",
            "url": "https://www.bing.com"
          },
          {
            "name": "谷歌",
            "url": "https://www.google.com"
          }
        ]
      }
    ]
  },
  "external": {
    "categories": [
      {
        "name": "常用网站",
        "links": [
          {
            "name": "kimi",
            "url": "https://kimi.moonshot.cn"
          },
          {
            "name": "cloudflare",
            "url": "https://dash.cloudflare.com"
          }
        ]
      },
      {
        "name": "搜索",
        "links": [
          {
            "name": "百度",
            "url": "https://www.baidu.com"
          },
          {
            "name": "Bing",
            "url": "https://www.bing.com"
          },
          {
            "name": "谷歌",
            "url": "https://www.google.com"
          }
        ]
      }
    ]
  }
};
