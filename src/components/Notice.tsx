import { Check, X } from 'lucide-react'

export type NoticeState = { tone: 'success' | 'error'; message: string } | null

export function Notice({ notice, elevated = false }: { notice: NoticeState; elevated?: boolean }) {
  if (!notice) return null
  return (
    <div className={`notice ${notice.tone}${elevated ? ' elevated' : ''}`} role="status">
      {notice.tone === 'success' ? <Check size={17} /> : <X size={17} />}
      {notice.message}
    </div>
  )
}
