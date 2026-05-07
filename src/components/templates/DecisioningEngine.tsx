import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, PlusIcon, UserPlusIcon } from 'lucide-react'
import { AppIcon } from '../atoms/AppIcon'
import { AvatarStack } from '../atoms/AvatarStack'
import type { Rule, Ruleset, ModelConfig } from '../../types'
import { isRuleValid, isRuleTouched } from '../../types'
import { initialRulesets as defaultRulesets } from '../../data'
import { DecisioningTable } from '../organisms/DecisioningTable'
import { RulesetTabs } from '../organisms/RulesetTabs'
import { ValidationBanner } from '../molecules/ValidationBanner'
import { RuleSearch } from '../molecules/RuleSearch'

interface DecisioningEngineProps {
  modelConfig?: ModelConfig | null
  initialRulesets?: Ruleset[]
}

export function DecisioningEngine({ modelConfig, initialRulesets }: DecisioningEngineProps) {
  const rulesetSeed = initialRulesets ?? defaultRulesets
  const [rulesets, setRulesets] = useState<Ruleset[]>(rulesetSeed)
  const [activeRulesetId, setActiveRulesetId] = useState(rulesetSeed[0].id)
  // ID of the most recently added rule — RuleRow uses this to autofocus its
  // name input on mount so the user can immediately start typing.
  const [autoFocusRuleId, setAutoFocusRuleId] = useState<string | null>(null)
  const [ruleNameQuery, setRuleNameQuery] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [chevronOpen, setChevronOpen] = useState(false)
  const defaultTitle = modelConfig?.modelName ?? 'My Decision Model'
  const [titleDraft, setTitleDraft] = useState(defaultTitle)
  const [title, setTitle] = useState(defaultTitle)
  const defaultDesc = 'Automated credit approval policy for consumer loans — evaluates income, account history, and risk indicators across all applicant segments.'
  const [descDraft, setDescDraft] = useState(defaultDesc)
  const [desc, setDesc] = useState(defaultDesc)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLTextAreaElement>(null)

  const activeRuleset = rulesets.find((rs) => rs.id === activeRulesetId)!

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus()
  }, [editingTitle])

  useEffect(() => {
    if (editingDesc) descInputRef.current?.focus()
  }, [editingDesc])

  function commitTitle() {
    const trimmed = titleDraft.trim()
    if (trimmed) setTitle(trimmed)
    setEditingTitle(false)
  }

  function commitDesc() {
    setDesc(descDraft.trim())
    setEditingDesc(false)
  }

  function selectInvalidRules() {
    const rs = rulesets.find((r) => r.id === activeRulesetId)
    if (!rs) return
    const updatedRules = rs.rules.map((rule) =>
      isRuleTouched(rule) && !isRuleValid(rule) ? { ...rule, selected: true } : rule,
    )
    updateRuleset({ ...rs, rules: updatedRules })
  }

  function updateRuleset(updated: Ruleset) {
    setRulesets((prev) => prev.map((rs) => (rs.id === updated.id ? updated : rs)))
  }

  function addRuleset() {
    const id = `rs-${Date.now()}`
    const newRuleset: Ruleset = {
      id,
      name: `Ruleset ${rulesets.length + 1}`,
      rules: [],
    }
    setRulesets((prev) => [...prev, newRuleset])
    setActiveRulesetId(id)
  }

  function duplicateRuleset(id: string) {
    const source = rulesets.find((rs) => rs.id === id)
    if (!source) return
    const newId = `rs-${Date.now()}`
    const dup: Ruleset = {
      id: newId,
      name: `${source.name} (copy)`,
      rules: source.rules.map((r) => ({
        ...r,
        id: `${r.id}-d${Date.now()}`,
        children: r.children?.map((c, i) => ({ ...c, id: `${c.id}-d${i}` })),
      })),
    }
    const idx = rulesets.findIndex((rs) => rs.id === id)
    setRulesets((prev) => {
      const next = [...prev]
      next.splice(idx + 1, 0, dup)
      return next
    })
    setActiveRulesetId(newId)
  }

  function deleteRuleset(id: string) {
    const idx = rulesets.findIndex((rs) => rs.id === id)
    if (idx === -1 || rulesets.length <= 1) return
    const next = rulesets.filter((rs) => rs.id !== id)
    setRulesets(next)
    if (activeRulesetId === id) {
      setActiveRulesetId(next[Math.min(idx, next.length - 1)].id)
    }
  }

  function addRule() {
    const rs = rulesets.find(r => r.id === activeRulesetId)
    if (!rs) return
    // Empty draft rule: every required field starts null/empty.
    // The user must fill each cell before the rule is considered valid.
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      selected: false,
      ruleName: '',
      dataAttribute: null,
      operator: null,
      amount: null,
      outcome: null,
      existingAccountOperator: null,
      existingAccountVariable: '',
      annualIncomeOperator: null,
      annualIncomeVariable: '',
      creditScoreOperator: null,
      creditScoreVariable: '',
    }
    updateRuleset({ ...rs, rules: [...rs.rules, newRule] })
    setAutoFocusRuleId(newRule.id)
  }

  function addChild(parentId: string) {
    const rs = rulesets.find(r => r.id === activeRulesetId)
    if (!rs) return
    const parent = rs.rules.find(r => r.id === parentId)
    if (!parent) return
    // Empty draft child rule. logicOperator defaults to AND.
    const newChild: Rule = {
      id: `rule-${Date.now()}`,
      selected: false,
      ruleName: '',
      dataAttribute: null,
      operator: null,
      amount: null,
      outcome: null,
      existingAccountOperator: null,
      existingAccountVariable: '',
      annualIncomeOperator: null,
      annualIncomeVariable: '',
      creditScoreOperator: null,
      creditScoreVariable: '',
      logicOperator: 'AND',
    }
    const updatedParent: Rule = { ...parent, children: [...(parent.children ?? []), newChild] }
    updateRuleset({
      ...rs,
      rules: rs.rules.map(r => (r.id === parentId ? updatedParent : r)),
    })
    setAutoFocusRuleId(newChild.id)
  }

  return (
    <div className="dt-page h-screen flex flex-col">
      {/* Header */}
      <div className="dt-page-header pl-4 pr-6 pt-6 pb-5 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <AppIcon />
          <div>
            <div className="dt-page-title-row">
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTitle()
                    if (e.key === 'Escape') { setTitleDraft(title); setEditingTitle(false) }
                  }}
                  className="dt-toolbar-name-input"
                />
              ) : (
                <div
                  className="dt-editable-label"
                  onClick={() => { setTitleDraft(title); setEditingTitle(true) }}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setTitleDraft(title); setEditingTitle(true) } }}
                  title="Click to rename"
                >
                  <h1 className="dt-page-title">{title}</h1>
                </div>
              )}
              <span className="dt-status-active" aria-label="Status: Active">
                <span className="dt-status-ping-wrap" aria-hidden="true">
                  <span className="dt-status-ping" />
                  <span className="dt-status-dot" />
                </span>
                Active
              </span>
            </div>
            <div className="dt-desc-area">
              {editingDesc ? (
                <textarea
                  ref={descInputRef}
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={commitDesc}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitDesc() }
                    if (e.key === 'Escape') { e.preventDefault(); setDescDraft(desc); setEditingDesc(false) }
                  }}
                  placeholder={`${rulesets.reduce((n, rs) => n + rs.rules.length, 0)} rules across ${rulesets.length} rulesets`}
                  className="dt-desc-textarea"
                  rows={2}
                />
              ) : (
                <p
                  className="dt-page-meta dt-editable-meta"
                  onClick={() => { setDescDraft(desc); setEditingDesc(true) }}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setDescDraft(desc); setEditingDesc(true) } }}
                  title={desc || `${rulesets.reduce((n, rs) => n + rs.rules.length, 0)} rules across ${rulesets.length} rulesets`}
                >
                  {desc || `${rulesets.reduce((n, rs) => n + rs.rules.length, 0)} rules across ${rulesets.length} rulesets`}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-center">
          <RuleSearch value={ruleNameQuery} onChange={setRuleNameQuery} />
          <div className="w-4 shrink-0" />
          <AvatarStack />
          <button type="button" className="dt-outline-btn">
            <UserPlusIcon size={14} />
            Share
          </button>
          <div className="dt-split-btn">
            <button onClick={addRule} className="dt-split-btn-main" type="button">
              <PlusIcon size={14} />
              Add rule
            </button>
            <button
              type="button"
              className="dt-split-btn-chevron"
              onClick={() => setChevronOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={chevronOpen}
              aria-label="More add options"
            >
              <ChevronDownIcon size={14} />
            </button>
            {chevronOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setChevronOpen(false)} />
                <div className="dt-split-btn-menu" role="menu">
                  <button type="button" role="menuitem" className="dt-split-btn-menu-item" onClick={() => { addRule(); setChevronOpen(false) }}>
                    Add rule
                  </button>
                  <hr className="dt-split-btn-menu-divider" />
                  <button type="button" role="menuitem" className="dt-split-btn-menu-item" onClick={() => setChevronOpen(false)}>
                    Add existing rule
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Validation banner — surfaces incomplete rules in the active ruleset */}
      {activeRuleset && <ValidationBanner ruleset={activeRuleset} onSelectInvalid={selectInvalidRules} />}

      {/* Table area — fills remaining viewport height; overflow handled inside dt-table-edge */}
      <div key={activeRulesetId} className="dt-tab-content flex-1 min-h-0 overflow-hidden">
        {activeRuleset && (
          <DecisioningTable
            ruleset={activeRuleset}
            onUpdate={updateRuleset}
            onAddRule={addRule}
            onAddChild={addChild}
            ruleNameQuery={ruleNameQuery}
            autoFocusRuleId={autoFocusRuleId}
            onAutoFocusConsumed={() => setAutoFocusRuleId(null)}
          />
        )}
      </div>

      {/* Ruleset Tabs */}
      <RulesetTabs
        rulesets={rulesets}
        activeRulesetId={activeRulesetId}
        onSelect={setActiveRulesetId}
        onAdd={addRuleset}
        onRename={(id, name) => {
          setRulesets((prev) => prev.map((rs) => rs.id === id ? { ...rs, name } : rs))
        }}
        onDuplicate={duplicateRuleset}
        onDelete={deleteRuleset}
        onExport={(id) => console.log('Export ruleset', id)}
      />
    </div>
  )
}
