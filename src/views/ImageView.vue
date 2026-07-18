<script setup>
import { onMounted, ref, computed } from 'vue'
import { useImage } from '../composables/useImage.js'

const img = useImage()
const { models, editableModels, loadingModels, loading, error, gallery, loadModels, generate, upload } = img

const form = ref({ prompt: '', model: 'flux', width: 1024, height: 1024, seed: '', enhance: false, nologo: true, safe: true })
const refImages = ref([])
const fileInput = ref(null)

const supportsImg2Img = computed(() => editableModels.value.some((m) => m.name === form.value.model))

async function onFile(e) {
  const files = e.target.files
  if (!files?.length) return
  for (const f of Array.from(files)) {
    try { const url = await upload(f, f.name); refImages.value.push(url) } catch (err) { error.value = err.message }
  }
  e.target.value = ''
}

function removeRef(i) { refImages.value.splice(i, 1) }

async function onSubmit() {
  if (!form.value.prompt.trim() || loading.value) return
  await generate({ ...form.value, refImages: supportsImg2Img.value ? refImages.value : [] })
}

onMounted(async () => { if (models.value.length === 0) await loadModels() })
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)"><i class="fa-regular fa-image"></i></div>
      <div><h1>Image Generation</h1><p>Generate images from prompts with multiple models.</p></div>
    </div>
    <div class="view-body">
      <div class="controls-col">
        <b-field label="Model" :loading="loadingModels">
          <b-select v-model="form.model" expanded :disabled="loadingModels">
            <option v-for="m in models" :key="m.name" :value="m.name">{{ m.name }}</option>
          </b-select>
        </b-field>
        <b-field label="Prompt">
          <b-input v-model="form.prompt" type="textarea" :rows="3" placeholder="Describe the image…" />
        </b-field>
        <div class="field-row">
          <b-field class="col" label="Width"><b-input v-model="form.width" type="number" /></b-field>
          <b-field class="col" label="Height"><b-input v-model="form.height" type="number" /></b-field>
          <b-field class="col" label="Seed"><b-input v-model="form.seed" placeholder="random" /></b-field>
        </div>
        <b-field>
          <b-checkbox v-model="form.enhance">Enhance</b-checkbox>
          <b-checkbox v-model="form.nologo">No logo</b-checkbox>
          <b-checkbox v-model="form.safe">Safe</b-checkbox>
        </b-field>
        <div v-if="supportsImg2Img" class="img2img">
          <p class="help">Reference images:</p>
          <div class="ref-thumbs">
            <figure v-for="(r, i) in refImages" :key="r" class="ref-thumb"><img :src="r" alt="ref" /><button class="delete is-small" @click="removeRef(i)" /></figure>
          </div>
          <b-button size="is-small" icon-left="upload" @click="fileInput.click()">Add reference</b-button>
          <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFile" />
        </div>
        <b-button type="is-primary" :loading="loading" expanded @click="onSubmit">Generate</b-button>
        <b-notification type="is-danger" v-if="error" @close="error = null">{{ error }}</b-notification>
      </div>
      <div class="results-col">
        <h2 class="subtitle">Gallery</h2>
        <div v-if="gallery.length === 0" class="empty">Generated images will appear here.</div>
        <div class="gallery">
          <figure v-for="(g, i) in gallery" :key="i" class="gallery-item">
            <img :src="g.url" :alt="g.prompt" loading="lazy" />
            <figcaption><span class="tag is-light">{{ g.model }}</span><a :href="g.url" target="_blank" class="is-small">open</a></figcaption>
          </figure>
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
.field-row { display: flex; gap: 10px; }
.col { flex: 1; }
.ref-thumbs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.3rem 0; }
.ref-thumb { position: relative; width: 56px; }
.ref-thumb img { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; }
.ref-thumb .delete { position: absolute; top: -6px; right: -6px; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.gallery-item img { width: 100%; border-radius: 10px; background: var(--bg-panel); }
.gallery-item figcaption { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.empty { color: var(--text-muted); padding: 20px; }
@media (max-width: 768px) { .view-body { flex-direction: column; } .controls-col { width: 100%; } }
</style>
