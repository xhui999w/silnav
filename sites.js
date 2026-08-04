// ============================================================
//  我的导航 - 链接配置（只改这个文件即可，不用动 index.html）
// ============================================================
//  规则：
//  1. 页面会读取【导航页自身被访问的网址】自动判断内/外网：
//      命中 internalHosts 或 internalIpPrefixes（如 192.168.*）→ 内网模式
//      否则 → 外网模式
//      → 普通分类只显示当前环境对应的那一组，不做切换、不显示两套。
//  2. 顶部「NAS」分类始终显示，每个设备同时填 internal（内网地址）和
//     external（外网地址）。点击图标时，页面按当前环境自动选对应地址：
//      内网打开 → 走 internal；外网打开 → 走 external。
//  3. 普通分类：
//     - internal.categories = 内网环境下显示的分类
//     - external.categories = 外网环境下显示的分类
//     - 每个链接只填 url（name 显示名，icon 可选填 1 个字强制文字图标）
// ============================================================

window.NAV_CONFIG = {
  title: "我的导航",
  logo: "导",

  // 默认搜索引擎（对应 searchEngines 里的 name）
  searchEngine: "百度",
  searchEngines: [
    { name: "百度",   url: "https://www.baidu.com/s?wd=" },
    { name: "必应",   url: "https://www.bing.com/search?q=" },
    { name: "Google", url: "https://www.google.com/search?q=" }
  ],

  // 是否自动获取网站 favicon（加载慢/失败时自动显示文字图标）
  useFavicon: true,

  // 这些 hostname 一律视为内网（小写匹配）
  internalHosts: [
    "localhost",
    "127.0.0.1",
    "nas.local",
    "router.local"
  ],

  // 以这些前缀开头的 IP 视为内网
  internalIpPrefixes: [
    "192.168.",
    "10.",
    "172.16.", "172.17.", "172.18.", "172.19.", "172.20.",
    "172.21.", "172.22.", "172.23.", "172.24.", "172.25.",
    "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."
  ],

  // ---------------- 顶部 NAS：每个设备内网 + 外网双地址 ----------------
  nas: [
    { name: "NAS 管理",    internal: "http://192.168.1.10:5000", external: "https://nas.example.com" },
    { name: "MoviePilot",  internal: "http://192.168.1.10:8000", external: "https://mp.example.com" },
    { name: "下载管理",    internal: "http://192.168.1.10:8080", external: "https://dl.example.com" },
    { name: "相册",        internal: "http://192.168.1.10:5001", external: "https://photo.example.com" }
  ],

  // ---------------- 内网环境显示的分类 ----------------
  internal: {
    categories: [
      {
        name: "内网服务",
        links: [
          { name: "路由器",   url: "http://192.168.1.1",        icon: "R" },
          { name: "监控",     url: "http://192.168.1.10:5001", icon: "C" },
          { name: "内网Git",  url: "http://192.168.1.12:3000", icon: "G" },
          { name: "打印机",   url: "http://192.168.1.11",       icon: "P" }
        ]
      }
    ]
  },

  // ---------------- 外网环境显示的分类 ----------------
  external: {
    categories: [
      {
        name: "资讯",
        links: [
          { name: "知乎",     url: "https://www.zhihu.com" },
          { name: "小红书",   url: "https://www.xiaohongshu.com" },
          { name: "百度贴吧", url: "https://tieba.baidu.com" },
          { name: "抖音搜索", url: "https://www.douyin.com" }
        ]
      },
      {
        name: "工作",
        links: [
          { name: "企业微信", url: "https://work.weixin.qq.com" },
          { name: "DeepSeek", url: "https://chat.deepseek.com" },
          { name: "CRM",      url: "https://www.example-crm.com" }
        ]
      },
      {
        name: "实用工具",
        links: [
          { name: "百度翻译",   url: "https://fanyi.baidu.com" },
          { name: "QQ邮箱",     url: "https://mail.qq.com" },
          { name: "科学计算器", url: "https://www.calculator.net" }
        ]
      },
      {
        name: "资源",
        links: [
          { name: "Z-Library", url: "https://z-lib.org" },
          { name: "可可影视",  url: "https://www.keke1.app" }
        ]
      }
    ]
  }
};
