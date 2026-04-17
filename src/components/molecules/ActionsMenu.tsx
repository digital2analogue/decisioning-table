import { CopyIcon, Trash2Icon } from 'lucide-react'
import type { RuleStatus } from '../../types'

export interface ActionsMenuProps {
  status: RuleStatus
  onDuplicate: () => void
  onDelete: () => void
  onSetStatus: (status: RuleStatus) => void
  onClose: () => void
}

export function ActionsMenu({ status, onDuplicate, onDelete, onSetStatus, onClose }: ActionsMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="dt-menu">
        <button onClick={onDuplicate} className="dt-menu-item">
          <CopyIcon size={13} />
          Duplicate
        </button>
        <hr className="dt-menu-divider" />
        {status !== 'active' && (
          <button onClick={() => onSetStatus('active')} className="dt-menu-item dt-menu-item-text">
            Enable
          </button>
        )}
        {status !== 'disabled' && (
          <button onClick={() => onSetStatus('disabled')} className="dt-menu-item dt-menu-item-text">
            Disable
          </button>
        )}
        {status !== 'draft' && (
          <button onClick={() => onSetStatus('draft')} className="dt-menu-item dt-menu-item-text">
            Mark as draft
          </button>
        )}
        <hr className="dt-menu-divider" />
        <button onClick={onDelete} className="dt-menu-item-danger">
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
