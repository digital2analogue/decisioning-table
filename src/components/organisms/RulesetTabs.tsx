import { PlusIcon } from 'lucide-react'
import type { Ruleset } from '../../types'
import { TabItem } from '../molecules/TabItem'

export interface RulesetTabsProps {
  rulesets: Ruleset[]
  activeRulesetId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRename: (id: string, name: string) => void
}

export function RulesetTabs({ rulesets, activeRulesetId, onSelect, onAdd, onRename }: RulesetTabsProps) {
  return (
    <div className="dt-tabs-bar px-2 flex items-center gap-0 overflow-x-auto">
      <button onClick={onAdd} className="dt-add-ruleset-btn">
        <PlusIcon size={14} />
      </button>
      {rulesets.map((rs) => (
        <TabItem
          key={rs.id}
          id={rs.id}
          name={rs.name}
          isActive={rs.id === activeRulesetId}
          onClick={onSelect}
          onRename={onRename}
        />
      ))}
    </div>
  )
}
