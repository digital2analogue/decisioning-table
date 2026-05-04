import { useCallback, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { MoreHorizontalIcon, GripVerticalIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import type { Rule, DragItem } from '../../types'
import { cn } from '../../lib/utils'
import { Checkbox } from '../atoms/Checkbox'
import { AttributeSelectBadge, OutcomeBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { OperatorSelect } from './OperatorSelect'
import { ActionsMenu } from './ActionsMenu'
import { ConditionalCell } from './ConditionalCell'

export const DND_TYPE = 'RULE_ROW'

export interface RuleRowProps {
  rule: Rule
  index: number
  openMenuId: string | null
  onMenuToggle: (id: string) => void
  onMenuClose: () => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  isExpanded: boolean
  onToggleExpand: (id: string) => void
}

export function RuleRow({
  rule,
  index,
  openMenuId,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  isExpanded,
  onToggleExpand,
}: RuleRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const [amountFocused, setAmountFocused] = useState(false)
  const childCount = rule.children?.length ?? 0
  const hasChildren = childCount > 0

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
    (el: HTMLTableCellElement | null) => { drag(el) },
    [drag],
  )

  dragPreview(drop(rowRef))

  return (
    <tr
      ref={rowRef}
      className={cn(
        'dt-tbody-row group',
        isDragging ? 'dt-tbody-row-dragging' : '',
        isOver && !isDragging ? 'dt-tbody-row-over' : '',
        rule.selected && !isDragging ? 'dt-tbody-row-selected' : '',
        hasChildren && isExpanded ? 'dt-parent-row-expanded' : '',
      )}
    >
      {/* Checkbox */}
      <td className="px-3 py-2.5 text-center">
        <Checkbox
          checked={rule.selected}
          onChange={(checked) => onUpdate(rule.id, { selected: checked })}
        />
      </td>

      {/* Drag handle + Row # — merged into one cell */}
      <td ref={handleRef} className="dt-drag-handle-cell px-2 py-2.5 text-center">
        <GripVerticalIcon size={14} className="dt-drag-grip" />
        <span className="dt-row-number">{index + 1}</span>
      </td>

      {/* Rule Name */}
      <td className="dt-col-sticky px-3 py-2.5 max-w-[260px]">
        <div className="dt-parent-name-wrap">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(rule.id)}
              className="dt-expand-toggle"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse sub-conditions' : 'Expand sub-conditions'}
              title={isExpanded ? 'Collapse sub-conditions' : 'Expand sub-conditions'}
            >
              {isExpanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
            </button>
          ) : (
            <span className="dt-expand-toggle-spacer" aria-hidden="true" />
          )}
          {hasChildren && <span className="dt-if-prefix" aria-hidden="true">IF</span>}
          <input
            type="text"
            value={rule.ruleName}
            onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
            className="dt-rule-name-input"
            placeholder="Rule name..."
            title={rule.ruleName}
          />
          {hasChildren && (
            <span className="dt-sub-count" title={`${childCount} sub-condition${childCount === 1 ? '' : 's'}`}>
              ({childCount})
            </span>
          )}
        </div>
      </td>

      {/* Data Attribute */}
      <td className="px-3 py-2.5">
        <AttributeSelectBadge
          value={rule.dataAttribute}
          onChange={(v) => onUpdate(rule.id, { dataAttribute: v })}
        />
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
            type={amountFocused ? 'number' : 'text'}
            value={amountFocused ? rule.amount : rule.amount.toLocaleString()}
            onChange={(e) => onUpdate(rule.id, { amount: Number(e.target.value.replace(/,/g, '')) })}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            className="dt-amount-input"
          />
        </div>
      </td>

      {/* Existing Account */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <ConditionalCell
          operator={rule.existingAccountOperator}
          variable={rule.existingAccountVariable}
          onOperatorChange={(op) => onUpdate(rule.id, { existingAccountOperator: op })}
          onVariableChange={(v) => onUpdate(rule.id, { existingAccountVariable: v })}
        />
      </td>

      {/* Annual Income */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <ConditionalCell
          operator={rule.annualIncomeOperator}
          variable={rule.annualIncomeVariable}
          onOperatorChange={(op) => onUpdate(rule.id, { annualIncomeOperator: op })}
          onVariableChange={(v) => onUpdate(rule.id, { annualIncomeVariable: v })}
        />
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
