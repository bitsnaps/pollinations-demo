import { describe, it, expect } from 'vitest'

globalThis.btoa = globalThis.btoa || ((s) => Buffer.from(s, 'binary').toString('base64'))
globalThis.atob = globalThis.atob || ((s) => Buffer.from(s, 'base64').toString('binary'))

const { encodePcmToBase64 } = await import('../src/composables/useRealtime.js')

describe('encodePcmToBase64', () => {
  it('encodes full-scale positive', () => {
    const bytes = Uint8Array.from(Buffer.from(encodePcmToBase64(new Float32Array([1.0])), 'base64'))
    expect([bytes[0], bytes[1]]).toEqual([0xff, 0x7f])
  })
  it('encodes full-scale negative', () => {
    const bytes = Uint8Array.from(Buffer.from(encodePcmToBase64(new Float32Array([-1.0])), 'base64'))
    expect([bytes[0], bytes[1]]).toEqual([0x00, 0x80])
  })
  it('clamps out-of-range', () => {
    const bytes = Uint8Array.from(Buffer.from(encodePcmToBase64(new Float32Array([2.0])), 'base64'))
    expect([bytes[0], bytes[1]]).toEqual([0xff, 0x7f])
  })
})
