import { ref, onUnmounted } from 'vue'
import { realtimeUrl, sessionUpdateEvent, responseCreateEvent, inputAudioBufferAppendEvent, userTranscriptFrom, modelContentFrom } from '../utils/realtime.js'
import { useSettingsStore } from '../stores/settings.js'

export function useRealtime() {
  const settings = useSettingsStore()
  const status = ref('idle')
  const error = ref(null)
  const transcript = ref([])

  let ws = null, mediaStream = null, audioCtx = null, audioEl = null, processor = null

  function connect(instructions = '', voice = 'alloy') {
    error.value = null
    status.value = 'connecting'
    ws = new WebSocket(realtimeUrl('gpt-realtime-2', settings.activeKey || undefined))
    ws.onopen = () => { status.value = 'open'; ws.send(JSON.stringify(sessionUpdateEvent({ instructions, voice }))) }
    ws.onmessage = (ev) => handleMessage(ev.data)
    ws.onerror = () => { status.value = 'error'; error.value = 'Connection error (key with balance required).' }
    ws.onclose = () => { status.value = 'closed'; stopMic() }
  }

  function handleMessage(data) {
    let event; try { event = JSON.parse(data) } catch { return }
    const u = userTranscriptFrom(event)
    if (u != null) { const last = transcript.value[transcript.value.length - 1]; if (last && last.role === 'user') last.text += u; else transcript.value.push({ role: 'user', text: u }) }
    const m = modelContentFrom(event)
    if (m?.kind === 'text') { const last = transcript.value[transcript.value.length - 1]; if (last && last.role === 'assistant') last.text += m.text; else transcript.value.push({ role: 'assistant', text: m.text }) }
  }

  async function startMic(element) {
    audioEl = element
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const src = audioCtx.createMediaStreamSource(mediaStream)
    processor = audioCtx.createScriptProcessor(4096, 1, 1)
    processor.onaudioprocess = (e) => {
      const pcm = e.inputBuffer.getChannelData(0)
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(inputAudioBufferAppendEvent(encodePcmToBase64(pcm))))
    }
    src.connect(processor); processor.connect(audioCtx.destination)
    if (audioEl && mediaStream) audioEl.srcObject = mediaStream
    status.value = 'speaking'
  }

  function stopMic() {
    if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop())
    if (processor) processor.disconnect()
    if (audioCtx) audioCtx.close()
    mediaStream = audioCtx = processor = null
    if (audioEl) audioEl.srcObject = null
  }

  function sendResponse() { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(responseCreateEvent())) }
  function disconnect() { if (ws) ws.close(); ws = null; status.value = 'closed' }

  onUnmounted(disconnect)
  return { status, error, transcript, connect, startMic, stopMic, sendResponse, disconnect }
}

export function encodePcmToBase64(pcm) {
  const buffer = new ArrayBuffer(pcm.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]))
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}
