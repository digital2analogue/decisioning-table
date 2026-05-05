import { useState } from 'react'
import { cn } from '../../lib/utils'

export interface AmountCellProps {
  /** null renders the input empty (placeholder only). */
  value: number | null
  onChange: (next: number | null) => void
  error?: boolean
}

export function AmountCell({ value, onChange, error }: AmountCellProps) {
  const [focused, setFocused] = useState(false)
  // Display formatting: empty string when null, raw number when focused, locale string when blurred.
  const displayValue =
    value === null ? '' : focused ? String(value) : value.toLocaleString()

  return (
    <div className={cn('dt-amount-cell', error && 'dt-cell-error')}>
      <span className="dt-amount-prefix" aria-hidden="true">$</span>
      <input
        type={focused ? 'number' : 'text'}
        value={displayValue}
        placeholder="Amount"
        onChange={(e) => {
          const raw = e.target.value.replace(/,/g, '').trim()
          onChange(raw === '' ? null : Number(raw))
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={error || undefined}
        className="dt-amount-input"
      />
    </div>
  )
}
