import { PlusIcon, Trash2Icon } from 'lucide-react'

export interface ToolbarActionsProps {
  rulesetName: string
  ruleCount: number
  selectedCount: number
  someSelected: boolean
  onDeleteSelected: () => void
  onAddRule: () => void
}

export function ToolbarActions({
  rulesetName,
  ruleCount,
  selectedCount,
  someSelected,
  onDeleteSelected,
  onAddRule,
}: ToolbarActionsProps) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between"
      style={{ borderBottom: '1px solid var(--color-border-muted)' }}
    >
      <div className="flex items-center gap-3">
        <h2
          style={{
            fontFamily: 'var(--font-label-medium-family)',
            fontSize: 'var(--font-label-medium-size)',
            lineHeight: 'var(--font-label-medium-line-height)',
            fontWeight: 600,
            color: 'var(--color-foreground-primary)',
            margin: 0,
          }}
        >
          {rulesetName}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-label-small-family)',
            fontSize: 'var(--font-label-small-size)',
            color: 'var(--color-foreground-muted)',
            backgroundColor: 'var(--color-background-default)',
            padding: '2px var(--space-sm)',
            borderRadius: '9999px',
          }}
        >
          {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
        </span>
        {someSelected && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 ml-2"
            style={{
              fontFamily: 'var(--font-label-small-family)',
              fontSize: 'var(--font-label-small-size)',
              color: 'var(--color-foreground-danger)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Trash2Icon size={13} />
            Delete {selectedCount} selected
          </button>
        )}
      </div>
      <button
        onClick={onAddRule}
        className="flex items-center gap-1.5 rounded-lg transition-opacity hover:opacity-80"
        style={{
          padding: '6px var(--space-md)',
          fontFamily: 'var(--font-label-small-family)',
          fontSize: 'var(--font-label-small-size)',
          fontWeight: 600,
          color: 'var(--color-foreground-inverse)',
          backgroundColor: 'var(--color-foreground-accent)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <PlusIcon size={13} />
        Add Rule
      </button>
    </div>
  )
}
