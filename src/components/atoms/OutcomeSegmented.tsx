import { CheckIcon, XIcon } from 'lucide-react'
import type { Outcome } from '../../types'

/**
 * A SEGMENTED CONTROL — not a badge.
 *
 * Both choices are visible at rest and exactly one is checked, so this is a
 * field, not a status readout: `role="radiogroup"` with `role="radio"` children.
 * The sliding indicator carries the fill, border and shadow; the buttons carry
 * only semantic text colour, which is what stops it reading as two adjacent
 * buttons. See #84, and parsimony#232 for the upstream promotion.
 */

export interface OutcomeSegmentedProps {
  /** null renders as a no-selection state where neither segment is active. */
  value: Outcome | null
  onChange: (v: Outcome) => void
}

export function OutcomeSegmented({ value, onChange }: OutcomeSegmentedProps) {
  return (
    <div className="dt-outcome-seg" role="radiogroup" aria-label="Outcome">
      {value !== null && (
        <span
          className={`dt-outcome-seg-indicator${value === 'Deny' ? ' dt-outcome-seg-indicator-right' : ''}`}
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'Approve'}
        onClick={() => onChange('Approve')}
        className={`dt-outcome-seg-btn${value === 'Approve' ? ' dt-outcome-seg-approve' : ''}`}
      >
        <CheckIcon size={12} className="dt-outcome-seg-icon" aria-hidden="true" />
        <span>Approve</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'Deny'}
        onClick={() => onChange('Deny')}
        className={`dt-outcome-seg-btn${value === 'Deny' ? ' dt-outcome-seg-deny' : ''}`}
      >
        <XIcon size={12} className="dt-outcome-seg-icon" aria-hidden="true" />
        <span>Deny</span>
      </button>
    </div>
  )
}
