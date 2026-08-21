import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Ruleset } from '../../types'
import { ValidationBanner } from './ValidationBanner'

const emptyRule = (id: string, ruleName = '') => ({
  id,
  selected: false,
  ruleName,
  dataAttribute: null as null,
  operator: null as null,
  amount: null as null,
  outcome: null as null,
  existingAccountOperator: null as null,
  existingAccountVariable: '',
  annualIncomeOperator: null as null,
  annualIncomeVariable: '',
})

describe('ValidationBanner', () => {
  it('renders nothing when all rules are valid', () => {
    const ruleset: Ruleset = {
      id: 'rs1',
      name: 'Test',
      rules: [{ ...emptyRule('r1', 'Income check'), outcome: 'Approve' }],
    }
    const { container } = render(
      <ValidationBanner ruleset={ruleset} onSelectInvalid={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for untouched draft rules', () => {
    const ruleset: Ruleset = {
      id: 'rs1',
      name: 'Test',
      rules: [emptyRule('r1')], // completely empty — untouched draft
    }
    const { container } = render(
      <ValidationBanner ruleset={ruleset} onSelectInvalid={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders with count=1 for a single invalid rule', () => {
    const ruleset: Ruleset = {
      id: 'rs1',
      name: 'Test',
      rules: [{ ...emptyRule('r1', 'Income check'), outcome: null }],
    }
    render(<ValidationBanner ruleset={ruleset} onSelectInvalid={vi.fn()} />)
    // dt-metric span holds the count; query within the alert to avoid ambiguity
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('1 incomplete rule')
  })

  it('renders plural noun for multiple invalid rules', () => {
    const ruleset: Ruleset = {
      id: 'rs1',
      name: 'Test',
      rules: [
        { ...emptyRule('r1', 'Rule A'), outcome: null },
        { ...emptyRule('r2', 'Rule B'), outcome: null },
        { ...emptyRule('r3', 'Rule C'), outcome: null },
      ],
    }
    render(<ValidationBanner ruleset={ruleset} onSelectInvalid={vi.fn()} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('3 incomplete rules')
  })

  it('calls onSelectInvalid when CTA is clicked', async () => {
    const onSelectInvalid = vi.fn()
    const ruleset: Ruleset = {
      id: 'rs1',
      name: 'Test',
      rules: [{ ...emptyRule('r1', 'Income check'), outcome: null }],
    }
    render(<ValidationBanner ruleset={ruleset} onSelectInvalid={onSelectInvalid} />)
    await userEvent.click(screen.getByRole('button', { name: /select incomplete rules/i }))
    expect(onSelectInvalid).toHaveBeenCalledOnce()
  })

  it('uses role=alert', () => {
    const ruleset: Ruleset = {
      id: 'rs1',
      name: 'Test',
      rules: [{ ...emptyRule('r1', 'Rule A'), outcome: null }],
    }
    render(<ValidationBanner ruleset={ruleset} onSelectInvalid={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
