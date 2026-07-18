import { defineStore } from 'pinia'
import { makeMessage } from '../utils/chat.js'

const STORAGE_KEY = 'pollinations-conversations'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    list: load(),
    activeId: load()[0]?.id || null,
  }),
  getters: {
    active: (s) => s.list.find((c) => c.id === s.activeId) || null,
    ordered: (s) => [...s.list].sort((a, b) => b.updatedAt - a.updatedAt),
    messages: (s) => {
      const c = s.list.find((x) => x.id === s.activeId)
      return c ? c.messages : []
    },
  },
  actions: {
    _save() { persist(this.list) },
    newConversation(model = 'openai', systemPrompt = '') {
      const id = crypto.randomUUID()
      const conv = {
        id,
        title: 'New chat',
        model,
        systemPrompt,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      this.list.unshift(conv)
      this.activeId = id
      this._save()
      return conv
    },
    select(id) { this.activeId = id },
    rename(id, title) {
      const c = this.list.find((x) => x.id === id)
      if (c) { c.title = title; this._save() }
    },
    remove(id) {
      this.list = this.list.filter((c) => c.id !== id)
      if (this.activeId === id) this.activeId = this.list[0]?.id || null
      this._save()
    },
    clearMessages() {
      const c = this.active
      if (c) { c.messages = []; c.title = 'New chat'; c.updatedAt = Date.now(); this._save() }
    },
    addMessage(role, content, extra = {}) {
      const c = this.active
      if (!c) return
      const msg = makeMessage(role, content, extra)
      c.messages.push(msg)
      if (c.messages.length === 1 && role === 'user') c.title = content.slice(0, 42)
      c.updatedAt = Date.now()
      this._save()
      return msg
    },
    appendToMessage(msgId, delta) {
      const c = this.active
      if (!c) return
      const msg = c.messages.find((m) => m.id === msgId)
      if (msg) msg.content += delta
      c.updatedAt = Date.now()
    },
    finalizeStream() { this._save() },
  },
})
