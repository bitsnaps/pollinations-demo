import { describe, it, expect } from 'vitest'
import { threeModels, requiresImage, normalizeFormat, isMediaUrl } from '../src/utils/three.js'

const sample = [
  { name: 'trellis-2-low', category: '3d', input_modalities: ['image'], output_modalities: ['3d'] },
  { name: 'flux', category: 'image', output_modalities: ['image'] },
]

describe('threeModels', () => {
  it('keeps 3d models', () => { expect(threeModels(sample).map(m => m.name)).toEqual(['trellis-2-low']) })
})
describe('requiresImage', () => {
  it('true for image-only input', () => { expect(requiresImage(sample[0])).toBe(true) })
  it('false for text-only', () => { expect(requiresImage({ input_modalities: ['text'] })).toBe(false) })
})
describe('normalizeFormat', () => {
  it('defaults to glb', () => { expect(normalizeFormat('xyz')).toBe('glb') })
})
describe('isMediaUrl', () => {
  it('detects media URLs', () => { expect(isMediaUrl('https://media.pollinations.ai/uploads/a.png')).toBe(true) })
  it('rejects others', () => { expect(isMediaUrl('https://example.com/x.png')).toBe(false) })
})
