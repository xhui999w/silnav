// ============================================================
//  我的导航 - 链接配置（只改这个文件即可，不用动 index.html）
// ============================================================
//  规则：
//  1. 所有分类都在同一界面显示，不再区分内外网模式、没有切换按钮。
//  2. 把 nas:true 的分类放最上面（建议就叫「NAS」），里面的每个设备
//     同时填 internal（内网地址）和 external（外网地址），页面会渲染成
//     「内网 / 外网」两个一键登录按钮，方便随时登录。
//  3. 普通分类（nas 不填或为 false）里的链接只填一个 url。
//  4. 每个链接：
//     - name：显示名
//     - url（普通） / internal + external（NAS）
//     - icon（可选）：填 1 个字，会强制显示文字图标；不填则自动抓 favicon，
//       失败自动回退文字首字
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

  // ---------------- 分类列表（按顺序显示，顶部为 NAS）----------------
  categories: [

    // ===== 顶部 NAS 分类：每个设备带内网 / 外网两个入口 =====
    {
      name: "NAS",
      nas: true,
      links: [
        { name: "NAS 管理",    internal: "http://192.168.1.10:5000", external: "https://nas.example.com" },
        { name: "MoviePilot",  internal: "http://192.168.1.10:8000", external: "https://mp.example.com" },
        { name: "下载管理",    internal: "http://192.168.1.10:8080", external: "https://dl.example.com" },
        { name: "相册",        internal: "http://192.168.1.10:5001", external: "https://photo.example.com" }
      ]
    },

    // ===== 内网（同屏显示）=====
    {
      name: "内网",
      links: [
        { name: "路由器",   url: "http://192.168.1.1",        icon: "R" },
        { name: "监控",     url: "http://192.168.1.10:5001", icon: "C" },
        { name: "内网Git",  url: "http://192.168.1.12:3000", icon: "G" },
        { name: "打印机",   url: "http://192.168.1.11",       icon: "P" }
      ]
    },

    // ===== 外网（同屏显示）=====
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
};
