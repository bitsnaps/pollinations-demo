export function videoModels(models = []) {
  return models.filter((m) => m.category === 'video' || (Array.isArray(m.output_modalities) && m.output_modalities.includes('video')))
}

export function videoImg2ImgModels(models = []) {
  return videoModels(models).filter((m) => Array.isArray(m.input_modalities) && m.input_modalities.includes('image'))
}

const VIDEO_CAP = { start_frame: 'Start frame', end_frame: 'End frame', audio_output: 'Audio output' }
export function videoCapabilityLabels(model = {}) {
  const caps = model.video_capabilities || model.capabilities || []
  return caps.map((c) => VIDEO_CAP[c] || c)
}

export function normalizeDuration(d) {
  const n = parseInt(d, 10)
  if (Number.isNaN(n)) return 4
  return Math.min(60, Math.max(1, n))
}

export function normalizeAspectRatio(r) {
  const allowed = ['16:9', '9:16', '1:1', '4:3', '3:4']
  return allowed.includes(r) ? r : '16:9'
}
