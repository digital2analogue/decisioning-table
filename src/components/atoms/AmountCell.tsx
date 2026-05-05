import { useState } from 'react'

export interface AmountCellProps {
  /** null renders the input empty (placeholder only). */
  value: number | null
  onChange: (next: number | null) => void
}

export function AmountCell({ value, onChange }: AmountCellProps) {
  const [focused, setFocused] = useState(false)
  // Display formatting: empty string when null, raw number when focused, locale string when blurred.
  const displayValue =
    value === null ? '' : focused ? String(value) : value.toLocaleString()

  return (
    <div className="flex items-center">
      <span className="dt-amount-prefix">$</span>
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
        className="dt-amount-input"
      />
    </div>
  )
}
