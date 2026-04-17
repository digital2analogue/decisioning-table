import { useCallback, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { MoreHorizontalIcon } from 'lucide-react'
import type { Rule, DragItem } from '../../types'
import { cn } from '../../lib/utils'
import { Checkbox } from '../atoms/Checkbox'
import { DragHandle } from '../atoms/DragHandle'
import { StatusChip } from '../atoms/StatusChip'
import { AttributeBadge, OutcomeBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { OperatorSelect } from './OperatorSelect'
import { AttributeEditor } from './AttributeEditor'
import { StatusEditor } from './StatusEditor'
import { ActionsMenu } from './ActionsMenu'

export const DND_TYPE = 'RULE_ROW'

export interface RuleRowProps {
  rule: Rule
  index: number
  focused: boolean
  editingAttributeId: string | null
  editingStatusId: string | null
  openMenuId: string | null
  onEditAttribute: (id: string) => void
  onCloseAttribute: () => void
  onEditStatus: (id: string) => void
  onCloseStatus: () => void
  onMenuToggle: (id: string) => void
  onMenuClose: () => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  onFocusRow: (index: number) => void
  onRowKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>, index: number) => void
  editNameTrigger: number
}

export function RuleRow({
  rule,
  index,
  focused,
  editingAttributeId,
  editingStatusId,
  openMenuId,
  onEditAttribute,
  onCloseAttribute,
  onEditStatus,
  onCloseStatus,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onFocusRow,
  onRowKeyDown,
  editNameTrigger,
}: RuleRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (focused && rowRef.current && document.activeElement !== nameInputRef.current) {
      rowRef.current.focus({ preventScroll: false })
    }
  }, [focused])

  useEffect(() => {
    if (editNameTrigger > 0 && focused) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [editNameTrigger, focused])

  return (
    <tr
      ref={rowRef}
      tabIndex={-1}
      data-row-index={index}
      onFocus={() => onFocusRow(index)}
      onKeyDown={(e) => onRowKeyDown(e, index)}
      className={cn(
        'dt-tbody-row group',
        isDragging ? 'dt-tbody-row-dragging' : '',
        isOver && !isDragging ? 'dt-tbody-row-over' : '',
        rule.selected && !isDragging ? 'dt-tbody-row-selected' : '',
        rule.status === 'disabled' ? 'dt-tbody-row-disabled' : '',
        focused ? 'dt-tbody-row-focused' : '',
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
      <td className="dt-row-number px-2 py-2.5">{index + 1}</td>

      {/* Rule Name + status */}
      <td className="px-3 py-2.5 relative">
        <div className="flex items-center gap-2">
          <StatusChip status={rule.status} onClick={() => onEditStatus(rule.id)} />
          <input
            ref={nameInputRef}
            type="text"
            value={rule.ruleName}
            onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
            className="dt-rule-name-input"
            placeholder="Rule name..."
          />
        </div>
        {editingStatusId === rule.id && (
          <StatusEditor
            value={rule.status}
            onChange={(s) => {
              onUpdate(rule.id, { status: s })
              onCloseStatus()
            }}
            onClose={onCloseStatus}
          />
        )}
      </td>

      {/* Data Attribute */}
      <td className="px-3 py-2.5 relative">
        <AttributeBadge
          value={rule.dataAttribute}
          onClick={() => onEditAttribute(rule.id)}
        />
        {editingAttributeId === rule.id && (
          <AttributeEditor
            value={rule.dataAttribute}
            onChange={(v) => {
              onUpdate(rule.id, { dataAttribute: v })
              onCloseAttribute()
            }}
            onClose={onCloseAttribute}
          />
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
          <span className="dt-amount-prefix">$</span>
          <input
            type="number"
            value={rule.amount}
            onChange={(e) => onUpdate(rule.id, { amount: Number(e.target.value) })}
            className="dt-amount-input"
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
          className="dt-icon-reveal"
        >
          <MoreHorizontalIcon size={16} />
        </IconButton>
        {openMenuId === rule.id && (
          <ActionsMenu
            status={rule.status}
            onDuplicate={() => onDuplicate(rule.id)}
            onDelete={() => onDelete(rule.id)}
            onSetStatus={(s) => {
              onUpdate(rule.id, { status: s })
              onMenuClose()
            }}
            onClose={onMenuClose}
          />
        )}
      </td>
    </tr>
  )
}
