import { CopyIcon, Trash2Icon } from 'lucide-react'

export interface ActionsMenuProps {
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

export function ActionsMenu({ onDuplicate, onDelete, onClose }: ActionsMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="dt-menu">
        <button onClick={onDuplicate} className="dt-menu-item">
          <CopyIcon size={13} />
          Duplicate
        </button>
        <hr className="dt-menu-divider" />
        <button onClick={onDelete} className="dt-menu-item-danger">
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
