import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { AmountCell } from './AmountCell'

const meta: Meta<typeof AmountCell> = {
  component: AmountCell,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 160 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AmountCell>

export const Empty: Story = {
  args: {
    value: null,
    onChange: fn(),
  },
}

export const Filled: Story = {
  args: {
    value: 50000,
    onChange: fn(),
  },
}

export const LargeAmount: Story = {
  args: {
    value: 1250000,
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
