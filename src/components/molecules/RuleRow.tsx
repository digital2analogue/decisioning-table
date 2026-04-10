import { useCallback, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { PencilIcon, MoreHorizontalIcon } from 'lucide-react'
import type { Rule, DragItem } from '../../types'
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

  const rowStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--color-border-muted)',
    transition: 'background-color 0.1s',
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: rule.selected
      ? 'var(--color-background-selected)'
      : isOver && !isDragging
        ? 'var(--color-background-accent-subtle)'
        : 'transparent',
    ...(isOver && !isDragging ? { borderTop: '2px solid var(--color-foreground-accent)' } : {}),
  }

  return (
    <tr ref={rowRef} className="group" style={rowStyle}>
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
      <td
        className="px-2 py-2.5 text-xs"
        style={{
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-foreground-muted)',
        }}
      >
        {index + 1}
      </td>

      {/* Rule Name */}
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={rule.ruleName}
          onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
          placeholder="Rule name..."
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body-medium-family)',
            fontSize: 'var(--font-body-medium-size)',
            lineHeight: 'var(--font-body-medium-line-height)',
            color: 'var(--color-foreground-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'
            e.currentTarget.style.outline = '1px solid var(--color-border-accent)'
            e.currentTarget.style.borderRadius = '4px'
            e.currentTarget.style.padding = '2px 6px'
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.outline = 'none'
            e.currentTarget.style.padding = '0'
          }}
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
              className="opacity-0 group-hover/attr:opacity-100 transition-opacity"
              style={{ color: 'var(--color-foreground-muted)' }}
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
          <span
            className="mr-1 text-sm"
            style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-foreground-muted)' }}
          >
            $
          </span>
          <input
            type="number"
            value={rule.amount}
            onChange={(e) => onUpdate(rule.id, { amount: Number(e.target.value) })}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--font-body-medium-size)',
              color: 'var(--color-foreground-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-elevated)'
              e.currentTarget.style.outline = '1px solid var(--color-border-accent)'
              e.currentTarget.style.borderRadius = '4px'
              e.currentTarget.style.padding = '2px 6px'
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.outline = 'none'
              e.currentTarget.style.padding = '0'
            }}
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
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          style={{ color: 'var(--color-foreground-muted)' }}
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
