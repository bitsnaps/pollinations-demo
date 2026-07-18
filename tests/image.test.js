import { describe, it, expect } from 'vitest'
import { imageModels, imageToImageModels, capabilityLabels, normalizeImageParams } from '../src/utils/image.js'

const sample = [
  { name: 'flux', category: 'image', input_modalities: ['text'], output_modalities: ['image'] },
  { name: 'kontext', category: 'image', input_modalities: ['text', 'image'], output_modalities: ['image'] },
  { name: 'openai', category: 'text', output_modalities: ['text'] },
]

describe('imageModels', () => {
  it('keeps only image models', () => { expect(imageModels(sample).map(m => m.name)).toEqual(['flux', 'kontext']) })
})
describe('imageToImageModels', () => {
  it('keeps only image input models', () => { expect(imageToImageModels(sample).map(m => m.name)).toEqual(['kontext']) })
})
describe('capabilityLabels', () => {
  it('maps known capabilities', () => { expect(capabilityLabels({ capabilities: ['inpainting'] })).toEqual(['Inpainting']) })
  it('returns [] when none', () => { expect(capabilityLabels({})).toEqual([]) })
})
describe('normalizeImageParams', () => {
  it('clamps and parses', () => {
    const p = normalizeImageParams({ width: 99999, height: 0, seed: '42', enhance: true })
    expect(p.width).toBe(4096); expect(p.height).toBe(16); expect(p.seed).toBe(42); expect(p.enhance).toBe(true)
  })
  it('drops empties', () => { const p = normalizeImageParams({ width: '', seed: null }); expect(p.width).toBeUndefined() })
})
