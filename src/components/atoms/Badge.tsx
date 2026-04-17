import { CheckIcon, XIcon } from 'lucide-react'
import type { DataAttribute, Outcome } from '../../types'
import { Pill } from './Pill'
import type { PillTone, PillVariant } from './Pill'

export interface AttributeBadgeProps {
  value: DataAttribute
}

const ATTRIBUTE_STYLE: Record<DataAttribute, { tone: PillTone; variant: PillVariant }> = {
  Income: { tone: 'blue', variant: 'soft' },
  Expense: { tone: 'red', variant: 'soft' },
  Asset: { tone: 'neutral', variant: 'soft' },
  Liability: { tone: 'blue', variant: 'outline-dashed' },
}

export function AttributeBadge({ value }: AttributeBadgeProps) {
  const { tone, variant } = ATTRIBUTE_STYLE[value]
  return (
    <Pill tone={tone} variant={variant}>
      {value}
    </Pill>
  )
}

export interface OutcomeBadgeProps {
  value: Outcome
  onChange: (v: Outcome) => void
}

export function OutcomeBadge({ value, onChange }: OutcomeBadgeProps) {
  const isApprove = value === 'Approve'
  return (
    <Pill
      tone={isApprove ? 'green' : 'muted'}
      leading={isApprove ? <CheckIcon size={11} /> : <XIcon size={11} />}
      onClick={() => onChange(isApprove ? 'Deny' : 'Approve')}
      title="Click to toggle"
    >
      {value}
    </Pill>
  )
}
