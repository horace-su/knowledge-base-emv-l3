<script setup>
// 全屏 AI 问答页 —— 直连 OpenRouter，使用免费模型（:free）。
// 静态站点无后端，API Key 由用户自行填写并保存在浏览器 localStorage，
// 请求从浏览器直接发往 OpenRouter（其接口支持 CORS）。
// 多会话：会话列表 / 每条会话的消息全部持久化到 localStorage；
// 助手回复用 markdown-it 渲染（html:false，防注入）。
import { ref, computed, nextTick, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const LS_KEY = 'emv-ai-openrouter-key'
const LS_MODEL = 'emv-ai-openrouter-model'
const LS_SESSIONS = 'emv-ai-sessions'
const LS_CURRENT = 'emv-ai-current'

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

// markdown 渲染器：禁用原始 HTML（防注入），开启链接识别与软换行。
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
function renderMd(text) {
  return md.render(text || '')
}

// ---- 状态 ----
const showSettings = ref(false)
const apiKey = ref('')
const model = ref(FREE_MODELS[0].id)
const input = ref('')
const loading = ref(false)
const bodyEl = ref(null)

// sessions: [{ id, title, messages: [{ role, content }], createdAt }]
const sessions = ref([])
const currentId = ref('')

const current = computed(() => sessions.value.find((s) => s.id === currentId.value) || null)
const messages = computed(() => current.value?.messages || [])

// 会话 id：时间戳 + 随机后缀，避免同毫秒碰撞。
function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function persistSessions() {
  try {
    localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions.value))
    localStorage.setItem(LS_CURRENT, currentId.value)
  } catch {
    /* localStorage 满 / 隐私模式禁用，静默忽略 */
  }
}

function createSession(activate = true) {
  const s = { id: newId(), title: '新对话', messages: [], createdAt: Date.now() }
  sessions.value.unshift(s)
  if (activate) currentId.value = s.id
  persistSessions()
  return s
}

function switchSession(id) {
  currentId.value = id
  persistSessions()
  scrollBottom()
}

function renameSession(s) {
  const name = window.prompt('重命名会话', s.title)
  if (name && name.trim()) {
    s.title = name.trim()
    persistSessions()
  }
}

function deleteSession(id) {
  const s = sessions.value.find((x) => x.id === id)
  if (s && s.messages.length && !window.confirm(`删除会话「${s.title}」？此操作不可撤销。`)) return
  sessions.value = sessions.value.filter((x) => x.id !== id)
  if (!sessions.value.length) createSession()
  else if (currentId.value === id) currentId.value = sessions.value[0].id
  persistSessions()
}

// ---- 导入 / 导出（跨设备迁移；API Key 不含在内） ----
const fileInput = ref(null)

