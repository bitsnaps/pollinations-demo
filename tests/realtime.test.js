import { describe, it, expect } from 'vitest'
import { realtimeUrl, sessionUpdateEvent, responseCreateEvent, inputAudioBufferAppendEvent, userTranscriptFrom, modelContentFrom, isSessionClosed } from '../src/utils/realtime.js'

describe('realtimeUrl', () => {
  it('builds url with key', () => {
    expect(realtimeUrl('gpt-realtime-2', 'pk_abc')).toBe('wss://gen.pollinations.ai/v1/realtime?model=gpt-realtime-2&key=pk_abc')
  })
  it('omits key when absent', () => {
    expect(realtimeUrl('gpt-realtime-2')).toBe('wss://gen.pollinations.ai/v1/realtime?model=gpt-realtime-2')
  })
})
describe('sessionUpdateEvent', () => {
  it('creates session update', () => {
    const e = sessionUpdateEvent({ voice: 'shimmer' })
    expect(e.type).toBe('session.update'); expect(e.session.voice).toBe('shimmer')
  })
})
describe('responseCreateEvent', () => {
  it('returns response.create', () => { expect(responseCreateEvent().type).toBe('response.create') })
})
describe('inputAudioBufferAppendEvent', () => {
  it('wraps audio', () => { expect(inputAudioBufferAppendEvent('AA')).toEqual({ type: 'input_audio_buffer.append', audio: 'AA' }) })
})
describe('userTranscriptFrom', () => {
  it('reads completed', () => { expect(userTranscriptFrom({ type: 'conversation.item.input_audio_transcription.completed', transcript: 'hi' })).toBe('hi') })
  it('reads delta', () => { expect(userTranscriptFrom({ type: 'conversation.item.input_audio_transcription.delta', delta: 'he' })).toBe('he') })
  it('null for unrelated', () => { expect(userTranscriptFrom({ type: 'response.audio.delta' })).toBeNull() })
})
describe('modelContentFrom', () => {
  it('extracts audio delta', () => { expect(modelContentFrom({ type: 'response.audio.delta', delta: 'X' })).toEqual({ kind: 'audio', audio: 'X' }) })
  it('extracts text delta', () => { expect(modelContentFrom({ type: 'response.text.delta', delta: 'y' })).toEqual({ kind: 'text', text: 'y' }) })
  it('null for unrelated', () => { expect(modelContentFrom({ type: 'session.created' })).toBeNull() })
})
describe('isSessionClosed', () => {
  it('true only for session.closed', () => { expect(isSessionClosed({ type: 'session.closed' })).toBe(true) })
})
