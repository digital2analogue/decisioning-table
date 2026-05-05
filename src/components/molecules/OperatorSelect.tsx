import type { Operator } from '../../types'
import { Picker, type PickerOption } from '../atoms/Picker'

export interface OperatorSelectProps {
  value: Operator | null
  onChange: (v: Operator) => void
  error?: boolean
}

const OPTIONS: PickerOption<Operator>[] = [
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'At least' },
  { value: '<', label: 'Less than' },
  { value: '<=', label: 'At most' },
  { value: '=', label: 'Equals' },
]

export function OperatorSelect({ value, onChange, error }: OperatorSelectProps) {
  return (
    <Picker<Operator>
      value={value}
      onChange={onChange}
      options={OPTIONS}
      placeholder="Select operator"
      triggerVariant="select-trigger"
      ariaLabel="Operator"
      error={error}
    />
  )
}
