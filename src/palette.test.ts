import { describe, expect, it } from 'vitest'
import { nextPaletteColor, parseCoolorsUrl } from './palette'

const HEX_COLOR = /^#[0-9a-f]{6}$/

describe('Coolors palette import', () => {
  it('parses five colors from a Coolors palette URL', () => {
    expect(parseCoolorsUrl('https://coolors.co/palette/606c38-283618-fefae0-dda15e-bc6c25')).toEqual([
      '#606c38',
      '#283618',
      '#fefae0',
      '#dda15e',
      '#bc6c25',
    ])
  })

  it('supports links without a protocol and the compact Coolors format', () => {
    expect(parseCoolorsUrl('coolors.co/606C38-283618-FEFAE0-DDA15E-BC6C25')).toEqual([
      '#606c38',
      '#283618',
      '#fefae0',
      '#dda15e',
      '#bc6c25',
    ])
  })

  it('accepts palettes with any positive number of colors', () => {
    expect(parseCoolorsUrl('https://coolors.co/palette/112233')).toEqual(['#112233'])
    expect(parseCoolorsUrl('https://coolors.co/112233-223344-334455-445566-556677-667788-778899')).toEqual([
      '#112233', '#223344', '#334455', '#445566', '#556677', '#667788', '#778899',
    ])
  })

  it('rejects other hosts, malformed colors, and empty palettes', () => {
    expect(parseCoolorsUrl('https://example.com/palette/606c38-283618-fefae0-dda15e-bc6c25')).toBeNull()
    expect(parseCoolorsUrl('https://coolors.co/palette/606c38-nothex-fefae0-dda15e-bc6c25')).toBeNull()
    expect(parseCoolorsUrl('https://coolors.co/palette/')).toBeNull()
  })
})

describe('proposing the next palette color', () => {
  it('returns the channel-wise midpoint of the last two colors when there are at least two', () => {
    expect(nextPaletteColor(['#000000', '#ffffff'])).toBe('#808080')
    expect(nextPaletteColor(['#112233', '#223344', '#334455'])).toBe('#2b3c4d')
  })

  it('darkens the sole color by ~25% when there is only one', () => {
    expect(nextPaletteColor(['#808080'])).toBe('#606060')
  })

  it('always returns a well-formed hex color', () => {
    expect(nextPaletteColor(['#ffffff'])).toMatch(HEX_COLOR)
    expect(nextPaletteColor(['#000000', '#000000'])).toMatch(HEX_COLOR)
    expect(nextPaletteColor(['#ff0000', '#00ff00', '#0000ff'])).toMatch(HEX_COLOR)
  })
})
