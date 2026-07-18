<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { useChat } from '../composables/useChat.js'
import { useConversationsStore } from '../stores/conversations.js'
import { renderMarkdown } from '../utils/chat.js'

const chat = useChat()
const convs = chat.convs
const { models, loadingModels, streaming, error, labelFor, loadModels, send } = chat

const input = ref('')
const scrollRef = ref(null)
const inputEl = ref(null)
const stickToBottom = ref(true)
const mode = ref('text')

const messages = computed(() => convs.messages)
const canSend = computed(() => input.value.trim().length > 0)

async function scrollToBottom(force = false) {
  await nextTick()
  const el = scrollRef.value
  if (el && (force || stickToBottom.value)) el.scrollTop = el.scrollHeight
}

function onScroll() {
  const el = scrollRef.value
  if (el) stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

function autoResize() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 180) + 'px'
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
}

async function onSend() {
  const text = input.value.trim()
  if (!text || streaming.value) return
  if (!convs.active) convs.newConversation(models.value[0]?.id || 'openai')
  input.value = ''
  nextTick(autoResize)
  stickToBottom.value = true
  await send(text)
  scrollToBottom(true)
}

function copyMessage(msg) { navigator.clipboard.writeText(msg.content || '') }

function formatTime(ts) { try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

const suggestions = [
  { title: 'Explain quantum computing', desc: 'Clear overview with analogies', icon: 'fa-solid fa-atom', prompt: 'Explain quantum computing like I am a curious beginner.' },
  { title: 'Generate a landscape image', desc: 'Mountain sunrise scene', icon: 'fa-regular fa-image', prompt: 'Create an image of a mountain sunrise over a misty lake.' },
  { title: 'Write a Vue 3 component', desc: 'Clean code with comments', icon: 'fa-solid fa-code', prompt: 'Write a Vue 3 Composition API counter component with reset.' },
  { title: 'Compose a melody', desc: 'Ambient audio sample', icon: 'fa-solid fa-music', prompt: 'Generate a calm ambient audio loop description and sample.' },
]

function useSuggestion(s) { input.value = s.prompt; nextTick(() => { autoResize(); onSend() }) }

onMounted(async () => { if (!convs.active) convs.newConversation('openai'); if (models.value.length === 0) await loadModels(); nextTick(scrollToBottom) })
</script>

<template>
  <div class="chat-view">
    <div class="messages" ref="scrollRef" @scroll="onScroll">
      <!-- Empty state -->
      <div v-if="messages.length === 0 && !streaming" class="empty-state">
        <div class="logo-mark"><i class="fa-solid fa-sparkles"></i></div>
        <h1>How can I help you today?</h1>
        <p>Multimodal AI assistant — text, images, audio, video, and more via Pollinations.</p>
        <div class="suggestions">
          <button class="suggestion" v-for="s in suggestions" :key="s.title" @click="useSuggestion(s)">
            <div class="s-title"><i :class="s.icon" style="margin-right:6px;opacity:0.8"></i>{{ s.title }}</div>
            <div class="s-desc">{{ s.desc }}</div>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-for="(msg, idx) in messages" :key="msg.id" class="msg-row" :class="msg.role">
        <div class="msg-inner">
          <div class="avatar" :class="{ assistant: msg.role === 'assistant' }">
            <template v-if="msg.role === 'user'">Y</template>
            <template v-else><i class="fa-solid fa-sparkles" style="font-size:14px"></i></template>
          </div>
          <div class="msg-body">
            <div class="msg-meta">
              <span class="msg-role">{{ msg.role === 'user' ? 'You' : 'Pollinations' }}</span>
              <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <div class="msg-content" v-if="msg.content" v-html="renderMarkdown(msg.content)"></div>
            <div v-if="streaming && idx === messages.length - 1 && msg.role === 'assistant' && !msg.content" class="typing">
              <span></span><span></span><span></span>
            </div>
            <div class="msg-actions" v-if="!(streaming && idx === messages.length - 1)">
              <button class="act-btn" @click="copyMessage(msg)" title="Copy"><i class="fa-regular fa-copy"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <div class="composer-wrap">
      <div class="composer">
        <div class="center-stop" v-if="streaming">
          <button class="stop-btn" @click="chat.streaming = false"><i class="fa-solid fa-stop"></i> Stop generating</button>
        </div>
        <div class="input-box">
          <textarea ref="inputEl" v-model="input" placeholder="Message Pollinations…" rows="1" @keydown="onKeydown" @input="autoResize" />
          <div class="input-toolbar">
            <div class="toolbar-left">
              <span class="badge"><i class="fa-solid fa-sparkles"></i> {{ labelFor(convs.active?.model) || 'openai' }}</span>
            </div>
            <div class="toolbar-right">
              <button class="send-btn" :disabled="!canSend || streaming" @click="onSend" title="Send"><i class="fa-solid fa-arrow-up"></i></button>
            </div>
          </div>
        </div>
        <div class="hint">Pollinations can make mistakes. Check important info.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-view { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.messages { flex: 1; overflow-y: auto; scroll-behavior: smooth; }
.messages::-webkit-scrollbar { width: 8px; }
.messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
.empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; text-align: center; gap: 12px; }
.logo-mark { width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(145deg, #10a37f, #0ea5e9); display: grid; place-items: center; font-size: 28px; color: white; box-shadow: 0 12px 40px rgba(16, 163, 127, 0.35); margin-bottom: 8px; }
.empty-state h1 { font-size: 1.75rem; font-weight: 700; margin: 0; color: var(--text); }
.empty-state p { color: var(--text-muted); max-width: 420px; margin: 0 0 12px; }
.suggestions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; width: min(720px, 100%); margin-top: 8px; }
.suggestion { text-align: left; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 14px; padding: 14px; cursor: pointer; color: var(--text); transition: border-color 0.15s, transform 0.15s, background 0.15s; }
.suggestion:hover { border-color: var(--accent); background: var(--bg-hover); transform: translateY(-2px); }
.s-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.s-desc { font-size: 12px; color: var(--text-muted); }
.msg-row { display: flex; justify-content: center; padding: 20px 16px; }
.msg-row.user { background: transparent; }
.msg-row.assistant { background: color-mix(in srgb, var(--bg-panel) 40%, transparent); }
.msg-inner { width: min(820px, 100%); display: flex; gap: 14px; }
.msg-body { flex: 1; min-width: 0; }
.msg-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.msg-role { font-weight: 700; font-size: 14px; }
.msg-time { font-size: 11px; color: var(--text-muted); }
.msg-content { font-size: 15px; line-height: 1.65; word-break: break-word; }
.msg-content :deep(p) { margin: 0 0 0.75em; }
.msg-content :deep(p:last-child) { margin-bottom: 0; }
.msg-content :deep(code.inline) { background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; padding: 1px 6px; font-family: ui-monospace, monospace; font-size: 0.9em; }
.msg-content :deep(.code-block) { background: #0d1117; color: #e6edf3; border-radius: 12px; overflow: hidden; margin: 10px 0; border: 1px solid #30363d; }
.msg-content :deep(.code-header) { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #161b22; color: #8b949e; font-size: 12px; }
.msg-content :deep(.code-header button) { background: transparent; border: none; color: #8b949e; cursor: pointer; }
.msg-content :deep(.code-header button:hover) { color: #fff; }
.msg-content :deep(.code-block pre) { margin: 0; padding: 14px; overflow-x: auto; font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.5; }
.msg-actions { display: flex; gap: 4px; margin-top: 10px; opacity: 0; transition: opacity 0.15s; }
.msg-row:hover .msg-actions { opacity: 1; }
.act-btn { border: none; background: transparent; color: var(--text-muted); cursor: pointer; padding: 6px 8px; border-radius: 8px; font-size: 13px; }
.act-btn:hover { background: var(--bg-hover); color: var(--text); }
.typing { display: inline-flex; gap: 5px; padding: 8px 0; }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); animation: bounce 1.2s infinite ease-in-out; }
.typing span:nth-child(2) { animation-delay: 0.15s; }
.typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
.composer-wrap { padding: 12px 16px 18px; background: linear-gradient(to top, var(--bg-app) 70%, transparent); }
.composer { width: min(820px, 100%); margin: 0 auto; }
.input-box { background: var(--bg-input); border: 1px solid var(--border); border-radius: 18px; padding: 10px 12px; box-shadow: var(--shadow); transition: border-color 0.15s, box-shadow 0.15s; }
.input-box:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow); }
.input-box textarea { width: 100%; border: none; outline: none; resize: none; background: transparent; color: var(--text); font-size: 15px; line-height: 1.5; max-height: 180px; min-height: 28px; font-family: inherit; padding: 4px 4px 8px; }
.input-box textarea::placeholder { color: var(--text-muted); }
.input-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 4px; }
.badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: var(--accent-soft); color: var(--accent); }
.send-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: var(--accent); color: white; cursor: pointer; display: grid; place-items: center; transition: background 0.15s, opacity 0.15s; }
.send-btn:hover { background: var(--accent-hover); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.hint { text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 10px; }
.stop-btn { background: var(--bg-panel); border: 1px solid var(--border); color: var(--text); border-radius: 999px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin: 0 auto 10px; }
.stop-btn:hover { background: var(--bg-hover); }
.center-stop { display: flex; justify-content: center; }
</style>
