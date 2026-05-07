import { useRef } from 'react'
import { AlertTriangleIcon, MoreHorizontalIcon } from 'lucide-react'
import type { Rule, LogicOperator } from '../../types'
import { isChildRuleValid, isRuleTouched, isEmptyDraft, missingFields } from '../../types'
import { cn } from '../../lib/utils'
import { AttributeSelectBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { ConditionalCell } from './ConditionalCell'
import { AccountTypeCell } from './AccountTypeCell'
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
}: ChildRuleRowProps) {
  const actionsAnchorRef = useRef<HTMLDivElement>(null)

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
      <td className="dt-child-cell-bare dt-td"></td>

      {/* Drag handle / # column — warning marker when invalid */}
      <td className="dt-child-cell-bare dt-child-connector-cell dt-col-sticky-num px-2 py-2.5">
        {isInvalid && (
          <span
            className="dt-row-warning dt-child-row-warning"
            role="img"
            aria-label={`Incomplete child rule: missing ${missing.join(', ')}`}
            title={`Missing: ${missing.join(', ')}`}
          >
            <AlertTriangleIcon size={16} fill="currentColor" stroke="white" strokeWidth={1.5} />
          </span>
        )}
      </td>

      {/* Rule Name (sticky) — AND/OR chip only; tree line lives here so chip stacks above it */}
      <td className="dt-col-sticky dt-child-name-cell pl-3 pr-3 py-2.5">
        <span className="dt-child-tree-line" aria-hidden="true" />
        <div className="dt-child-name-wrap">
          <LogicOperatorSelect
            value={op}
            onChange={(v) => onUpdate(parentId, rule.id, { logicOperator: v })}
          />
        </div>
      </td>

      {/* Data Attribute — hidden via .dt-col-data-attribute (kept in JSX for easy re-enable) */}
      <td className="dt-col-data-attribute dt-td">
        <AttributeSelectBadge
          value={rule.dataAttribute}
          onChange={(v) => onUpdate(parentId, rule.id, { dataAttribute: v })}
          error={false}
        />
      </td>

      {/* Existing Account — account type picker, no operator */}
      <td className="dt-td min-w-[200px]">
        <AccountTypeCell
          value={rule.existingAccountVariable}
          onChange={(v) => onUpdate(parentId, rule.id, { existingAccountVariable: v })}
        />
      </td>

      {/* Annual Income — operator + dollar amount */}
      <td className="dt-td min-w-[220px]">
        <ConditionalCell
          operator={rule.annualIncomeOperator}
          variable={rule.annualIncomeVariable}
          onOperatorChange={(o) => onUpdate(parentId, rule.id, { annualIncomeOperator: o })}
          onVariableChange={(v) => onUpdate(parentId, rule.id, { annualIncomeVariable: v })}
          variablePlaceholder="Amount"
          variableType="amount"
        />
      </td>

      {/* Outcome — children inherit the parent outcome implicitly; cell stays empty to keep column alignment */}
      <td className="dt-td"></td>

      {/* Actions */}
      <td className="dt-td dt-col-actions" data-menu-open={menuOpen || undefined}>
        <div ref={actionsAnchorRef} className="relative inline-block">
          <IconButton
            onClick={onMenuToggle}
            className="dt-toolbar-btn"
            ariaLabel={`Child rule actions for ${rule.ruleName || 'unnamed child rule'}`}
            ariaHasPopup="menu"
            ariaExpanded={menuOpen}
          >
            <MoreHorizontalIcon size={18} />
          </IconButton>
          {menuOpen && (
            <ActionsMenu
              anchorRef={actionsAnchorRef}
              onDuplicate={() => onDuplicate(parentId, rule.id)}
              onDelete={() => onDelete(parentId, rule.id)}
              onClose={onMenuClose}
              onMoveUp={childIndex > 0 ? () => onMove(parentId, childIndex, childIndex - 1) : undefined}
              onMoveDown={childIndex < totalChildren - 1 ? () => onMove(parentId, childIndex, childIndex + 1) : undefined}
              isChild
            />
          )}
        </div>
      </td>
    </tr>
  )
}
