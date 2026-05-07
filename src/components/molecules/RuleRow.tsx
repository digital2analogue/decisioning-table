import { useCallback, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { AlertTriangleIcon, MoreHorizontalIcon, ChevronRightIcon } from 'lucide-react'

/**
 * Custom 6-dot drag handle (3 rows × 2 cols). Hand-rolled SVG instead of
 * Lucide's GripVerticalIcon — feels native to the table's craft level
 * and uses currentColor for token-driven theming.
 */
function DragGrip() {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden="true"
      className="dt-drag-grip"
    >
      <circle cx="2" cy="3" r="1" />
      <circle cx="8" cy="3" r="1" />
      <circle cx="2" cy="7" r="1" />
      <circle cx="8" cy="7" r="1" />
      <circle cx="2" cy="11" r="1" />
      <circle cx="8" cy="11" r="1" />
    </svg>
  )
}
import type { Rule, DragItem } from '../../types'
import { isRuleValid, isRuleTouched, isEmptyDraft, missingFields } from '../../types'
import { cn } from '../../lib/utils'
import { Checkbox } from '../atoms/Checkbox'
import { AttributeSelectBadge, OutcomeBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { ActionsMenu } from './ActionsMenu'
import { ConditionalCell } from './ConditionalCell'
import { AccountTypeCell } from './AccountTypeCell'

export const DND_TYPE = 'RULE_ROW'

export interface RuleRowProps {
  rule: Rule
  index: number
  totalRules: number
  openMenuId: string | null
  onMenuToggle: (id: string) => void
  onMenuClose: () => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddChild: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  /** Drag-and-drop reorder enable flag. Suppressed while a filter is active
      to avoid the visible-vs-absolute-index mismatch. */
  dndEnabled?: boolean
  /** When true, focus the rule-name input on mount. */
  autoFocus?: boolean
  /** Called once autofocus has been applied so the parent can clear the marker. */
  onAutoFocusConsumed?: () => void
}

export function RuleRow({
  rule,
  index,
  totalRules,
  openMenuId,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddChild,
  onMove,
  isExpanded,
  onToggleExpand,
  dndEnabled = true,
  autoFocus,
  onAutoFocusConsumed,
}: RuleRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)
  const actionsAnchorRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      nameInputRef.current.focus()
      onAutoFocusConsumed?.()
    }
  }, [autoFocus, onAutoFocusConsumed])
  const childCount = rule.children?.length ?? 0
  const hasChildren = childCount > 0
  // Untouched drafts don't surface as invalid — the row warning + tinted
  // background stay quiet until the user has set at least one field.
  const isInvalid = isRuleTouched(rule) && !isRuleValid(rule)
  const missing = isInvalid ? missingFields(rule) : []

  // Cleanup: when focus leaves the row entirely AND the row is still an
  // untouched draft, delete it so the user isn't left with empty rows.
  function handleFocusOut(e: React.FocusEvent<HTMLTableRowElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    if (isEmptyDraft(rule)) onDelete(rule.id)
  }

  const [{ isDragging }, drag, dragPreview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: DND_TYPE,
    // item is a function so it runs at drag-start — close any open overflow
    // menu so the portaled popover doesn't dangle in the old viewport position.
    item: () => {
      onMenuClose()
      return { index, id: rule.id }
    },
    canDrag: () => dndEnabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: DND_TYPE,
    canDrop: () => dndEnabled,
    collect: (monitor) => ({ isOver: monitor.isOver() }),
    hover(item) {
      if (!dndEnabled) return
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
      <td className="dt-td text-center">
        <Checkbox
          checked={rule.selected}
          onChange={(checked) => onUpdate(rule.id, { selected: checked })}
        />
      </td>

      {/* Drag grip + expand toggle + Row # — grip at left edge, adjacent to checkbox */}
      <td ref={handleRef} className="dt-drag-handle-cell dt-col-sticky-num px-2 py-2.5">
        <div className="dt-drag-handle-inner">
          <DragGrip />
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(rule.id)}
              className="dt-expand-toggle"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse child rules' : 'Expand child rules'}
              title={isExpanded ? 'Collapse child rules' : 'Expand child rules'}
            >
              <ChevronRightIcon size={14} />
            </button>
          ) : (
            <span className="dt-expand-toggle-spacer" aria-hidden="true" />
          )}
          {isInvalid && (
            <span
              className="dt-row-warning"
              role="img"
              aria-label={`Incomplete rule: missing ${missing.join(', ')}`}
              title={`Missing: ${missing.join(', ')}`}
            >
              <AlertTriangleIcon size={16} fill="currentColor" stroke="white" strokeWidth={1.5} />
            </span>
          )}
          <span className="dt-row-number">{index + 1}</span>
        </div>
      </td>

      {/* Rule Name */}
      <td className="dt-col-sticky dt-td">
        <div className="dt-parent-name-wrap">
          <input
            ref={nameInputRef}
            type="text"
            value={rule.ruleName}
            onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
            className={cn('dt-rule-name-input', missing.includes('rule name') && 'dt-cell-error')}
            placeholder="Rule name..."
            title={rule.ruleName}
            aria-invalid={missing.includes('rule name') || undefined}
          />
        </div>
      </td>

      {/* Data Attribute — hidden via .dt-col-data-attribute (kept in JSX for easy re-enable) */}
      <td className="dt-col-data-attribute dt-td">
        <AttributeSelectBadge
          value={rule.dataAttribute}
          onChange={(v) => onUpdate(rule.id, { dataAttribute: v })}
          error={false}
        />
      </td>

      {/* Existing Account — account type picker, no operator */}
      <td className="dt-td min-w-[200px]">
        <AccountTypeCell
          value={rule.existingAccountVariable}
          onChange={(v) => onUpdate(rule.id, { existingAccountVariable: v })}
        />
      </td>

      {/* Annual Income — operator + dollar amount */}
      <td className="dt-td min-w-[220px]">
        <ConditionalCell
          operator={rule.annualIncomeOperator}
          variable={rule.annualIncomeVariable}
          onOperatorChange={(op) => onUpdate(rule.id, { annualIncomeOperator: op })}
          onVariableChange={(v) => onUpdate(rule.id, { annualIncomeVariable: v })}
          variablePlaceholder="Amount"
          variableType="amount"
        />
      </td>

      {/* Outcome — always visible. Renders the segmented control regardless of
          validity so the user can toggle Approve/Deny independently of filling
          the rest of the row. */}
      <td className="dt-td">
        <OutcomeBadge
          value={rule.outcome}
          onChange={(v) => onUpdate(rule.id, { outcome: v })}
        />
      </td>

      {/* Actions */}
      <td className="dt-td dt-col-actions" data-menu-open={openMenuId === rule.id || undefined}>
        <div ref={actionsAnchorRef} className="relative inline-block">
          <IconButton
            onClick={() => onMenuToggle(rule.id)}
            className="dt-toolbar-btn"
            ariaLabel={`Row actions for ${rule.ruleName || `rule ${index + 1}`}`}
            ariaHasPopup="menu"
            ariaExpanded={openMenuId === rule.id}
          >
            <MoreHorizontalIcon size={18} />
          </IconButton>
          {openMenuId === rule.id && (
            <ActionsMenu
              anchorRef={actionsAnchorRef}
              onAddChild={() => onAddChild(rule.id)}
              onDuplicate={() => onDuplicate(rule.id)}
              onDelete={() => onDelete(rule.id)}
              onClose={onMenuClose}
              onMoveUp={index > 0 ? () => onMove(index, index - 1) : undefined}
              onMoveDown={index < totalRules - 1 ? () => onMove(index, index + 1) : undefined}
            />
          )}
        </div>
      </td>
    </tr>
  )
}
