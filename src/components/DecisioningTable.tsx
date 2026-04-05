import { useCallback, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import {
  PlusIcon,
  Trash2Icon,
  GripVerticalIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  CopyIcon,
} from 'lucide-react'
import type { Rule, Ruleset, DataAttribute, Operator, Outcome } from '../types'
import { cn } from '../lib/utils'

const DND_TYPE = 'RULE_ROW'

interface DecisioningTableProps {
  ruleset: Ruleset
  onUpdate: (ruleset: Ruleset) => void
}

interface DragItem {
  index: number
  id: string
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-800">{ruleset.name}</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {ruleset.rules.length} rule{ruleset.rules.length !== 1 ? 's' : ''}
          </span>
          {someSelected && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 ml-2"
            >
              <Trash2Icon size={13} />
              Delete {selectedCount} selected
            </button>
          )}
        </div>
        <button
          onClick={addRule}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <PlusIcon size={13} />
          Add Rule
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 cursor-pointer"
                />
              </th>
              <th className="w-8 px-1 py-2.5"></th>
              <th className="w-10 px-2 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[180px]">Rule Name</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[140px]">Data Attribute</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-[110px]">Operator</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-[110px]">Outcome</th>
              <th className="w-10 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {ruleset.rules.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                  No rules yet. Click <strong className="text-slate-600">Add Rule</strong> to get started.
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

// ─── Rule Row ────────────────────────────────────────────────────────────────

interface RuleRowProps {
  rule: Rule
  index: number
  editingAttributeId: string | null
  openMenuId: string | null
  onEditAttribute: (id: string) => void
  onCloseAttribute: () => void
  onMenuToggle: (id: string) => void
  onMenuClose: () => void
  onUpdate: (id: string, patch: Partial<Rule>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
}

function RuleRow({
  rule,
  index,
  editingAttributeId,
  openMenuId,
  onEditAttribute,
  onCloseAttribute,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
}: RuleRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null)

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
    (el: HTMLTableCellElement | null) => {
      drag(el)
    },
    [drag],
  )

  dragPreview(drop(rowRef))

  return (
    <tr
      ref={rowRef}
      className={cn(
        'border-b border-slate-100 transition-colors group',
        isDragging ? 'opacity-40 bg-indigo-50' : 'hover:bg-slate-50',
        isOver && !isDragging ? 'border-t-2 border-t-indigo-400' : '',
        rule.selected ? 'bg-indigo-50/40' : '',
      )}
    >
      {/* Checkbox */}
      <td className="px-3 py-2.5 text-center">
        <input
          type="checkbox"
          checked={rule.selected}
          onChange={(e) => onUpdate(rule.id, { selected: e.target.checked })}
          className="rounded border-slate-300 text-indigo-600 cursor-pointer"
        />
      </td>

      {/* Drag Handle */}
      <td ref={handleRef} className="px-1 py-2.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
        <GripVerticalIcon size={16} />
      </td>

      {/* Row # */}
      <td className="px-2 py-2.5 text-slate-400 text-xs font-mono">{index + 1}</td>

      {/* Rule Name */}
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={rule.ruleName}
          onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
          className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm placeholder:text-slate-300 focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1.5 py-0.5 -mx-1.5 transition-all"
          placeholder="Rule name..."
        />
      </td>

      {/* Data Attribute */}
      <td className="px-3 py-2.5">
        {editingAttributeId === rule.id ? (
          <AttributeEditor
            value={rule.dataAttribute}
            onChange={(v) => { onUpdate(rule.id, { dataAttribute: v }); onCloseAttribute() }}
            onClose={onCloseAttribute}
          />
        ) : (
          <div className="flex items-center gap-1.5 group/attr">
            <AttributeBadge value={rule.dataAttribute} />
            <button
              onClick={() => onEditAttribute(rule.id)}
              className="opacity-0 group-hover/attr:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
            >
              <PencilIcon size={12} />
            </button>
          </div>
        )}
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
        <div className="flex items-center">
          <span className="text-slate-400 text-sm mr-1">$</span>
          <input
            type="number"
            value={rule.amount}
            onChange={(e) => onUpdate(rule.id, { amount: Number(e.target.value) })}
            className="w-full bg-transparent border-0 outline-none text-slate-800 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1.5 py-0.5 transition-all"
          />
        </div>
      </td>

      {/* Outcome */}
      <td className="px-3 py-2.5">
        <OutcomeToggle
          value={rule.outcome}
          onChange={(v) => onUpdate(rule.id, { outcome: v })}
        />
      </td>

      {/* Actions */}
      <td className="px-3 py-2.5 relative">
        <button
          onClick={() => onMenuToggle(rule.id)}
          className="text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontalIcon size={16} />
        </button>
        {openMenuId === rule.id && (
          <ActionsMenu
            onDuplicate={() => onDuplicate(rule.id)}
            onDelete={() => onDelete(rule.id)}
            onClose={onMenuClose}
          />
        )}
      </td>
    </tr>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AttributeBadge({ value }: { value: DataAttribute }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        value === 'Income'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200',
      )}
    >
      {value}
    </span>
  )
}

function AttributeEditor({
  value,
  onChange,
  onClose,
}: {
  value: DataAttribute
  onChange: (v: DataAttribute) => void
  onClose: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      {(['Income', 'Expense'] as DataAttribute[]).map((attr) => (
        <button
          key={attr}
          onClick={() => onChange(attr)}
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
            attr === value
              ? attr === 'Income'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-red-100 text-red-700 border-red-300'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
          )}
        >
          {attr}
        </button>
      ))}
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <XIcon size={12} />
      </button>
    </div>
  )
}

function OperatorSelect({ value, onChange }: { value: Operator; onChange: (v: Operator) => void }) {
  const operators: Operator[] = ['>', '>=', '<', '<=', '=']
  const labels: Record<Operator, string> = {
    '>': '> Greater than',
    '>=': '≥ At least',
    '<': '< Less than',
    '<=': '≤ At most',
    '=': '= Equals',
  }
  const display: Record<Operator, string> = {
    '>': '>',
    '>=': '≥',
    '<': '<',
    '<=': '≤',
    '=': '=',
  }

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Operator)}
        className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 pr-6 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 hover:border-slate-300 transition-colors"
        title={labels[value]}
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {display[op]} {op === '>=' ? 'At least' : op === '<=' ? 'At most' : op === '>' ? 'Greater' : op === '<' ? 'Less' : 'Equals'}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={12}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  )
}

function OutcomeToggle({ value, onChange }: { value: Outcome; onChange: (v: Outcome) => void }) {
  return (
    <button
      onClick={() => onChange(value === 'Approve' ? 'Deny' : 'Approve')}
      title="Click to toggle"
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
        value === 'Approve'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      )}
    >
      {value === 'Approve' ? <CheckIcon size={11} /> : <XIcon size={11} />}
      {value}
    </button>
  )
}

function ActionsMenu({
  onDuplicate,
  onDelete,
  onClose,
}: {
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-7 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
        <button
          onClick={onDuplicate}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <CopyIcon size={13} />
          Duplicate
        </button>
        <div className="border-t border-slate-100 my-1" />
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
