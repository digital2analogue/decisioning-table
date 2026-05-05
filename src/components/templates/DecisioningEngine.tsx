import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, PencilIcon, CheckIcon, PlayIcon, PlusIcon } from 'lucide-react'
import type { Rule, Ruleset, ModelConfig } from '../../types'
import { initialRulesets } from '../../data'
import { DecisioningTable } from '../organisms/DecisioningTable'
import { RulesetTabs } from '../organisms/RulesetTabs'
import { ValidationBanner } from '../molecules/ValidationBanner'

interface DecisioningEngineProps {
  modelConfig?: ModelConfig | null
}

export function DecisioningEngine({ modelConfig }: DecisioningEngineProps) {
  const [rulesets, setRulesets] = useState<Ruleset[]>(initialRulesets)
  const [activeRulesetId, setActiveRulesetId] = useState(initialRulesets[0].id)
  // ID of the most recently added rule — RuleRow uses this to autofocus its
  // name input on mount so the user can immediately start typing.
  const [autoFocusRuleId, setAutoFocusRuleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [chevronOpen, setChevronOpen] = useState(false)
  const defaultTitle = modelConfig?.modelName ?? 'My Decision Model'
  const [titleDraft, setTitleDraft] = useState(defaultTitle)
  const [title, setTitle] = useState(defaultTitle)
  const [editingDesc, setEditingDesc] = useState(false)
  const defaultDesc = modelConfig?.modelDescription ?? ''
  const [descDraft, setDescDraft] = useState(defaultDesc)
  const [desc, setDesc] = useState(defaultDesc)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLInputElement>(null)

  const activeRuleset = rulesets.find((rs) => rs.id === activeRulesetId)!

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus()
  }, [editingTitle])

  useEffect(() => {
    if (editingDesc) descInputRef.current?.focus()
  }, [editingDesc])

  function commitDesc() {
    const trimmed = descDraft.trim()
    setDesc(trimmed)
    setEditingDesc(false)
  }

  function commitTitle() {
    const trimmed = titleDraft.trim()
    if (trimmed) setTitle(trimmed)
    setEditingTitle(false)
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
    }
    updateRuleset({ ...rs, rules: [...rs.rules, newRule] })
    setAutoFocusRuleId(newRule.id)
  }

  return (
    <div className="dt-page min-h-screen flex flex-col">
      {/* Header */}
      <div className="dt-page-header px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 group/title">
            {editingTitle ? (
              <div className="flex items-center gap-2">
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
                  style={{ font: 'var(--font-title-small)' }}
                />
                <button onMouseDown={(e) => e.preventDefault()} onClick={commitTitle} className="dt-confirm-btn" title="Save">
                  <CheckIcon size={14} />
                </button>
              </div>
            ) : (
              <>
                <h1 className="dt-page-title">{title}</h1>
                <button
                  onClick={() => { setTitleDraft(title); setEditingTitle(true) }}
                  className="dt-icon-btn dt-icon-reveal dt-edit-cta"
                  title="Rename"
                >
                  <PencilIcon size={12} />
                  Edit
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 group/desc">
            {editingDesc ? (
              <div className="flex items-center gap-2">
                <input
                  ref={descInputRef}
                  type="text"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={commitDesc}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitDesc()
                    if (e.key === 'Escape') { setDescDraft(desc); setEditingDesc(false) }
                  }}
                  className="dt-page-subtitle-input"
                  placeholder="Add a description…"
                />
                <button onMouseDown={(e) => e.preventDefault()} onClick={commitDesc} className="dt-confirm-btn" title="Save">
                  <CheckIcon size={14} />
                </button>
              </div>
            ) : (
              <>
                <p
                  className={`dt-page-subtitle${!desc ? ' dt-page-subtitle--empty' : ''}`}
                  onClick={() => { setDescDraft(desc); setEditingDesc(true) }}
                >
                  {desc || 'Add a description…'}
                </p>
                <button
                  onClick={() => { setDescDraft(desc); setEditingDesc(true) }}
                  className="dt-icon-btn dt-icon-reveal dt-edit-cta"
                  title="Edit description"
                >
                  <PencilIcon size={12} />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="dt-test-model-btn">
            <PlayIcon size={14} />
            Test model
          </button>
          <span className="dt-header-divider" aria-hidden="true" />
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
      {activeRuleset && <ValidationBanner ruleset={activeRuleset} />}

      {/* Table area — edge-to-edge */}
      <div className="flex-1">
        {activeRuleset && (
          <DecisioningTable
            ruleset={activeRuleset}
            onUpdate={updateRuleset}
            onAddRule={addRule}
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
      />
    </div>
  )
}
