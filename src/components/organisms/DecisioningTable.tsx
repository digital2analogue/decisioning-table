import { useState } from 'react'
import type { Rule, Ruleset } from '../../types'
import { Checkbox } from '../atoms/Checkbox'
import { RuleRow } from '../molecules/RuleRow'
import { ToolbarActions } from '../molecules/ToolbarActions'

export interface DecisioningTableProps {
  ruleset: Ruleset
  onUpdate: (ruleset: Ruleset) => void
}

export function DecisioningTable({ ruleset, onUpdate }: DecisioningTableProps) {
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  function updateRule(id: string, patch: Partial<Rule>) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  }

  function toggleAll(checked: boolean) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => ({ ...r, selected: checked })),
    })
  }

  function addRule() {
    const newRule: Rule = {
      id: `r-${Date.now()}`,
      selected: false,
      ruleName: 'New Rule',
      dataAttribute: 'Income',
      operator: '>=',
      amount: 0,
      outcome: 'Approve',
    }
    onUpdate({ ...ruleset, rules: [...ruleset.rules, newRule] })
  }

  function deleteRule(id: string) {
    onUpdate({ ...ruleset, rules: ruleset.rules.filter((r) => r.id !== id) })
    setOpenMenuId(null)
  }

  function duplicateRule(id: string) {
    const source = ruleset.rules.find((r) => r.id === id)
    if (!source) return
    const dup: Rule = { ...source, id: `r-${Date.now()}`, ruleName: `${source.ruleName} (copy)` }
    const idx = ruleset.rules.findIndex((r) => r.id === id)
    const next = [...ruleset.rules]
    next.splice(idx + 1, 0, dup)
    onUpdate({ ...ruleset, rules: next })
    setOpenMenuId(null)
  }

  function moveRow(dragIndex: number, hoverIndex: number) {
    const next = [...ruleset.rules]
    const [removed] = next.splice(dragIndex, 1)
    next.splice(hoverIndex, 0, removed)
    onUpdate({ ...ruleset, rules: next })
  }

  const allSelected = ruleset.rules.length > 0 && ruleset.rules.every((r) => r.selected)
  const someSelected = ruleset.rules.some((r) => r.selected)
  const selectedCount = ruleset.rules.filter((r) => r.selected).length

  function deleteSelected() {
    onUpdate({ ...ruleset, rules: ruleset.rules.filter((r) => !r.selected) })
  }

  return (
    <div className="dt-table-card">
      <ToolbarActions
        rulesetName={ruleset.name}
        ruleCount={ruleset.rules.length}
        selectedCount={selectedCount}
        someSelected={someSelected}
        onDeleteSelected={deleteSelected}
        onAddRule={addRule}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="dt-thead-row">
              <th className="w-10 px-3 py-2.5 text-center">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="w-8 px-1 py-2.5"></th>
              <th className="dt-th w-10 px-2 py-2.5 text-left tracking-wider">#</th>
              <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[180px]">Rule Name</th>
              <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[140px]">Data Attribute</th>
              <th className="dt-th px-3 py-2.5 text-left tracking-wider w-[110px]">Operator</th>
              <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[120px]">Amount</th>
              <th className="dt-th px-3 py-2.5 text-left tracking-wider w-[110px]">Outcome</th>
              <th className="w-10 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {ruleset.rules.length === 0 ? (
              <tr>
                <td colSpan={9} className="dt-empty-cell py-12 text-center">
                  No rules yet. Click <strong>Add Rule</strong> to get started.
                </td>
              </tr>
            ) : (
              ruleset.rules.map((rule, index) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  index={index}
                  editingAttributeId={editingAttributeId}
                  openMenuId={openMenuId}
                  onEditAttribute={(id) => setEditingAttributeId(id)}
                  onCloseAttribute={() => setEditingAttributeId(null)}
                  onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                  onMenuClose={() => setOpenMenuId(null)}
                  onUpdate={updateRule}
                  onDelete={deleteRule}
                  onDuplicate={duplicateRule}
                  onMove={moveRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
