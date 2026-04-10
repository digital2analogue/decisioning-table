import { CheckIcon, XIcon } from 'lucide-react'
import type { DataAttribute, Outcome } from '../../types'

export interface AttributeBadgeProps {
  value: DataAttribute
}

export function AttributeBadge({ value }: AttributeBadgeProps) {
  return (
    <span className={`dt-badge ${value === 'Income' ? 'dt-badge-income' : 'dt-badge-expense'}`}>
      {value}
    </span>
  )
}

export interface OutcomeBadgeProps {
  value: Outcome
  onChange: (v: Outcome) => void
}

export function OutcomeBadge({ value, onChange }: OutcomeBadgeProps) {
  return (
    <button
      onClick={() => onChange(value === 'Approve' ? 'Deny' : 'Approve')}
      title="Click to toggle"
      className={`dt-outcome-badge ${value === 'Approve' ? 'dt-outcome-approve' : 'dt-outcome-deny'}`}
    >
      {value === 'Approve' ? <CheckIcon size={11} /> : <XIcon size={11} />}
      {value}
    </button>
  )
}
