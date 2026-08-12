import type { DevicePreset, WallpaperState } from './types'

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'phone', label: 'Phone', group: 'Mobile', width: 1179, height: 2556 },
  { id: 'phone-large', label: 'Large phone', group: 'Mobile', width: 1440, height: 3200 },
  { id: 'tablet', label: 'Tablet', group: 'Mobile', width: 2048, height: 2732 },
  { id: 'laptop', label: 'Laptop', group: 'Computer', width: 2560, height: 1600 },
  { id: 'full-hd', label: 'Full HD', group: 'Computer', width: 1920, height: 1080 },
  { id: 'qhd', label: 'QHD', group: 'Desktop', width: 2560, height: 1440 },
  { id: '4k', label: '4K UHD', group: 'Desktop', width: 3840, height: 2160 },
  { id: '5k', label: '5K', group: 'Desktop', width: 5120, height: 2880 },
  { id: 'ultrawide', label: 'Ultrawide', group: 'Desktop', width: 3440, height: 1440 },
  { id: 'super-ultrawide', label: 'Super ultrawide', group: 'Desktop', width: 5120, height: 1440 },
]

export const PALETTES: Record<string, WallpaperState['palette']> = {
  'Purple dusk': ['#9490c1', '#5d6597', '#211b61', '#090d2c', '#04081e'],
  Ocean: ['#bfe8e5', '#5bc0be', '#2c7da0', '#184e77', '#082f49'],
  Aurora: ['#d8f3dc', '#74c69d', '#40916c', '#5b5f97', '#29274c'],
  Sunset: ['#ffd6a5', '#ff9f68', '#e76f51', '#9d4edd', '#3c096c'],
  Monochrome: ['#ececec', '#c9c9c9', '#8c8c8c', '#424242', '#151515'],
  Rosewood: ['#f8e1e7', '#dfa5b4', '#b56576', '#6d3b47', '#2f1b22'],
}

export const MAX_PALETTE_COLORS = 8

export const DEFAULT_STATE: WallpaperState = {
  version: 1,
  presetId: 'full-hd',
  width: 1920,
  height: 1080,
  palette: [...PALETTES['Purple dusk']],
  seed: 28473,
  depth: 56,
}
