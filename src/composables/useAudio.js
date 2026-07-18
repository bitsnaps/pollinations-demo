import { ref } from 'vue'
import { listModels, generateAudio, transcribeAudio } from '../services/pollinations.js'
import { audioModels, musicModels, ttsModels, voicesFor, isMusicModel, normalizeFormat } from '../utils/audio.js'
import { useSettingsStore } from '../stores/settings.js'

export function useAudio() {
  const settings = useSettingsStore()
  const models = ref([])
  const loadingModels = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const gallery = ref([])
  const transcript = ref('')

  async function loadModels() {
    loadingModels.value = true
    try {
      const all = await listModels(null, settings.activeKey || undefined, settings.baseUrl || undefined)
      models.value = audioModels(all)
    } catch (e) { error.value = e.message } finally { loadingModels.value = false }
  }

  function musicModelList() { return musicModels(models.value) }
  function ttsModelList() { return ttsModels(models.value) }
  function voices(model) { const m = models.value.find((x) => x.name === model); return voicesFor(m || {}) }

  async function generate({ text, model = 'elevenlabs', voice = 'nova', format = 'mp3' }) {
    loading.value = true
    try {
      const fmt = normalizeFormat(format)
      const blob = await generateAudio({ text, voice: isMusicModel(model) ? undefined : voice, model }, settings.activeKey || undefined, settings.baseUrl || undefined)
      const url = URL.createObjectURL(blob)
      gallery.value.unshift({ url, kind: isMusicModel(model) ? 'music' : 'tts', model, text, createdAt: Date.now() })
      return url
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }

  async function transcribe(blob, filename = 'audio.mp3') {
    loading.value = true
    try { transcript.value = await transcribeAudio(blob, { filename }, settings.activeKey || undefined, settings.baseUrl || undefined) }
    catch (e) { error.value = e.message } finally { loading.value = false }
  }

  return { models, loadingModels, loading, error, gallery, transcript, loadModels, musicModelList, ttsModelList, voices, generate, transcribe }
}
