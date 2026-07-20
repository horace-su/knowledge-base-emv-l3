import { defineConfig } from 'vitepress'

// EMV L3 知识库 —— VitePress 站点配置
// 内容文档位于仓库根目录（.md），本配置负责导航 / 侧边栏 / 搜索 / 主题。

// 部署到 GitHub Pages 项目站点时需要子路径 base（如 /knowledge-base-emv-l3/）；
// CI 通过 DOCS_BASE 注入，本地开发默认根路径。
const base = process.env.DOCS_BASE || '/'

// llms.txt / llms-full.txt 是面向 LLM 的静态文件（非页面），由 docs:build
// 从仓库根目录复制进 public/，站点在 base 根路径提供。手动拼 base 避免
// normalizeLink 对 .txt 不加 base 前缀导致的项目子路径 404；target:_blank
// 让浏览器直接下载 / 打开，绕开 SPA 路由拦截。
const llmsTxt = `${base}llms.txt`
const llmsFullTxt = `${base}llms-full.txt`

export default defineConfig({
  lang: 'zh-CN',
  title: 'EMV L3 知识库',

  base,

  description:
    'EMV Level 3（终端集成 / 部署）测试与认证中文知识库 —— 覆盖 FIME 测试工具、Visa / Mastercard / Amex / Discover / JCB / 银联 六大卡组织 L3 认证程序、用例与字节级配置细节。',

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  // web-docs/ 是原始来源 PDF 归档目录（含 PII，已 gitignore，不进入站点）。
  // 文中指向它的链接为本地档案引用，构建时跳过死链检查。
  ignoreDeadLinks: [/web-docs/],

  // 仅渲染知识库正文，排除临时 / 草稿 / 指令文件
  srcExclude: [
    'README.md',
    'CLAUDE.md',
    'Chat.md',
    'Help.md',
    'My project.md',
    'happiness/**',
    'archive/**',
    'temp/**',
    'web-docs/**',
    'node_modules/**',
  ],

  head: [
    ['meta', { name: 'theme-color', content: '#6d5efc' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'EMV L3 知识库' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'EMV Level 3 终端集成 / 认证中文知识库',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: '',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    ],
  ],

  markdown: {
    lineNumbers: true,
    image: { lazyLoading: true },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'EMV L3 知识库',

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    nav: [
      { text: '首页', link: '/' },
      { text: 'AI 助手', link: '/ai-chat' },
      {
        text: '基础概念',
        items: [
          { text: '非接内核 Deep Dive', link: '/01-基础概念/emv-contactless-kernel-deep-dive' },
          { text: '接触与非接 CVM 详解', link: '/01-基础概念/接触与非接CVM详解' },
          { text: 'EMV 免密免签判断流程', link: '/01-基础概念/EMV免密免签判断流程' },
          { text: '终端配置：AID 与 CAPK', link: '/01-基础概念/终端配置-AID与CAPK' },
          { text: 'AID/CAPK 全卡组织参考表', link: '/01-基础概念/AID与CAPK全卡组织参考表' },
          { text: 'TAC/IAC/TVR 决策逻辑', link: '/01-基础概念/TAC-IAC-TVR决策逻辑' },
          { text: 'ODA 证书链字节级', link: '/01-基础概念/ODA证书链字节级' },
          { text: 'EMVCo Kernel 2 V2.11 要点', link: '/01-基础概念/EMVCo-Kernel2-V2.11规范要点' },
          { text: '各内核数据元参考(D-PAS L2)', link: '/01-基础概念/终端配置-各内核数据元参考-DPAS-L2' },
          { text: 'EMVCo L3 测试框架与标准化文件', link: '/01-基础概念/EMVCo-L3测试框架与标准化文件格式' },
        ],
      },
      {
        text: '卡组织专题',
        items: [
          {
            text: 'FIME 测试工具',
            items: [
              { text: 'FIME L3 工具总览', link: '/02-fime测试工具/FIME-L3测试工具深度解析' },
              { text: 'BTT 品牌测试工具', link: '/02-fime测试工具/FIME-BTT-品牌测试工具深度解析' },
              { text: 'BTT .tpp 与测试计划', link: '/02-fime测试工具/FIME-BTT-TPP项目文件与L3测试计划' },
            ],
          },
          {
            text: 'Visa',
            items: [
              { text: 'Global L3 Test Set 与 qVSDC-DM', link: '/04-visa专题/Visa-Global-L3-Test-Set与qVSDC-DM' },
              { text: 'CDET 非接用例细分', link: '/04-visa专题/Visa-CDET非接测试用例细分' },
              { text: 'TTQ/CTQ 与 CDCVM Token', link: '/04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示' },
              { text: 'MC-TSE 配置与 Visa 用例', link: '/04-visa专题/MC-TSE配置项与Visa-L3测试用例' },
            ],
          },
          {
            text: 'Mastercard',
            items: [
              { text: 'M-TIP TSE 配置详解', link: '/05-mastercard专题/M-TIP-TSE配置详解' },
              { text: 'M-TIP 问卷与配置参数', link: '/05-mastercard专题/M-TIP-TSE问卷与终端配置参数' },
              { text: '非接 CVM 机制与 FFI', link: '/05-mastercard专题/Mastercard非接CVM机制与FFI' },
            ],
          },
        ],
      },
      {
        text: '报文层',
        items: [
          { text: 'ISO 8583 报文域全景与 DE22', link: '/06-报文层/ISO8583-报文域全景与POS录入方式' },
          { text: '磁条/接触/非接报文差异对照', link: '/06-报文层/ISO8583-磁条-接触-非接报文差异对照' },
          { text: 'DE55 跨卡组织要求(框架篇)', link: '/06-报文层/ISO8583-字段55-跨卡组织要求' },
          { text: 'DE55 逐标签实现清单(字节级)', link: '/06-报文层/ISO8583-DE55-逐标签实现清单' },
          { text: 'DE55 标签分组速查(勘误篇)', link: '/06-报文层/ISO8583-DE55-标签分组速查' },
          { text: 'APDU/TLV 实测交易走读', link: '/06-报文层/APDU-TLV实测交易流程解读' },
          { text: '收单主机认证与 L3 重测', link: '/06-报文层/收单主机认证与L3重测触发条件' },
          { text: '在线报文与 TLV 解析工具速查', link: '/06-报文层/在线报文与TLV解析工具速查' },
          { text: '冲正报文要求与触发条件', link: '/06-报文层/ISO8583-冲正报文要求与触发条件' },
          { text: 'DE39 应答码与拒绝治理', link: '/06-报文层/ISO8583-DE39应答码与拒绝治理' },
          { text: 'EMV 3-D Secure AReq/ARes', link: '/06-报文层/EMV-3DS-AReq-ARes报文字段与认证结果' },
        ],
      },
      {
        text: 'llms.txt',
        items: [
          { text: 'llms.txt（索引）', link: llmsTxt, target: '_blank', rel: 'noopener' },
          { text: 'llms-full.txt（全文汇编）', link: llmsFullTxt, target: '_blank', rel: 'noopener' },
        ],
      },
    ],

    sidebar: [
      {
        text: '一、基础概念',
        collapsed: false,
        items: [
          { text: '非接内核 Deep Dive', link: '/01-基础概念/emv-contactless-kernel-deep-dive' },
          { text: '接触与非接 CVM 详解', link: '/01-基础概念/接触与非接CVM详解' },
          { text: 'EMV 免密免签判断流程', link: '/01-基础概念/EMV免密免签判断流程' },
          { text: '终端配置：AID 与 CAPK', link: '/01-基础概念/终端配置-AID与CAPK' },
          { text: 'AID 与 CAPK 全卡组织参考表', link: '/01-基础概念/AID与CAPK全卡组织参考表' },
          { text: 'TAC / IAC / TVR 决策逻辑', link: '/01-基础概念/TAC-IAC-TVR决策逻辑' },
          { text: 'ODA 证书链字节级', link: '/01-基础概念/ODA证书链字节级' },
          { text: 'EMVCo Kernel 2 V2.11 规范要点', link: '/01-基础概念/EMVCo-Kernel2-V2.11规范要点' },
          { text: '各内核数据元参考（D-PAS L2）', link: '/01-基础概念/终端配置-各内核数据元参考-DPAS-L2' },
          { text: 'EMVCo L3 测试框架与标准化文件格式', link: '/01-基础概念/EMVCo-L3测试框架与标准化文件格式' },
        ],
      },
      {
        text: '二、FIME 测试工具',
        collapsed: false,
        items: [
          { text: 'FIME L3 测试工具深度解析', link: '/02-fime测试工具/FIME-L3测试工具深度解析' },
          { text: 'FIME-BTT 品牌测试工具', link: '/02-fime测试工具/FIME-BTT-品牌测试工具深度解析' },
          { text: 'BTT .tpp 项目文件与 L3 测试计划', link: '/02-fime测试工具/FIME-BTT-TPP项目文件与L3测试计划' },
        ],
      },
      {
        text: '三、各卡组织 L3 认证要求',
        collapsed: false,
        items: [
          { text: '各卡组织 L3 认证测试要求一览', link: '/03-各卡组织L3认证/各卡组织L3认证测试要求一览' },
          { text: 'Visa 与 Mastercard L3 深度解析', link: '/03-各卡组织L3认证/Visa与Mastercard-L3认证深度解析' },
          { text: 'Amex 与 Discover L3 深度解析', link: '/03-各卡组织L3认证/Amex与Discover-L3认证深度解析' },
          { text: 'JCB 与银联 L3 深度解析', link: '/03-各卡组织L3认证/JCB与银联-L3认证深度解析' },
          { text: 'JCB TCI 测试用例与编号体系', link: '/03-各卡组织L3认证/JCB-TCI测试用例与编号体系' },
          { text: '银联国内：PBOC 3.0 与国密算法', link: '/03-各卡组织L3认证/银联国内-PBOC3.0与国密算法' },
          { text: '银联国际 QuickPass 与 HK/SG CVM', link: '/03-各卡组织L3认证/银联国际-QuickPass-L3配置与HK-SG特殊CVM' },
        ],
      },
      {
        text: '三之二、实测案例',
        collapsed: false,
        items: [
          { text: 'Sunmi T6F10 终端配置剖析', link: '/07-实测案例/L3认证实例-Sunmi-T6F10终端配置剖析' },
        ],
      },
      {
        text: '四、Visa 专题',
        collapsed: false,
        items: [
          { text: 'Visa Global L3 Test Set 与 qVSDC-DM', link: '/04-visa专题/Visa-Global-L3-Test-Set与qVSDC-DM' },
          { text: 'Visa CDET 非接测试用例细分', link: '/04-visa专题/Visa-CDET非接测试用例细分' },
          { text: 'Visa TTQ/CTQ 与 CDCVM Token 化', link: '/04-visa专题/Visa-TTQ-CTQ与CDCVM-Token化指示' },
          { text: 'MC-TSE 配置项与 Visa L3 用例', link: '/04-visa专题/MC-TSE配置项与Visa-L3测试用例' },
        ],
      },
      {
        text: '五、Mastercard 专题',
        collapsed: false,
        items: [
          { text: 'M-TIP TSE 配置详解', link: '/05-mastercard专题/M-TIP-TSE配置详解' },
          { text: 'M-TIP TSE 问卷与终端配置参数', link: '/05-mastercard专题/M-TIP-TSE问卷与终端配置参数' },
          { text: 'Mastercard 非接 CVM 机制与 FFI', link: '/05-mastercard专题/Mastercard非接CVM机制与FFI' },
        ],
      },
      {
        text: '五之二、报文层（主机侧）',
        collapsed: false,
        items: [
          { text: 'ISO 8583 报文域全景与 DE22 / 技术回退', link: '/06-报文层/ISO8583-报文域全景与POS录入方式' },
          { text: 'ISO 8583 报文差异对照：磁条/接触/非接', link: '/06-报文层/ISO8583-磁条-接触-非接报文差异对照' },
          { text: 'DE55 与各卡组织 EMV 数据要求（框架篇）', link: '/06-报文层/ISO8583-字段55-跨卡组织要求' },
          { text: 'DE55 逐标签实现清单（字节级）', link: '/06-报文层/ISO8583-DE55-逐标签实现清单' },
          { text: 'DE55 标签分组速查（必填/条件/专有/响应侧·勘误篇）', link: '/06-报文层/ISO8583-DE55-标签分组速查' },
          { text: 'APDU/TLV 实测交易流程解读', link: '/06-报文层/APDU-TLV实测交易流程解读' },
          { text: '收单主机认证与 L3 重测触发条件', link: '/06-报文层/收单主机认证与L3重测触发条件' },
          { text: '在线报文与 TLV 解析工具速查', link: '/06-报文层/在线报文与TLV解析工具速查' },
          { text: 'ISO 8583 冲正报文要求与触发条件', link: '/06-报文层/ISO8583-冲正报文要求与触发条件' },
          { text: 'ISO 8583 DE39 应答码与拒绝治理', link: '/06-报文层/ISO8583-DE39应答码与拒绝治理' },
          { text: 'EMV 3-D Secure：AReq/ARes 报文字段', link: '/06-报文层/EMV-3DS-AReq-ARes报文字段与认证结果' },
        ],
      },
      {
        text: '面向 LLM（llms.txt）',
        collapsed: false,
        items: [
          { text: 'llms.txt（精选索引）', link: llmsTxt, target: '_blank', rel: 'noopener' },
          { text: 'llms-full.txt（全文汇编）', link: llmsFullTxt, target: '_blank', rel: 'noopener' },
        ],
      },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除查询',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/horace-su/knowledge-base-emv-l3' },
    ],

    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'medium' },
    },

    footer: {
      message:
        '中文知识库 · 内容基于公开 EMVCo / 卡组织规范与脱敏实测资料整理；精确用例号 / 版本请以各卡组织门户最新版为准。',
      copyright: 'EMV Level 3 终端集成与认证知识库',
    },
  },
})
