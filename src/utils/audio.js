export function audioModels(models = []) {
  return models.filter((m) => m.category === 'audio' || (Array.isArray(m.output_modalities) && m.output_modalities.includes('audio')))
}

const MUSIC_MODELS = new Set(['elevenmusic', 'stable-audio-3-medium', 'stable-audio-3-large', 'acestep'])
export function musicModels(models = []) {
  return audioModels(models).filter((m) => MUSIC_MODELS.has(m.name))
}

export function ttsModels(models = []) {
  return audioModels(models).filter((m) => !MUSIC_MODELS.has(m.name))
}

export function voicesFor(model = {}) { return model.voices || [] }
export function isMusicModel(name) { return MUSIC_MODELS.has(name) }

export function normalizeFormat(fmt) {
  const allowed = ['mp3', 'wav', 'flac', 'opus', 'pcm16']
  return allowed.includes(fmt) ? fmt : 'mp3'
}
