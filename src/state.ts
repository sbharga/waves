import { DEFAULT_STATE, DEVICE_PRESETS } from './constants'
import type { WallpaperState } from './types'

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)))
const numeric = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function reorderPalette(
  palette: WallpaperState['palette'],
  fromIndex: number,
  toIndex: number,
): WallpaperState['palette'] {
  const reordered = [...palette]
  const [color] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, color)
  return reordered
}

export function normalizeState(input: Partial<WallpaperState>): WallpaperState {
  const palette: WallpaperState['palette'] = Array.isArray(input.palette) && input.palette.length > 0
    && input.palette.every((color) => typeof color === 'string' && HEX_COLOR.test(color))
      ? input.palette.map((color) => color.toLowerCase())
      : [...DEFAULT_STATE.palette]

  const width = clamp(numeric(input.width, DEFAULT_STATE.width), 320, 7680)
  const height = clamp(numeric(input.height, DEFAULT_STATE.height), 320, 7680)
  const matchedPreset = DEVICE_PRESETS.find(
    (preset) =>
      (preset.width === width && preset.height === height)
      || (preset.width === height && preset.height === width),
  )

  const requestedPreset = typeof input.presetId === 'string'
    ? DEVICE_PRESETS.find((preset) => preset.id === input.presetId)
    : undefined
  const presetMatches = requestedPreset && (
    (requestedPreset.width === width && requestedPreset.height === height)
    || (requestedPreset.width === height && requestedPreset.height === width)
  )

  return {
    version: 1,
    presetId: input.presetId === 'custom'
      ? 'custom'
      : presetMatches ? requestedPreset.id : matchedPreset?.id ?? 'custom',
    width,
    height,
    palette,
    seed: clamp(numeric(input.seed, DEFAULT_STATE.seed), 1, 2_147_483_647),
    depth: clamp(numeric(input.depth, DEFAULT_STATE.depth), 0, 100),
  }
}

const HASH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const HASH_LENGTH = 31
const HASH_RADIX = 64n
const DIMENSION_RADIX = 7361n
const COLOR_RADIX = 16_777_216n
const SEED_RADIX = 2_147_483_647n
const DEPTH_RADIX = 101n

function encodeInteger(value: bigint, minimumLength = 1) {
  let encoded = ''
  do {
    encoded = HASH_ALPHABET[Number(value % HASH_RADIX)] + encoded
    value /= HASH_RADIX
  } while (value > 0n)
  return encoded.padStart(minimumLength, HASH_ALPHABET[0])
}

function decodeInteger(encoded: string) {
  let value = 0n
  for (const character of encoded) {
    value = value * HASH_RADIX + BigInt(HASH_ALPHABET.indexOf(character))
  }
  return value
}

function packState(state: WallpaperState) {
  let packed = BigInt(state.width - 320)
  packed = packed * DIMENSION_RADIX + BigInt(state.height - 320)
  packed = packed * 2n + BigInt(state.presetId === 'custom' ? 1 : 0)
  for (const color of state.palette) {
    packed = packed * COLOR_RADIX + BigInt(Number.parseInt(color.slice(1), 16))
  }
  packed = packed * SEED_RADIX + BigInt(state.seed - 1)
  packed = packed * DEPTH_RADIX + BigInt(state.depth)
  return packed
}

function serializeLegacyState(state: WallpaperState) {
  return encodeInteger(packState(state), HASH_LENGTH)
}

export function serializeState(state: WallpaperState) {
  return `${encodeInteger(BigInt(state.palette.length))}.${encodeInteger(packState(state))}`
}

function unpackState(packedValue: bigint, paletteLength: number) {
  let packed = packedValue
  const depth = Number(packed % DEPTH_RADIX)
  packed /= DEPTH_RADIX
  const seed = Number(packed % SEED_RADIX) + 1
  packed /= SEED_RADIX

  const palette = Array<string>(paletteLength)
  for (let index = palette.length - 1; index >= 0; index -= 1) {
    const color = Number(packed % COLOR_RADIX)
    palette[index] = `#${color.toString(16).padStart(6, '0')}`
    packed /= COLOR_RADIX
  }

  const customPreset = packed % 2n === 1n
  packed /= 2n
  const height = Number(packed % DIMENSION_RADIX) + 320
  packed /= DIMENSION_RADIX
  const width = Number(packed % DIMENSION_RADIX) + 320
  packed /= DIMENSION_RADIX
  if (packed !== 0n) return null

  const state = normalizeState({
    presetId: customPreset ? 'custom' : undefined,
    width,
    height,
    palette,
    seed,
    depth,
  })
  return packed === 0n ? state : null
}

export function parseState(encoded: string | null): WallpaperState | null {
  if (!encoded) return null

  if (/^[A-Za-z0-9_-]{31}$/.test(encoded)) {
    const state = unpackState(decodeInteger(encoded), 5)
    return state && serializeLegacyState(state) === encoded ? state : null
  }

  const match = encoded.match(/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/)
  if (!match) return null
  const paletteLengthValue = decodeInteger(match[1])
  if (paletteLengthValue < 1n || paletteLengthValue > BigInt(Math.ceil(match[2].length / 4))) return null

  const paletteLength = Number(paletteLengthValue)
  if (!Number.isSafeInteger(paletteLength)) return null
  const state = unpackState(decodeInteger(match[2]), paletteLength)
  return state && serializeState(state) === encoded ? state : null
}

export function initialState(): WallpaperState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  return parseState(window.location.hash.slice(1)) ?? DEFAULT_STATE
}
