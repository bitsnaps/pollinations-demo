import { ref } from 'vue'
import { listModels, generateImage, uploadMedia } from '../services/pollinations.js'
import { imageModels, imageToImageModels, normalizeImageParams } from '../utils/image.js'
import { useSettingsStore } from '../stores/settings.js'

export function useImage() {
  const settings = useSettingsStore()
  const models = ref([])
  const editableModels = ref([])
  const loadingModels = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const gallery = ref([])

  async function loadModels() {
    loadingModels.value = true
    error.value = null
    try {
      const all = await listModels(null, settings.activeKey || undefined, settings.baseUrl || undefined)
      editableModels.value = imageToImageModels(all)
      models.value = imageModels(all)
    } catch (e) { error.value = e.message } finally { loadingModels.value = false }
  }

  async function generate({ prompt, model = 'flux', width, height, seed, enhance, nologo, safe, refImages }) {
    loading.value = true
    error.value = null
    const params = normalizeImageParams({ width, height, seed, enhance, nologo, safe, refImages })
    try {
      const url = await generateImage({ prompt, model, ...params }, settings.activeKey || undefined, settings.baseUrl || undefined)
      gallery.value.unshift({ url, prompt, model, createdAt: Date.now() })
      return url
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }

  async function upload(blob, name) { return uploadMedia(blob, name) }

  return { models, editableModels, loadingModels, loading, error, gallery, loadModels, generate, upload }
}
