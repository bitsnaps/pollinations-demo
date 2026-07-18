<script setup>
import { onMounted, ref, computed } from 'vue'
import { useVideo } from '../composables/useVideo.js'

const v = useVideo()
const { models, img2imgModels, loadingModels, loading, error, gallery, loadModels, generate, upload } = v

const form = ref({ prompt: '', model: 'veo', duration: 4, aspectRatio: '16:9', audio: true, seed: '' })
const refImages = ref([])
const fileInput = ref(null)

const supportsImg2Img = computed(() => img2imgModels.value.some((m) => m.name === form.value.model))

async function onFile(e) {
  const f = e.target.files?.[0]; if (!f) return
  try { refImages.value.push(await upload(f, f.name)) } catch (err) { error.value = err.message }
  e.target.value = ''
}

async function onSubmit() {
  if (!form.value.prompt.trim() || loading.value) return
  await generate({ ...form.value, refImages: supportsImg2Img.value ? refImages.value : [] })
}

onMounted(async () => { if (models.value.length === 0) await loadModels() })
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#3b82f6,#8b5cf6)"><i class="fa-solid fa-video"></i></div>
      <div><h1>Video Generation</h1><p>Generate videos from prompts.</p></div>
    </div>
    <div class="view-body">
      <div class="controls-col">
        <b-field label="Model" :loading="loadingModels">
          <b-select v-model="form.model" expanded :disabled="loadingModels">
            <option v-for="m in models" :key="m.name" :value="m.name">{{ m.name }}</option>
          </b-select>
        </b-field>
        <b-field label="Prompt"><b-input v-model="form.prompt" type="textarea" :rows="3" placeholder="Describe the video…" /></b-field>
        <div class="field-row">
          <b-field class="col" label="Duration (s)"><b-input v-model="form.duration" type="number" min="1" max="60" /></b-field>
          <b-field class="col" label="Seed"><b-input v-model="form.seed" placeholder="random" /></b-field>
        </div>
        <b-field label="Aspect ratio">
          <b-select v-model="form.aspectRatio" expanded>
            <option v-for="r in ['16:9','9:16','1:1','4:3','3:4']" :key="r" :value="r">{{ r }}</option>
          </b-select>
        </b-field>
        <b-field><b-checkbox v-model="form.audio">Include audio</b-checkbox></b-field>
        <div v-if="supportsImg2Img" class="img2img">
          <p class="help">Reference image (start frame):</p>
          <div class="ref-thumbs"><figure v-for="(r,i) in refImages" :key="r" class="ref-thumb"><img :src="r" alt="ref" /><button class="delete is-small" @click="refImages.splice(i,1)" /></figure></div>
          <b-button size="is-small" icon-left="upload" @click="fileInput.click()">Add reference</b-button>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
        </div>
        <b-button type="is-primary" :loading="loading" expanded @click="onSubmit">Generate</b-button>
        <b-notification type="is-danger" v-if="error" @close="error = null">{{ error }}</b-notification>
      </div>
      <div class="results-col">
        <h2 class="subtitle">Gallery</h2>
        <div v-if="gallery.length === 0" class="empty">Generated videos will appear here.</div>
        <div class="vids">
          <figure v-for="(g,i) in gallery" :key="i" class="vid-item"><video :src="g.url" controls muted loop playsinline /><figcaption><span class="tag is-light">{{ g.model }}</span><a :href="g.url" target="_blank" class="is-small">download</a></figcaption></figure>
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
.ref-thumbs { display: flex; gap: 0.5rem; margin: 0.3rem 0; }
.ref-thumb { position: relative; width: 56px; }
.ref-thumb img { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; }
.vids { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.vid-item { background: var(--bg-panel); border-radius: 10px; padding: 8px; }
.vid-item video { width: 100%; border-radius: 8px; }
.vid-item figcaption { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.empty { color: var(--text-muted); padding: 20px; }
@media (max-width: 768px) { .view-body { flex-direction: column; } .controls-col { width: 100%; } }
</style>
