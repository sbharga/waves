import { useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react'

const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function PaletteBar({
  palette,
  maxColors,
  onUpdateColor,
  onMoveColor,
  onRemoveColor,
  onAddColor,
}: {
  palette: string[]
  maxColors: number
  onUpdateColor: (index: number, color: string) => void
  onMoveColor: (fromIndex: number, toIndex: number) => void
  onRemoveColor: (index: number) => void
  onAddColor: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [hexDraft, setHexDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const [draggedColor, setDraggedColor] = useState<number | null>(null)
  const [colorDropTarget, setColorDropTarget] = useState<number | null>(null)
  const [trashDropTarget, setTrashDropTarget] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedColor = selected !== null ? palette[selected] : undefined

  useEffect(() => {
    if (selectedColor) setHexDraft(selectedColor)
  }, [selected, selectedColor])

  useEffect(() => {
    if (selected === null) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setSelected(null)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selected])

  const commitHex = () => {
    if (selected === null) return
    if (HEX_COLOR.test(hexDraft)) {
      onUpdateColor(selected, hexDraft.toLowerCase())
    } else {
      setHexDraft(palette[selected])
    }
  }

  const copyHex = async () => {
    if (selectedColor === undefined) return
    try {
      await navigator.clipboard.writeText(selectedColor)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      window.prompt('Copy this color:', selectedColor)
    }
  }

  const removeSelected = () => {
    if (selected === null) return
    const focusIndex = Math.max(0, selected - 1)
    onRemoveColor(selected)
    setSelected(null)
    window.requestAnimationFrame(() => swatchRefs.current[focusIndex]?.focus())
  }

  const moveSelected = (toIndex: number) => {
    if (selected === null) return
    onMoveColor(selected, toIndex)
    setSelected(toIndex)
    window.requestAnimationFrame(() => swatchRefs.current[toIndex]?.focus())
  }

  return (
    <div className="palette-bar" ref={rootRef}>
      <div className="palette-swatches" role="list" aria-label="Custom wallpaper colors" aria-describedby="palette-reorder-help">
        {palette.map((color, index) => (
          <button
            type="button"
            key={index}
            ref={(node) => { swatchRefs.current[index] = node }}
            className={[
              'color-swatch',
              draggedColor === index ? 'dragging' : '',
              colorDropTarget === index ? 'drop-target' : '',
              selected === index ? 'selected' : '',
            ].filter(Boolean).join(' ')}
            style={{ backgroundColor: color }}
            role="listitem"
            draggable
            aria-haspopup="dialog"
            aria-expanded={selected === index}
            aria-label={`Color ${index + 1}: ${color}. Press Enter to edit, use arrow keys to reorder, or press Delete to remove.`}
            title={`Color ${index + 1}: ${color}`}
            onClick={() => setSelected((current) => (current === index ? null : index))}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(index))
              setDraggedColor(index)
            }}
            onDragEnter={() => {
              setColorDropTarget(index)
              setTrashDropTarget(false)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(event) => {
              event.preventDefault()
              const fromIndex = Number(event.dataTransfer.getData('text/plain'))
              if (Number.isInteger(fromIndex)) onMoveColor(fromIndex, index)
              setDraggedColor(null)
              setColorDropTarget(null)
              setTrashDropTarget(false)
            }}
            onDragEnd={() => {
              setDraggedColor(null)
              setColorDropTarget(null)
              setTrashDropTarget(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' && index > 0) {
                event.preventDefault()
                onMoveColor(index, index - 1)
                if (selected === index) setSelected(index - 1)
                window.requestAnimationFrame(() => swatchRefs.current[index - 1]?.focus())
              }
              if (event.key === 'ArrowRight' && index < palette.length - 1) {
                event.preventDefault()
                onMoveColor(index, index + 1)
                if (selected === index) setSelected(index + 1)
                window.requestAnimationFrame(() => swatchRefs.current[index + 1]?.focus())
              }
              if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault()
                onRemoveColor(index)
                if (palette.length > 1) {
                  if (selected === index) setSelected(null)
                  const focusIndex = Math.max(0, index - 1)
                  window.requestAnimationFrame(() => swatchRefs.current[focusIndex]?.focus())
                }
              }
            }}
          />
        ))}
        <button
          type="button"
          className="palette-add"
          onClick={onAddColor}
          disabled={palette.length >= maxColors}
          aria-label="Add a color"
          title={palette.length >= maxColors ? `A palette can hold up to ${maxColors} colors` : 'Add a color'}
        >
          <Plus size={15} />
        </button>
      </div>
      <span id="palette-reorder-help" className="sr-only">
        Drag colors into a new order or onto the trash bin to remove them. When focused, use the left and right arrow keys to reorder, or Delete to remove.
      </span>

      <div
        className={`palette-trash${draggedColor !== null && palette.length > 1 ? ' visible' : ''}${trashDropTarget ? ' drop-target' : ''}`}
        aria-hidden={draggedColor === null || palette.length === 1}
        onDragEnter={() => {
          setTrashDropTarget(true)
          setColorDropTarget(null)
        }}
        onDragLeave={() => setTrashDropTarget(false)}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(event) => {
          event.preventDefault()
          const fromIndex = Number(event.dataTransfer.getData('text/plain'))
          if (Number.isInteger(fromIndex) && fromIndex >= 0 && fromIndex < palette.length) onRemoveColor(fromIndex)
          setDraggedColor(null)
          setColorDropTarget(null)
          setTrashDropTarget(false)
        }}
      >
        <Trash2 size={15} />
        <span>Drop to remove</span>
      </div>

      {selected !== null && selectedColor && (
        <div className="color-popover" role="dialog" aria-label={`Edit color ${selected + 1}`}>
          <label className="color-popover-well" style={{ backgroundColor: selectedColor }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(event) => onUpdateColor(selected, event.target.value)}
              aria-label={`Choose color ${selected + 1}`}
            />
          </label>
          <div className="color-popover-fields">
            <input
              type="text"
              className="hex-input"
              value={hexDraft}
              onChange={(event) => setHexDraft(event.target.value)}
              onBlur={commitHex}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitHex()
                }
              }}
              spellCheck="false"
              aria-label="Hex color value"
            />
            <button type="button" className="icon-button" onClick={copyHex} aria-label="Copy hex value" title="Copy hex value">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="color-popover-actions">
            <button type="button" className="icon-button" disabled={selected === 0} onClick={() => moveSelected(selected - 1)} aria-label="Move color left">
              <ChevronLeft size={15} />
            </button>
            <button type="button" className="icon-button" disabled={selected === palette.length - 1} onClick={() => moveSelected(selected + 1)} aria-label="Move color right">
              <ChevronRight size={15} />
            </button>
            <button type="button" className="remove-button" onClick={removeSelected} disabled={palette.length === 1}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
