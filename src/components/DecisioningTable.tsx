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
    <div className="dt-container">
      {/* Toolbar */}
      <div className="dt-toolbar flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="dt-ruleset-name">{ruleset.name}</span>
          <span className="dt-count-badge">
            {ruleset.rules.length} rule{ruleset.rules.length !== 1 ? 's' : ''}
          </span>
          {someSelected && (
            <button onClick={deleteSelected} className="dt-delete-selected-btn">
              <Trash2Icon size={13} />
              Delete {selectedCount} selected
            </button>
          )}
        </div>
        <button onClick={addRule} className="dt-add-btn">
          <PlusIcon size={13} />
          Add Rule
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="dt-thead-row">
              <th className="dt-th dt-th--center" style={{ width: 40, padding: '8px 12px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="dt-checkbox"
                />
              </th>
              <th className="dt-th" style={{ width: 32, padding: '8px 4px' }} />
              <th className="dt-th" style={{ width: 40 }}>#</th>
              <th className="dt-th" style={{ minWidth: 180 }}>Rule Name</th>
              <th className="dt-th" style={{ minWidth: 140 }}>Data Attribute</th>
              <th className="dt-th" style={{ width: 110 }}>Operator</th>
              <th className="dt-th" style={{ minWidth: 120 }}>Amount</th>
              <th className="dt-th" style={{ width: 110 }}>Outcome</th>
              <th className="dt-th" style={{ width: 40, padding: '8px 12px' }} />
            </tr>
          </thead>
          <tbody>
            {ruleset.rules.length === 0 ? (
              <tr>
                <td colSpan={9} className="dt-empty-state">
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
        'dt-row',
        isDragging ? 'dt-row--dragging' : '',
        isOver && !isDragging ? 'dt-row--over' : '',
        rule.selected ? 'dt-row--selected' : '',
      )}
    >
      {/* Checkbox */}
      <td className="dt-cell dt-cell--center" style={{ padding: '8px 12px' }}>
        <input
          type="checkbox"
          checked={rule.selected}
          onChange={(e) => onUpdate(rule.id, { selected: e.target.checked })}
          className="dt-checkbox"
        />
      </td>

      {/* Drag Handle */}
      <td ref={handleRef} className="dt-cell dt-cell--handle">
        <span className="dt-drag-handle">
          <GripVerticalIcon size={16} />
        </span>
      </td>

      {/* Row # */}
      <td className="dt-cell">
        <span className="dt-row-num">{index + 1}</span>
      </td>

      {/* Rule Name */}
      <td className="dt-cell" style={{ padding: '8px 12px' }}>
        <input
          type="text"
          value={rule.ruleName}
          onChange={(e) => onUpdate(rule.id, { ruleName: e.target.value })}
          className="dt-rule-name-input"
          placeholder="Rule name..."
        />
      </td>

      {/* Data Attribute */}
      <td className="dt-cell" style={{ padding: '8px 12px' }}>
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
              className="attr-edit-trigger group-hover/attr:opacity-100"
            >
              <PencilIcon size={12} />
            </button>
          </div>
        )}
      </td>

      {/* Operator */}
      <td className="dt-cell" style={{ padding: '8px 12px' }}>
        <OperatorSelect
          value={rule.operator}
          onChange={(v) => onUpdate(rule.id, { operator: v })}
        />
      </td>

      {/* Amount */}
      <td className="dt-cell" style={{ padding: '8px 12px' }}>
        <div className="flex items-center">
          <span className="dt-amount-prefix">$</span>
          <input
            type="number"
            value={rule.amount}
            onChange={(e) => onUpdate(rule.id, { amount: Number(e.target.value) })}
            className="dt-amount-input"
          />
        </div>
      </td>

      {/* Outcome */}
      <td className="dt-cell" style={{ padding: '8px 12px' }}>
        <OutcomeToggle
          value={rule.outcome}
          onChange={(v) => onUpdate(rule.id, { outcome: v })}
        />
      </td>

      {/* Actions */}
      <td className="dt-cell relative" style={{ padding: '8px 12px' }}>
        <button
          onClick={() => onMenuToggle(rule.id)}
          className="actions-trigger"
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
    <span className={`attr-badge ${value === 'Income' ? 'attr-badge--income' : 'attr-badge--expense'}`}>
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
      {(['Income', 'Expense'] as DataAttribute[]).map((attr) => {
        const isActive = attr === value
        const activeClass = attr === 'Income' ? 'attr-editor-btn--income-active' : 'attr-editor-btn--expense-active'
        return (
          <button
            key={attr}
            onClick={() => onChange(attr)}
            className={`attr-editor-btn ${isActive ? activeClass : 'attr-editor-btn--inactive'}`}
          >
            {attr}
          </button>
        )
      })}
      <button onClick={onClose} className="attr-editor-close">
        <XIcon size={12} />
      </button>
    </div>
  )
}

function OperatorSelect({ value, onChange }: { value: Operator; onChange: (v: Operator) => void }) {
  const operators: Operator[] = ['>', '>=', '<', '<=', '=']
  const display: Record<Operator, string> = {
    '>': '>',
    '>=': '≥',
    '<': '<',
    '<=': '≤',
    '=': '=',
  }

  return (
    <div className="operator-select-wrap">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Operator)}
        className="operator-select"
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {display[op]} {op === '>=' ? 'At least' : op === '<=' ? 'At most' : op === '>' ? 'Greater' : op === '<' ? 'Less' : 'Equals'}
          </option>
        ))}
      </select>
      <span className="operator-chevron">
        <ChevronDownIcon size={12} />
      </span>
    </div>
  )
}

function OutcomeToggle({ value, onChange }: { value: Outcome; onChange: (v: Outcome) => void }) {
  return (
    <button
      onClick={() => onChange(value === 'Approve' ? 'Deny' : 'Approve')}
      title="Click to toggle"
      className={`outcome-toggle ${value === 'Approve' ? 'outcome-toggle--approve' : 'outcome-toggle--deny'}`}
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
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="actions-menu">
        <button onClick={onDuplicate} className="actions-menu-item actions-menu-item--normal">
          <CopyIcon size={13} />
          Duplicate
        </button>
        <hr className="actions-menu-divider" />
        <button onClick={onDelete} className="actions-menu-item actions-menu-item--danger">
          <Trash2Icon size={13} />
          Delete rule
        </button>
      </div>
    </>
  )
}
