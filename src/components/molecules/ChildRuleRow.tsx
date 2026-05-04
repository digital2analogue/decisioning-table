import { useRef } from 'react'
import { MoreHorizontalIcon } from 'lucide-react'
import type { Rule, LogicOperator } from '../../types'
import { cn } from '../../lib/utils'
import { AttributeSelectBadge } from '../atoms/Badge'
import { IconButton } from '../atoms/IconButton'
import { AmountCell } from '../atoms/AmountCell'
import { OperatorSelect } from './OperatorSelect'
import { ConditionalCell } from './ConditionalCell'
import { ActionsMenu } from './ActionsMenu'

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

  function toggleLogic() {
    onUpdate(parentId, rule.id, { logicOperator: op === 'AND' ? 'OR' : 'AND' })
  }

  return (
    <tr className={cn('dt-tbody-row dt-child-row', isLast && 'dt-child-row-last')}>
      {/* Checkbox column — empty for children */}
      <td className="dt-child-cell-bare px-3 py-2.5"></td>

      {/* Drag handle / # column — CSS-drawn tree connector */}
      <td className="dt-child-cell-bare dt-child-connector-cell px-2 py-2.5">
        <span className="dt-child-tree-line" aria-hidden="true" />
      </td>

      {/* Rule Name (sticky) — AND/OR chip + name */}
      <td className="dt-col-sticky dt-child-name-cell px-3 py-2.5">
        <div className="dt-child-name-wrap">
          <button
            type="button"
            onClick={toggleLogic}
            className={cn(
              'dt-logic-chip',
              op === 'AND' ? 'dt-logic-chip-and' : 'dt-logic-chip-or',
            )}
            title={`Logic: ${op} — click to toggle`}
            aria-label={`Logic operator ${op}, click to toggle`}
          >
            {op}
          </button>
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
