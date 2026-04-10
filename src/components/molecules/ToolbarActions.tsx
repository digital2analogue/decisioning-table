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
    <div className="dt-toolbar px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="dt-toolbar-name">{rulesetName}</h2>
        <span className="dt-rule-count">
          {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
        </span>
        {someSelected && (
          <button onClick={onDeleteSelected} className="dt-delete-selected ml-2">
            <Trash2Icon size={13} />
            Delete {selectedCount} selected
          </button>
        )}
      </div>
      <button onClick={onAddRule} className="dt-add-rule-btn">
        <PlusIcon size={13} />
        Add Rule
      </button>
    </div>
  )
}
