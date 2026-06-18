<script setup>
// 首页 Hero 下方统计带；数字与实际文档/覆盖一致
const stats = [
  { num: '31', unit: '篇', label: '深度文档', desc: '字节级实战' },
  { num: '6', unit: '大', label: '国际卡组织', desc: '全覆盖' },
  { num: '10', unit: '套', label: 'FIME L3 工具', desc: 'BTT / ASTREX…' },
  { num: '5', unit: '篇', label: '报文层专篇', desc: 'DE55 / ISO 8583' },
]
</script>

<template>
  <div class="emv-stats">
    <div class="emv-stats-inner">
      <div v-for="s in stats" :key="s.label" class="emv-stat">
        <div class="emv-stat-num">
          {{ s.num }}<span class="emv-stat-unit">{{ s.unit }}</span>
        </div>
        <div class="emv-stat-label">{{ s.label }}</div>
        <div class="emv-stat-desc">{{ s.desc }}</div>
      </div>
    </div>
  </div>
</template>
