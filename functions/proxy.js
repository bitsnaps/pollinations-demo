// Netlify serverless proxy. Keeps the secret API key on the server side.
const GEN_BASE = 'https://gen.pollinations.ai'
const OPENAI_BASE = `${GEN_BASE}/v1`

const PROXY_TARGETS = {
  'chat/completions': `${OPENAI_BASE}/chat/completions`,
  'embeddings': `${OPENAI_BASE}/embeddings`,
  'models': `${OPENAI_BASE}/models`,
  'image/': `${GEN_BASE}/image/`,
  'video': `${GEN_BASE}/video`,
  'audio/': `${GEN_BASE}/audio/`,
  '3d/': `${GEN_BASE}/3d/`,
}

function resolveTarget(path) {
  for (const [prefix, target] of Object.entries(PROXY_TARGETS)) {
    if (path.startsWith(prefix)) return target
  }
  return null
}

export async function handler(event) {
  const path = (event.path || '').replace(/^\/api\/?/, '')
  const target = resolveTarget(path)
  if (!target) {
    return { statusCode: 404, body: JSON.stringify({ error: 'unknown proxy path' }) }
  }

  const apiKey = process.env.POLLINATIONS_API
  const url = `${target}${event.rawQuery ? `?${event.rawQuery}` : ''}`
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  const body = event.body || undefined

  try {
    const res = await fetch(url, { method: event.httpMethod, headers, body })
    const buffer = await res.arrayBuffer()
    return {
      statusCode: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    }
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) }
  }
}
