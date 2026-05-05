import type { LogicOperator } from '../../types'
import { Picker, type PickerOption } from '../atoms/Picker'

export interface LogicOperatorSelectProps {
  value: LogicOperator
  onChange: (v: LogicOperator) => void
}

const OPTIONS: PickerOption<LogicOperator>[] = [
  { value: 'AND', label: 'and' },
  { value: 'OR', label: 'or' },
]

export function LogicOperatorSelect({ value, onChange }: LogicOperatorSelectProps) {
  return (
    <Picker<LogicOperator>
      value={value}
      onChange={onChange}
      options={OPTIONS}
      triggerVariant="logic-chip"
      ariaLabel={`Logic operator: ${value.toLowerCase()}`}
      title={`Logic: ${value.toLowerCase()}`}
    />
  )
}
