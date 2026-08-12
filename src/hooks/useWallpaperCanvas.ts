import { useEffect, useRef } from 'react'
import { renderWallpaper } from '../renderer'
import type { WallpaperState } from '../types'

/**
 * Sizes a canvas to match its parent frame at the device pixel ratio (capped
 * at 2x) and redraws the wallpaper whenever the frame resizes or state
 * changes. Shared by the sharp device-frame preview and the blurred ambient
 * backdrop so both stay pixel-accurate to the same deterministic renderer.
 */
export function useWallpaperCanvas(state: WallpaperState) {
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return
    const context = canvas.getContext('2d')
    if (!context) return

    const resize = () => {
      const bounds = frame.getBoundingClientRect()
      const density = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(bounds.width * density))
      canvas.height = Math.max(1, Math.round(bounds.height * density))
    }

    const draw = () => {
      renderWallpaper(context, canvas.width, canvas.height, state)
    }

    const observer = new ResizeObserver(() => {
      resize()
      draw()
    })
    observer.observe(frame)
    resize()
    draw()

    return () => {
      observer.disconnect()
    }
  }, [state])

  return { frameRef, canvasRef }
}
