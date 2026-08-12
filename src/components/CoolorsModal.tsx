import { X } from 'lucide-react'

export function CoolorsModal({
  url,
  onUrlChange,
  onSubmit,
  onClose,
}: {
  url: string
  onUrlChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="import-modal" role="dialog" aria-modal="true" aria-labelledby="coolors-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close Coolors import">
          <X size={18} />
        </button>
        <img className="modal-logo" src="/coolors-logo.svg" alt="Coolors" />
        <h2 id="coolors-modal-title">Import a palette</h2>
        <p>Paste a Coolors palette link containing one or more colors.</p>
        <form className="coolors-form" onSubmit={onSubmit}>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://coolors.co/…"
            aria-label="Coolors palette URL"
            spellCheck="false"
            autoFocus
          />
          <button className="primary-button" type="submit" disabled={!url.trim()}>Import palette</button>
        </form>
      </section>
    </div>
  )
}
