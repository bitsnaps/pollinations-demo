import { describe, it, expect } from 'vitest'
import { videoModels, videoImg2ImgModels, videoCapabilityLabels, normalizeDuration, normalizeAspectRatio } from '../src/utils/video.js'

const sample = [
  { name: 'veo', category: 'video', input_modalities: ['text', 'image'], output_modalities: ['video'], video_capabilities: ['start_frame', 'audio_output'] },
  { name: 'wan', category: 'video', input_modalities: ['text'], output_modalities: ['video'] },
  { name: 'flux', category: 'image', output_modalities: ['image'] },
]

describe('videoModels', () => {
  it('keeps only video models', () => { expect(videoModels(sample).map(m => m.name)).toEqual(['veo', 'wan']) })
})
describe('videoImg2ImgModels', () => {
  it('keeps only image-input models', () => { expect(videoImg2ImgModels(sample).map(m => m.name)).toEqual(['veo']) })
})
describe('videoCapabilityLabels', () => {
  it('maps video_capabilities', () => { expect(videoCapabilityLabels(sample[0])).toEqual(['Start frame', 'Audio output']) })
})
describe('normalizeDuration', () => {
  it('defaults NaN to 4', () => { expect(normalizeDuration('abc')).toBe(4) })
  it('clamps', () => { expect(normalizeDuration('999')).toBe(60); expect(normalizeDuration('0')).toBe(1) })
})
describe('normalizeAspectRatio', () => {
  it('defaults unknown', () => { expect(normalizeAspectRatio('21:9')).toBe('16:9') })
  it('accepts valid', () => { expect(normalizeAspectRatio('9:16')).toBe('9:16') })
})
