<script setup>
import { ref } from 'vue'
import { useRealtime } from '../composables/useRealtime.js'

const rt = useRealtime()
const { status, error, transcript, connect, startMic, stopMic, sendResponse, disconnect } = rt

const instructions = ref('You are a helpful, concise voice assistant.')
const voice = ref('alloy')
const audioEl = ref(null)
const micOn = ref(false)

async function onConnect() { connect(instructions.value, voice.value) }

async function toggleMic() {
  if (micOn.value) { stopMic(); micOn.value = false }
  else if (status.value === 'open') {
    try { await startMic(audioEl.value); micOn.value = true }
    catch (e) { error.value = 'Microphone permission denied: ' + e.message }
  }
}

function onDisconnect() { disconnect(); micOn.value = false }
</script>

<template>
  <div class="view-scroll">
    <div class="view-header">
      <div class="view-icon" style="background:linear-gradient(135deg,#ec4899,#f43f5e)"><i class="fa-solid fa-microphone"></i></div>
      <div><h1>Realtime Voice</h1><p>OpenAI-compatible WebSocket voice session (gpt-realtime-2).</p></div>
    </div>
    <div class="view-body">
      <div class="controls-col">
        <b-field label="System instructions"><b-input v-model="instructions" type="textarea" :rows="2" /></b-field>
        <b-field label="Voice"><b-select v-model="voice"><option v-for="v in ['alloy','ash','ballad','coral','echo','sage','shimmer','verse']" :key="v" :value="v">{{ v }}</option></b-select></b-field>
        <div class="buttons">
          <b-button type="is-primary" :disabled="status === 'open' || status === 'connecting'" @click="onConnect">Connect</b-button>
          <b-button type="is-info" :disabled="status !== 'open'" @click="toggleMic">{{ micOn ? 'Stop mic' : 'Start mic' }}</b-button>
          <b-button type="is-warning" :disabled="status !== 'open'" @click="sendResponse">Respond</b-button>
          <b-button type="is-light" :disabled="status !== 'open' && status !== 'speaking'" @click="onDisconnect">Disconnect</b-button>
        </div>
        <p class="status">Status: <span class="tag" :class="{ 'is-success': status === 'open' || status === 'speaking', 'is-warning': status === 'connecting', 'is-danger': status === 'error' || status === 'closed', 'is-light': status === 'idle' }">{{ status }}</span></p>
        <b-notification type="is-danger" v-if="error" @close="error = null">{{ error }}</b-notification>
        <audio ref="audioEl" autoplay style="display:none" />
      </div>
      <div class="results-col">
        <h2 class="subtitle">Transcript</h2>
        <div v-if="transcript.length === 0" class="empty">Conversation will appear here.</div>
        <div v-for="(line,i) in transcript" :key="i" class="line" :class="line.role">
          <span class="role">{{ line.role }}</span><span class="text">{{ line.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-scroll { flex: 1; overflow-y: auto; }
.view-header { display: flex; align-items: center; gap: 14px; padding: 20px 24px 12px; }
.view-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; color: white; font-size: 16px; flex-shrink: 0; }
.view-header h1 { font-size: 1.25rem; margin: 0; }
.view-header p { margin: 0; color: var(--text-muted); font-size: 14px; }
.view-body { display: flex; gap: 24px; padding: 0 24px 24px; }
.controls-col { width: 400px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; }
.results-col { flex: 1; min-width: 0; }
.status { margin: 0; }
.line { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.line .role { text-transform: uppercase; font-size: 11px; font-weight: 700; opacity: 0.6; width: 80px; flex-shrink: 0; }
.line.user .role { color: var(--accent); }
.line.assistant .role { color: #3b82f6; }
.empty { color: var(--text-muted); padding: 20px; }
@media (max-width: 768px) { .view-body { flex-direction: column; } .controls-col { width: 100%; } }
</style>
