<script setup>
import { ref, computed, onMounted } from 'vue'
import { listModels } from '../services/pollinations.js'
import { useSettingsStore } from '../stores/settings.js'

const store = useSettingsStore()
const apiKey = ref(store.apiKey)
const byopKey = ref(store.byopKey)
const baseUrl = ref(store.baseUrl)
const safe = ref(store.safe)
const models = ref([])
const loadingModels = ref(false)

const maskedKey = computed(() => store.apiKey ? store.apiKey.slice(0, 8) + '...' + store.apiKey.slice(-4) : 'Not set')

function save() {
  store.apiKey = apiKey.value
  store.byopKey = byopKey.value
  store.baseUrl = baseUrl.value
  store.safe = safe.value
  store.save()
}

async function testKey() {
  loadingModels.value = true
  try {
    models.value = await listModels(null, store.activeKey || undefined, store.baseUrl || undefined)
    alert(`Key works! ${models.value.length} models available.`)
  } catch (e) { alert(`Key test failed: ${e.message}`) }
  finally { loadingModels.value = false }
}
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#64748b,#475569)"><i class="fa-solid fa-gear"></i></div>
      <div><h1>Settings</h1><p>Configure your API keys and preferences.</p></div>
    </div>
    <div class="settings-body">
      <div class="settings-card">
        <h3>API Key</h3>
        <p class="help">Current: <code>{{ maskedKey }}</code></p>
        <b-field label="API Base URL">
          <b-input v-model="baseUrl" placeholder="https://gen.pollinations.ai/v1" />
        </b-field>
        <b-field label="Secret Key (sk_…)">
          <b-input v-model="apiKey" type="password" password-reveal placeholder="sk_…" />
        </b-field>
        <b-field label="BYOP Key (pk_…, optional)">
          <b-input v-model="byopKey" placeholder="pk_…" />
        </b-field>
        <b-field><b-checkbox v-model="safe">Safe mode (privacy / no secrets / no nsfw)</b-checkbox></b-field>
        <div class="buttons">
          <b-button type="is-primary" @click="save">Save</b-button>
          <b-button @click="testKey" :loading="loadingModels">Test key</b-button>
        </div>
        <div v-if="models.length" class="model-count">{{ models.length }} models available</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-scroll { flex: 1; overflow-y: auto; }
.view-header { display: flex; align-items: center; gap: 14px; padding: 20px 24px 12px; }
.view-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; color: white; font-size: 16px; flex-shrink: 0; }
.view-header h1 { font-size: 1.25rem; margin: 0; }
.view-header p { margin: 0; color: var(--text-muted); font-size: 14px; }
.settings-body { padding: 0 24px 24px; max-width: 520px; }
.settings-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 14px; }
.settings-card h3 { margin: 0; font-size: 1rem; }
.model-count { font-size: 13px; color: var(--accent); font-weight: 600; }
</style>
