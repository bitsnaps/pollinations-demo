import { ref } from 'vue'
import { listModels, videoUrl, uploadMedia } from '../services/pollinations.js'
import { videoModels, videoImg2ImgModels, normalizeDuration, normalizeAspectRatio } from '../utils/video.js'
import { useSettingsStore } from '../stores/settings.js'

export function useVideo() {
  const settings = useSettingsStore()
  const models = ref([])
  const img2imgModels = ref([])
  const loadingModels = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const gallery = ref([])

  async function loadModels() {
    loadingModels.value = true
    try {
      const all = await listModels(null, settings.activeKey || undefined, settings.baseUrl || undefined)
      img2imgModels.value = videoImg2ImgModels(all)
      models.value = videoModels(all)
    } catch (e) { error.value = e.message } finally { loadingModels.value = false }
  }

  async function generate({ prompt, model = 'veo', duration, aspectRatio, audio, seed, refImages }) {
    loading.value = true
    try {
      const supportsRefs = img2imgModels.value.some((m) => m.name === model)
      const url = videoUrl({
        prompt, model,
        duration: normalizeDuration(duration),
        aspectRatio: normalizeAspectRatio(aspectRatio),
        audio, seed,
        ...(supportsRefs && refImages?.length ? { image: refImages[0] } : {}),
      }, settings.activeKey || undefined, settings.baseUrl || undefined)
      gallery.value.unshift({ url, prompt, model, createdAt: Date.now() })
      return url
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }

  async function upload(blob, name) { return uploadMedia(blob, name) }

  return { models, img2imgModels, loadingModels, loading, error, gallery, loadModels, generate, upload }
}
