import { CheckIcon, XIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { DataAttribute, Outcome } from '../../types'

export interface AttributeBadgeProps {
  value: DataAttribute
}

export function AttributeBadge({ value }: AttributeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        value === 'Income'
          ? 'bg-[var(--dt-color-success-muted)] text-[var(--dt-color-success-text)] border border-[var(--dt-color-success-default)]'
          : 'bg-[var(--dt-color-danger-muted)] text-[var(--dt-color-danger-text)] border border-[var(--dt-color-danger-default)]',
      )}
    >
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
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
        value === 'Approve'
          ? 'bg-[var(--dt-color-success-muted)] text-[var(--dt-color-success-text)] border-[var(--dt-color-success-default)] hover:bg-[var(--dt-color-success-subtle)]'
          : 'bg-[var(--dt-color-danger-muted)] text-[var(--dt-color-danger-text)] border-[var(--dt-color-danger-default)] hover:bg-[var(--dt-color-danger-subtle)]',
      )}
    >
      {value === 'Approve' ? <CheckIcon size={11} /> : <XIcon size={11} />}
      {value}
    </button>
  )
}
