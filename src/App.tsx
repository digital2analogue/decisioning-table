import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DecisioningTable } from './components/DecisioningTable'
import { initialRulesets } from './data'
import type { Ruleset } from './types'
import { PlusIcon } from 'lucide-react'

export default function App() {
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col app-shell">
        {/* Header */}
        <div className="app-header flex items-center justify-between">
          <div>
            <h1 className="app-title">Decisioning Engine</h1>
            <p className="app-subtitle">Configure rules to automate approval decisions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge">
              <span className="status-dot" />
              Active
            </span>
          </div>
        </div>

        {/* Table area */}
        <div className="table-area flex-1">
          {activeRuleset && (
            <DecisioningTable ruleset={activeRuleset} onUpdate={updateRuleset} />
          )}
        </div>

        {/* Ruleset Tabs at bottom */}
        <div className="app-tabs flex items-center gap-1">
          {rulesets.map((rs) => (
            <button
              key={rs.id}
              onClick={() => setActiveRulesetId(rs.id)}
              className={`tab-btn${rs.id === activeRulesetId ? ' tab-btn--active' : ''}`}
            >
              {rs.name}
            </button>
          ))}
          <button onClick={addRuleset} className="tab-add-btn">
            <PlusIcon size={14} />
            Add Ruleset
          </button>
        </div>
      </div>
    </DndProvider>
  )
}
