import { useState, useRef, useEffect } from 'react'
import { PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react'

export interface ToolbarActionsProps {
  rulesetName: string
  ruleCount: number
  selectedCount: number
  someSelected: boolean
  onDeleteSelected: () => void
  onAddRule: () => void
  onRename: (name: string) => void
}

export function ToolbarActions({
  rulesetName,
  ruleCount,
  selectedCount,
  someSelected,
  onDeleteSelected,
  onAddRule,
  onRename,
}: ToolbarActionsProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(rulesetName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== rulesetName) onRename(trimmed)
    setEditing(false)
  }

  return (
    <div className="dt-toolbar px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setDraft(rulesetName); setEditing(false) }
            }}
            className="dt-toolbar-name-input"
          />
        ) : (
          <div className="flex items-center gap-1.5 group/name">
            <h2 className="dt-toolbar-name">{rulesetName}</h2>
            <button
              onClick={() => { setDraft(rulesetName); setEditing(true) }}
              className="dt-icon-btn dt-icon-reveal"
              title="Rename"
            >
              <PencilIcon size={13} />
            </button>
          </div>
        )}
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
