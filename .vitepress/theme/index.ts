import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './custom.css'
import Stats from './Stats.vue'
import AiChat from './AiChat.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    // 在首页 Hero 之后注入统计数字带；全站右下角注入悬浮 AI 助手
    return h(DefaultTheme.Layout, null, {
      'home-hero-after': () => h(Stats),
      'layout-bottom': () => h(AiChat),
    })
  },
} satisfies Theme
