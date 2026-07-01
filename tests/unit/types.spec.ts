import { describe, it, expect } from 'vitest'
import {
  isReadyForOutcome,
  isRuleValid,
  isChildRuleValid,
  isRuleTouched,
  isEmptyDraft,
  missingFields,
  type Rule,
} from '@/types'

// A brand-new draft, exactly as addRule() creates it: everything unset.
function draftRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 'test-rule',
    selected: false,
    ruleName: '',
    dataAttribute: null,
    operator: null,
    amount: null,
    outcome: null,
    existingAccountOperator: null,
    existingAccountVariable: '',
    annualIncomeOperator: null,
    annualIncomeVariable: '',
    ...overrides,
  }
}

describe('isReadyForOutcome', () => {
  it('is false for an empty draft', () => {
    expect(isReadyForOutcome(draftRule())).toBe(false)
  })

  it('is true once the rule has a name', () => {
    expect(isReadyForOutcome(draftRule({ ruleName: 'Income floor' }))).toBe(true)
  })

  it('ignores whitespace-only names', () => {
    expect(isReadyForOutcome(draftRule({ ruleName: '   ' }))).toBe(false)
  })

  it('does not require conditional fields (scoping refinements, not preconditions)', () => {
    const rule = draftRule({ ruleName: 'Income floor' })
    expect(rule.existingAccountOperator).toBeNull()
    expect(rule.annualIncomeOperator).toBeNull()
    expect(isReadyForOutcome(rule)).toBe(true)
  })
})

describe('isRuleValid (parent rules)', () => {
  it('requires an outcome on top of readiness', () => {
    const named = draftRule({ ruleName: 'Income floor' })
    expect(isRuleValid(named)).toBe(false)
    expect(isRuleValid({ ...named, outcome: 'Approve' })).toBe(true)
  })

  it('is false when named but outcome missing', () => {
    expect(isRuleValid(draftRule({ ruleName: 'Income floor', outcome: null }))).toBe(false)
  })
})

describe('isChildRuleValid (children inherit outcome)', () => {
  it('does NOT require an outcome', () => {
    expect(isChildRuleValid(draftRule({ ruleName: 'Sub-condition' }))).toBe(true)
  })

  it('still requires a name', () => {
    expect(isChildRuleValid(draftRule({ outcome: 'Approve' }))).toBe(false)
  })
})

describe('isRuleTouched', () => {
  it('is false for a brand-new draft', () => {
    expect(isRuleTouched(draftRule())).toBe(false)
  })

  it.each([
    ['ruleName', { ruleName: 'x' }],
    ['dataAttribute', { dataAttribute: 'Income' as const }],
    ['operator', { operator: '>' as const }],
    ['amount', { amount: 0 }],
    ['outcome', { outcome: 'Deny' as const }],
    ['existingAccountOperator', { existingAccountOperator: '==' as const }],
    ['annualIncomeVariable', { annualIncomeVariable: 'salary' }],
  ])('any single field set marks the rule touched: %s', (_label, overrides) => {
    expect(isRuleTouched(draftRule(overrides))).toBe(true)
  })

  it('treats amount 0 as touched (0 is a real value, not empty)', () => {
    expect(isRuleTouched(draftRule({ amount: 0 }))).toBe(true)
  })

  it('bubbles up from touched children', () => {
    const parent = draftRule({
      children: [draftRule({ id: 'child', ruleName: 'child rule' })],
    })
    expect(isRuleTouched(parent)).toBe(true)
  })

  it('stays untouched when children are all untouched', () => {
    const parent = draftRule({ children: [draftRule({ id: 'child' })] })
    expect(isRuleTouched(parent)).toBe(false)
  })
})

describe('isEmptyDraft', () => {
  it('is true for a brand-new draft', () => {
    expect(isEmptyDraft(draftRule())).toBe(true)
  })

  it('is false once the name is typed', () => {
    expect(isEmptyDraft(draftRule({ ruleName: 'x' }))).toBe(false)
  })

  it('ignores outcome so it works for both parent and child rows', () => {
    expect(isEmptyDraft(draftRule({ outcome: 'Approve' }))).toBe(true)
  })
})

describe('missingFields', () => {
  it('lists rule name and outcome for an empty parent draft', () => {
    expect(missingFields(draftRule())).toEqual(['rule name', 'outcome'])
  })

  it('omits outcome for child rules (forChild = true)', () => {
    expect(missingFields(draftRule(), true)).toEqual(['rule name'])
  })

  it('is empty for a valid parent rule', () => {
    expect(missingFields(draftRule({ ruleName: 'Income floor', outcome: 'Approve' }))).toEqual([])
  })

  it('treats whitespace-only name as missing', () => {
    expect(missingFields(draftRule({ ruleName: '  ', outcome: 'Approve' }))).toEqual(['rule name'])
  })
})
