import { CheckIcon, XIcon } from 'lucide-react'
import type { DataAttribute, Outcome } from '../../types'

export interface AttributeBadgeProps {
  value: DataAttribute
}

function badgeVariant(value: DataAttribute): string {
  switch (value) {
    case 'Income':
      return 'dt-badge-income'
    case 'Expense':
      return 'dt-badge-expense'
    case 'Asset':
      return 'dt-badge-asset'
    case 'Liability':
      return 'dt-badge-liability'
  }
}

export function AttributeBadge({ value }: AttributeBadgeProps) {
  return (
    <span className={`dt-badge ${badgeVariant(value)}`}>
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
