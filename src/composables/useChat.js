import { ref } from 'vue'
import { listModels, streamChatCompletion } from '../services/pollinations.js'
import { textModels, sortModels, modelLabel } from '../utils/models.js'
import { toApiMessages } from '../utils/chat.js'
import { useConversationsStore } from '../stores/conversations.js'
import { useSettingsStore } from '../stores/settings.js'

export function useChat() {
  const convs = useConversationsStore()
  const settings = useSettingsStore()

  const models = ref([])
  const loadingModels = ref(false)
  const streaming = ref(false)
  const error = ref(null)

  const labelFor = (id) => {
    const m = models.value.find((x) => x.id === id)
    return m ? modelLabel(m) : id
  }

  async function loadModels() {
    loadingModels.value = true
    error.value = null
    try {
      const all = await listModels(null, settings.activeKey || undefined, settings.baseUrl || undefined)
      models.value = sortModels(textModels(all))
    } catch (e) {
      error.value = e.message
    } finally {
      loadingModels.value = false
    }
  }

  async function send(text) {
    if (!text.trim() || streaming.value) return
    let conv = convs.active
    if (!conv) conv = convs.newConversation()
    convs.addMessage('user', text)
    streaming.value = true
    error.value = null
    const assistant = convs.addMessage('assistant', '', { pending: true })
    try {
      const messages = conv.systemPrompt
        ? [{ role: 'system', content: conv.systemPrompt }, ...toApiMessages(conv.messages.slice(0, -1))]
        : toApiMessages(conv.messages.slice(0, -1))
      for await (const delta of streamChatCompletion(
        { model: conv.model, messages },
        settings.activeKey || undefined, settings.baseUrl || undefined,
      )) {
        convs.appendToMessage(assistant.id, delta)
      }
    } catch (e) {
      error.value = e.message
      convs.appendToMessage(assistant.id, `\n\n[error] ${e.message}`)
    } finally {
      streaming.value = false
      convs.finalizeStream()
    }
  }

  return { models, loadingModels, streaming, error, labelFor, loadModels, send, convs }
}
