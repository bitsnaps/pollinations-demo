import { describe, it, expect } from 'vitest'
import { makeMessage, toApiMessages, extractCodeBlocks, renderMarkdown, escapeHtml } from '../src/utils/chat.js'

describe('makeMessage', () => {
  it('creates a message with role, content, id', () => {
    const m = makeMessage('user', 'hello')
    expect(m.role).toBe('user'); expect(m.content).toBe('hello'); expect(typeof m.id).toBe('string')
  })
})

describe('toApiMessages', () => {
  it('strips UI-only fields', () => {
    const msgs = [makeMessage('user', 'hi', { createdAt: 1, id: 'a' })]
    expect(toApiMessages(msgs)).toEqual([{ role: 'user', content: 'hi' }])
  })
})

describe('extractCodeBlocks', () => {
  it('extracts a fenced block', () => {
    expect(extractCodeBlocks('```js\nconst a = 1\n```')).toEqual([{ lang: 'js', code: 'const a = 1' }])
  })
  it('returns [] when none', () => { expect(extractCodeBlocks('plain')).toEqual([]) })
})

describe('renderMarkdown', () => {
  it('escapes HTML', () => { expect(renderMarkdown('<script>')).toContain('&lt;script&gt;') })
  it('converts bold', () => { expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>') })
  it('converts inline code', () => { expect(renderMarkdown('`x`')).toContain('class="inline"') })
  it('wraps paragraphs', () => { expect(renderMarkdown('hello')).toContain('<p>') })
})
