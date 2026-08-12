import { renderWallpaper } from './renderer'
import type { WallpaperState } from './types'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export async function exportPng(state: WallpaperState) {
  const canvas = createCanvas(state.width, state.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas rendering is not available in this browser.')
  renderWallpaper(context, state.width, state.height, state)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('The PNG could not be created.'))
    }, 'image/png')
  })
  downloadBlob(blob, `wave-${state.width}x${state.height}.png`)
}
