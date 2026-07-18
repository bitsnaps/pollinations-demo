import { describe, it, expect } from 'vitest'
import { audioModels, musicModels, ttsModels, voicesFor, isMusicModel, normalizeFormat } from '../src/utils/audio.js'

const sample = [
  { name: 'elevenlabs', category: 'audio', output_modalities: ['audio'], voices: ['nova', 'alloy'] },
  { name: 'elevenmusic', category: 'audio', output_modalities: ['audio'] },
  { name: 'whisper', category: 'audio', input_modalities: ['audio'], output_modalities: ['text'] },
  { name: 'flux', category: 'image', output_modalities: ['image'] },
]

describe('audioModels', () => {
  it('keeps audio models', () => { expect(audioModels(sample).map(m => m.name)).toEqual(['elevenlabs', 'elevenmusic', 'whisper']) })
})
describe('musicModels', () => {
  it('keeps music models', () => { expect(musicModels(sample).map(m => m.name)).toEqual(['elevenmusic']) })
})
describe('ttsModels', () => {
  it('excludes music', () => { expect(ttsModels(sample).map(m => m.name)).toEqual(['elevenlabs', 'whisper']) })
})
describe('voicesFor', () => {
  it('returns model voices', () => { expect(voicesFor(sample[0])).toEqual(['nova', 'alloy']) })
  it('returns [] when absent', () => { expect(voicesFor({})).toEqual([]) })
})
describe('isMusicModel', () => {
  it('classifies correctly', () => { expect(isMusicModel('elevenmusic')).toBe(true); expect(isMusicModel('elevenlabs')).toBe(false) })
})
describe('normalizeFormat', () => {
  it('defaults unknown to mp3', () => { expect(normalizeFormat('xyz')).toBe('mp3') })
})
