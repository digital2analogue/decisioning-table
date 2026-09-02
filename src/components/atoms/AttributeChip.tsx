import { ChevronDownIcon } from 'lucide-react'
import type { DataAttribute } from '../../types'
import { Picker, type PickerOption } from './Picker'

/**
 * A CHIP that triggers a listbox — not a badge.
 *
 * It names a thing (the rule's data attribute) and opens a panel that writes a
 * value back into the rule, so it is input, not output. A badge reports state
 * the system decided and cannot be clicked; anything taking an `onChange` is a
 * chip. See #84.
 */

const ATTRIBUTE_OPTIONS: PickerOption<DataAttribute>[] = [
  { value: 'Income', label: 'Income', leadingDotClass: 'dt-attr-dot-income' },
  { value: 'Expense', label: 'Expense', leadingDotClass: 'dt-attr-dot-expense' },
  { value: 'Asset', label: 'Asset', leadingDotClass: 'dt-attr-dot-asset' },
  { value: 'Liability', label: 'Liability', leadingDotClass: 'dt-attr-dot-liability' },
]

export interface AttributeChipProps {
  value: DataAttribute | null
  onChange: (v: DataAttribute) => void
  error?: boolean
}

export function AttributeChip({ value, onChange, error }: AttributeChipProps) {
  return (
    <Picker<DataAttribute>
      value={value}
      onChange={onChange}
      options={ATTRIBUTE_OPTIONS}
      placeholder="Select attribute"
      triggerVariant="chip"
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
