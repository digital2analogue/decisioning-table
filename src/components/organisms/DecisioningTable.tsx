import { useCallback, useEffect, useRef, useState } from 'react'
import type { Rule, RuleStatus, Ruleset } from '../../types'
import { Checkbox } from '../atoms/Checkbox'
import { RuleRow } from '../molecules/RuleRow'
import { SelectionBar } from '../molecules/SelectionBar'

export interface DecisioningTableProps {
  ruleset: Ruleset
  onUpdate: (ruleset: Ruleset) => void
}

function isTextualTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function DecisioningTable({ ruleset, onUpdate }: DecisioningTableProps) {
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null)
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [editNameTrigger, setEditNameTrigger] = useState(0)
  const tableRef = useRef<HTMLDivElement>(null)

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

  function deleteRule(id: string) {
    const idx = ruleset.rules.findIndex((r) => r.id === id)
    onUpdate({ ...ruleset, rules: ruleset.rules.filter((r) => r.id !== id) })
    setOpenMenuId(null)
    if (idx >= 0) {
      const nextLen = ruleset.rules.length - 1
      setFocusedIndex(nextLen === 0 ? -1 : Math.min(idx, nextLen - 1))
    }
  }

  function duplicateRule(id: string) {
    const source = ruleset.rules.find((r) => r.id === id)
    if (!source) return
    const dup: Rule = { ...source, id: `r-${Date.now()}`, selected: false, ruleName: `${source.ruleName} (copy)` }
    const idx = ruleset.rules.findIndex((r) => r.id === id)
    const next = [...ruleset.rules]
    next.splice(idx + 1, 0, dup)
    onUpdate({ ...ruleset, rules: next })
    setOpenMenuId(null)
    setFocusedIndex(idx + 1)
  }

  function moveRow(dragIndex: number, hoverIndex: number) {
    const next = [...ruleset.rules]
    const [removed] = next.splice(dragIndex, 1)
    next.splice(hoverIndex, 0, removed)
    onUpdate({ ...ruleset, rules: next })
  }

  const allSelected = ruleset.rules.length > 0 && ruleset.rules.every((r) => r.selected)
  const someSelected = ruleset.rules.some((r) => r.selected)
  const selectedRules = ruleset.rules.filter((r) => r.selected)
  const selectedCount = selectedRules.length
  const allSelectedDisabled = selectedCount > 0 && selectedRules.every((r) => r.status === 'disabled')

  function deleteSelected() {
    onUpdate({ ...ruleset, rules: ruleset.rules.filter((r) => !r.selected) })
    setFocusedIndex(-1)
  }

  function clearSelection() {
    if (!someSelected) return
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => (r.selected ? { ...r, selected: false } : r)),
    })
  }

  function duplicateSelected() {
    const next: Rule[] = []
    for (const r of ruleset.rules) {
      next.push(r)
      if (r.selected) {
        next.push({
          ...r,
          id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          selected: false,
          ruleName: `${r.ruleName} (copy)`,
        })
      }
    }
    onUpdate({ ...ruleset, rules: next })
  }

  function setStatusForSelected(status: RuleStatus) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => (r.selected ? { ...r, status } : r)),
    })
  }

  function toggleEnabledSelected() {
    setStatusForSelected(allSelectedDisabled ? 'active' : 'disabled')
  }

  const focusRow = useCallback((i: number) => setFocusedIndex(i), [])

  function handleRowKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>, index: number) {
    const rule = ruleset.rules[index]
    if (!rule) return
    const inText = isTextualTarget(e.target)

    if (e.key === 'Escape' && inText) {
      e.preventDefault()
      e.currentTarget.focus()
      return
    }

    if (inText) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(Math.min(index + 1, ruleset.rules.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(Math.max(index - 1, 0))
    } else if (e.key === ' ') {
      e.preventDefault()
      updateRule(rule.id, { selected: !rule.selected })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setEditNameTrigger((t) => t + 1)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      if (someSelected) deleteSelected()
      else deleteRule(rule.id)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      if (e.shiftKey) {
        updateRule(rule.id, { status: rule.status === 'disabled' ? 'active' : 'disabled' })
      } else {
        duplicateRule(rule.id)
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      toggleAll(true)
    }
  }

  useEffect(() => {
    function onGlobalKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (!tableRef.current?.contains(document.activeElement)) return
      if (isTextualTarget(document.activeElement)) return
      if (someSelected) {
        e.preventDefault()
        clearSelection()
      }
    }
    document.addEventListener('keydown', onGlobalKey)
    return () => document.removeEventListener('keydown', onGlobalKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [someSelected, ruleset])

  return (
    <div className="dt-table-edge" ref={tableRef}>
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
            <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[180px]">Rule name</th>
            <th className="dt-th px-3 py-2.5 text-left tracking-wider min-w-[140px]">Data attribute</th>
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
                No rules yet. Click <strong>Add rule</strong> to get started.
              </td>
            </tr>
          ) : (
            ruleset.rules.map((rule, index) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                index={index}
                focused={focusedIndex === index}
                editingAttributeId={editingAttributeId}
                editingStatusId={editingStatusId}
                openMenuId={openMenuId}
                onEditAttribute={(id) => setEditingAttributeId(id)}
                onCloseAttribute={() => setEditingAttributeId(null)}
                onEditStatus={(id) => setEditingStatusId(id)}
                onCloseStatus={() => setEditingStatusId(null)}
                onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                onMenuClose={() => setOpenMenuId(null)}
                onUpdate={updateRule}
                onDelete={deleteRule}
                onDuplicate={duplicateRule}
                onMove={moveRow}
                onFocusRow={focusRow}
                onRowKeyDown={handleRowKeyDown}
                editNameTrigger={focusedIndex === index ? editNameTrigger : 0}
              />
            ))
          )}
        </tbody>
      </table>

      <SelectionBar
        selectedCount={selectedCount}
        allDisabled={allSelectedDisabled}
        onClear={clearSelection}
        onDelete={deleteSelected}
        onDuplicate={duplicateSelected}
        onToggleEnabled={toggleEnabledSelected}
      />
    </div>
  )
}
