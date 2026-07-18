<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAudio } from '../composables/useAudio.js'

const a = useAudio()
const { models, loadingModels, loading, error, gallery, transcript, loadModels, musicModelList, ttsModelList, voices, generate, transcribe } = a

const tab = ref('tts')
const ttsModelsList = computed(() => ttsModelList())
const musicModelsList = computed(() => musicModelList())

const form = ref({ text: '', ttsModel: 'elevenlabs', musicModel: 'elevenmusic', voice: 'nova', format: 'mp3' })
const transcribeInput = ref(null)

const currentVoices = computed(() => tab.value === 'tts' ? voices(form.value.ttsModel) : [])

async function onGenerate() {
  if (!form.value.text.trim() || loading.value) return
  if (tab.value === 'tts') await generate({ text: form.value.text, model: form.value.ttsModel, voice: form.value.voice, format: form.value.format })
  else await generate({ text: form.value.text, model: form.value.musicModel })
}

async function onTranscribeFile(e) {
  const f = e.target.files?.[0]; if (!f) return
  await transcribe(f, f.name); e.target.value = ''
}

onMounted(async () => { if (models.value.length === 0) await loadModels() })
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#f97316,#ef4444)"><i class="fa-solid fa-music"></i></div>
      <div><h1>Audio Generation</h1><p>Text-to-speech, music, and transcription.</p></div>
    </div>
    <div class="view-body">
      <div class="controls-col">
        <b-tabs v-model="tab" type="is-boxed">
          <b-tab-item value="tts" label="TTS" />
          <b-tab-item value="music" label="Music" />
          <b-tab-item value="transcribe" label="Transcription" />
        </b-tabs>

        <template v-if="tab === 'tts'">
          <b-field label="Model" :loading="loadingModels">
            <b-select v-model="form.ttsModel" expanded><option v-for="m in ttsModelsList" :key="m.name" :value="m.name">{{ m.name }}</option></b-select>
          </b-field>
          <b-field label="Voice"><b-select v-model="form.voice" expanded><option v-for="v in currentVoices" :key="v" :value="v">{{ v }}</option></b-select></b-field>
          <b-field label="Format"><b-select v-model="form.format" expanded><option v-for="f in ['mp3','wav','flac','opus','pcm16']" :key="f" :value="f">{{ f }}</option></b-select></b-field>
        </template>

        <template v-else-if="tab === 'music'">
          <b-field label="Model" :loading="loadingModels">
            <b-select v-model="form.musicModel" expanded><option v-for="m in musicModelsList" :key="m.name" :value="m.name">{{ m.name }}</option></b-select>
          </b-field>
        </template>

        <template v-else>
          <b-field label="Upload audio"><b-button icon-left="upload" @click="transcribeInput.click()">Choose file</b-button>
            <input ref="transcribeInput" type="file" accept="audio/*" hidden @change="onTranscribeFile" /></b-field>
          <b-field v-if="transcript" label="Transcript"><b-input type="textarea" :value="transcript" rows="5" readonly /></b-field>
        </template>

        <b-field v-if="tab !== 'transcribe'" label="Text / Prompt">
          <b-input v-model="form.text" type="textarea" :rows="3" placeholder="Enter text…" />
        </b-field>

        <b-button v-if="tab !== 'transcribe'" type="is-primary" :loading="loading" expanded @click="onGenerate">Generate</b-button>
        <b-notification type="is-danger" v-if="error" @close="error = null">{{ error }}</b-notification>
      </div>

      <div class="results-col">
        <h2 class="subtitle">Library</h2>
        <div v-if="gallery.length === 0" class="empty">Generated audio will appear here.</div>
        <div v-for="(g,i) in gallery" :key="i" class="lib-item">
          <span class="tag is-light">{{ g.kind }} · {{ g.model }}</span>
          <audio :src="g.url" controls /><a :href="g.url" download class="is-small">download</a>
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
.lib-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.lib-item audio { flex: 1; min-width: 200px; }
.empty { color: var(--text-muted); padding: 20px; }
@media (max-width: 768px) { .view-body { flex-direction: column; } .controls-col { width: 100%; } }
</style>
