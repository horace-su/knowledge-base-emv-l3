<script setup>
// 悬浮 AI 问答组件 —— 直连 OpenRouter，使用免费模型（:free）。
// 静态站点无后端，API Key 由用户自行填写并保存在浏览器 localStorage，
// 请求从浏览器直接发往 OpenRouter（其接口支持 CORS）。
import { ref, nextTick, onMounted, watch } from 'vue'

const LS_KEY = 'emv-ai-openrouter-key'
const LS_MODEL = 'emv-ai-openrouter-model'

// OpenRouter 上常见的免费模型（:free 后缀，额度有限、可能随平台调整）。
// 若模型下线，在“设置”里可直接改写为任意 OpenRouter model id。
const FREE_MODELS = [
  { id: 'tencent/hy3:free', name: 'Tencent 混元 Hy3 (free)' },
  { id: 'xiaomi/mimo-v2-flash:free', name: 'MiMo V2 Flash 推理/代码 (free)' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3 (free)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 推理 (free)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (free)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (free)' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (free)' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 (free)' },
]

// 系统提示词：角色 + 知识库地图 + 跨文档不变量 + 书写规范。
// 不变量须与 CLAUDE.md /「一致性核查」保持一致，改文档时同步更新此处。
const SYSTEM_PROMPT = [
  '你是「EMV L3 知识库」的技术助手，服务于收单 / 终端厂商的工程与测试人员。',
  '聚焦 EMV Level 3（终端集成 / 部署）测试与认证，覆盖六大卡组织：Visa、Mastercard、Amex、Discover、JCB、银联(UnionPay)。',
  '',
  '【知识库范围】本库共 40 篇文档，分为六部分，回答时可指引用户去对应主题：',
  '① 基础概念：非接内核(Kernel 2/3/6)与品牌映射、接触/非接 CVM、免密免签判断、AID 与 CAPK、TAC/IAC/TVR 决策、ODA 证书链字节级、EMVCo Kernel 2 V2.11、EMVCo L3 测试框架(L3FIG / 测试卡映像 emvcard.* / 联机响应 emvsim.*)；',
  '② FIME 测试工具：BTT / ASTREX / STP / Card Simulator 等，.tpp 工程包与各卡组织测试计划；',
  '③ 各卡组织 L3 认证：对照总表、Visa/MC、Amex(Expresspay)/Discover(D-PAS)、JCB(TCI/TCI-CL)、银联国内(PBOC 3.0/国密) 与国际(QuickPass)；',
  '④ 实测案例：Sunmi T6F10 终端配置剖析、Visa 非接 59 拒绝 ARC 反解；',
  '⑤ Visa / Mastercard 专题：Visa Global L3 Test Set、CDET、TTQ/CTQ 与 CDCVM Token 化、M-TIP TSE 配置与问卷、MC 非接 CVM 与 FFI；',
  '⑥ 报文层(主机侧)：ISO 8583 报文域全景与 DE22 录入方式/技术回退、磁条/接触/非接差异、DE55 逐标签实现清单与分组速查、APDU/TLV 字节级走读、收单主机认证与 L3 重测触发、冲正(0400/0420)、DE39 应答码与拒绝治理、EMV 3-D Secure。',
  '',
  '【必须遵守的关键事实，不得编造或改写】',
  '- 内核编号：K2 = Mastercard，K3 = Visa，K6 = Discover。',
  '- Visa RID = A000000003。',
  '- Visa Global L3 Test Set 于 2022-07-16 取代 ADVT/CDET。',
  '- 用例数：ADVT 共 29(=22 接触 + 7)，CDET 共 17(=13 + 4)。',
  '- 术语写作：写 M-TIP、D-PAS；裸写 MTIP 仅用于参考号格式内。',
  '',
  '【书写规范】用中文作答，技术术语保留英文(如 CVM、TVR、CDCVM、TLV、ARQC)；EMV TLV 标签一律以十六进制反引号书写，如 `9F66`、`8E`、`9F6E`。',
  '【严谨性】简明准确、面向工程落地。精确的版本号 / 用例编号 / CAPK 索引可能随卡组织门户更新而变化——不确定时请提示"以卡组织门户最新版本为准"，切勿编造；涉及 PII、真实密钥、生产 CAPK 时提示脱敏与安全红线。',
].join('\n')

const open = ref(false)
const showSettings = ref(false)
const apiKey = ref('')
const model = ref(FREE_MODELS[0].id)
const input = ref('')
const loading = ref(false)
const messages = ref([]) // { role: 'user' | 'assistant', content: string }
const bodyEl = ref(null)

onMounted(() => {
  apiKey.value = localStorage.getItem(LS_KEY) || ''
  model.value = localStorage.getItem(LS_MODEL) || FREE_MODELS[0].id
  if (!apiKey.value) showSettings.value = true
})

watch(model, (v) => localStorage.setItem(LS_MODEL, v))

function saveKey() {
  localStorage.setItem(LS_KEY, apiKey.value.trim())
  localStorage.setItem(LS_MODEL, model.value)
  showSettings.value = false
}

async function scrollBottom() {
  await nextTick()
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

function toggle() {
  open.value = !open.value
  if (open.value) scrollBottom()
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  if (!apiKey.value) {
    showSettings.value = true
    return
  }
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  const assistant = { role: 'assistant', content: '' }
  messages.value.push(assistant)
  loading.value = true
  scrollBottom()

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
        'HTTP-Referer': location.origin,
        //'X-Title': 'EMV L3 Knowledge Base',
      },
      body: JSON.stringify({
        model: model.value,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.value
            .filter((m) => m.content)
            .map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    })

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${errText.slice(0, 200)}`)
    }

    // 解析 SSE 流式响应
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const t = line.trim()
        if (!t.startsWith('data:')) continue
        const data = t.slice(5).trim()
        if (data === '[DONE]') continue
        try {
          const json = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            assistant.content += delta
            scrollBottom()
          }
        } catch {
          /* 忽略非 JSON 行（keep-alive 注释等） */
        }
      }
    }
    if (!assistant.content) assistant.content = '（无返回内容）'
  } catch (e) {
    assistant.content = `⚠️ 请求失败：${e.message}\n\n请检查 API Key、所选免费模型是否仍可用（额度 / 下线），或稍后重试。`
  } finally {
    loading.value = false
    scrollBottom()
  }
}

function clearChat() {
  messages.value = []
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="ai-chat">
    <!-- 悬浮触发按钮 -->
    <button
      class="ai-fab"
      :class="{ 'is-open': open }"
      :aria-label="open ? '关闭 AI 助手' : '打开 AI 助手'"
      @click="toggle"
    >
      <span v-if="!open">💬 AI</span>
      <span v-else>✕</span>
    </button>

    <!-- 聊天面板 -->
    <div v-if="open" class="ai-panel">
      <header class="ai-head">
        <div class="ai-title">
          <strong>EMV L3 助手</strong>
          <select v-model="model" class="ai-model" title="选择免费模型">
            <option v-for="m in FREE_MODELS" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
        </div>
        <div class="ai-head-btns">
          <button class="ai-mini" title="清空对话" @click="clearChat">🗑</button>
          <button class="ai-mini" title="设置 API Key" @click="showSettings = !showSettings">⚙</button>
        </div>
      </header>

      <!-- 设置区 -->
      <div v-if="showSettings" class="ai-settings">
        <p class="ai-hint">
          免费使用 OpenRouter 上的开源模型。请前往
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai/keys</a>
          创建一个 Key（免费额度），仅保存在你本机浏览器，不会上传。
        </p>
        <input
          v-model="apiKey"
          type="password"
          class="ai-key"
          placeholder="sk-or-v1-..."
          autocomplete="off"
        />
        <button class="ai-save" @click="saveKey">保存</button>
      </div>

      <!-- 消息区 -->
      <div ref="bodyEl" class="ai-body">
        <div v-if="!messages.length" class="ai-empty">
          问我关于 EMV L3 的问题，例如：<br />
          「DE55 里 9F66 各卡组织怎么置位？」<br />
          「CDCVM 在 TVR 上如何体现？」
        </div>
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="ai-msg"
          :class="m.role"
        >
          <div class="ai-bubble">{{ m.content || '…' }}</div>
        </div>
      </div>

      <!-- 输入区 -->
      <footer class="ai-input">
        <textarea
          v-model="input"
          rows="1"
          placeholder="输入问题，Enter 发送 / Shift+Enter 换行"
          @keydown="onKeydown"
        ></textarea>
        <button class="ai-send" :disabled="loading || !input.trim()" @click="send">
          {{ loading ? '…' : '发送' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ai-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
  height: 48px;
  min-width: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 24px;
  background: var(--vp-c-brand-1, #6d5efc);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  transition: transform 0.15s ease, background 0.15s ease;
}
.ai-fab:hover {
  transform: translateY(-2px);
}
.ai-fab.is-open {
  background: var(--vp-c-gray-1, #64748b);
}

.ai-panel {
  position: fixed;
  right: 24px;
  bottom: 84px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  width: min(400px, calc(100vw - 32px));
  height: min(600px, calc(100vh - 120px));
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.ai-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--vp-c-divider, #e2e2e3);
  background: var(--vp-c-bg-soft, #f6f6f7);
}
.ai-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ai-model {
  font-size: 12px;
  padding: 2px 4px;
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1);
  max-width: 220px;
}
.ai-head-btns {
  display: flex;
  gap: 6px;
}
.ai-mini {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.ai-mini:hover {
  background: var(--vp-c-default-soft, #ececec);
}

.ai-settings {
  padding: 12px;
  border-bottom: 1px solid var(--vp-c-divider, #e2e2e3);
  background: var(--vp-c-bg-soft, #f6f6f7);
}
.ai-hint {
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 8px;
}
.ai-key {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 8px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1);
}
.ai-save {
  margin-top: 8px;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1, #6d5efc);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.ai-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ai-empty {
  margin: auto;
  text-align: center;
  font-size: 13px;
  line-height: 1.8;
  color: var(--vp-c-text-3);
}
.ai-msg {
  display: flex;
}
.ai-msg.user {
  justify-content: flex-end;
}
.ai-bubble {
  max-width: 82%;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.ai-msg.user .ai-bubble {
  background: var(--vp-c-brand-1, #6d5efc);
  color: #fff;
  border-bottom-right-radius: 3px;
}
.ai-msg.assistant .ai-bubble {
  background: var(--vp-c-bg-soft, #f2f2f3);
  color: var(--vp-c-text-1);
  border-bottom-left-radius: 3px;
}

.ai-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid var(--vp-c-divider, #e2e2e3);
  background: var(--vp-c-bg, #fff);
}
.ai-input textarea {
  flex: 1;
  resize: none;
  max-height: 120px;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 10px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1);
  font-family: inherit;
}
.ai-send {
  align-self: flex-end;
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  background: var(--vp-c-brand-1, #6d5efc);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.ai-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
