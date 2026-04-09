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
    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-800">{rulesetName}</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
        </span>
        {someSelected && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 ml-2"
          >
            <Trash2Icon size={13} />
            Delete {selectedCount} selected
          </button>
        )}
      </div>
      <button
        onClick={onAddRule}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        <PlusIcon size={13} />
        Add Rule
      </button>
    </div>
  )
}
