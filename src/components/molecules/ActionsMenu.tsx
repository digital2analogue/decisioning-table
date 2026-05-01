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
          Duplicate
        </button>
        <hr className="dt-menu-divider" />
        <button onClick={onDelete} className="dt-menu-item-danger">
          Delete rule
        </button>
      </div>
    </>
  )
}
