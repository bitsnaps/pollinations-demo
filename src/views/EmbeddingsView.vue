<script setup>
import { ref } from 'vue'
import { createEmbeddings } from '../services/pollinations.js'
import { useSettingsStore } from '../stores/settings.js'

const settings = useSettingsStore()

const input = ref('')
const model = ref('openai-3-small')
const dimensions = ref('')
const loading = ref(false)
const error = ref(null)
const result = ref(null)

async function onSubmit() {
  if (!input.value.trim() || loading.value) return
  loading.value = true
  error.value = null
  result.value = null
  try {
    const res = await createEmbeddings({
      input: input.value,
      model: model.value,
      dimensions: dimensions.value ? parseInt(dimensions.value) : undefined,
    }, settings.activeKey || undefined, settings.baseUrl || undefined)
    result.value = res.data?.[0]?.embedding || res.embedding || []
  } catch (e) { error.value = e.message }
  finally { loading.value = false }
}
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#a855f7,#6366f1)"><i class="fa-solid fa-vector-square"></i></div>
      <div><h1>Embeddings</h1><p>Generate vector embeddings from text.</p></div>
    </div>
    <div class="view-body">
      <div class="controls-col">
        <b-field label="Model">
          <b-select v-model="model" expanded>
            <option value="openai-3-small">openai-3-small</option>
            <option value="openai-3-large">openai-3-large</option>
          </b-select>
        </b-field>
        <b-field label="Dimensions"><b-input v-model="dimensions" placeholder="Optional (default: model default)" type="number" /></b-field>
        <b-field label="Input text"><b-input v-model="input" type="textarea" :rows="4" placeholder="Enter text to embed…" /></b-field>
        <b-button type="is-primary" :loading="loading" expanded @click="onSubmit">Generate</b-button>
        <b-notification type="is-danger" v-if="error" @close="error = null">{{ error }}</b-notification>
      </div>
      <div class="results-col">
        <h2 class="subtitle">Result</h2>
        <div v-if="result" class="embedding-box">
          <div class="embedding-meta">Vector length: {{ result.length }}</div>
          <pre class="embedding-preview">{{ JSON.stringify(result.slice(0, 10), null, 2) }}{{ result.length > 10 ? `\n// ... (${result.length} dimensions total)` : '' }}</pre>
          <b-button size="is-small" icon-left="copy" @click="navigator.clipboard.writeText(JSON.stringify(result))">Copy full vector</b-button>
        </div>
        <div v-else class="empty">Enter text and click Generate.</div>
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
.view-body { display: flex; gap: 24px; padding: 0 24px 24px; }
.controls-col { width: 360px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
.results-col { flex: 1; min-width: 0; }
.embedding-box { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.embedding-meta { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
.embedding-preview { font-family: ui-monospace, monospace; font-size: 12px; overflow-x: auto; background: var(--bg-input); padding: 12px; border-radius: 8px; max-height: 400px; overflow-y: auto; }
.empty { color: var(--text-muted); padding: 20px; }
@media (max-width: 768px) { .view-body { flex-direction: column; } .controls-col { width: 100%; } }
</style>
