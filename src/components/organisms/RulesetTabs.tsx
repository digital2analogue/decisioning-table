import { PlusIcon } from 'lucide-react'
import type { Ruleset } from '../../types'
import { TabItem } from '../molecules/TabItem'

export interface RulesetTabsProps {
  rulesets: Ruleset[]
  activeRulesetId: string
  onSelect: (id: string) => void
  onAdd: () => void
}

export function RulesetTabs({ rulesets, activeRulesetId, onSelect, onAdd }: RulesetTabsProps) {
  return (
    <div className="bg-white border-t border-slate-200 px-6 py-0 flex items-center gap-1 overflow-x-auto">
      {rulesets.map((rs) => (
        <TabItem
          key={rs.id}
          id={rs.id}
          name={rs.name}
          isActive={rs.id === activeRulesetId}
          onClick={onSelect}
        />
      ))}
      <button
        onClick={onAdd}
        className="px-3 py-3 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm"
      >
        <PlusIcon size={14} />
        Add Ruleset
      </button>
    </div>
  )
}
