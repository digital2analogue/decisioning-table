import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'

export interface TabItemProps {
  id: string
  name: string
  isActive: boolean
  onClick: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function TabItem({ id, name, isActive, onClick, onRename }: TabItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(id, trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className={`dt-tab-item dt-tab-item-active dt-tab-item-editing`}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setTimeout(commit, 100)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') { setDraft(name); setEditing(false) }
          }}
          className="dt-tab-input"
        />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={commit}
          className="dt-confirm-btn dt-confirm-btn-sm"
          title="Save"
        >
          <CheckIcon size={12} />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`dt-tab-item ${isActive ? 'dt-tab-item-active' : ''}`}
      onClick={() => onClick(id)}
    >
      <span>{name}</span>
      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setDraft(name)
            setEditing(true)
          }}
          className="dt-tab-edit-btn"
          title="Rename"
        >
          <ChevronDownIcon size={12} />
        </button>
      )}
    </div>
  )
}
