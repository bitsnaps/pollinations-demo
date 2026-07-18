<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from './stores/settings.js'
import SideBar from './components/SideBar.vue'
import TopBar from './components/TopBar.vue'

const settings = useSettingsStore()

onMounted(() => {
  settings.initTheme()
})
</script>

<template>
  <div class="app-shell">
    <SideBar />
    <main class="main">
      <TopBar />
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell { display: flex; height: 100vh; width: 100%; overflow: hidden; }
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; background: var(--bg-app); }
</style>
