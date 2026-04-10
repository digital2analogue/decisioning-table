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
    <div className="dt-tabs-bar px-6 flex items-center gap-1 overflow-x-auto">
      {rulesets.map((rs) => (
        <TabItem
          key={rs.id}
          id={rs.id}
          name={rs.name}
          isActive={rs.id === activeRulesetId}
          onClick={onSelect}
        />
      ))}
      <button onClick={onAdd} className="dt-add-ruleset-btn">
        <PlusIcon size={14} />
        Add Ruleset
      </button>
    </div>
  )
}
