import { ref } from 'vue'
import { listModels, generate3D, uploadMedia } from '../services/pollinations.js'
import { threeModels, requiresImage, normalizeFormat } from '../utils/three.js'
import { useSettingsStore } from '../stores/settings.js'

export function use3D() {
  const settings = useSettingsStore()
  const models = ref([])
  const loadingModels = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const gallery = ref([])

  async function loadModels() {
    loadingModels.value = true
    try { const all = await listModels(null, settings.activeKey || undefined); models.value = threeModels(all) }
    catch (e) { error.value = e.message } finally { loadingModels.value = false }
  }

  function modelNeedsImage(name) { const m = models.value.find((x) => x.name === name); return m ? requiresImage(m) : true }

  async function generate({ prompt, model = 'trellis-2-low', image, format = 'glb' }) {
    loading.value = true
    try {
      const fmt = normalizeFormat(format)
      const blob = await generate3D({ prompt, model, image }, settings.activeKey || undefined)
      const url = URL.createObjectURL(blob)
      gallery.value.unshift({ url, model, prompt, format: fmt, createdAt: Date.now() })
      return url
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }

  async function upload(blob, name) { return uploadMedia(blob, name) }

  return { models, loadingModels, loading, error, gallery, loadModels, modelNeedsImage, generate, upload }
}
