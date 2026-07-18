export function imageModels(models = []) {
  return models.filter((m) => m.category === 'image' || (Array.isArray(m.output_modalities) && m.output_modalities.includes('image')))
}

export function imageToImageModels(models = []) {
  return imageModels(models).filter((m) => Array.isArray(m.input_modalities) && m.input_modalities.includes('image'))
}

export function capabilityLabels(model = {}) {
  const CAP = { inpainting: 'Inpainting', outpainting: 'Outpainting', 'control-net': 'ControlNet' }
  return (model.capabilities || []).map((c) => CAP[c] || c)
}

export function normalizeImageParams({ width, height, seed, enhance, nologo, safe, refImages }) {
  const out = {}
  if (width != null && width !== '') out.width = clampInt(width, 16, 4096)
  if (height != null && height !== '') out.height = clampInt(height, 16, 4096)
  if (seed !== '' && seed != null) out.seed = clampInt(seed, 0, 4294967295)
  if (enhance) out.enhance = true
  if (nologo) out.nologo = true
  if (safe) out.safe = true
  if (refImages && refImages.length) out.ref_images = refImages
  return out
}

function clampInt(v, min, max) {
  const n = parseInt(v, 10)
  if (Number.isNaN(n)) return undefined
  return Math.min(max, Math.max(min, n))
}
