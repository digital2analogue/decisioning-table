import { useState } from 'react'
import type { Ruleset } from '../../types'
import { initialRulesets } from '../../data'
import { DecisioningTable } from '../organisms/DecisioningTable'
import { RulesetTabs } from '../organisms/RulesetTabs'

export function DecisioningEngine() {
  const [rulesets, setRulesets] = useState<Ruleset[]>(initialRulesets)
  const [activeRulesetId, setActiveRulesetId] = useState(initialRulesets[0].id)

  const activeRuleset = rulesets.find((rs) => rs.id === activeRulesetId)!

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

  return (
    <div className="dt-page min-h-screen flex flex-col">
      {/* Header */}
      <div className="dt-page-header px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="dt-page-title">Decisioning Engine</h1>
          <p className="dt-page-subtitle">Configure rules to automate approval decisions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="dt-status-badge">
            <span className="dt-status-dot" />
            Active
          </span>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 p-6 pb-2">
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
      />
    </div>
  )
}
