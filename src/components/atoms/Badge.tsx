import { CheckIcon, XIcon } from 'lucide-react'
import type { DataAttribute, Outcome } from '../../types'

export interface AttributeBadgeProps {
  value: DataAttribute
}

export function AttributeBadge({ value }: AttributeBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px var(--space-sm)',
        borderRadius: '9999px',
        fontFamily: 'var(--font-label-small-family)',
        fontSize: 'var(--font-label-small-size)',
        lineHeight: 'var(--font-label-small-line-height)',
        border: '1px solid',
        color: value === 'Income' ? 'var(--color-foreground-accent)' : 'var(--color-foreground-danger)',
        borderColor: value === 'Income' ? 'var(--color-border-accent)' : 'var(--color-foreground-danger)',
        backgroundColor: value === 'Income'
          ? 'var(--color-background-accent-subtle)'
          : 'var(--color-background-danger-subtle)',
      }}
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
  const isApprove = value === 'Approve'
  return (
    <button
      onClick={() => onChange(isApprove ? 'Deny' : 'Approve')}
      title="Click to toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px var(--space-sm)',
        borderRadius: '9999px',
        fontFamily: 'var(--font-label-small-family)',
        fontSize: 'var(--font-label-small-size)',
        lineHeight: 'var(--font-label-small-line-height)',
        fontWeight: 600,
        border: '1px solid',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        color: isApprove ? 'var(--color-foreground-accent)' : 'var(--color-foreground-danger)',
        borderColor: isApprove ? 'var(--color-border-accent)' : 'var(--color-foreground-danger)',
        backgroundColor: isApprove
          ? 'var(--color-background-accent-subtle)'
          : 'var(--color-background-danger-subtle)',
      }}
    >
      {isApprove ? <CheckIcon size={11} /> : <XIcon size={11} />}
      {value}
    </button>
  )
}
