import { useWallpaperCanvas } from '../hooks/useWallpaperCanvas'
import type { WallpaperState } from '../types'

/**
 * Full-viewport, blurred render of the current wallpaper sitting behind the
 * device frame and dock. Purely atmospheric — the sharp device frame in
 * WallpaperPreview remains the single source of truth for what exports.
 */
export function AmbientBackdrop({ state }: { state: WallpaperState }) {
  const { frameRef, canvasRef } = useWallpaperCanvas(state)

  return (
    <div ref={frameRef} className="ambient-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="ambient-scrim" />
    </div>
  )
}
