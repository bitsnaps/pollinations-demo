import OpenAI from 'openai'

const GEN_BASE = 'https://gen.pollinations.ai'
const OPENAI_BASE = `${GEN_BASE}/v1`

const CLIENT_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY || import.meta.env.POLLINATIONS_API_KEY || ''
const CLIENT_BASE = import.meta.env.VITE_OPENAI_BASE_URL || import.meta.env.OPENAI_BASE_URL || OPENAI_BASE

export function createClient(apiKey) {
  return new OpenAI({
    apiKey: apiKey || CLIENT_KEY || 'anonymous',
    baseURL: CLIENT_BASE,
    dangerouslyAllowBrowser: true,
  })
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

export async function listModels(modality, apiKey) {
  const client = createClient(apiKey)
  const models = await client.models.list()
  const data = models.data || []
  return modality ? data.filter((m) => m.modality === modality) : data
}

export function chatCompletion({ model = 'openai', messages, ...opts }, apiKey) {
  const client = createClient(apiKey)
  return client.chat.completions.create({ model, messages, stream: false, ...opts })
}

export async function* streamChatCompletion({ model = 'openai', messages, ...opts }, apiKey) {
  const client = createClient(apiKey)
  const stream = await client.chat.completions.create({ model, messages, stream: true, ...opts })
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content
    if (delta) yield delta
  }
}

export async function generateImage({ prompt, model = 'flux', width, height, seed, enhance, nologo, safe }, apiKey) {
  const query = buildQuery({ model, width, height, seed, enhance: enhance ? 'true' : undefined, nologo: nologo ? 'true' : undefined, safe: safe ? 'true' : undefined })
  const url = `${GEN_BASE}/image/${encodeURIComponent(prompt)}${query}`
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`generateImage failed: ${res.status}`)
  return url
}

/** URL-based video generation. Returns the final MP4 URL directly. */
export function videoUrl({ prompt, model = 'veo', duration, aspectRatio, audio, seed, ...opts }, apiKey) {
  const query = buildQuery({ model, duration, aspectRatio, audio: audio ? 'true' : undefined, seed, ...opts })
  const url = `${GEN_BASE}/video/${encodeURIComponent(prompt)}${query}`
  if (apiKey) {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}key=${encodeURIComponent(apiKey)}`
  }
  return url
}

export async function generateAudio({ text, voice = 'nova', ...opts }, apiKey) {
  const query = buildQuery({ voice, ...opts })
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  const res = await fetch(`${GEN_BASE}/audio/${encodeURIComponent(text)}${query}`, { headers })
  if (!res.ok) throw new Error(`generateAudio failed: ${res.status}`)
  return res.blob()
}

export async function transcribeAudio(blob, { model = 'whisper', filename = 'audio.mp3' } = {}, apiKey) {
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('model', model)
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, { method: 'POST', headers, body: form })
  if (!res.ok) throw new Error(`transcribeAudio failed: ${res.status}`)
  return res.text()
}

export async function generate3D({ prompt, image, model = 'trellis-2-low' }, apiKey) {
  const headers = { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) }
  const res = await fetch(`${GEN_BASE}/3d/${encodeURIComponent(prompt)}`, {
    method: 'POST', headers,
    body: JSON.stringify({ image, model }),
  })
  if (!res.ok) throw new Error(`generate3D failed: ${res.status}`)
  return res.blob()
}

export function createEmbeddings({ input, model = 'openai-3-small', dimensions }, apiKey) {
  const client = createClient(apiKey)
  return client.embeddings.create({ input, model, dimensions })
}

export async function uploadMedia(blob, name = 'file') {
  const form = new FormData()
  form.append('file', blob, name)
  const res = await fetch('https://media.pollinations.ai/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error(`uploadMedia failed: ${res.status}`)
  const data = await res.json()
  return data.url || data.location
}

export const pollinations = {
  GEN_BASE, OPENAI_BASE, createClient, buildQuery, listModels,
  chatCompletion, streamChatCompletion, generateImage, videoUrl,
  generateAudio, transcribeAudio, generate3D, createEmbeddings, uploadMedia,
}

export default pollinations
