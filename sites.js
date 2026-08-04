// ============================================================
//  我的导航 - 链接配置（只改这个文件即可，不用动 index.html）
// ============================================================
//  规则：
//  1. groups.internal  = 内网环境显示的工具
//  2. groups.external  = 外网环境显示的服务
//  3. internalHosts / internalIpPrefixes 用于“按访问网址自动判断”
//     页面会读取自己当前的 hostname：命中内网则显示 internal，
//     否则显示 external。顶部的“切换”按钮可手动覆盖。
// ============================================================

window.NAV_CONFIG = {
  title: "我的导航",
  logo: "导",

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

  groups: {
    // ---------------- 内网工具 ----------------
    internal: [
      { name: "NAS",      url: "http://192.168.1.10:5000", icon: "N" },
      { name: "路由器",   url: "http://192.168.1.1",        icon: "R" },
      { name: "监控",     url: "http://192.168.1.10:5001", icon: "C" },
      { name: "内网Git",  url: "http://192.168.1.12:3000", icon: "G" },
      { name: "打印机",   url: "http://192.168.1.11",       icon: "P" }
    ],

    // ---------------- 外网服务 ----------------
    external: [
      { name: "企业微信", url: "https://work.weixin.qq.com",     icon: "企" },
      { name: "抖音直播", url: "https://creator.douyin.com",     icon: "抖" },
      { name: "小红书",   url: "https://creator.xiaohongshu.com", icon: "红" },
      { name: "闲鱼",     url: "https://www.goofish.com",        icon: "闲" },
      { name: "CRM",      url: "https://www.example-crm.com",    icon: "C" }
    ]
  }
};
