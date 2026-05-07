import { useEffect, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Trash2Icon } from 'lucide-react'
import { usePortalPosition } from '../../lib/portalPosition'

export interface ColumnHeaderMenuProps {
  anchorRef: RefObject<HTMLElement | null>
  onChangeDataElement: () => void
  onDelete: () => void
  onClose: () => void
}

export function ColumnHeaderMenu({ anchorRef, onChangeDataElement, onDelete, onClose }: ColumnHeaderMenuProps) {
  const pos = usePortalPosition(anchorRef, 'below-right')

  useEffect(() => {
    function close() { onClose() }
    document.addEventListener('scroll', close, true)
    return () => document.removeEventListener('scroll', close, true)
  }, [onClose])

  if (!pos) return null

  return createPortal(
    <>
      <div className="fixed inset-0" style={{ zIndex: 'var(--z-backdrop)' }} onClick={onClose} />
      <div
        className="dt-menu"
        role="menu"
        style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 'var(--z-dropdown)' }}
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
          <Trash2Icon size={13} />
          Delete
        </button>
      </div>
    </>,
    document.body,
  )
}