function exportSessions() {
  const payload = { v: 1, exportedAt: new Date().toISOString(), sessions: sessions.value }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `emv-ai-sessions-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

async function onImportFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const parsed = JSON.parse(await file.text())
    // 兼容两种格式：{ sessions: [...] } 或裸数组
    const incoming = Array.isArray(parsed) ? parsed : parsed?.sessions
    if (!Array.isArray(incoming) || !incoming.length) throw new Error('未找到会话数据')
    // 规整并重新分配 id，避免与现有会话冲突；追加到列表顶部
    const normalized = incoming
      .filter((s) => s && Array.isArray(s.messages))
      .map((s) => ({
        id: newId(),
        title: (s.title || '导入的对话').slice(0, 40),
        messages: s.messages
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
          .map((m) => ({ role: m.role, content: String(m.content || '') })),
        createdAt: typeof s.createdAt === 'number' ? s.createdAt : Date.now(),
      }))
    if (!normalized.length) throw new Error('会话数据为空或格式不符')
    sessions.value = [...normalized, ...sessions.value]
    currentId.value = normalized[0].id
    persistSessions()
    scrollBottom()
    window.alert(`已导入 ${normalized.length} 个会话。`)
  } catch (err) {
    window.alert(`导入失败：${err.message}`)
  } finally {
    e.target.value = '' // 允许再次选择同一文件
  }
}

onMounted(() => {
  apiKey.value = localStorage.getItem(LS_KEY) || ''
  model.value = localStorage.getItem(LS_MODEL) || FREE_MODELS[0].id

  try {
    const raw = localStorage.getItem(LS_SESSIONS)
    const parsed = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed) && parsed.length) sessions.value = parsed
  } catch {
    /* 损坏的存储，忽略并新建 */
  }
  if (!sessions.value.length) createSession()

  const saved = localStorage.getItem(LS_CURRENT)
  currentId.value = sessions.value.some((s) => s.id === saved) ? saved : sessions.value[0].id

  if (!apiKey.value) showSettings.value = true
  scrollBottom()
})

function saveKey() {
  localStorage.setItem(LS_KEY, apiKey.value.trim())
  localStorage.setItem(LS_MODEL, model.value)
  showSettings.value = false
}

function onModelChange() {
  localStorage.setItem(LS_MODEL, model.value)
}

async function scrollBottom() {
  await nextTick()
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  if (!apiKey.value) {
    showSettings.value = true
    return
  }
  const s = current.value || createSession()
  input.value = ''
  s.messages.push({ role: 'user', content: text })
  // 首条用户消息作为会话标题
  if (s.title === '新对话') s.title = text.slice(0, 24)
  const assistant = { role: 'assistant', content: '' }
  s.messages.push(assistant)
  loading.value = true
  persistSessions()
  scrollBottom()

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
        'HTTP-Referer': location.origin,
      },
      body: JSON.stringify({
        model: model.value,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...s.messages
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
    persistSessions()
    scrollBottom()
  }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="aic">
    <!-- 会话侧栏 -->
    <aside class="aic-side">
      <button class="aic-new" @click="createSession()">＋ 新对话</button>
      <div class="aic-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="aic-item"
          :class="{ active: s.id === currentId }"
          @click="switchSession(s.id)"
        >
          <span class="aic-item-title">{{ s.title || '新对话' }}</span>
          <span class="aic-item-btns">
            <button title="重命名" @click.stop="renameSession(s)">✎</button>
            <button title="删除" @click.stop="deleteSession(s.id)">🗑</button>
          </span>
        </div>
      </div>
      <div class="aic-side-foot">
        <button class="aic-io" title="导出全部会话为 JSON" @click="exportSessions">导出</button>
        <button class="aic-io" title="从 JSON 导入会话" @click="triggerImport">导入</button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="aic-file"
          @change="onImportFile"
        />
      </div>
    </aside>

    <!-- 主区 -->
    <section class="aic-main">
      <header class="aic-head">
        <strong>EMV L3 助手</strong>
        <div class="aic-head-right">
          <select v-model="model" class="aic-model" title="选择免费模型" @change="onModelChange">
            <option v-for="m in FREE_MODELS" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <button class="aic-mini" title="设置 API Key" @click="showSettings = !showSettings">⚙</button>
        </div>
      </header>

      <!-- 设置区 -->
      <div v-if="showSettings" class="aic-settings">
        <p class="aic-hint">
          免费使用 OpenRouter 上的开源模型。请前往
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai/keys</a>
          创建一个 Key（免费额度），仅保存在你本机浏览器，不会上传。
        </p>
        <div class="aic-settings-row">
          <input
            v-model="apiKey"
            type="password"
            class="aic-key"
            placeholder="sk-or-v1-..."
            autocomplete="off"
          />
          <button class="aic-save" @click="saveKey">保存</button>
        </div>
      </div>

      <!-- 消息区 -->
      <div ref="bodyEl" class="aic-body">
        <div v-if="!messages.length" class="aic-empty">
          问我关于 EMV L3 的问题，例如：<br />
          「DE55 里 <code>9F66</code> 各卡组织怎么置位？」<br />
          「CDCVM 在 TVR 上如何体现？」
        </div>
        <div v-for="(m, i) in messages" :key="i" class="aic-msg" :class="m.role">
          <div v-if="m.role === 'assistant'" class="aic-bubble md" v-html="renderMd(m.content || '…')"></div>
          <div v-else class="aic-bubble">{{ m.content }}</div>
        </div>
      </div>

      <!-- 输入区 -->
      <footer class="aic-input">
        <textarea
          v-model="input"
          rows="1"
          placeholder="输入问题，Enter 发送 / Shift+Enter 换行"
          @keydown="onKeydown"
        ></textarea>
        <button class="aic-send" :disabled="loading || !input.trim()" @click="send">
          {{ loading ? '…' : '发送' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.aic {
  display: flex;
  height: calc(100vh - var(--vp-nav-height, 64px));
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

/* 侧栏 */
.aic-side {
  width: 220px;
  flex: none;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.aic-new {
  margin: 12px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
}
.aic-new:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.aic-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
}
.aic-side-foot {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--vp-c-divider);
}
.aic-io {
  flex: 1;
  padding: 6px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}
.aic-io:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.aic-file {
  display: none;
}
.aic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.aic-item:hover {
  background: var(--vp-c-default-soft);
}
.aic-item.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-1);
}
.aic-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.aic-item-btns {
  display: none;
  flex: none;
  gap: 2px;
}
.aic-item:hover .aic-item-btns {
  display: flex;
}
.aic-item-btns button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  color: var(--vp-c-text-2);
}
.aic-item-btns button:hover {
  color: var(--vp-c-brand-1);
}

/* 主区 */
.aic-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
}
.aic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.aic-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.aic-model {
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  max-width: 240px;
}
.aic-mini {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.aic-mini:hover {
  background: var(--vp-c-default-soft);
}

.aic-settings {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.aic-hint {
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 8px;
}
.aic-settings-row {
  display: flex;
  gap: 8px;
}
.aic-key {
  flex: 1;
  box-sizing: border-box;
  padding: 8px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.aic-save {
  flex: none;
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.aic-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.aic-empty {
  margin: auto;
  text-align: center;
  font-size: 14px;
  line-height: 2;
  color: var(--vp-c-text-3);
}
.aic-msg {
  display: flex;
}
.aic-msg.user {
  justify-content: flex-end;
}
.aic-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.aic-msg.user .aic-bubble {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-bottom-right-radius: 3px;
  white-space: pre-wrap;
}
.aic-msg.assistant .aic-bubble {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-bottom-left-radius: 3px;
}

/* markdown 渲染样式 */
.aic-bubble.md :first-child {
  margin-top: 0;
}
.aic-bubble.md :last-child {
  margin-bottom: 0;
}
.aic-bubble.md p {
  margin: 8px 0;
}
.aic-bubble.md ul,
.aic-bubble.md ol {
  margin: 8px 0;
  padding-left: 22px;
}
.aic-bubble.md code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85em;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
}
.aic-bubble.md pre {
  margin: 10px 0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  background: var(--vp-c-bg-alt);
}
.aic-bubble.md pre code {
  padding: 0;
  background: transparent;
}
.aic-bubble.md table {
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 13px;
}
.aic-bubble.md th,
.aic-bubble.md td {
  border: 1px solid var(--vp-c-divider);
  padding: 6px 10px;
}
.aic-bubble.md th {
  background: var(--vp-c-bg-soft);
}
.aic-bubble.md a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}
.aic-bubble.md h1,
.aic-bubble.md h2,
.aic-bubble.md h3 {
  margin: 12px 0 6px;
  font-size: 1.05em;
  font-weight: 600;
}

.aic-input {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}
.aic-input textarea {
  flex: 1;
  resize: none;
  max-height: 160px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
}
.aic-send {
  align-self: flex-end;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.aic-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 窄屏：侧栏收窄 */
@media (max-width: 720px) {
  .aic {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .aic-side {
    width: 132px;
  }
  .aic-bubble {
    max-width: 92%;
  }
}
</style>
