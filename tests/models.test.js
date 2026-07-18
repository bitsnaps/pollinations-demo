import { describe, it, expect } from 'vitest'
import { textModels, sortModels, modelLabel } from '../src/utils/models.js'

const sample = [
  { id: 'openai', output_modalities: ['text'], tools: true, reasoning: false },
  { id: 'flux', output_modalities: ['image'], tools: false },
  { id: 'gpt-5', output_modalities: ['text'], tools: true, reasoning: true },
  { id: 'veo', output_modalities: ['video'] },
]

describe('textModels', () => {
  it('keeps only text models', () => { expect(textModels(sample).map(m => m.id)).toEqual(['openai', 'gpt-5']) })
  it('returns [] for empty', () => { expect(textModels([])).toEqual([]) })
})

describe('sortModels', () => {
  it('ranks tools+reasoning above plain tools', () => { expect(sortModels(sample)[0].id).toBe('gpt-5') })
  it('does not mutate input', () => { const i = sample.slice(0, 2); sortModels(i); expect(i.length).toBe(2) })
})

describe('modelLabel', () => {
  it('appends tags for reasoning/tools', () => { expect(modelLabel(sample[2])).toBe('gpt-5 (reasoning, tools)') })
  it('handles null', () => { expect(modelLabel(null)).toBe('') })
})
