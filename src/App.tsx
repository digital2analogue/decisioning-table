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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Decisioning Engine</h1>
            <p className="text-sm text-slate-500 mt-0.5">Configure rules to automate approval decisions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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

        {/* Ruleset Tabs at bottom */}
        <div className="bg-white border-t border-slate-200 px-6 py-0 flex items-center gap-1 overflow-x-auto">
          {rulesets.map((rs) => (
            <button
              key={rs.id}
              onClick={() => setActiveRulesetId(rs.id)}
              className={`px-4 py-3 text-sm font-medium border-t-2 whitespace-nowrap transition-colors ${
                rs.id === activeRulesetId
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {rs.name}
            </button>
          ))}
          <button
            onClick={addRuleset}
            className="px-3 py-3 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm"
          >
            <PlusIcon size={14} />
            Add Ruleset
          </button>
        </div>
      </div>
    </DndProvider>
  )
}
