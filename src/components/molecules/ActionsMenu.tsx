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
      <div className="absolute right-0 top-7 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
        <button
          onClick={onDuplicate}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <CopyIcon size={13} />
          Duplicate
        </button>
        <div className="border-t border-slate-100 my-1" />
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
