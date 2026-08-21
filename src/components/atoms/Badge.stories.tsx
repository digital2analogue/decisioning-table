import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { useState } from 'react'
import type { DataAttribute, Outcome } from '../../types'
import { AttributeSelectBadge, OutcomeBadge } from './Badge'

// ─── AttributeSelectBadge ────────────────────────────────────────────────────

const attributeMeta: Meta<typeof AttributeSelectBadge> = {
  component: AttributeSelectBadge,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'changed' },
    value: {
      control: 'select',
      options: [null, 'Income', 'Expense', 'Asset', 'Liability'],
    },
  },
}

export default attributeMeta
type AttributeStory = StoryObj<typeof AttributeSelectBadge>

export const AttributeEmpty: AttributeStory = {
  name: 'AttributeSelectBadge / Empty',
  args: {
    value: null,
    onChange: fn(),
  },
}

export const AttributeFilled: AttributeStory = {
  name: 'AttributeSelectBadge / Filled',
  args: {
    value: 'Income',
    onChange: fn(),
  },
}

export const AttributeError: AttributeStory = {
  name: 'AttributeSelectBadge / Error',
  args: {
    value: null,
    error: true,
    onChange: fn(),
  },
}

export const AttributeInteractive: AttributeStory = {
  name: 'AttributeSelectBadge / Interactive',
  render: () => {
    const [value, setValue] = useState<DataAttribute | null>(null)
    return <AttributeSelectBadge value={value} onChange={setValue} />
  },
}

// ─── OutcomeBadge ────────────────────────────────────────────────────────────

export const OutcomeUnselected: StoryObj = {
  name: 'OutcomeBadge / Unselected',
  render: () => {
    const [value, setValue] = useState<Outcome | null>(null)
    return <OutcomeBadge value={value} onChange={setValue} />
  },
}

export const OutcomeApprove: StoryObj = {
  name: 'OutcomeBadge / Approve',
  render: () => {
    const [value, setValue] = useState<Outcome | null>('Approve')
    return <OutcomeBadge value={value} onChange={setValue} />
  },
}

export const OutcomeDeny: StoryObj = {
  name: 'OutcomeBadge / Deny',
  render: () => {
    const [value, setValue] = useState<Outcome | null>('Deny')
    return <OutcomeBadge value={value} onChange={setValue} />
  },
}
