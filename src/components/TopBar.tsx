import { Copy, Download } from 'lucide-react'

export function TopBar({
  formatLabel,
  width,
  height,
  exporting,
  onCopyLink,
  onDownload,
}: {
  formatLabel: string
  width: number
  height: number
  exporting: boolean
  onCopyLink: () => void
  onDownload: () => void
}) {
  return (
    <header className="top-bar">
      <span className="top-bar-meta">{formatLabel} · {width} × {height}</span>

      <div className="top-bar-actions">
        <button className="share-button" type="button" onClick={onCopyLink} aria-label="Copy link" title="Copy link (L)">
          <Copy size={15} />
        </button>
        <button
          className="primary-button download-button"
          type="button"
          onClick={onDownload}
          disabled={exporting}
          aria-label={exporting ? 'Creating…' : 'Download PNG'}
          title="Download PNG (D)"
        >
          <Download size={16} />
        </button>
      </div>
    </header>
  )
}
