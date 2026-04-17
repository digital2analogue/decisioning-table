import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, PencilIcon, CheckIcon, FlaskConicalIcon, PlusIcon } from 'lucide-react'
import type { Rule, Ruleset } from '../../types'
import { initialRulesets } from '../../data'
import { DecisioningTable } from '../organisms/DecisioningTable'
import { RulesetTabs } from '../organisms/RulesetTabs'

export function DecisioningEngine() {
  const [rulesets, setRulesets] = useState<Ruleset[]>(initialRulesets)
  const [activeRulesetId, setActiveRulesetId] = useState(initialRulesets[0].id)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('My Decision Model')
  const [title, setTitle] = useState('My Decision Model')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const activeRuleset = rulesets.find((rs) => rs.id === activeRulesetId)!

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus()
  }, [editingTitle])

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

  function addRuleToActive() {
    const rs = rulesets.find((r) => r.id === activeRulesetId)
    if (!rs) return
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      selected: false,
      ruleName: `Line of credit ${rs.rules.length + 1}`,
      dataAttribute: 'Income',
      operator: '>',
      amount: 0,
      outcome: 'Approve',
      status: 'draft',
    }
    updateRuleset({ ...rs, rules: [...rs.rules, newRule] })
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
                  className="dt-icon-btn dt-icon-reveal"
                  title="Rename"
                >
                  <PencilIcon size={14} />
                </button>
              </>
            )}
          </div>
          <p className="dt-page-subtitle">Add a description</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="dt-test-model-btn">
            <FlaskConicalIcon size={14} />
            Test model
          </button>
          <div className="dt-split-btn">
            <button onClick={addRuleToActive} className="dt-split-btn-main">
              <PlusIcon size={14} />
              Add rule
            </button>
            <button className="dt-split-btn-chevron">
              <ChevronDownIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Table area — edge-to-edge */}
      <div className="flex-1">
        {activeRuleset && (
          <DecisioningTable ruleset={activeRuleset} onUpdate={updateRuleset} />
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
