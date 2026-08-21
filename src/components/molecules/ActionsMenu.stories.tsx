import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ActionsMenu } from './ActionsMenu'

const meta: Meta<typeof ActionsMenu> = {
  title: 'Molecules/ActionsMenu',
  component: ActionsMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const ParentRule: StoryObj<typeof ActionsMenu> = {
  args: {
    onAddChild: fn(),
    onDuplicate: fn(),
    onDelete: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    isChild: false,
    triggerAriaLabel: 'More options',
  },
}

export const ParentRuleTopOfList: StoryObj<typeof ActionsMenu> = {
  name: 'Parent rule (top — no Move Up)',
  args: {
    onAddChild: fn(),
    onDuplicate: fn(),
    onDelete: fn(),
    onMoveUp: undefined,
    onMoveDown: fn(),
    isChild: false,
    triggerAriaLabel: 'More options',
  },
}

export const ChildRule: StoryObj<typeof ActionsMenu> = {
  args: {
    onDuplicate: fn(),
    onDelete: fn(),
    onMoveUp: fn(),
    onMoveDown: fn(),
    isChild: true,
    triggerAriaLabel: 'More options',
  },
}
