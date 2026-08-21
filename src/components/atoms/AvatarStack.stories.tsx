import type { Meta, StoryObj } from '@storybook/react'
import { AvatarStack } from './AvatarStack'

const meta: Meta<typeof AvatarStack> = {
  component: AvatarStack,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AvatarStack>

export const Default: Story = {}
