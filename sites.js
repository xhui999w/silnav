// ============================================================
//  Silnav静航 - 链接配置（只改这个文件即可，不用动 index.html）
//  说明：公网版仅保留 NAS【外网地址】，内网 IP 不公开（安全）。
//        需要内网地址自动切换，请在内网单独部署一份含 internal 的版本。
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
      "external": "https://openlist.example.com"
    },
    {
      "name": "openspeedtest",
      "external": "https://speed.example.com:16888"
    },
    {
      "name": "MoviePilot-V2",
      "external": "https://mp-v2.example.com"
    },
    {
      "name": "CloudDrive2",
      "external": "https://cd2.example.com:16888"
    },
    {
      "name": "Lucky",
      "external": "https://lucky.example.com"
    },
    {
      "name": "Vaultwarden",
      "external": "https://vau.example.com"
    },
    {
      "name": "qbittorrent",
      "external": "https://qb.example.com"
    },
    {
      "name": "emby",
      "external": "https://emby.example.com"
    },
    {
      "name": "飞牛-虚拟机",
      "external": "https://example.net/xhui999w"
    },
    {
      "name": "v2raya",
      "external": "https://v2ray.example.com"
    },
    {
      "name": "taosync",
      "external": "https://taotao.example.com"
    },
    {
      "name": "immich",
      "external": "https://immich.example.com"
    },
    {
      "name": "dockercopilot",
      "external": "https://docker.example.com"
    },
    {
      "name": "Navidrome",
      "external": "https://music1.example.com:1688"
    },
    {
      "name": "transmission",
      "external": "https://tr.example.com"
    },
    {
      "name": "plex",
      "external": "https://plex.example.com:16888"
    },
    {
      "name": "IYUU",
      "external": "https://iyuu.example.com"
    },
    {
      "name": "audiobookshelf",
      "external": "https://audio.example.com:16888"
    },
    {
      "name": "CMS",
      "external": "https://cms.example.com"
    },
    {
      "name": "CloudSaver",
      "external": "https://cs.example.com"
    },
    {
      "name": "ms-go",
      "external": "https://ms.example.com"
    },
    {
      "name": "MDC-NG",
      "external": "https://mdc.example.com"
    },
    {
      "name": "tgto123",
      "external": "https://tg123.example.com"
    },
    {
      "name": "yt-dlp Web UI",
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
