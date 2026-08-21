/**
 * Automated WCAG 2.1 AA accessibility tests via axe-core.
 *
 * Each test renders a component into jsdom and asserts zero violations.
 * These catch structural a11y issues (missing labels, invalid ARIA, contrast
 * failures detectable in DOM, role misuse) but do not replace manual keyboard
 * and screen-reader testing.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { useState } from 'react'
import { Settings2Icon } from 'lucide-react'

import { IconButton } from '../components/atoms/IconButton'
import { Checkbox } from '../components/atoms/Checkbox'
import { AmountCell } from '../components/atoms/AmountCell'
import { AvatarStack } from '../components/atoms/AvatarStack'
import { AppIcon } from '../components/atoms/AppIcon'
import { AttributeSelectBadge, OutcomeBadge } from '../components/atoms/Badge'
import { Picker, type PickerOption } from '../components/atoms/Picker'
import { Toast } from '../components/molecules/Toast'
import { ValidationBanner } from '../components/molecules/ValidationBanner'
import { OperatorSelect } from '../components/molecules/OperatorSelect'
import type { Operator, Outcome, DataAttribute, Ruleset } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const noop = () => {}

const invalidRuleset: Ruleset = {
  id: 'rs1',
  name: 'Test',
  rules: [
    {
      id: 'r1',
      selected: false,
      ruleName: 'Income check',
      dataAttribute: null,
      operator: null,
      amount: null,
      outcome: null,
      existingAccountOperator: null,
      existingAccountVariable: '',
      annualIncomeOperator: null,
      annualIncomeVariable: '',
    },
  ],
}

// ─── IconButton ───────────────────────────────────────────────────────────────

describe('IconButton a11y', () => {
  it('has no violations', async () => {
    const { container } = render(
      <IconButton ariaLabel="Settings" onClick={noop}>
        <Settings2Icon size={16} />
      </IconButton>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no violations with aria-haspopup', async () => {
    const { container } = render(
      <IconButton ariaLabel="More options" ariaHasPopup="menu" ariaExpanded={false} onClick={noop}>
        <Settings2Icon size={16} />
      </IconButton>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── Checkbox ────────────────────────────────────────────────────────────────

describe('Checkbox a11y', () => {
  it('unchecked has no violations', async () => {
    const { container } = render(
      <label>
        Select rule
        <Checkbox checked={false} onChange={noop} />
      </label>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('checked has no violations', async () => {
    const { container } = render(
      <label>
        Select rule
        <Checkbox checked={true} onChange={noop} />
      </label>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('indeterminate has no violations', async () => {
    const { container } = render(
      <label>
        Select all
        <Checkbox checked={false} indeterminate={true} onChange={noop} />
      </label>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── AmountCell ───────────────────────────────────────────────────────────────

describe('AmountCell a11y', () => {
  it('empty state has no violations', async () => {
    const { container } = render(
      <AmountCell value={null} onChange={noop} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('filled state has no violations', async () => {
    const { container } = render(
      <AmountCell value={50000} onChange={noop} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('error state has no violations', async () => {
    const { container } = render(
      <AmountCell value={null} error={true} onChange={noop} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── AvatarStack ─────────────────────────────────────────────────────────────

describe('AvatarStack a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<AvatarStack />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── AppIcon ─────────────────────────────────────────────────────────────────

describe('AppIcon a11y', () => {
  it('has no violations (decorative svg)', async () => {
    const { container } = render(<AppIcon size={44} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── OutcomeBadge ─────────────────────────────────────────────────────────────

describe('OutcomeBadge a11y', () => {
  it('unselected state has no violations', async () => {
    const { container } = render(<OutcomeBadge value={null} onChange={noop} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Approve selected has no violations', async () => {
    const { container } = render(<OutcomeBadge value="Approve" onChange={noop} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Deny selected has no violations', async () => {
    const { container } = render(<OutcomeBadge value="Deny" onChange={noop} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── AttributeSelectBadge ────────────────────────────────────────────────────

describe('AttributeSelectBadge a11y', () => {
  it('empty state has no violations', async () => {
    const { container } = render(
      <AttributeSelectBadge value={null} onChange={noop as (v: DataAttribute) => void} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('filled state has no violations', async () => {
    const { container } = render(
      <AttributeSelectBadge value="Income" onChange={noop as (v: DataAttribute) => void} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── Picker ───────────────────────────────────────────────────────────────────

const OPERATOR_OPTIONS: PickerOption<Operator>[] = [
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'At least' },
  { value: '<', label: 'Less than' },
]

describe('Picker a11y', () => {
  it('closed empty state has no violations', async () => {
    const { container } = render(
      <Picker<Operator>
        value={null}
        onChange={noop as (v: Operator) => void}
        options={OPERATOR_OPTIONS}
        placeholder="Select operator"
        triggerVariant="select-trigger"
        ariaLabel="Operator"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('closed filled state has no violations', async () => {
    const { container } = render(
      <Picker<Operator>
        value=">"
        onChange={noop as (v: Operator) => void}
        options={OPERATOR_OPTIONS}
        triggerVariant="select-trigger"
        ariaLabel="Operator"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('open listbox has no violations', async () => {
    function PickerOpen() {
      const [value, setVal] = useState<Operator | null>(null)
      return (
        <Picker<Operator>
          value={value}
          onChange={setVal}
          options={OPERATOR_OPTIONS}
          placeholder="Select operator"
          triggerVariant="select-trigger"
          ariaLabel="Operator"
        />
      )
    }
    const { container, getByRole } = render(<PickerOpen />)
    // Open it
    getByRole('button', { name: 'Operator' }).click()
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── OperatorSelect ───────────────────────────────────────────────────────────

describe('OperatorSelect a11y', () => {
  it('has no violations', async () => {
    const { container } = render(
      <OperatorSelect value={null} onChange={noop as (v: Operator) => void} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ─── Toast ────────────────────────────────────────────────────────────────────

describe('Toast a11y', () => {
  it('message-only has no violations', async () => {
    const { container } = render(
      <Toast message="Rule deleted." onDismiss={noop} durationMs={0} />,
    )
    // Toast portals to document.body — axe the full body
    expect(await axe(document.body)).toHaveNoViolations()
    container.remove()
  })

  it('with undo action has no violations', async () => {
    const { container } = render(
      <Toast
        message="Rule deleted."
        actionLabel="Undo"
        onAction={noop}
        onDismiss={noop}
        durationMs={0}
      />,
    )
    expect(await axe(document.body)).toHaveNoViolations()
    container.remove()
  })
})

// ─── ValidationBanner ────────────────────────────────────────────────────────

describe('ValidationBanner a11y', () => {
  it('visible state has no violations', async () => {
    const { container } = render(
      <ValidationBanner ruleset={invalidRuleset} onSelectInvalid={noop} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
