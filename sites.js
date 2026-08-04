// ============================================================
//  Silnav静航 - 链接配置（只改这个文件即可，不用动 index.html）
//  数据已从 sun-Panel 导入（24 个内网服务 + 1 个外部分类）
// ============================================================
//  规则：
//  1. 页面读取【导航页自身被访问的网址】自动判断内/外网：
//      命中 internalHosts 或 internalIpPrefixes（如 192.168.*）→ 内网模式
//      否则 → 外网模式。普通分类只显示当前环境对应的那一组。
//  2. 顶部「NAS」分类始终显示，每个设备填 internal（内网）+ external（外网），
//      点击图标按当前环境自动选地址。
//  3. 自行添加：在任意分类标题上右键 → 快速添加（普通分类单网址，NAS 勾选填双地址）。
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
  "nas": [
    {
      "name": "Openlist",
      "internal": "http://192.168.1.10:5248",
      "external": "https://openlist.example.com"
    },
    {
      "name": "openspeedtest",
      "internal": "http://192.168.1.10:3001",
      "external": "https://speed.example.com:16888"
    },
    {
      "name": "MoviePilot-V2",
      "internal": "http://192.168.1.10:3004",
      "external": "https://mp-v2.example.com"
    },
    {
      "name": "CloudDrive2",
      "internal": "http://192.168.1.10:19798",
      "external": "https://cd2.example.com:16888"
    },
    {
      "name": "Lucky",
      "internal": "http://192.168.1.10:16601",
      "external": "https://lucky.example.com"
    },
    {
      "name": "Vaultwarden",
      "internal": "http://192.168.1.10:3512",
      "external": "https://vau.example.com"
    },
    {
      "name": "qbittorrent",
      "internal": "http://192.168.1.10:8091",
      "external": "https://qb.example.com"
    },
    {
      "name": "emby",
      "internal": "http://192.168.1.10:9096",
      "external": "https://emby.example.com"
    },
    {
      "name": "飞牛-虚拟机",
      "internal": "http://192.168.2.10:8000",
      "external": "https://example.net/xhui999w"
    },
    {
      "name": "v2raya",
      "internal": "http://192.168.1.10:2017",
      "external": "https://v2ray.example.com"
    },
    {
      "name": "taosync",
      "internal": "http://192.168.1.10:8023",
      "external": "https://taotao.example.com"
    },
    {
      "name": "immich",
      "internal": "http://192.168.1.10:2283",
      "external": "https://immich.example.com"
    },
    {
      "name": "dockercopilot",
      "internal": "http://192.168.1.10:12712",
      "external": "https://docker.example.com"
    },
    {
      "name": "Navidrome",
      "internal": "http://192.168.1.10:4533",
      "external": "https://music1.example.com:1688"
    },
    {
      "name": "transmission",
      "internal": "http://192.168.1.10:9091",
      "external": "https://tr.example.com"
    },
    {
      "name": "plex",
      "internal": "http://192.168.1.10:32400",
      "external": "https://plex.example.com:16888"
    },
    {
      "name": "IYUU",
      "internal": "http://192.168.1.10:8780",
      "external": "https://iyuu.example.com"
    },
    {
      "name": "audiobookshelf",
      "internal": "http://192.168.2.11:13378",
      "external": "https://audio.example.com:16888"
    },
    {
      "name": "CMS",
      "internal": "http://192.168.1.10:9527",
      "external": "https://cms.example.com"
    },
    {
      "name": "CloudSaver",
      "internal": "http://192.168.1.10:8008",
      "external": "https://cs.example.com"
    },
    {
      "name": "ms-go",
      "internal": "http://192.168.1.10:8888",
      "external": "https://ms.example.com"
    },
    {
      "name": "MDC-NG",
      "internal": "http://192.168.1.10:9208",
      "external": "https://mdc.example.com"
    },
    {
      "name": "tgto123",
      "internal": "http://192.168.1.10:12366",
      "external": "https://tg123.example.com"
    },
    {
      "name": "yt-dlp Web UI",
      "internal": "http://192.168.1.10:3033",
      "external": "https://yt.example.com"
    }
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
