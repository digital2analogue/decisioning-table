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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--dt-color-bg-canvas)' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'var(--dt-color-bg-surface)',
          borderBottom: 'var(--dt-border-width) solid var(--dt-color-border-default)',
        }}
      >
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--dt-color-text-primary)', fontFamily: 'var(--dt-font-mono)' }}
          >
            Decisioning Engine
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--dt-color-text-secondary)' }}
          >
            Configure rules to automate approval decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            style={{
              background: 'var(--dt-color-success-muted)',
              color: 'var(--dt-color-success-text)',
              borderColor: 'var(--dt-color-success-default)',
              fontFamily: 'var(--dt-font-mono)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--dt-color-success-default)' }}
            />
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
