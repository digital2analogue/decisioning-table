import { useState } from 'react'

export interface AmountCellProps {
  value: number
  onChange: (next: number) => void
}

export function AmountCell({ value, onChange }: AmountCellProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex items-center">
      <span className="dt-amount-prefix">$</span>
      <input
        type={focused ? 'number' : 'text'}
        value={focused ? value : value.toLocaleString()}
        onChange={(e) => onChange(Number(e.target.value.replace(/,/g, '')))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="dt-amount-input"
      />
    </div>
  )
}
