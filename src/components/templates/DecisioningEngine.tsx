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
      style={{ backgroundColor: 'var(--color-background-default)' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--color-background-alt)',
          borderBottom: '1px solid var(--color-border-muted)',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-title-small-family)',
              fontSize: 'var(--font-title-small-size)',
              lineHeight: 'var(--font-title-small-line-height)',
              fontWeight: 'var(--font-title-small-weight)',
              color: 'var(--color-foreground-primary)',
              margin: 0,
            }}
          >
            Decisioning Engine
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body-medium-family)',
              fontSize: 'var(--font-body-medium-size)',
              lineHeight: 'var(--font-body-medium-line-height)',
              color: 'var(--color-foreground-muted)',
              margin: '2px 0 0 0',
            }}
          >
            Configure rules to automate approval decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full"
            style={{
              padding: '4px 10px',
              fontFamily: 'var(--font-label-small-family)',
              fontSize: 'var(--font-label-small-size)',
              fontWeight: 500,
              color: 'var(--color-foreground-accent)',
              backgroundColor: 'var(--color-background-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-foreground-accent)',
                display: 'inline-block',
              }}
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
