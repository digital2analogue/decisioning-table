import { Fragment, useState } from 'react'
import { PlusIcon, TableIcon } from 'lucide-react'
import type { Rule, Ruleset } from '../../types'
import { Checkbox } from '../atoms/Checkbox'
import { RuleRow } from '../molecules/RuleRow'
import { ChildRuleRow } from '../molecules/ChildRuleRow'
import { Toast } from '../molecules/Toast'

interface ToastState {
  message: string
  undo: () => void
}

export interface DecisioningTableProps {
  ruleset: Ruleset
  onUpdate: (ruleset: Ruleset) => void
  onAddRule: () => void
  onAddChild: (parentId: string) => void
  /** ID of a rule whose name input should auto-focus on mount (e.g., a freshly-added rule). */
  autoFocusRuleId?: string | null
  /** Called once the autofocus has been consumed so the parent can clear the marker. */
  onAutoFocusConsumed?: () => void
}

export function DecisioningTable({
  ruleset,
  onUpdate,
  onAddRule,
  onAddChild,
  autoFocusRuleId,
  onAutoFocusConsumed,
}: DecisioningTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Default: parents with children start expanded so the feature is discoverable
    const initial = new Set<string>()
    ruleset.rules.forEach((r) => {
      if (r.children && r.children.length > 0) initial.add(r.id)
    })
    return initial
  })

  function updateRule(id: string, patch: Partial<Rule>) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  }

  function updateChild(parentId: string, childId: string, patch: Partial<Rule>) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) =>
        r.id === parentId
          ? {
              ...r,
              children: r.children?.map((c) => (c.id === childId ? { ...c, ...patch } : c)) ?? [],
            }
          : r,
      ),
    })
  }

  function toggleAll(checked: boolean) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => ({ ...r, selected: checked })),
    })
  }

  function deleteRule(id: string) {
    const idx = ruleset.rules.findIndex((r) => r.id === id)
    if (idx === -1) return
    const removed = ruleset.rules[idx]
    const nextRules = ruleset.rules.filter((r) => r.id !== id)
    onUpdate({ ...ruleset, rules: nextRules })
    setOpenMenuId(null)
    setToast({
      message: `"${removed.ruleName || 'Untitled rule'}" deleted`,
      undo: () => {
        const restored = [...nextRules]
        restored.splice(idx, 0, removed)
        onUpdate({ ...ruleset, rules: restored })
      },
    })
  }

  function duplicateRule(id: string) {
    const source = ruleset.rules.find((r) => r.id === id)
    if (!source) return
    const dup: Rule = {
      ...source,
      id: `r-${Date.now()}`,
      ruleName: `${source.ruleName} (copy)`,
      children: source.children?.map((c, i) => ({ ...c, id: `r-${Date.now()}-c${i}` })),
    }
    const idx = ruleset.rules.findIndex((r) => r.id === id)
    const next = [...ruleset.rules]
    next.splice(idx + 1, 0, dup)
    onUpdate({ ...ruleset, rules: next })
    setOpenMenuId(null)
  }

  function deleteChild(parentId: string, childId: string) {
    const parent = ruleset.rules.find((r) => r.id === parentId)
    if (!parent || !parent.children) return
    const childIdx = parent.children.findIndex((c) => c.id === childId)
    if (childIdx === -1) return
    const removed = parent.children[childIdx]
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) =>
        r.id === parentId
          ? { ...r, children: r.children?.filter((c) => c.id !== childId) ?? [] }
          : r,
      ),
    })
    setOpenMenuId(null)
    setToast({
      message: `Sub-condition "${removed.ruleName || 'Untitled'}" deleted`,
      undo: () => {
        onUpdate({
          ...ruleset,
          rules: ruleset.rules.map((r) => {
            if (r.id !== parentId) return r
            const next = [...(r.children ?? [])]
            next.splice(childIdx, 0, removed)
            return { ...r, children: next }
          }),
        })
      },
    })
  }

  function duplicateChild(parentId: string, childId: string) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => {
        if (r.id !== parentId || !r.children) return r
        const idx = r.children.findIndex((c) => c.id === childId)
        if (idx === -1) return r
        const src = r.children[idx]
        const dup: Rule = { ...src, id: `r-${Date.now()}`, ruleName: `${src.ruleName} (copy)` }
        const nextChildren = [...r.children]
        nextChildren.splice(idx + 1, 0, dup)
        return { ...r, children: nextChildren }
      }),
    })
    setOpenMenuId(null)
  }

  function moveRow(dragIndex: number, hoverIndex: number) {
    const next = [...ruleset.rules]
    const [removed] = next.splice(dragIndex, 1)
    next.splice(hoverIndex, 0, removed)
    onUpdate({ ...ruleset, rules: next })
  }

  /** Wrapper around onAddChild that ensures the parent is expanded before
      the new draft child renders, so the user immediately sees what they added. */
  function handleAddChild(parentId: string) {
    setExpandedIds((prev) => {
      if (prev.has(parentId)) return prev
      const next = new Set(prev)
      next.add(parentId)
      return next
    })
    onAddChild(parentId)
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = ruleset.rules.length > 0 && ruleset.rules.every((r) => r.selected)
  const someSelected = ruleset.rules.some((r) => r.selected)

  return (
    <div className="dt-table-edge">
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
            <th className="dt-th w-14 px-2 py-2.5 text-center tracking-wider">#</th>
            <th className="dt-th dt-col-sticky-head px-3 py-2.5 text-left tracking-wider min-w-[260px]">Rule name</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[140px]">Data attribute</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider w-[110px]">Operator</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[120px]">Amount</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[160px]">Existing Account</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[160px]">Annual Income</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider w-[110px]">Outcome</th>
            <th className="w-10 px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {ruleset.rules.length === 0 ? (
            <tr>
              <td colSpan={11} className="dt-empty-cell">
                <div className="dt-empty-state">
                  <TableIcon size={28} className="dt-empty-icon" />
                  <p className="dt-empty-title">No rules yet</p>
                  <p className="dt-empty-subtitle">Click <strong>Add rule</strong> to define your first decision rule.</p>
                </div>
              </td>
            </tr>
          ) : (
            ruleset.rules.map((rule, index) => {
              const expanded = expandedIds.has(rule.id)
              const children = rule.children ?? []
              return (
                <Fragment key={rule.id}>
                  <RuleRow
                    rule={rule}
                    index={index}
                    openMenuId={openMenuId}
                    onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                    onMenuClose={() => setOpenMenuId(null)}
                    onUpdate={updateRule}
                    onDelete={deleteRule}
                    onDuplicate={duplicateRule}
                    onAddChild={handleAddChild}
                    onMove={moveRow}
                    isExpanded={expanded}
                    onToggleExpand={toggleExpand}
                    autoFocus={autoFocusRuleId === rule.id}
                    onAutoFocusConsumed={onAutoFocusConsumed}
                  />
                  {expanded && children.map((child, ci) => (
                    <ChildRuleRow
                      key={child.id}
                      rule={child}
                      parentId={rule.id}
                      isLast={ci === children.length - 1}
                      menuOpen={openMenuId === child.id}
                      onMenuToggle={() => setOpenMenuId(openMenuId === child.id ? null : child.id)}
                      onMenuClose={() => setOpenMenuId(null)}
                      onUpdate={updateChild}
                      onDelete={deleteChild}
                      onDuplicate={duplicateChild}
                      autoFocus={autoFocusRuleId === child.id}
                      onAutoFocusConsumed={onAutoFocusConsumed}
                    />
                  ))}
                </Fragment>
              )
            })
          )}
          {/* Chromeless add-rule row — Airtable-style affordance at the bottom of the tbody */}
          <tr className="dt-add-rule-row">
            <td colSpan={11} className="dt-add-rule-row-cell">
              <button
                type="button"
                onClick={onAddRule}
                className="dt-add-rule-row-btn"
              >
                <PlusIcon size={14} />
                <span>Add rule</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {toast && (
        <Toast
          message={toast.message}
          actionLabel="Undo"
          onAction={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
