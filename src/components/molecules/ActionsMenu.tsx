import { CopyIcon, Trash2Icon } from 'lucide-react'

export interface ActionsMenuProps {
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

export function ActionsMenu({ onDuplicate, onDelete, onClose }: ActionsMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        className="absolute right-0 top-7 z-20 rounded-lg py-1 min-w-[140px]"
        style={{
          background: 'var(--dt-color-bg-overlay)',
          border: 'var(--dt-border-width) solid var(--dt-color-border-default)',
          boxShadow: 'var(--dt-shadow-md)',
        }}
      >
        <button
          onClick={onDuplicate}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--dt-color-text-primary)] hover:bg-[var(--dt-color-bg-raised)] transition-colors"
        >
          <CopyIcon size={13} />
          Duplicate
        </button>
        <div
          className="my-1"
          style={{ borderTop: 'var(--dt-border-width) solid var(--dt-color-border-muted)' }}
        />
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--dt-color-danger-text)] hover:bg-[var(--dt-color-danger-subtle)] transition-colors"
        >
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
