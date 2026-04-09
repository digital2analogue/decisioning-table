import { GripVerticalIcon } from 'lucide-react'

export interface DragHandleProps {
  dragRef: (el: HTMLTableCellElement | null) => void
}

export function DragHandle({ dragRef }: DragHandleProps) {
  return (
    <td
      ref={dragRef}
      className="px-1 py-2.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500"
    >
      <GripVerticalIcon size={16} />
    </td>
  )
}
