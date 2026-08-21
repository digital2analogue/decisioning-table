import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import type { Ruleset } from '../../types'
import { ValidationBanner } from './ValidationBanner'

const meta: Meta<typeof ValidationBanner> = {
  component: ValidationBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onSelectInvalid: { action: 'select invalid clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 0, maxWidth: 900 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ValidationBanner>

const ruleBase = {
  selected: false,
  dataAttribute: null,
  operator: null,
  amount: null,
  outcome: null,
  existingAccountOperator: null,
  existingAccountVariable: '',
  annualIncomeOperator: null,
  annualIncomeVariable: '',
} as const

const rulesetOneInvalid: Ruleset = {
  id: 'rs1',
  name: 'Credit Approval',
  rules: [
    { id: 'r1', ...ruleBase, ruleName: 'High income', outcome: null },
  ],
}

const rulesetThreeInvalid: Ruleset = {
  id: 'rs2',
  name: 'Credit Approval',
  rules: [
    { id: 'r1', ...ruleBase, ruleName: 'High income', outcome: null },
    { id: 'r2', ...ruleBase, ruleName: 'Existing account', outcome: null },
    { id: 'r3', ...ruleBase, ruleName: 'Low liability', outcome: null },
  ],
}

export const OneIncomplete: Story = {
  args: {
    ruleset: rulesetOneInvalid,
    onSelectInvalid: fn(),
  },
}

export const ThreeIncomplete: Story = {
  args: {
    ruleset: rulesetThreeInvalid,
    onSelectInvalid: fn(),
  },
}
