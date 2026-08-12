import type { RenderOptions } from './types'

type Point = { x: number; y: number }

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function wavePoints(seed: number, layer: number, layerCount = 4): Point[] {
  const random = seededRandom(seed + layer * 7919)
  const baseline = 0.13 + layer * (0.82 / layerCount)
  const waveAmplitude = 0.065 + random() * 0.055
  const cycles = 0.65 + random() * 0.5
  const phaseOffset = random() * Math.PI * 2
  const sampleCount = 128

  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    const x = index / sampleCount
    const angle = x * Math.PI * 2 * cycles + phaseOffset
    return { x, y: baseline + Math.sin(angle) * waveAmplitude }
  })
}

export function renderWallpaper(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions,
) {
  const { palette, seed, depth } = options
  context.clearRect(0, 0, width, height)
  context.fillStyle = palette[0]
  context.fillRect(0, 0, width, height)

  const layerCount = palette.length - 1
  for (let layer = 0; layer < layerCount; layer += 1) {
    const points = wavePoints(seed, layer, layerCount)
    const path = new Path2D()
    path.moveTo(0, height)
    path.lineTo(0, points[0].y * height)
    for (let index = 1; index < points.length; index += 1) {
      path.lineTo(points[index].x * width, points[index].y * height)
    }

    path.lineTo(width, height)
    path.closePath()

    context.save()
    context.shadowColor = `rgba(4, 7, 28, ${0.08 + depth * 0.003})`
    context.shadowBlur = Math.max(4, Math.min(width, height) * (0.006 + depth * 0.00016))
    context.shadowOffsetY = Math.max(2, Math.min(width, height) * 0.008)
    context.fillStyle = palette[layer + 1]
    context.fill(path)
    context.restore()
  }
}
