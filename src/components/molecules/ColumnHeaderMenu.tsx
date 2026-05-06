import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export interface ColumnHeaderMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  onChangeDataElement: () => void
  onDelete: () => void
  onClose: () => void
}

export function ColumnHeaderMenu({ anchorRef, onChangeDataElement, onDelete, onClose }: ColumnHeaderMenuProps) {
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
          className="dt-menu-item"
          onClick={() => { onChangeDataElement(); onClose() }}
        >
          Change Data Element
        </button>
        <hr className="dt-menu-divider" />
        <button
          type="button"
          role="menuitem"
          className="dt-menu-item-danger"
          onClick={() => { onDelete(); onClose() }}
        >
          Delete
        </button>
      </div>
    </>,
    document.body,
  )
}
