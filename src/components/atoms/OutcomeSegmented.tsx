import type { KeyboardEvent } from 'react'
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
 *
 * Keyboard follows the WAI-ARIA radio group pattern: one tab stop for the whole
 * group via roving tabindex, arrows both move and select.
 */

export interface OutcomeSegmentedProps {
  /** null renders as a no-selection state where neither segment is active. */
  value: Outcome | null
  onChange: (v: Outcome) => void
}

const SEGMENTS: Outcome[] = ['Approve', 'Deny']

export function OutcomeSegmented({ value, onChange }: OutcomeSegmentedProps) {
  // Arrows move and select. With nothing chosen yet there is no "current", so
  // either arrow key commits the first segment rather than doing nothing.
  const step = (from: Outcome | null, delta: number) => {
    if (from === null) return SEGMENTS[0]
    const next = (SEGMENTS.indexOf(from) + delta + SEGMENTS.length) % SEGMENTS.length
    return SEGMENTS[next]
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (delta === 0) return
    e.preventDefault()
    const next = step(value, delta)
    onChange(next)
    // Selection follows focus, so move focus to the segment we just checked.
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-outcome="${next}"]`)?.focus()
  }

  // Roving tabindex: the group is a single tab stop. With no selection the
  // first segment is the entry point, so the group never falls out of the tab
  // order entirely.
  const tabIndexFor = (outcome: Outcome) =>
    value === outcome || (value === null && outcome === SEGMENTS[0]) ? 0 : -1

  return (
    <div className="dt-outcome-seg" role="radiogroup" aria-label="Outcome" onKeyDown={onKeyDown}>
      {value !== null && (
        <span
          className={`dt-outcome-seg-indicator${value === 'Deny' ? ' dt-outcome-seg-indicator-right' : ''}`}
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        role="radio"
        data-outcome="Approve"
        tabIndex={tabIndexFor('Approve')}
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
        data-outcome="Deny"
        tabIndex={tabIndexFor('Deny')}
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
