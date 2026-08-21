import { useState } from 'react'
import { cn } from '../../lib/utils'

export interface AmountCellProps {
  /** null renders the input empty. */
  value: number | null
  onChange: (next: number | null) => void
  error?: boolean
  /** Accessible label for the input. Defaults to "Amount". Override when used in
   *  a context that provides more specificity, e.g. "Minimum amount" or "Amount (USD)". */
  ariaLabel?: string
}

export function AmountCell({ value, onChange, error, ariaLabel }: AmountCellProps) {
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
        aria-label={ariaLabel ?? 'Amount'}
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
