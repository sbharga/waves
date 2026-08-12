export interface WallpaperState {
  version: 1
  presetId: string
  width: number
  height: number
  palette: string[]
  seed: number
  depth: number
}

export interface DevicePreset {
  id: string
  label: string
  group: 'Mobile' | 'Computer' | 'Desktop'
  width: number
  height: number
}

export type RenderOptions = Pick<
  WallpaperState,
  'palette' | 'seed' | 'depth'
>
