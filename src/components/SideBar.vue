<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConversationsStore } from '../stores/conversations.js'
import { useSettingsStore } from '../stores/settings.js'
import { useSidebar } from '../composables/useSidebar.js'

const router = useRouter()
const route = useRoute()
const convs = useConversationsStore()
const settings = useSettingsStore()

const { sidebarOpen, isMobile, close } = useSidebar()

const navItems = [
  { path: '/', icon: 'fa-solid fa-comment', label: 'Chat' },
  { path: '/image', icon: 'fa-regular fa-image', label: 'Image' },
  { path: '/video', icon: 'fa-solid fa-video', label: 'Video' },
  { path: '/audio', icon: 'fa-solid fa-music', label: 'Audio' },
  { path: '/3d', icon: 'fa-solid fa-cube', label: '3D' },
  { path: '/realtime', icon: 'fa-solid fa-waveform', label: 'Voice' },
  { path: '/embeddings', icon: 'fa-solid fa-vector-square', label: 'Embeddings' },
  { path: '/settings', icon: 'fa-solid fa-gear', label: 'Settings' },
]

function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d.getTime() }
const todayChats = computed(() => convs.ordered.filter(c => c.updatedAt >= startOfToday()))
const olderChats = computed(() => convs.ordered.filter(c => c.updatedAt < startOfToday()))

function newChat() { convs.newConversation(); if (route.path !== '/') router.push('/') }
function selectChat(id) { convs.select(id); if (route.path !== '/') router.push('/'); if (isMobile.value) sidebarOpen.value = false }
function deleteChat(id) { convs.remove(id) }
function navigate(path) { router.push(path); if (isMobile.value) close() }

const userInitials = computed(() => { const n = 'You'; return n.split(/\s+/).map(p => p[0]).join('').slice(0,2).toUpperCase() || 'Y' })
</script>

<template>
  <div class="mobile-overlay" :class="{ show: sidebarOpen && isMobile }" @click="close" />
  <aside class="sidebar" :class="{ collapsed: !sidebarOpen && !isMobile, open: sidebarOpen }">
    <div class="sidebar-header">
      <button class="btn-new" @click="newChat"><i class="fa-solid fa-plus"></i> New chat</button>
      <button class="icon-btn" @click="close" title="Close sidebar"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="chat-list">
      <div v-if="todayChats.length">
        <div class="section-label">Today</div>
        <div v-for="c in todayChats" :key="c.id" class="chat-item" :class="{ active: c.id === convs.activeId }" @click="selectChat(c.id)">
          <i class="fa-regular fa-message" style="opacity:0.6;font-size:13px"></i>
          <span class="title-text">{{ c.title }}</span>
          <button class="del-btn" @click.stop="deleteChat(c.id)"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>
      <div v-if="olderChats.length">
        <div class="section-label">Previous</div>
        <div v-for="c in olderChats" :key="c.id" class="chat-item" :class="{ active: c.id === convs.activeId }" @click="selectChat(c.id)">
          <i class="fa-regular fa-message" style="opacity:0.6;font-size:13px"></i>
          <span class="title-text">{{ c.title }}</span>
          <button class="del-btn" @click.stop="deleteChat(c.id)"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>
      <div v-if="!convs.list.length" class="empty-hint">No conversations yet</div>

      <div class="section-label" style="margin-top:12px">Tools</div>
      <div v-for="n in navItems" :key="n.path" class="chat-item" :class="{ active: route.path === n.path }" @click="navigate(n.path)">
        <i :class="n.icon" style="opacity:0.6;font-size:13px"></i>
        <span class="title-text">{{ n.label }}</span>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-row">
        <div class="avatar">{{ userInitials }}</div>
        <div style="min-width:0;flex:1">
          <div style="font-weight:600;font-size:13px">You</div>
          <div style="font-size:11px;color:var(--text-muted)">Pollinations API</div>
        </div>
        <button class="icon-btn" style="width:34px;height:34px;border:none" @click="settings.setTheme(settings.theme === 'dark' ? 'light' : 'dark')">
          <i :class="settings.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar { width: var(--sidebar-w); min-width: var(--sidebar-w); background: var(--bg-sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 40; }
.sidebar.collapsed { display: none; }
.sidebar-header { padding: 14px; border-bottom: 1px solid var(--border); display: flex; gap: 8px; }
.btn-new { flex: 1; background: transparent; border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 10px 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s, border-color 0.15s; }
.btn-new:hover { background: var(--bg-hover); border-color: var(--accent); }
.icon-btn { width: 42px; height: 42px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text); cursor: pointer; display: grid; place-items: center; transition: background 0.15s; }
.icon-btn:hover { background: var(--bg-hover); }
.chat-list { flex: 1; overflow-y: auto; padding: 10px; }
.chat-list::-webkit-scrollbar { width: 6px; }
.chat-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
.section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); padding: 10px 10px 6px; font-weight: 700; }
.chat-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; color: var(--text); transition: background 0.15s; position: relative; }
.chat-item:hover { background: var(--bg-hover); }
.chat-item.active { background: var(--bg-hover); }
.title-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; }
.del-btn { opacity: 0; border: none; background: transparent; color: var(--text-muted); cursor: pointer; padding: 4px; }
.chat-item:hover .del-btn { opacity: 1; }
.del-btn:hover { color: var(--danger); }
.empty-hint { padding: 20px; color: var(--text-muted); font-size: 13px; text-align: center; }
.sidebar-footer { border-top: 1px solid var(--border); padding: 12px; }
.user-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #10a37f, #3b82f6); display: grid; place-items: center; font-weight: 700; font-size: 13px; color: white; flex-shrink: 0; }
.mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 35; }
@media (max-width: 768px) { .sidebar { position: fixed; left: 0; top: 0; bottom: 0; transform: translateX(-100%); margin-left: 0 !important; } .sidebar.open { transform: translateX(0); } .mobile-overlay.show { display: block; } }
</style>
