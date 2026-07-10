import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { MoreHorizontalIcon, PlusIcon, TableIcon } from 'lucide-react'
import type { Rule, Ruleset } from '../../types'
import { isRuleTouched } from '../../types'
import { Checkbox } from '../atoms/Checkbox'
import { RuleRow } from '../molecules/RuleRow'
import { ChildRuleRow } from '../molecules/ChildRuleRow'
import { Toast } from '../molecules/Toast'
import { ColumnHeaderMenu } from '../molecules/ColumnHeaderMenu'

interface ToastState {
  message: string
  undo: () => void
}

export interface DecisioningTableProps {
  ruleset: Ruleset
  onUpdate: (ruleset: Ruleset) => void
  onAddRule: () => void
  onAddChild: (parentId: string) => void
  /** Active rule-name search filter. Empty string = no filter. */
  ruleNameQuery?: string
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
  ruleNameQuery = '',
  autoFocusRuleId,
  onAutoFocusConsumed,
}: DecisioningTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [collapsingIds, setCollapsingIds] = useState<Set<string>>(new Set())
  const [openColumnMenuId, setOpenColumnMenuId] = useState<string | null>(null)
  const existingAccountBtnRef = useRef<HTMLButtonElement>(null)
  const annualIncomeBtnRef = useRef<HTMLButtonElement>(null)
  const creditScoreBtnRef = useRef<HTMLButtonElement>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  // Scroll-shadow affordance: cast a shadow off the sticky columns' right edge once
  // content scrolls under them, and under the sticky header once rows scroll beneath —
  // the hallmark "there's more here" cue of a polished data table.
  const edgeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const edge = edgeRef.current
    if (!edge) return
    let raf = 0
    const update = () => {
      raf = 0
      edge.classList.toggle('dt-scrolled-x', edge.scrollLeft > 0)
      edge.classList.toggle('dt-scrolled-y', edge.scrollTop > 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    edge.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      edge.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Drop-settle: briefly highlight a row after it's reordered (drag, keyboard, or
  // menu) so the eye confirms where it landed — neighbours don't part here.
  const [settledRuleId, setSettledRuleId] = useState<string | null>(null)
  const settleTimer = useRef<number | undefined>(undefined)
  function flashSettle(id: string) {
    setSettledRuleId(id)
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => setSettledRuleId(null), 500)
  }

  const normalizedQuery = ruleNameQuery.trim().toLowerCase()
  const filterActive = normalizedQuery.length > 0
  const visibleCount = filterActive
    ? ruleset.rules.filter((r) => r.ruleName.toLowerCase().includes(normalizedQuery)).length
    : ruleset.rules.length
  const [addRuleMenuOpen, setAddRuleMenuOpen] = useState(false)
  const addRuleWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addRuleMenuOpen) return
    function handleOutside(e: MouseEvent) {
      if (addRuleWrapRef.current && !addRuleWrapRef.current.contains(e.target as Node)) {
        setAddRuleMenuOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAddRuleMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [addRuleMenuOpen])
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
    // Focus follows the deletion — keyboard / screen-reader users land on the
    // next visible row's name input (or the previous one if the deleted row
    // was the last). Defers a frame so the new DOM is mounted.
    const nextFocusRule = nextRules[idx] ?? nextRules[idx - 1]
    if (nextFocusRule) {
      window.requestAnimationFrame(() => {
        const target = document.querySelector<HTMLInputElement>(
          `tr[data-rule-id="${nextFocusRule.id}"] .dt-rule-name-input`,
        )
        target?.focus()
      })
    }
    // Silently drop untouched draft rules — no toast, no undo. The user
    // never put anything in, so there's nothing to recover.
    if (!isRuleTouched(removed)) return
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
    const nextChildren = parent.children.filter((c) => c.id !== childId)
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) =>
        r.id === parentId
          ? { ...r, children: nextChildren }
          : r,
      ),
    })
    setOpenMenuId(null)
    // Focus the next visible sibling child (or the parent if no siblings remain).
    const nextFocusId = nextChildren[childIdx]?.id ?? nextChildren[childIdx - 1]?.id ?? parentId
    if (nextFocusId) {
      window.requestAnimationFrame(() => {
        const target = document.querySelector<HTMLInputElement>(
          `tr[data-rule-id="${nextFocusId}"] .dt-rule-name-input`,
        )
        target?.focus()
      })
    }
    // Same silent-drop policy as deleteRule — untouched draft children
    // disappear without an undo toast.
    if (!isRuleTouched(removed)) return
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

  // dnd-kit sensors. Mouse needs a small drag distance so a click isn't a drag;
  // touch needs a press-and-hold delay so a plain swipe still scrolls the page and
  // only a deliberate hold on the grip starts a drag (the mobile fix); keyboard for
  // accessible reordering. dnd-kit animates the reflow natively via SortableContext.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // A `transform` on a <tr> is dropped by the browser when the row has sticky
  // cells (# and rule-name columns), so dnd-kit's default in-place row transform
  // never renders. Instead we capture a static snapshot of the picked-up row and
  // render it in a DragOverlay — a fixed-position portal dnd-kit moves with the
  // pointer, immune to the sticky-cell conflict. See docs/decisions.md.
  const [activeDrag, setActiveDrag] = useState<{
    id: string
    html: string
    colWidths: number[]
    tableWidth: number
  } | null>(null)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function handleDragStart(event: DragStartEvent) {
    // Close any open overflow menu so its portaled popover doesn't dangle mid-drag.
    setOpenMenuId(null)
    const row = document.querySelector<HTMLTableRowElement>(
      `tr[data-rule-id="${event.active.id}"]`,
    )
    if (!row) return
    const colWidths = Array.from(row.children).map(
      (cell) => (cell as HTMLElement).getBoundingClientRect().width,
    )
    const tableWidth = row.closest('table')?.getBoundingClientRect().width ?? 0
    // Clone the row and bake the controlled <input> values (rule name, amounts) into
    // attributes — they live as DOM properties, so a raw outerHTML would serialize empty.
    const clone = row.cloneNode(true) as HTMLTableRowElement
    const liveFields = row.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
    const cloneFields = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
    liveFields.forEach((live, i) => {
      const c = cloneFields[i]
      if (!c) return
      c.setAttribute('value', live.value)
      if (c instanceof HTMLTextAreaElement) c.textContent = live.value
    })
    setActiveDrag({ id: String(event.active.id), html: clone.outerHTML, colWidths, tableWidth })
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = ruleset.rules.findIndex((r) => r.id === active.id)
    const to = ruleset.rules.findIndex((r) => r.id === over.id)
    if (from === -1 || to === -1) return
    moveRow(from, to)
  }

  function handleDragCancel() {
    setActiveDrag(null)
  }

  function moveRow(dragIndex: number, hoverIndex: number) {
    const next = [...ruleset.rules]
    const [removed] = next.splice(dragIndex, 1)
    next.splice(hoverIndex, 0, removed)
    onUpdate({ ...ruleset, rules: next })
    flashSettle(removed.id)
  }

  function moveChild(parentId: string, fromIdx: number, toIdx: number) {
    onUpdate({
      ...ruleset,
      rules: ruleset.rules.map((r) => {
        if (r.id !== parentId || !r.children) return r
        const next = [...r.children]
        const [removed] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, removed)
        return { ...r, children: next }
      }),
    })
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
    if (expandedIds.has(id)) {
      // Animate children out before removing them from the DOM
      setCollapsingIds((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setExpandedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
        setCollapsingIds((prev) => { const next = new Set(prev); next.delete(id); return next })
      }, 150)
    } else {
      setExpandedIds((prev) => new Set(prev).add(id))
    }
  }

  const allSelected = ruleset.rules.length > 0 && ruleset.rules.every((r) => r.selected)
  const someSelected = ruleset.rules.some((r) => r.selected)

  return (
    <div className="dt-table-edge" ref={edgeRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
      <table className="w-full">
        <thead>
          <tr className="dt-thead-row">
            <th className="w-10 dt-td text-center">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
              />
            </th>
            <th className="dt-th dt-col-sticky-num-head w-14 px-2 py-2.5 text-right tracking-wider">#</th>
            <th className="dt-th dt-col-sticky-head dt-td text-left tracking-wider w-[260px] max-w-[260px]">Rule name</th>
            <th className="dt-th dt-col-data-attribute dt-td text-left tracking-wider min-w-[140px]">Data attribute</th>
            <th className="dt-th dt-td text-left tracking-wider">
              <div className="dt-th-label-wrap">
                <span>Existing Account</span>
                <button
                  ref={existingAccountBtnRef}
                  type="button"
                  className="dt-icon-btn dt-icon-reveal dt-th-menu-btn"
                  aria-label="Existing Account column options"
                  aria-haspopup="menu"
                  aria-expanded={openColumnMenuId === 'existing-account'}
                  onClick={() => setOpenColumnMenuId(openColumnMenuId === 'existing-account' ? null : 'existing-account')}
                >
                  <MoreHorizontalIcon size={14} />
                </button>
              </div>
            </th>
            <th className="dt-th dt-td text-left tracking-wider">
              <div className="dt-th-label-wrap">
                <span>Annual Income</span>
                <button
                  ref={annualIncomeBtnRef}
                  type="button"
                  className="dt-icon-btn dt-icon-reveal dt-th-menu-btn"
                  aria-label="Annual Income column options"
                  aria-haspopup="menu"
                  aria-expanded={openColumnMenuId === 'annual-income'}
                  onClick={() => setOpenColumnMenuId(openColumnMenuId === 'annual-income' ? null : 'annual-income')}
                >
                  <MoreHorizontalIcon size={14} />
                </button>
              </div>
            </th>
            <th className="dt-th dt-td text-left tracking-wider">
              <div className="dt-th-label-wrap">
                <span>Credit Score</span>
                <button
                  ref={creditScoreBtnRef}
                  type="button"
                  className="dt-icon-btn dt-icon-reveal dt-th-menu-btn"
                  aria-label="Credit Score column options"
                  aria-haspopup="menu"
                  aria-expanded={openColumnMenuId === 'credit-score'}
                  onClick={() => setOpenColumnMenuId(openColumnMenuId === 'credit-score' ? null : 'credit-score')}
                >
                  <MoreHorizontalIcon size={14} />
                </button>
              </div>
            </th>
            <th className="dt-th dt-td text-left tracking-wider w-[190px]">Outcome</th>
            <th className="dt-col-actions-head w-10 dt-td"></th>
          </tr>
        </thead>
        <tbody>
          <SortableContext
            items={ruleset.rules.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
          {ruleset.rules.length === 0 ? (
            <tr>
              <td colSpan={9} className="dt-empty-cell">
                <div className="dt-empty-state">
                  <TableIcon size={24} className="dt-empty-icon" />
                  <p className="dt-empty-title">No rules yet</p>
                  <p className="dt-empty-subtitle">Each rule pairs a data attribute, operator, and threshold with an outcome.</p>
                </div>
              </td>
            </tr>
          ) : filterActive && visibleCount === 0 ? (
            <tr>
              <td colSpan={9} className="dt-empty-cell">
                <div className="dt-empty-state">
                  <p className="dt-empty-title">No rules match "{ruleNameQuery}"</p>
                  <p className="dt-empty-subtitle">Clear the search to see all rules.</p>
                </div>
              </td>
            </tr>
          ) : (
            ruleset.rules.map((rule, index) => {
              // Filter by rule name (case-insensitive). Children always render with
              // their parent — we don't filter children independently because the
              // parent-child relationship would become incoherent.
              if (filterActive && !rule.ruleName.toLowerCase().includes(normalizedQuery)) {
                return null
              }
              const expanded = expandedIds.has(rule.id)
              const children = rule.children ?? []
              return (
                <Fragment key={rule.id}>
                  <RuleRow
                    rule={rule}
                    index={index}
                    totalRules={ruleset.rules.length}
                    dndEnabled={!filterActive}
                    isSettled={settledRuleId === rule.id}
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
                  {(expanded || collapsingIds.has(rule.id)) && children.map((child, ci) => (
                    <ChildRuleRow
                      key={child.id}
                      rule={child}
                      parentId={rule.id}
                      childIndex={ci}
                      totalChildren={children.length}
                      isLast={ci === children.length - 1}
                      isCollapsing={collapsingIds.has(rule.id)}
                      menuOpen={openMenuId === child.id}
                      onMenuToggle={() => setOpenMenuId(openMenuId === child.id ? null : child.id)}
                      onMenuClose={() => setOpenMenuId(null)}
                      onUpdate={updateChild}
                      onDelete={deleteChild}
                      onDuplicate={duplicateChild}
                      onMove={moveChild}
                    />
                  ))}
                </Fragment>
              )
            })
          )}
          {/* Chromeless add-rule row — Airtable-style affordance at the bottom of the tbody.
              Mirrors the toolbar split-button: clicking opens a small menu with
              "Add rule" + "Add existing rule" so users can pick either path inline. */}
          <tr className="dt-add-rule-row">
            <td colSpan={9} className="dt-add-rule-row-cell">
              <div ref={addRuleWrapRef} className="dt-add-rule-row-wrap">
                <button
                  type="button"
                  onClick={() => setAddRuleMenuOpen((o) => !o)}
                  className="dt-add-rule-row-btn"
                  aria-haspopup="menu"
                  aria-expanded={addRuleMenuOpen}
                >
                  <PlusIcon size={14} />
                  <span>Add rule</span>
                </button>
                {addRuleMenuOpen && (
                  <div className="dt-add-rule-row-menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="dt-split-btn-menu-item"
                      onClick={() => { onAddRule(); setAddRuleMenuOpen(false) }}
                    >
                      Add rule
                    </button>
                    <hr className="dt-split-btn-menu-divider" />
                    <button
                      type="button"
                      role="menuitem"
                      className="dt-split-btn-menu-item"
                      onClick={() => setAddRuleMenuOpen(false)}
                    >
                      Add existing rule
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
          </SortableContext>
        </tbody>
      </table>
      <DragOverlay dropAnimation={prefersReducedMotion ? null : undefined}>
        {activeDrag ? (
          <div className="dt-drag-overlay">
            <table className="w-full dt-drag-overlay-table" style={{ width: activeDrag.tableWidth }}>
              <colgroup>
                {activeDrag.colWidths.map((w, i) => (
                  <col key={i} style={{ width: w }} />
                ))}
              </colgroup>
              <tbody dangerouslySetInnerHTML={{ __html: activeDrag.html }} />
            </table>
          </div>
        ) : null}
      </DragOverlay>
      </DndContext>
      {toast && (
        <Toast
          message={toast.message}
          actionLabel="Undo"
          onAction={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
      {openColumnMenuId === 'existing-account' && (
        <ColumnHeaderMenu
          anchorRef={existingAccountBtnRef}
          onChangeDataElement={() => console.log('Change Data Element: Existing Account')}
          onDelete={() => console.log('Delete column: Existing Account')}
          onClose={() => setOpenColumnMenuId(null)}
        />
      )}
      {openColumnMenuId === 'annual-income' && (
        <ColumnHeaderMenu
          anchorRef={annualIncomeBtnRef}
          onChangeDataElement={() => console.log('Change Data Element: Annual Income')}
          onDelete={() => console.log('Delete column: Annual Income')}
          onClose={() => setOpenColumnMenuId(null)}
        />
      )}
      {openColumnMenuId === 'credit-score' && (
        <ColumnHeaderMenu
          anchorRef={creditScoreBtnRef}
          onChangeDataElement={() => console.log('Change Data Element: Credit Score')}
          onDelete={() => console.log('Delete column: Credit Score')}
          onClose={() => setOpenColumnMenuId(null)}
        />
      )}
      {/* Selection bar — persistent bottom-center bar while rows are selected */}
      {someSelected && createPortal(
        <div className="dt-selection-bar" role="status" aria-live="polite">
          <span className="dt-selection-bar-count">
            {ruleset.rules.filter((r) => r.selected).length}
            {' '}
            {ruleset.rules.filter((r) => r.selected).length === 1 ? 'row' : 'rows'} selected
          </span>
          <button
            type="button"
            className="dt-selection-bar-action"
            onClick={() => toggleAll(false)}
          >
            Unselect all
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}
