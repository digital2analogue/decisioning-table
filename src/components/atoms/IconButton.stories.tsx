import type { Meta, StoryObj } from '@storybook/react'
import { Settings2Icon, Trash2Icon, PlusIcon, EllipsisIcon } from 'lucide-react'
import { IconButton } from './IconButton'

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
    ariaHasPopup: {
      control: 'select',
      options: [undefined, 'menu', 'listbox', 'dialog'],
    },
  },
}

export default meta
type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  args: {
    ariaLabel: 'Settings',
    children: <Settings2Icon size={16} />,
  },
}

export const WithMenu: Story = {
  args: {
    ariaLabel: 'More options',
    ariaHasPopup: 'menu',
    ariaExpanded: false,
    title: 'More options',
    children: <EllipsisIcon size={16} />,
  },
}

export const WithMenuExpanded: Story = {
  args: {
    ariaLabel: 'More options',
    ariaHasPopup: 'menu',
    ariaExpanded: true,
    title: 'More options',
    children: <EllipsisIcon size={16} />,
  },
}

export const Destructive: Story = {
  args: {
    ariaLabel: 'Delete rule',
    title: 'Delete rule',
    children: <Trash2Icon size={16} />,
  },
}

export const Add: Story = {
  args: {
    ariaLabel: 'Add rule',
    title: 'Add rule',
    children: <PlusIcon size={16} />,
  },
}
