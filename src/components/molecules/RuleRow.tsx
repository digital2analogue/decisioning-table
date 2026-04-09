import { useCallback, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { PencilIcon, MoreHorizontalIcon } from 'lucide-react'
import type { Rule, DragItem } from '../../types'
import { cn } from '../../lib/utils'
import { Checkbox } from '../atoms/Checkbox'
import { DragHandle } from '../atoms/DragHandle'
import { AttributeBadge, OutcomeBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { OperatorSelect } from './OperatorSelect'
import { AttributeEditor } from './AttributeEditor'
import { ActionsMenu } from './ActionsMenu'

export const DND_TYPE = 'RULE_ROW'

export interface RuleRowProps {
  rule: Rule
  index: number
  editingAttributeId: string | null
  openMenuId: string | null
  onEditAttribute: (id: string) => void
  onCloseAttribute: () => void
  onMenuToggle: (id: string) => void
  onMenuClose: () => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
}

export function RuleRow({
  rule,
  index,
  editingAttributeId,
  openMenuId,
  onEditAttribute,
  onCloseAttribute,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
}: RuleRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)

  const [{ isDragging }, drag, dragPreview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: DND_TYPE,
    item: { index, id: rule.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: DND_TYPE,
    collect: (monitor) => ({ isOver: monitor.isOver() }),
    hover(item) {
      if (item.index === index) return
      onMove(item.index, index)
      item.index = index
    },
  })

  const handleRef = useCallback(
    (el: HTMLTableCellElement | null) => {
      drag(el)
    },
    [drag],
  )

  dragPreview(drop(rowRef))

  return (
    <tr
      ref={rowRef}
      className={cn(
        'border-b border-slate-100 transition-colors group',
        isDragging ? 'opacity-40 bg-indigo-50' : 'hover:bg-slate-50',
        isOver && !isDragging ? 'border-t-2 border-t-indigo-400' : '',
        rule.selected ? 'bg-indigo-50/40' : '',
      )}
    >
      {/* Checkbox */}
      <td className="px-3 py-2.5 text-center">
        <Checkbox
          checked={rule.selected}
          onChange={(checked) => onUpdate(rule.id, { selected: checked })}
        />
      </td>

      {/* Drag Handle */}
      <DragHandle dragRef={handleRef} />

      {/* Row # */}
      <td className="px-2 py-2.5 text-slate-400 text-xs font-mono">{index + 1}</td>

      {/* Rule Name */}
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={rule.ruleName}
          onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
          className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm placeholder:text-slate-300 focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1.5 py-0.5 -mx-1.5 transition-all"
          placeholder="Rule name..."
        />
      </td>

      {/* Data Attribute */}
      <td className="px-3 py-2.5">
        {editingAttributeId === rule.id ? (
          <AttributeEditor
            value={rule.dataAttribute}
            onChange={(v) => {
              onUpdate(rule.id, { dataAttribute: v })
              onCloseAttribute()
            }}
            onClose={onCloseAttribute}
          />
        ) : (
          <div className="flex items-center gap-1.5 group/attr">
            <AttributeBadge value={rule.dataAttribute} />
            <IconButton
              onClick={() => onEditAttribute(rule.id)}
              className="opacity-0 group-hover/attr:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
            >
              <PencilIcon size={12} />
            </IconButton>
          </div>
        )}
      </td>

      {/* Operator */}
      <td className="px-3 py-2.5">
        <OperatorSelect
          value={rule.operator}
          onChange={(v) => onUpdate(rule.id, { operator: v })}
        />
      </td>

      {/* Amount */}
      <td className="px-3 py-2.5">
        <div className="flex items-center">
          <span className="text-slate-400 text-sm mr-1">$</span>
          <input
            type="number"
            value={rule.amount}
            onChange={(e) => onUpdate(rule.id, { amount: Number(e.target.value) })}
            className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1.5 py-0.5 transition-all"
          />
        </div>
      </td>

      {/* Outcome */}
      <td className="px-3 py-2.5">
        <OutcomeBadge
          value={rule.outcome}
          onChange={(v) => onUpdate(rule.id, { outcome: v })}
        />
      </td>

      {/* Actions */}
      <td className="px-3 py-2.5 relative">
        <IconButton
          onClick={() => onMenuToggle(rule.id)}
          className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontalIcon size={16} />
        </IconButton>
        {openMenuId === rule.id && (
          <ActionsMenu
            onDuplicate={() => onDuplicate(rule.id)}
            onDelete={() => onDelete(rule.id)}
            onClose={onMenuClose}
          />
        )}
      </td>
    </tr>
  )
}
