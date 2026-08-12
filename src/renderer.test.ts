import { describe, expect, it } from 'vitest'
import { wavePoints } from './renderer'

describe('wave geometry', () => {
  it('is deterministic for the same seed', () => {
    expect(wavePoints(42, 2)).toEqual(wavePoints(42, 2))
    expect(wavePoints(43, 2)).not.toEqual(wavePoints(42, 2))
  })

  it('samples every layer from a single sinusoidal curve', () => {
    const points = wavePoints(930, 2)
    expect(points).toHaveLength(129)
    expect(points[0].x).toBe(0)
    expect(points.at(-1)?.x).toBe(1)

    const midpoint = (Math.max(...points.map((point) => point.y)) + Math.min(...points.map((point) => point.y))) / 2
    const centered = points.map((point) => point.y - midpoint)
    const signChanges = centered.slice(1).filter((value, index) => value * centered[index] < 0)
    expect(signChanges.length).toBeGreaterThanOrEqual(1)
  })
})
