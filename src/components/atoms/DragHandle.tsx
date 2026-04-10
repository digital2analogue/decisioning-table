import { GripVerticalIcon } from 'lucide-react'

export interface DragHandleProps {
  dragRef: (el: HTMLTableCellElement | null) => void
}

export function DragHandle({ dragRef }: DragHandleProps) {
  return (
    <td ref={dragRef} className="dt-drag-handle px-1 py-2.5">
      <GripVerticalIcon size={16} />
    </td>
  )
}
