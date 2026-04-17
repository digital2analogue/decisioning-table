import { CopyIcon, Trash2Icon, PowerIcon, PowerOffIcon, XIcon } from 'lucide-react'

export interface SelectionBarProps {
  selectedCount: number
  allDisabled: boolean
  onClear: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleEnabled: () => void
}

export function SelectionBar({
  selectedCount,
  allDisabled,
  onClear,
  onDelete,
  onDuplicate,
  onToggleEnabled,
}: SelectionBarProps) {
  const visible = selectedCount > 0
  return (
    <div
      className={`dt-selection-bar ${visible ? 'dt-selection-bar-visible' : ''}`}
      role="toolbar"
      aria-label="Bulk actions for selected rules"
      aria-hidden={!visible}
    >
      <span className="dt-selection-count">
        <span className="dt-selection-count-number">{selectedCount}</span>
        selected
      </span>
      <span className="dt-selection-divider" />
      <button onClick={onToggleEnabled} className="dt-selection-action" type="button">
        {allDisabled ? <PowerIcon size={13} /> : <PowerOffIcon size={13} />}
        {allDisabled ? 'Enable' : 'Disable'}
      </button>
      <button onClick={onDuplicate} className="dt-selection-action" type="button">
        <CopyIcon size={13} />
        Duplicate
      </button>
      <button onClick={onDelete} className="dt-selection-action dt-selection-action-danger" type="button">
        <Trash2Icon size={13} />
        Delete
      </button>
      <span className="dt-selection-divider" />
      <button onClick={onClear} className="dt-selection-action-ghost" type="button" aria-label="Clear selection">
        <XIcon size={14} />
      </button>
    </div>
  )
}
