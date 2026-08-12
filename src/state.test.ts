import { describe, expect, it } from 'vitest'
import { DEFAULT_STATE } from './constants'
import { normalizeState, parseState, reorderPalette, serializeState } from './state'

describe('wallpaper state', () => {
  it('round trips every shared design setting', () => {
    const design = normalizeState({
      ...DEFAULT_STATE,
      presetId: 'custom',
      width: 3333,
      height: 1777,
      palette: ['#112233', '#223344', '#334455', '#445566', '#556677'],
      seed: 987654,
      depth: 0,
    })

    const encoded = serializeState(design)
    expect(parseState(encoded)).toEqual(design)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  })

  it('clamps unsafe dimensions and settings', () => {
    const design = normalizeState({ width: 12, height: 99_999, depth: -8 })
    expect(design.width).toBe(320)
    expect(design.height).toBe(7680)
    expect(design.depth).toBe(0)
  })

  it('rejects malformed and unknown shared states', () => {
    expect(parseState('not-a-design')).toBeNull()
    expect(parseState('_______________________________')).toBeNull()
  })

  it('round trips the full supported range', () => {
    const design = normalizeState({
      presetId: 'custom',
      width: 7680,
      height: 320,
      palette: ['#000000', '#ffffff', '#123456', '#abcdef', '#987654'],
      seed: 2_147_483_647,
      depth: 100,
    })

    expect(parseState(serializeState(design))).toEqual(design)
  })

  it('normalizes and round trips palettes of different lengths', () => {
    for (const palette of [
      ['#112233'],
      ['#112233', '#223344', '#334455'],
      ['#112233', '#223344', '#334455', '#445566', '#556677', '#667788', '#778899'],
    ]) {
      const design = normalizeState({ ...DEFAULT_STATE, palette })
      expect(design.palette).toEqual(palette)
      expect(parseState(serializeState(design))).toEqual(design)
    }
  })

  it('continues to parse legacy five-color share links', () => {
    const design = normalizeState({
      ...DEFAULT_STATE,
      presetId: 'custom',
      width: 3333,
      height: 1777,
      palette: ['#112233', '#223344', '#334455', '#445566', '#556677'],
      seed: 987654,
      depth: 0,
    })

    expect(parseState('IWGqoLWMcE3WnXwfJgSnro0wMgmQK8G')).toEqual(design)
  })

  it('reorders colors without changing the palette contents', () => {
    const palette = ['#111111', '#222222', '#333333', '#444444', '#555555'] as const

    expect(reorderPalette([...palette], 1, 4)).toEqual([
      '#111111', '#333333', '#444444', '#555555', '#222222',
    ])
    expect(reorderPalette([...palette], 4, 0)).toEqual([
      '#555555', '#111111', '#222222', '#333333', '#444444',
    ])
  })
})
