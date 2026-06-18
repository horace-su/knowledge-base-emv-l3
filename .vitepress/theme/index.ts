import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './custom.css'
import Stats from './Stats.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    // 在首页 Hero 之后注入统计数字带
    return h(DefaultTheme.Layout, null, {
      'home-hero-after': () => h(Stats),
    })
  },
} satisfies Theme
