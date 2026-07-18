export function makeMessage(role, content, extra = {}) {
  return { id: crypto.randomUUID(), role, content, createdAt: Date.now(), ...extra }
}

export function toApiMessages(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }))
}

export function extractCodeBlocks(content) {
  const re = /```(\w*)\n([\s\S]*?)```/g
  const blocks = []
  let m
  while ((m = re.exec(content)) !== null) {
    blocks.push({ lang: m[1] || 'text', code: m[2].trimEnd() })
  }
  return blocks
}

export function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderMarkdown(text) {
  if (!text) return ''
  let html = escapeHtml(text)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'code'
    return `<div class="code-block"><div class="code-header"><span>${language}</span><button type="button" class="copy-code"><i class="fa-regular fa-copy"></i> Copy</button></div><pre><code>${code.replace(/\n$/, '')}</code></pre></div>`
  })
  html = html.replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  html = html.replace(/^(?:- |\* )(.+)$/gm, '• $1')
  html = html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
  return html
}
