import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { Operator, DataAttribute } from '../../types'
import { Picker, type PickerOption } from './Picker'

const OPERATOR_OPTIONS: PickerOption<Operator>[] = [
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '<', label: 'Less than' },
  { value: '<=', label: 'Less than or equal' },
  { value: '=', label: 'Equal to' },
]

const ATTRIBUTE_OPTIONS: PickerOption<DataAttribute>[] = [
  { value: 'Income', label: 'Income', leadingDotClass: 'dt-attr-dot-income' },
  { value: 'Expense', label: 'Expense', leadingDotClass: 'dt-attr-dot-expense' },
  { value: 'Asset', label: 'Asset', leadingDotClass: 'dt-attr-dot-asset' },
  { value: 'Liability', label: 'Liability', leadingDotClass: 'dt-attr-dot-liability' },
]

const meta: Meta = {
  title: 'Atoms/Picker',
  tags: ['autodocs'],
}

export default meta

export const SelectTriggerEmpty: StoryObj = {
  name: 'select-trigger / Empty',
  render: () => {
    const [value, setValue] = useState<Operator | null>(null)
    return (
      <Picker<Operator>
        value={value}
        onChange={setValue}
        options={OPERATOR_OPTIONS}
        placeholder="Select operator"
        triggerVariant="select-trigger"
        ariaLabel="Operator"
        width={180}
      />
    )
  },
}

export const SelectTriggerFilled: StoryObj = {
  name: 'select-trigger / Filled',
  render: () => {
    const [value, setValue] = useState<Operator | null>('>')
    return (
      <Picker<Operator>
        value={value}
        onChange={setValue}
        options={OPERATOR_OPTIONS}
        triggerVariant="select-trigger"
        ariaLabel="Operator"
        width={180}
      />
    )
  },
}

export const SelectTriggerError: StoryObj = {
  name: 'select-trigger / Error',
  render: () => {
    const [value, setValue] = useState<Operator | null>(null)
    return (
      <Picker<Operator>
        value={value}
        onChange={setValue}
        options={OPERATOR_OPTIONS}
        placeholder="Select operator"
        triggerVariant="select-trigger"
        ariaLabel="Operator"
        error={true}
        width={180}
      />
    )
  },
}

export const BadgeTrigger: StoryObj = {
  name: 'badge / With dots',
  render: () => {
    const [value, setValue] = useState<DataAttribute | null>(null)
    return (
      <Picker<DataAttribute>
        value={value}
        onChange={setValue}
        options={ATTRIBUTE_OPTIONS}
        placeholder="Select attribute"
        triggerVariant="badge"
        ariaLabel="Data attribute"
      />
    )
  },
}

export const LogicChip: StoryObj = {
  name: 'logic-chip',
  render: () => {
    type Logic = 'AND' | 'OR'
    const [value, setValue] = useState<Logic | null>('AND')
    return (
      <Picker<Logic>
        value={value}
        onChange={setValue}
        options={[
          { value: 'AND', label: 'AND' },
          { value: 'OR', label: 'OR' },
        ]}
        triggerVariant="logic-chip"
        ariaLabel="Logic operator"
      />
    )
  },
}
