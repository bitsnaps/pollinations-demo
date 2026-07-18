<script setup>
import { onMounted, ref, computed } from 'vue'
import { use3D } from '../composables/use3D.js'

const t = use3D()
const { models, loadingModels, loading, error, gallery, loadModels, modelNeedsImage, generate, upload } = t

const form = ref({ prompt: '', model: 'trellis-2-low', format: 'glb' })
const refImage = ref('')
const fileInput = ref(null)

const currentNeedsImage = computed(() => modelNeedsImage(form.value.model))

async function onFile(e) {
  const f = e.target.files?.[0]; if (!f) return
  try { refImage.value = await upload(f, f.name) } catch (err) { error.value = err.message }
  e.target.value = ''
}

async function onSubmit() {
  if (loading.value) return
  if (currentNeedsImage.value && !refImage.value) { error.value = 'This model requires a reference image.'; return }
  await generate({ prompt: form.value.prompt, model: form.value.model, image: refImage.value || undefined, format: form.value.format })
}

onMounted(async () => { if (models.value.length === 0) await loadModels() })
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#10b981,#059669)"><i class="fa-solid fa-cube"></i></div>
      <div><h1>3D Generation</h1><p>Generate 3D models (GLB) from a reference image.</p></div>
    </div>
    <div class="view-body">
      <div class="controls-col">
        <b-field label="Model" :loading="loadingModels">
          <b-select v-model="form.model" expanded><option v-for="m in models" :key="m.name" :value="m.name">{{ m.name }}</option></b-select>
        </b-field>
        <b-field label="Prompt (optional)"><b-input v-model="form.prompt" type="textarea" :rows="2" placeholder="Describe the model…" /></b-field>
        <b-field label="Format"><b-select v-model="form.format" expanded><option v-for="f in ['glb','gltf','obj','stl','usdz']" :key="f" :value="f">{{ f }}</option></b-select></b-field>
        <template v-if="currentNeedsImage">
          <b-field label="Reference image (required)">
            <div v-if="refImage" class="ref-preview"><img :src="refImage" alt="ref" /><button class="delete is-small" @click="refImage = ''" /></div>
            <b-button v-else icon-left="upload" @click="fileInput.click()">Upload image</b-button>
            <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
          </b-field>
        </template>
        <b-button type="is-primary" :loading="loading" expanded @click="onSubmit">Generate</b-button>
        <b-notification type="is-warning" v-if="currentNeedsImage && !refImage">Trellis models ignore text — an image is required.</b-notification>
        <b-notification type="is-danger" v-if="error" @close="error = null">{{ error }}</b-notification>
      </div>
      <div class="results-col">
        <h2 class="subtitle">Gallery</h2>
        <div v-if="gallery.length === 0" class="empty">Generated models will appear here.</div>
        <div v-for="(g,i) in gallery" :key="i" class="model-item">
          <span class="tag is-light">{{ g.model }} · {{ g.format }}</span>
          <a :href="g.url" :download="`model-${i}.${g.format}`" class="is-small">download</a>
        </div>
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
.ref-preview { position: relative; display: inline-block; }
.ref-preview img { width: 120px; height: 120px; object-fit: cover; border-radius: 10px; }
.ref-preview .delete { position: absolute; top: -6px; right: -6px; }
.model-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
.empty { color: var(--text-muted); padding: 20px; }
@media (max-width: 768px) { .view-body { flex-direction: column; } .controls-col { width: 100%; } }
</style>
