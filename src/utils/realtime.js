export function realtimeUrl(model = 'gpt-realtime-2', apiKey) {
  const params = new URLSearchParams({ model })
  if (apiKey) params.set('key', apiKey)
  return `wss://gen.pollinations.ai/v1/realtime?${params.toString()}`
}

export function sessionUpdateEvent({ instructions = '', voice = 'alloy', modalities = ['text', 'audio'] } = {}) {
  return { type: 'session.update', session: { type: 'realtime', modalities, instructions, voice } }
}

export function responseCreateEvent() { return { type: 'response.create' } }
export function inputAudioBufferAppendEvent(base64) { return { type: 'input_audio_buffer.append', audio: base64 } }

export function userTranscriptFrom(event) {
  if (!event) return null
  if (event.type === 'conversation.item.input_audio_transcription.completed') return event.transcript || null
  if (event.type === 'conversation.item.input_audio_transcription.delta') return event.delta || null
  return null
}

export function modelContentFrom(event) {
  if (!event) return null
  if (event.type === 'response.audio.delta') return { kind: 'audio', audio: event.delta }
  if (event.type === 'response.audio_transcript.delta') return { kind: 'text', text: event.delta }
  if (event.type === 'response.text.delta') return { kind: 'text', text: event.delta }
  return null
}

export function isSessionClosed(event) { return event?.type === 'session.closed' }
