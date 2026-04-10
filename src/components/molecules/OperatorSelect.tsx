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
        className="appearance-none rounded-lg px-2.5 py-1 pr-6 text-sm cursor-pointer focus:outline-none transition-colors"
        style={{
          background: 'var(--dt-color-bg-raised)',
          border: 'var(--dt-border-width) solid var(--dt-color-border-default)',
          color: 'var(--dt-color-text-primary)',
          fontFamily: 'var(--dt-font-mono)',
        }}
        title={labels[value]}
      >
        {operators.map((op) => (
          <option
            key={op}
            value={op}
            style={{ background: 'var(--dt-color-bg-overlay)', color: 'var(--dt-color-text-primary)' }}
          >
            {display[op]}{' '}
            {op === '>=' ? 'At least' : op === '<=' ? 'At most' : op === '>' ? 'Greater' : op === '<' ? 'Less' : 'Equals'}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={12}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--dt-color-text-tertiary)]"
      />
    </div>
  )
}
