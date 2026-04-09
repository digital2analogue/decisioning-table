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
        className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 pr-6 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 hover:border-slate-300 transition-colors"
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
        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  )
}
