import { ChevronDownIcon } from 'lucide-react'
import type { Operator } from '../../types'

export interface OperatorSelectProps {
  value: Operator
  onChange: (v: Operator) => void
}

const operators: Operator[] = ['>', '>=', '<', '<=', '=']

const labels: Record<Operator, string> = {
  '>': '> Greater than',
  '>=': '≥ At least',
  '<': '< Less than',
  '<=': '≤ At most',
  '=': '= Equals',
}

const display: Record<Operator, string> = {
  '>': '>',
  '>=': '≥',
  '<': '<',
  '<=': '≤',
  '=': '=',
}

export function OperatorSelect({ value, onChange }: OperatorSelectProps) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Operator)}
        title={labels[value]}
        style={{
          appearance: 'none',
          backgroundColor: 'var(--color-background-default)',
          border: '1px solid var(--color-border-muted)',
          borderRadius: '6px',
          padding: '4px 24px 4px var(--space-sm)',
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-label-small-size)',
          color: 'var(--color-foreground-secondary)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-foreground-accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-muted)' }}
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {display[op]}{' '}
            {op === '>=' ? 'At least' : op === '<=' ? 'At most' : op === '>' ? 'Greater' : op === '<' ? 'Less' : 'Equals'}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={12}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-foreground-muted)' }}
      />
    </div>
  )
}
