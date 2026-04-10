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
        className="absolute right-0 top-7 z-20 rounded-lg py-1"
        style={{
          minWidth: '140px',
          backgroundColor: 'var(--color-background-elevated)',
          border: '1px solid var(--color-border-muted)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <button
          onClick={onDuplicate}
          className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors"
          style={{
            fontFamily: 'var(--font-label-medium-family)',
            fontSize: 'var(--font-label-medium-size)',
            color: 'var(--color-foreground-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-alt)'
            e.currentTarget.style.color = 'var(--color-foreground-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-foreground-secondary)'
          }}
        >
          <CopyIcon size={13} />
          Duplicate
        </button>
        <div style={{ borderTop: '1px solid var(--color-border-muted)', margin: '4px 0' }} />
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors"
          style={{
            fontFamily: 'var(--font-label-medium-family)',
            fontSize: 'var(--font-label-medium-size)',
            color: 'var(--color-foreground-danger)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-danger-subtle)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
