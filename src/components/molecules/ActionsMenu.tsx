import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export interface ActionsMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

export function ActionsMenu({ anchorRef, onDuplicate, onDelete, onClose }: ActionsMenuProps) {
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
        style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      >
        <button onClick={onDuplicate} className="dt-menu-item">
          Duplicate
        </button>
        <hr className="dt-menu-divider" />
        <button onClick={onDelete} className="dt-menu-item-danger">
          Delete rule
        </button>
      </div>
    </>,
    document.body,
  )
}
