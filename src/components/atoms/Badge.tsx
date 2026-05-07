import { CheckIcon, XIcon, ChevronDownIcon } from 'lucide-react'
import type { DataAttribute, Outcome } from '../../types'
import { Picker, type PickerOption } from './Picker'

// ─── AttributeSelectBadge ────────────────────────────────────────────────────

const ATTRIBUTE_OPTIONS: PickerOption<DataAttribute>[] = [
  { value: 'Income', label: 'Income', leadingDotClass: 'dt-attr-dot-income' },
  { value: 'Expense', label: 'Expense', leadingDotClass: 'dt-attr-dot-expense' },
  { value: 'Asset', label: 'Asset', leadingDotClass: 'dt-attr-dot-asset' },
  { value: 'Liability', label: 'Liability', leadingDotClass: 'dt-attr-dot-liability' },
]

export interface AttributeSelectBadgeProps {
  value: DataAttribute | null
  onChange: (v: DataAttribute) => void
  error?: boolean
}

export function AttributeSelectBadge({ value, onChange, error }: AttributeSelectBadgeProps) {
  return (
    <Picker<DataAttribute>
      value={value}
      onChange={onChange}
      options={ATTRIBUTE_OPTIONS}
      placeholder="Select attribute"
      triggerVariant="badge"
      ariaLabel="Data attribute"
      error={error}
      renderTrigger={({ label }) => (
        <>
          {label}
          <ChevronDownIcon size={12} className="dt-select-chevron" />
        </>
      )}
    />
  )
}

// ─── OutcomeBadge ────────────────────────────────────────────────────────────

export interface OutcomeBadgeProps {
  /** null renders as a no-selection state where neither segment is active. */
  value: Outcome | null
  onChange: (v: Outcome) => void
}

export function OutcomeBadge({ value, onChange }: OutcomeBadgeProps) {
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
