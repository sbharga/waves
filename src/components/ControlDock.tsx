import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  Frame,
  Palette as PaletteIcon,
  RefreshCw,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react'
import { MAX_PALETTE_COLORS, PALETTES } from '../constants'
import type { WallpaperState } from '../types'
import { FormatSelect } from './FormatSelect'
import { PaletteBar } from './PaletteBar'
import { Slider } from './Slider'

export type DrawerId = 'presets' | 'canvas' | null

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => setDraft(String(value)), [value])

  const commit = () => {
    if (!draft.trim()) {
      setDraft(String(value))
      return
    }
    const nextValue = Number(draft)
    if (Number.isFinite(nextValue)) onChange(nextValue)
    else setDraft(String(value))
  }

  return (
    <label>
      <span>{label} <small>px</small></span>
      <input
        type="number"
        min="320"
        max="7680"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
          if (event.key === 'Escape') {
            event.preventDefault()
            setDraft(String(value))
          }
        }}
        aria-label={`${label} in pixels`}
      />
    </label>
  )
}

export function ControlDock({
  state,
  paletteName,
  portrait,
  activeDrawer,
  hidden,
  onToggleDrawer,
  onToggleHidden,
  onUpdateColor,
  onMoveColor,
  onRemoveColor,
  onAddColor,
  onSelectPalette,
  onOpenCoolorsImport,
  onDepthChange,
  onShuffle,
  onChooseDevice,
  onWidthChange,
  onHeightChange,
  onRotate,
}: {
  state: WallpaperState
  paletteName?: string
  portrait: boolean
  activeDrawer: DrawerId
  hidden: boolean
  onToggleDrawer: (id: Exclude<DrawerId, null>) => void
  onToggleHidden: () => void
  onUpdateColor: (index: number, color: string) => void
  onMoveColor: (fromIndex: number, toIndex: number) => void
  onRemoveColor: (index: number) => void
  onAddColor: () => void
  onSelectPalette: (colors: string[]) => void
  onOpenCoolorsImport: () => void
  onDepthChange: (depth: number) => void
  onShuffle: () => void
  onChooseDevice: (id: string) => void
  onWidthChange: (width: number) => void
  onHeightChange: (height: number) => void
  onRotate: () => void
}) {
  if (hidden) {
    return (
      <button type="button" className="dock-reveal" onClick={onToggleHidden} aria-label="Show controls (H)" title="Show controls (H)">
        <SlidersHorizontal size={16} />
      </button>
    )
  }

  return (
    <div className="control-dock">
      {activeDrawer && (
        <div className="dock-drawer" id="dock-drawer" role="region" aria-label={activeDrawer === 'presets' ? 'Palette presets' : 'Canvas size'}>
          {activeDrawer === 'presets' && (
            <div className="drawer-presets">
              <div className="preset-heading">
                <span>Presets</span>
                <button type="button" className="import-link" onClick={onOpenCoolorsImport}>Import from Coolors</button>
              </div>
              <div className="palette-list">
                {Object.entries(PALETTES).map(([name, colors]) => (
                  <button
                    type="button"
                    key={name}
                    className={paletteName === name ? 'palette-option active' : 'palette-option'}
                    onClick={() => onSelectPalette([...colors])}
                    aria-pressed={paletteName === name}
                  >
                    <span>{name}</span>
                    {paletteName === name && <Check size={15} />}
                    <span className="mini-palette">
                      {colors.slice(0, 5).map((color) => <i key={color} style={{ backgroundColor: color }} />)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeDrawer === 'canvas' && (
            <div className="drawer-canvas">
              <span className="field-label">Format</span>
              <FormatSelect presetId={state.presetId} portrait={portrait} onChange={onChooseDevice} />
              <div className="dimension-row">
                <DimensionField label="Width" value={state.width} onChange={onWidthChange} />
                <span className="dimension-x">×</span>
                <DimensionField label="Height" value={state.height} onChange={onHeightChange} />
                <button className="icon-button" type="button" onClick={onRotate} aria-label="Rotate orientation" title="Rotate orientation">
                  <RotateCw size={17} />
                </button>
              </div>
              <p className="shortcut-legend">
                <kbd>N</kbd> new wave <kbd>D</kbd> download <kbd>L</kbd> copy link <kbd>H</kbd> hide dock
              </p>
            </div>
          )}
        </div>
      )}

      <div className="dock-bar">
        <PaletteBar
          palette={state.palette}
          maxColors={MAX_PALETTE_COLORS}
          onUpdateColor={onUpdateColor}
          onMoveColor={onMoveColor}
          onRemoveColor={onRemoveColor}
          onAddColor={onAddColor}
        />

        <div className="dock-divider" aria-hidden="true" />

        <button type="button" className="shuffle-button" onClick={onShuffle} title="New wave (N)">
          <RefreshCw size={15} /> <span className="button-label">New wave</span>
        </button>

        <Slider label="Depth" value={state.depth} onChange={onDepthChange} />

        <div className="dock-divider" aria-hidden="true" />

        <div className="dock-tabs">
          <button
            type="button"
            aria-expanded={activeDrawer === 'canvas'}
            aria-controls="dock-drawer"
            className={activeDrawer === 'canvas' ? 'dock-tab active' : 'dock-tab'}
            onClick={() => onToggleDrawer('canvas')}
          >
            <Frame size={14} /> Canvas
          </button>
          <button
            type="button"
            aria-expanded={activeDrawer === 'presets'}
            aria-controls="dock-drawer"
            className={activeDrawer === 'presets' ? 'dock-tab active' : 'dock-tab'}
            onClick={() => onToggleDrawer('presets')}
          >
            <PaletteIcon size={14} /> Presets
          </button>
        </div>

        <button type="button" className="dock-collapse" onClick={onToggleHidden} aria-label="Hide controls (H)" title="Hide controls (H)">
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  )
}
