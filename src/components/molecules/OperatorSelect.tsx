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
        className="dt-operator-select"
        title={labels[value]}
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
        className="dt-select-chevron absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  )
}
