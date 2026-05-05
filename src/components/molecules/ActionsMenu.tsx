import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export interface ActionsMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  /** Optional — only render the "Add sub-condition" item when provided (parent rules only). */
  onAddChild?: () => void
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
  /** Reorder handlers — disabled when undefined (top/bottom of list). */
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function ActionsMenu({
  anchorRef,
  onAddChild,
  onDuplicate,
  onDelete,
  onClose,
  onMoveUp,
  onMoveDown,
}: ActionsMenuProps) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  useEffect(() => {
    if (!anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
  }, [anchorRef])

  useEffect(() => {
    function close() { onClose() }
    document.addEventListener('scroll', close, true)
    return () => document.removeEventListener('scroll', close, true)
  }, [onClose])

  if (!pos) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="dt-menu"
        role="menu"
        style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => { onMoveUp?.(); onClose() }}
          disabled={!onMoveUp}
          className="dt-menu-item"
        >
          Move up
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => { onMoveDown?.(); onClose() }}
          disabled={!onMoveDown}
          className="dt-menu-item"
        >
          Move down
        </button>
        <hr className="dt-menu-divider" />
        {onAddChild && (
          <button type="button" role="menuitem" onClick={() => { onAddChild(); onClose() }} className="dt-menu-item">
            Add sub-condition
          </button>
        )}
        <button type="button" role="menuitem" onClick={onDuplicate} className="dt-menu-item">
          Duplicate
        </button>
        <hr className="dt-menu-divider" />
        <button type="button" role="menuitem" onClick={onDelete} className="dt-menu-item-danger">
          Delete rule
        </button>
      </div>
    </>,
    document.body,
  )
}
