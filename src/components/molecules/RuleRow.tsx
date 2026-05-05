import { useCallback, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { AlertTriangleIcon, MoreHorizontalIcon, GripVerticalIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import type { Rule, DragItem } from '../../types'
import { isRuleValid, isReadyForOutcome, missingFields } from '../../types'
import { cn } from '../../lib/utils'
import { Checkbox } from '../atoms/Checkbox'
import { AttributeSelectBadge, OutcomeBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { AmountCell } from '../atoms/AmountCell'
import { OperatorSelect } from './OperatorSelect'
import { ActionsMenu } from './ActionsMenu'
import { ConditionalCell } from './ConditionalCell'

/**
 * True when the rule was just created and the user hasn't touched any field.
 * Used to auto-clean up unfocused empty drafts.
 */
function isEmptyDraft(rule: Rule): boolean {
  return (
    rule.ruleName === '' &&
    rule.dataAttribute === null &&
    rule.operator === null &&
    rule.amount === null &&
    rule.outcome === null &&
    rule.existingAccountOperator === null &&
    rule.existingAccountVariable === '' &&
    rule.annualIncomeOperator === null &&
    rule.annualIncomeVariable === ''
  )
}

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
  const actionsAnchorRef = useRef<HTMLDivElement>(null)
  const childCount = rule.children?.length ?? 0
  const hasChildren = childCount > 0
  const isInvalid = !isRuleValid(rule)
  const showOutcome = isReadyForOutcome(rule)
  const missing = isInvalid ? missingFields(rule) : []

  // Cleanup: when focus leaves the row entirely AND the row is still an
  // untouched draft, delete it so the user isn't left with empty rows.
  function handleFocusOut(e: React.FocusEvent<HTMLTableRowElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    if (isEmptyDraft(rule)) onDelete(rule.id)
  }

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
      data-rule-id={rule.id}
      data-rule-invalid={isInvalid ? 'true' : undefined}
      aria-invalid={isInvalid || undefined}
      onBlur={handleFocusOut}
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

      {/* Drag handle + Row # (or warning icon when invalid) */}
      <td ref={handleRef} className="dt-drag-handle-cell px-2 py-2.5 text-center">
        <GripVerticalIcon size={14} className="dt-drag-grip" />
        {isInvalid ? (
          <span
            className="dt-row-warning"
            role="img"
            aria-label={`Incomplete rule: missing ${missing.join(', ')}`}
            title={`Missing: ${missing.join(', ')}`}
          >
            <AlertTriangleIcon size={14} />
          </span>
        ) : (
          <span className="dt-row-number">{index + 1}</span>
        )}
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
        <AmountCell
          value={rule.amount}
          onChange={(amount) => onUpdate(rule.id, { amount })}
        />
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

      {/* Outcome — hidden until every other required field is filled; placeholder hint until then */}
      <td className="px-3 py-2.5">
        {showOutcome ? (
          <OutcomeBadge
            value={rule.outcome}
            onChange={(v) => onUpdate(rule.id, { outcome: v })}
          />
        ) : (
          <span
            className="dt-outcome-pending"
            aria-disabled="true"
            title="Complete the other fields first to set the outcome"
          >
            Complete other fields first
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-2.5">
        <div ref={actionsAnchorRef} className="relative inline-block">
          <IconButton
            onClick={() => onMenuToggle(rule.id)}
            ariaLabel={`Row actions for ${rule.ruleName || `rule ${index + 1}`}`}
            ariaHasPopup="menu"
            ariaExpanded={openMenuId === rule.id}
          >
            <MoreHorizontalIcon size={16} />
          </IconButton>
          {openMenuId === rule.id && (
            <ActionsMenu
              anchorRef={actionsAnchorRef}
              onDuplicate={() => onDuplicate(rule.id)}
              onDelete={() => onDelete(rule.id)}
              onClose={onMenuClose}
            />
          )}
        </div>
      </td>
    </tr>
  )
}
