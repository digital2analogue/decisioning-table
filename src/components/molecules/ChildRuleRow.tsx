import { useRef } from 'react'
import { AlertTriangleIcon, MoreHorizontalIcon } from 'lucide-react'
import type { Rule, LogicOperator } from '../../types'
import { isChildRuleValid, missingFields } from '../../types'
import { cn } from '../../lib/utils'
import { AttributeSelectBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { AmountCell } from '../atoms/AmountCell'
import { OperatorSelect } from './OperatorSelect'
import { ConditionalCell } from './ConditionalCell'
import { ActionsMenu } from './ActionsMenu'
import { LogicOperatorSelect } from './LogicOperatorSelect'

/** Same untouched-draft check used by RuleRow. Inline duplicate kept tight to preserve module scope. */
function isEmptyDraftChild(rule: Rule): boolean {
  return (
    rule.ruleName === '' &&
    rule.dataAttribute === null &&
    rule.operator === null &&
    rule.amount === null &&
    rule.existingAccountOperator === null &&
    rule.existingAccountVariable === '' &&
    rule.annualIncomeOperator === null &&
    rule.annualIncomeVariable === ''
  )
}

export interface ChildRuleRowProps {
  rule: Rule
  parentId: string
  isLast: boolean
  menuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onUpdate: (parentId: string, childId: string, patch: Partial<Rule>) => void
  onDelete: (parentId: string, childId: string) => void
  onDuplicate: (parentId: string, childId: string) => void
}

export function ChildRuleRow({
  rule,
  parentId,
  isLast,
  menuOpen,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: ChildRuleRowProps) {
  const actionsAnchorRef = useRef<HTMLDivElement>(null)
  const op: LogicOperator = rule.logicOperator ?? 'AND'
  const isInvalid = !isChildRuleValid(rule)
  const missing = isInvalid ? missingFields(rule, true) : []

  function handleFocusOut(e: React.FocusEvent<HTMLTableRowElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    if (isEmptyDraftChild(rule)) onDelete(parentId, rule.id)
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
      <td className="dt-child-cell-bare dt-child-connector-cell px-2 py-2.5">
        <span className="dt-child-tree-line" aria-hidden="true" />
        {isInvalid && (
          <span
            className="dt-row-warning dt-child-row-warning"
            role="img"
            aria-label={`Incomplete sub-condition: missing ${missing.join(', ')}`}
            title={`Missing: ${missing.join(', ')}`}
          >
            <AlertTriangleIcon size={12} />
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
            type="text"
            value={rule.ruleName}
            onChange={(e) => onUpdate(parentId, rule.id, { ruleName: e.target.value })}
            className="dt-rule-name-input"
            placeholder="Sub-condition…"
            title={rule.ruleName}
          />
        </div>
      </td>

      {/* Data Attribute */}
      <td className="px-3 py-2.5">
        <AttributeSelectBadge
          value={rule.dataAttribute}
          onChange={(v) => onUpdate(parentId, rule.id, { dataAttribute: v })}
        />
      </td>

      {/* Operator */}
      <td className="px-3 py-2.5">
        <OperatorSelect
          value={rule.operator}
          onChange={(v) => onUpdate(parentId, rule.id, { operator: v })}
        />
      </td>

      {/* Amount */}
      <td className="px-3 py-2.5">
        <AmountCell
          value={rule.amount}
          onChange={(amount) => onUpdate(parentId, rule.id, { amount })}
        />
      </td>

      {/* Existing Account */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <ConditionalCell
          operator={rule.existingAccountOperator}
          variable={rule.existingAccountVariable}
          onOperatorChange={(o) => onUpdate(parentId, rule.id, { existingAccountOperator: o })}
          onVariableChange={(v) => onUpdate(parentId, rule.id, { existingAccountVariable: v })}
        />
      </td>

      {/* Annual Income */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <ConditionalCell
          operator={rule.annualIncomeOperator}
          variable={rule.annualIncomeVariable}
          onOperatorChange={(o) => onUpdate(parentId, rule.id, { annualIncomeOperator: o })}
          onVariableChange={(v) => onUpdate(parentId, rule.id, { annualIncomeVariable: v })}
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
            />
          )}
        </div>
      </td>
    </tr>
  )
}
