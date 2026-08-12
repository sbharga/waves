import type { WallpaperState } from './types'

const COOLORS_HOSTS = new Set(['coolors.co', 'www.coolors.co'])
const HEX_SEGMENT = /^[0-9a-f]{6}$/i

function hexToChannels(color: string): [number, number, number] {
  const value = Number.parseInt(color.slice(1), 16)
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

function channelsToHex(channels: [number, number, number]): string {
  return `#${channels.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0')).join('')}`
}

/**
 * Deterministically proposes the next color to append to a palette: the
 * channel-wise midpoint of the last two colors when there are at least two,
 * or the sole color darkened by ~25% when there is only one.
 */
export function nextPaletteColor(palette: WallpaperState['palette']): string {
  if (palette.length === 0) return '#5b568f'
  if (palette.length === 1) {
    const [r, g, b] = hexToChannels(palette[0])
    return channelsToHex([r * 0.75, g * 0.75, b * 0.75])
  }
  const [ar, ag, ab] = hexToChannels(palette[palette.length - 2])
  const [br, bg, bb] = hexToChannels(palette[palette.length - 1])
  return channelsToHex([(ar + br) / 2, (ag + bg) / 2, (ab + bb) / 2])
}

export function parseCoolorsUrl(value: string): WallpaperState['palette'] | null {
  try {
    const candidate = /^https?:\/\//i.test(value.trim())
      ? value.trim()
      : `https://${value.trim()}`
    const url = new URL(candidate)
    if (!COOLORS_HOSTS.has(url.hostname.toLowerCase())) return null

    const segments = url.pathname.split('/').filter(Boolean)
    const paletteSlug = segments[0] === 'palette' ? segments[1] : segments[0]
    const colors = paletteSlug?.split('-') ?? []
    if (colors.length === 0 || !colors.every((color) => HEX_SEGMENT.test(color))) return null

    return colors.map((color) => `#${color.toLowerCase()}`)
  } catch {
    return null
  }
}
