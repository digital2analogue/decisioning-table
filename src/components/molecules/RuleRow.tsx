import { useCallback, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import type { Rule } from '../../types'
import { isRuleValid, isRuleTouched, isEmptyDraft, missingFields } from '../../types'
import { cn } from '../../lib/utils'
import { Checkbox } from '../atoms/Checkbox'
import { AttributeSelectBadge, OutcomeBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { ActionsMenu } from './ActionsMenu'
import { ConditionalCell } from './ConditionalCell'
import { AccountTypeCell } from './AccountTypeCell'

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

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // dnd-kit sortable — pointer + touch + keyboard (sensors + reorder live in
  // DecisioningTable's DndContext). Disabled while a name filter is active so the
  // visible order can't diverge from the absolute rules index.
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    activeIndex,
    overIndex,
  } = useSortable({ id: rule.id, disabled: !dndEnabled })

  // The picked-up row is drawn by the DragOverlay (a floating clone), because a
  // transform on a <tr> with sticky cells doesn't render. So here we only mark the
  // source row as a ghost and show a drop-indicator line on the row the pointer is
  // over (neighbour rows can't part for the same sticky reason).
  const showDropBefore = isOver && !isDragging && activeIndex > overIndex
  const showDropAfter = isOver && !isDragging && activeIndex < overIndex

  // Merge dnd-kit's sortable node ref with our own rowRef (used for focus + DOM reads).
  const setRowRef = useCallback(
    (el: HTMLTableRowElement | null) => {
      rowRef.current = el
      setNodeRef(el)
    },
    [setNodeRef],
  )

  const rowStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform) ?? undefined,
    transition: prefersReducedMotion ? undefined : (transition ?? undefined),
  }

  return (
    <tr
      ref={setRowRef}
      style={rowStyle}
      data-rule-id={rule.id}
      data-rule-invalid={isInvalid ? 'true' : undefined}
      aria-invalid={isInvalid || undefined}
      onBlur={handleFocusOut}
      className={cn(
        'dt-tbody-row group',
        isDragging ? 'dt-tbody-row-dragging' : '',
        showDropBefore ? 'dt-tbody-row-drop-before' : '',
        showDropAfter ? 'dt-tbody-row-drop-after' : '',
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

      {/* Drag grip + expand toggle + Row # — grip at left edge, adjacent to checkbox.
          The grip is the sortable activator (keyboard + pointer + touch); the rest of
          the cell is not draggable, so the chevron and row number stay tappable. */}
      <td className="dt-drag-handle-cell dt-col-sticky-num px-2 py-2.5">
        <div className="dt-drag-handle-inner">
          <span
            ref={setActivatorNodeRef}
            className="dt-drag-grip-handle"
            aria-label={`Reorder ${rule.ruleName || `rule ${index + 1}`}`}
            {...attributes}
            {...listeners}
          >
            <DragGrip />
          </span>
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
              <AlertTriangleIcon size={16} strokeWidth={1.75} />
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

      {/* Credit Score — operator + plain number */}
      <td className="dt-td min-w-[200px]">
        <ConditionalCell
          operator={rule.creditScoreOperator ?? null}
          variable={rule.creditScoreVariable ?? ''}
          onOperatorChange={(op) => onUpdate(rule.id, { creditScoreOperator: op })}
          onVariableChange={(v) => onUpdate(rule.id, { creditScoreVariable: v })}
          variablePlaceholder="Score"
          variableType="number"
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
