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
    <div
      className="px-6 py-0 flex items-center gap-1 overflow-x-auto"
      style={{ borderTop: '1px solid var(--color-border-muted)', backgroundColor: 'var(--color-background-alt)' }}
    >
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
        className="px-3 py-3 flex items-center gap-1 transition-colors"
        style={{
          fontFamily: 'var(--font-label-medium-family)',
          fontSize: 'var(--font-label-medium-size)',
          color: 'var(--color-foreground-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-foreground-accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-foreground-muted)' }}
      >
        <PlusIcon size={14} />
        Add Ruleset
      </button>
    </div>
  )
}
