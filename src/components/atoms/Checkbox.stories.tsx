import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {
  args: {
    checked: false,
    onChange: fn(),
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    onChange: fn(),
  },
}

export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
    onChange: fn(),
  },
}
