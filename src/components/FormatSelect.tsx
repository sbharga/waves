import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Monitor, Smartphone } from 'lucide-react'
import { DEVICE_PRESETS } from '../constants'

export function FormatSelect({
  presetId,
  portrait,
  onChange,
}: {
  presetId: string
  portrait: boolean
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const groups = [...new Set(DEVICE_PRESETS.map((preset) => preset.group))]
  const selected = DEVICE_PRESETS.find((preset) => preset.id === presetId)
  const label = presetId === 'custom' || !selected ? 'Custom size' : selected.label

  const choose = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <div className="format-select" ref={rootRef}>
      <button
        type="button"
        className="format-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Format · ${label}`}
      >
        {portrait ? <Smartphone size={16} /> : <Monitor size={16} />}
        <span>{label}</span>
        {selected && <span className="format-trigger-dims">{selected.width}×{selected.height}</span>}
        <ChevronDown size={15} className="format-trigger-chevron" />
      </button>

      {open && (
        <div className="format-menu" role="listbox" aria-label="Format">
          {groups.map((group) => (
            <div className="format-group" key={group}>
              <span className="format-group-label">{group}</span>
              {DEVICE_PRESETS.filter((preset) => preset.group === group).map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  role="option"
                  aria-selected={preset.id === presetId}
                  className={preset.id === presetId ? 'format-option active' : 'format-option'}
                  onClick={() => choose(preset.id)}
                >
                  <span>{preset.label}</span>
                  <span className="format-option-dims">{preset.width}×{preset.height}</span>
                  {preset.id === presetId && <Check size={13} />}
                </button>
              ))}
            </div>
          ))}
          <div className="format-group">
            <button
              type="button"
              role="option"
              aria-selected={presetId === 'custom'}
              className={presetId === 'custom' ? 'format-option active' : 'format-option'}
              onClick={() => choose('custom')}
            >
              <span>Custom size</span>
              {presetId === 'custom' && <Check size={13} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
