import { describe, it, expect } from 'vitest'
import { buildQuery } from '../src/services/pollinations.js'

describe('buildQuery', () => {
  it('returns empty string for no params', () => { expect(buildQuery({})).toBe('') })
  it('returns empty string when all params are null/undefined', () => { expect(buildQuery({ a: null, b: undefined })).toBe('') })
  it('skips null/undefined but keeps falsy values', () => {
    expect(buildQuery({ model: 'flux', width: 0, seed: null, enhance: false })).toBe('?model=flux&width=0&enhance=false')
  })
  it('url-encodes keys and values', () => {
    expect(buildQuery({ prompt: 'a cat in space' })).toBe('?prompt=a+cat+in+space')
  })
})
