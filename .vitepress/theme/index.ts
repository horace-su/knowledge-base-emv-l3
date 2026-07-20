import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './custom.css'
import Stats from './Stats.vue'
import AiChat from './AiChat.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    // 在首页 Hero 之后注入统计数字带
    return h(DefaultTheme.Layout, null, {
      'home-hero-after': () => h(Stats),
    })
  },
  // 全局注册 AiChat，供 /chat 独立页面（chat.md）使用
  enhanceApp({ app }) {
    app.component('AiChat', AiChat)
  },
} satisfies Theme
