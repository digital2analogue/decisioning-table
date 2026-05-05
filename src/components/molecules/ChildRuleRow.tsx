import { useEffect, useRef } from 'react'
import { AlertTriangleIcon, MoreHorizontalIcon } from 'lucide-react'
import type { Rule, LogicOperator } from '../../types'
import { isChildRuleValid, isRuleTouched, isEmptyDraft, missingFields } from '../../types'
import { cn } from '../../lib/utils'
import { AttributeSelectBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { AmountCell } from '../atoms/AmountCell'
import { OperatorSelect } from './OperatorSelect'
import { ConditionalCell } from './ConditionalCell'
import { ActionsMenu } from './ActionsMenu'
import { LogicOperatorSelect } from './LogicOperatorSelect'


export interface ChildRuleRowProps {
  rule: Rule
  parentId: string
  childIndex: number
  totalChildren: number
  isLast: boolean
  menuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onUpdate: (parentId: string, childId: string, patch: Partial<Rule>) => void
  onDelete: (parentId: string, childId: string) => void
  onDuplicate: (parentId: string, childId: string) => void
  onMove: (parentId: string, fromIdx: number, toIdx: number) => void
  /** When true, focus the rule-name input on mount. */
  autoFocus?: boolean
  /** Called once autofocus has been applied so the parent can clear the marker. */
  onAutoFocusConsumed?: () => void
}

export function ChildRuleRow({
  rule,
  parentId,
  childIndex,
  totalChildren,
  isLast,
  menuOpen,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  autoFocus,
  onAutoFocusConsumed,
}: ChildRuleRowProps) {
  const actionsAnchorRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      nameInputRef.current.focus()
      onAutoFocusConsumed?.()
    }
  }, [autoFocus, onAutoFocusConsumed])
  const op: LogicOperator = rule.logicOperator ?? 'AND'
  // Untouched drafts stay quiet — no warning icon, no tinted row bg —
  // until the user has set at least one field.
  const isInvalid = isRuleTouched(rule) && !isChildRuleValid(rule)
  const missing = isInvalid ? missingFields(rule, true) : []

  function handleFocusOut(e: React.FocusEvent<HTMLTableRowElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    if (isEmptyDraft(rule)) onDelete(parentId, rule.id)
  }

  return (
    <tr
      data-rule-id={rule.id}
      data-rule-invalid={isInvalid ? 'true' : undefined}
      aria-invalid={isInvalid || undefined}
      onBlur={handleFocusOut}
      className={cn('dt-tbody-row dt-child-row', isLast && 'dt-child-row-last')}
    >
      {/* Checkbox column — empty for children */}
      <td className="dt-child-cell-bare px-3 py-2.5"></td>

      {/* Drag handle / # column — CSS-drawn tree connector + warning marker when invalid */}
      <td className="dt-child-cell-bare dt-child-connector-cell dt-col-sticky-num px-2 py-2.5">
        <span className="dt-child-tree-line" aria-hidden="true" />
        {isInvalid && (
          <span
            className="dt-row-warning dt-child-row-warning"
            role="img"
            aria-label={`Incomplete sub-condition: missing ${missing.join(', ')}`}
            title={`Missing: ${missing.join(', ')}`}
          >
            <AlertTriangleIcon size={16} fill="currentColor" stroke="var(--color-background-warning-subtle)" />
          </span>
        )}
      </td>

      {/* Rule Name (sticky) — AND/OR picker + name input */}
      <td className="dt-col-sticky dt-child-name-cell px-3 py-2.5">
        <div className="dt-child-name-wrap">
          <LogicOperatorSelect
            value={op}
            onChange={(v) => onUpdate(parentId, rule.id, { logicOperator: v })}
          />
          <input
            ref={nameInputRef}
            type="text"
            value={rule.ruleName}
            onChange={(e) => onUpdate(parentId, rule.id, { ruleName: e.target.value })}
            className={cn('dt-rule-name-input', missing.includes('rule name') && 'dt-cell-error')}
            placeholder="Sub-condition…"
            title={rule.ruleName}
            aria-invalid={missing.includes('rule name') || undefined}
          />
        </div>
      </td>

      {/* Data Attribute — hidden via .dt-col-data-attribute (kept in JSX for easy re-enable) */}
      <td className="dt-col-data-attribute px-3 py-2.5">
        <AttributeSelectBadge
          value={rule.dataAttribute}
          onChange={(v) => onUpdate(parentId, rule.id, { dataAttribute: v })}
          error={missing.includes('data attribute')}
        />
      </td>

      {/* Operator */}
      <td className="px-3 py-2.5">
        <OperatorSelect
          value={rule.operator}
          onChange={(v) => onUpdate(parentId, rule.id, { operator: v })}
          error={missing.includes('operator')}
        />
      </td>

      {/* Amount */}
      <td className="px-3 py-2.5">
        <AmountCell
          value={rule.amount}
          onChange={(amount) => onUpdate(parentId, rule.id, { amount })}
          error={missing.includes('amount')}
        />
      </td>

      {/* Existing Account */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <ConditionalCell
          operator={rule.existingAccountOperator}
          variable={rule.existingAccountVariable}
          onOperatorChange={(o) => onUpdate(parentId, rule.id, { existingAccountOperator: o })}
          onVariableChange={(v) => onUpdate(parentId, rule.id, { existingAccountVariable: v })}
          variablePlaceholder="Select variable"
        />
      </td>

      {/* Annual Income */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <ConditionalCell
          operator={rule.annualIncomeOperator}
          variable={rule.annualIncomeVariable}
          onOperatorChange={(o) => onUpdate(parentId, rule.id, { annualIncomeOperator: o })}
          onVariableChange={(v) => onUpdate(parentId, rule.id, { annualIncomeVariable: v })}
          variablePlaceholder="Enter value"
        />
      </td>

      {/* Outcome — children inherit the parent outcome implicitly; cell stays empty to keep column alignment */}
      <td className="px-3 py-2.5"></td>

      {/* Actions */}
      <td className="px-3 py-2.5">
        <div ref={actionsAnchorRef} className="relative inline-block">
          <IconButton
            onClick={onMenuToggle}
            ariaLabel={`Sub-condition actions for ${rule.ruleName || 'unnamed sub-condition'}`}
            ariaHasPopup="menu"
            ariaExpanded={menuOpen}
          >
            <MoreHorizontalIcon size={16} />
          </IconButton>
          {menuOpen && (
            <ActionsMenu
              anchorRef={actionsAnchorRef}
              onDuplicate={() => onDuplicate(parentId, rule.id)}
              onDelete={() => onDelete(parentId, rule.id)}
              onClose={onMenuClose}
              onMoveUp={childIndex > 0 ? () => onMove(parentId, childIndex, childIndex - 1) : undefined}
              onMoveDown={childIndex < totalChildren - 1 ? () => onMove(parentId, childIndex, childIndex + 1) : undefined}
            />
          )}
        </div>
      </td>
    </tr>
  )
}
