export function threeModels(models = []) {
  return models.filter((m) => m.category === '3d' || (Array.isArray(m.output_modalities) && m.output_modalities.includes('3d')))
}

export function requiresImage(model = {}) {
  const input = model.input_modalities || []
  return !input.includes('text') && input.includes('image')
}

export function normalizeFormat(fmt) {
  const allowed = ['glb', 'gltf', 'obj', 'stl', 'usdz']
  return allowed.includes(fmt) ? fmt : 'glb'
}

export function isMediaUrl(url) {
  return typeof url === 'string' && /^https?:\/\/.+\/(uploads|media)\/.+/.test(url)
}
