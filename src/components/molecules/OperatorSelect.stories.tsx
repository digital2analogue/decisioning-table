import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { useState } from 'react'
import type { Operator } from '../../types'
import { OperatorSelect } from './OperatorSelect'

const meta: Meta<typeof OperatorSelect> = {
  component: OperatorSelect,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
}

export default meta
type Story = StoryObj<typeof OperatorSelect>

export const Empty: Story = {
  args: {
    value: null,
    onChange: fn(),
  },
}

export const Filled: Story = {
  args: {
    value: '>',
    onChange: fn(),
  },
}

export const Error: Story = {
  args: {
    value: null,
    error: true,
    onChange: fn(),
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<Operator | null>(null)
    return <OperatorSelect value={value} onChange={setValue} />
  },
}
