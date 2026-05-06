import { useState, useRef, useEffect } from 'react'
import { MoreHorizontalIcon, CheckIcon } from 'lucide-react'
import { createPortal } from 'react-dom'

export interface TabItemProps {
  id: string
  name: string
  isActive: boolean
  onClick: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
}

export function TabItem({ id, name, isActive, onClick, onRename, onDuplicate, onDelete, onExport }: TabItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ bottom: number; right: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

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

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    if (!menuBtnRef.current) return
    const r = menuBtnRef.current.getBoundingClientRect()
    setMenuPos({ bottom: window.innerHeight - r.top + 4, right: window.innerWidth - r.right })
    setMenuOpen(true)
  }

  function closeMenu() { setMenuOpen(false) }

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
    <>
      <div
        className={`dt-tab-item ${isActive ? 'dt-tab-item-active' : ''}`}
        onClick={() => onClick(id)}
      >
        <span>{name}</span>
        <button
          ref={menuBtnRef}
          onClick={isActive ? openMenu : undefined}
          className="dt-tab-edit-btn"
          title={isActive ? 'Tab options' : undefined}
          aria-label={isActive ? `Options for ${name}` : undefined}
          aria-haspopup={isActive ? 'menu' : undefined}
          aria-expanded={isActive ? menuOpen : undefined}
          tabIndex={isActive ? undefined : -1}
          style={{ visibility: isActive ? 'visible' : 'hidden' }}
        >
          <MoreHorizontalIcon size={12} />
        </button>
      </div>
      {menuOpen && menuPos && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={closeMenu} />
          <div
            className="dt-menu"
            role="menu"
            style={{ position: 'fixed', bottom: menuPos.bottom, right: menuPos.right, zIndex: 9999 }}
          >
            <button type="button" role="menuitem" className="dt-menu-item"
              onClick={() => { setDraft(name); setEditing(true); closeMenu() }}>
              Rename
            </button>
            <hr className="dt-menu-divider" />
            <button type="button" role="menuitem" className="dt-menu-item"
              onClick={() => { onDuplicate(id); closeMenu() }}>
              Duplicate ruleset
            </button>
            <button type="button" role="menuitem" className="dt-menu-item"
              onClick={() => { onExport(id); closeMenu() }}>
              Export ruleset
            </button>
            <hr className="dt-menu-divider" />
            <button type="button" role="menuitem" className="dt-menu-item-danger"
              onClick={() => { onDelete(id); closeMenu() }}>
              Delete ruleset
            </button>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
