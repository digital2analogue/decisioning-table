import { ChevronDownIcon } from 'lucide-react'
import type { RuleStatus } from '../../types'
import { Pill } from './Pill'
import type { PillTone } from './Pill'

export interface StatusChipProps {
  status: RuleStatus
  onClick: () => void
}

const LABEL: Record<RuleStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  disabled: 'Disabled',
}

const TONE: Record<RuleStatus, PillTone> = {
  active: 'green',
  draft: 'neutral',
  disabled: 'muted',
}

export function StatusChip({ status, onClick }: StatusChipProps) {
  return (
    <Pill
      tone={TONE[status]}
      leading={<span className={`dt-status-dot dt-status-dot-${status}`} aria-hidden />}
      trailing={<ChevronDownIcon size={10} className="dt-status-chevron" aria-hidden />}
      onClick={onClick}
      title={`Status: ${LABEL[status]}`}
      ariaHasPopup="menu"
    >
      {LABEL[status]}
    </Pill>
  )
}
