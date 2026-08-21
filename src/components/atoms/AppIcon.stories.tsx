import type { Meta, StoryObj } from '@storybook/react'
import { AppIcon } from './AppIcon'

const meta: Meta<typeof AppIcon> = {
  component: AppIcon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 16, max: 128, step: 8 } },
  },
}

export default meta
type Story = StoryObj<typeof AppIcon>

export const Default: Story = {
  args: { size: 44 },
}

export const Small: Story = {
  args: { size: 24 },
}

export const Large: Story = {
  args: { size: 80 },
}
