<script setup>
import { useConversationsStore } from '../stores/conversations.js'
import { useSidebar } from '../composables/useSidebar.js'

const convs = useConversationsStore()
const { toggle } = useSidebar()
</script>

<template>
  <div class="topbar">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="icon-btn" @click="toggle" title="Toggle sidebar"><i class="fa-solid fa-bars"></i></button>
      <span class="topbar-title" v-if="$route.name === 'chat'">{{ convs.active?.title || 'Pollinations' }}</span>
      <span class="topbar-title" v-else>{{ $route.meta?.title || $route.name }}</span>
    </div>
    <div class="topbar-actions">
      <button class="icon-btn" @click="convs.clearMessages()" v-if="$route.name === 'chat'" title="Clear messages"><i class="fa-solid fa-broom"></i></button>
    </div>
  </div>
</template>

<style scoped>
.topbar { height: 56px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: color-mix(in srgb, var(--bg-app) 85%, transparent); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 20; }
.icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text); cursor: pointer; display: grid; place-items: center; transition: background 0.15s; }
.icon-btn:hover { background: var(--bg-hover); }
.topbar-title { font-weight: 600; font-size: 15px; }
.topbar-actions { display: flex; gap: 8px; align-items: center; }
</style>
