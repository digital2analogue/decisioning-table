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
      style={{ borderBottom: 'var(--dt-border-width) solid var(--dt-color-border-default)' }}
    >
      <div className="flex items-center gap-3">
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--dt-color-text-primary)', fontFamily: 'var(--dt-font-mono)' }}
        >
          {rulesetName}
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            color: 'var(--dt-color-text-secondary)',
            background: 'var(--dt-color-neutral-muted)',
          }}
        >
          {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
        </span>
        {someSelected && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 text-xs ml-2 transition-colors"
            style={{ color: 'var(--dt-color-danger-text)' }}
          >
            <Trash2Icon size={13} />
            Delete {selectedCount} selected
          </button>
        )}
      </div>
      <button
        onClick={onAddRule}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
        style={{
          color: 'var(--dt-color-text-inverse)',
          background: 'var(--dt-color-accent-default)',
          fontFamily: 'var(--dt-font-mono)',
        }}
      >
        <PlusIcon size={13} />
        Add Rule
      </button>
    </div>
  )
}
