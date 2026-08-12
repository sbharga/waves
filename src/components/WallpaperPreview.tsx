import { useWallpaperCanvas } from '../hooks/useWallpaperCanvas'
import type { WallpaperState } from '../types'

export function WallpaperPreview({ state }: { state: WallpaperState }) {
  const { frameRef, canvasRef } = useWallpaperCanvas(state)

  const style = {
    aspectRatio: `${state.width} / ${state.height}`,
    '--ar': state.width / state.height,
  } as React.CSSProperties

  return (
    <div ref={frameRef} className="preview-frame" style={style}>
      <canvas ref={canvasRef} aria-label="Generated wave wallpaper preview" />
    </div>
  )
}
