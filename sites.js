// ============================================================
//  我的导航 - 链接配置（只改这个文件即可，不用动 index.html）
// ============================================================
//  规则：
//  1. internal.categories = 内网环境显示的分类
//  2. external.categories = 外网环境显示的分类
//  3. internalHosts / internalIpPrefixes 用于“按访问网址自动判断”
//     页面会读取自己当前的 hostname：命中内网则显示 internal，
//     否则显示 external。顶部的“切换”按钮可手动覆盖。
//  4. 每个链接：
//     - name：显示名
//     - url：跳转地址
//     - icon（可选）：填 1 个字，会强制显示文字图标
//       不填则尝试自动获取目标网站 favicon，失败自动回退文字首字
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

  // 是否自动获取网站 favicon（国内网络若图标加载慢/失败会自动显示文字图标）
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

  // ---------------- 内网分类 ----------------
  internal: {
    categories: [
      {
        name: "设备",
        links: [
          { name: "NAS",      url: "http://192.168.1.10:5000", icon: "N" },
          { name: "路由器",   url: "http://192.168.1.1",        icon: "R" }
        ]
      },
      {
        name: "服务",
        links: [
          { name: "监控",     url: "http://192.168.1.10:5001", icon: "C" },
          { name: "内网Git",  url: "http://192.168.1.12:3000", icon: "G" },
          { name: "打印机",   url: "http://192.168.1.11",       icon: "P" }
        ]
      }
    ]
  },

  // ---------------- 外网分类 ----------------
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
