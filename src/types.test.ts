import { describe, it, expect } from 'vitest'
import {
  isRuleValid,
  isChildRuleValid,
  isRuleTouched,
  isEmptyDraft,
  missingFields,
  type Rule,
} from './types'

const emptyRule = (): Rule => ({
  id: 'r1',
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
})

describe('isRuleValid', () => {
  it('returns false for an empty draft rule', () => {
    expect(isRuleValid(emptyRule())).toBe(false)
  })

  it('returns false when ruleName is filled but outcome is missing', () => {
    expect(isRuleValid({ ...emptyRule(), ruleName: 'High income' })).toBe(false)
  })

  it('returns true when ruleName and outcome are both set', () => {
    expect(isRuleValid({ ...emptyRule(), ruleName: 'High income', outcome: 'Approve' })).toBe(true)
  })

  it('returns false when ruleName is only whitespace', () => {
    expect(isRuleValid({ ...emptyRule(), ruleName: '   ', outcome: 'Approve' })).toBe(false)
  })
})

describe('isChildRuleValid', () => {
  it('returns false for an empty draft', () => {
    expect(isChildRuleValid(emptyRule())).toBe(false)
  })

  it('returns true with only ruleName — children do not require outcome', () => {
    expect(isChildRuleValid({ ...emptyRule(), ruleName: 'Sub-condition' })).toBe(true)
  })

  it('returns false when ruleName is only whitespace', () => {
    expect(isChildRuleValid({ ...emptyRule(), ruleName: '  ' })).toBe(false)
  })
})

describe('isRuleTouched', () => {
  it('returns false for a fully empty draft', () => {
    expect(isRuleTouched(emptyRule())).toBe(false)
  })

  it('returns true when ruleName has been typed', () => {
    expect(isRuleTouched({ ...emptyRule(), ruleName: 'a' })).toBe(true)
  })

  it('returns true when dataAttribute is set', () => {
    expect(isRuleTouched({ ...emptyRule(), dataAttribute: 'Income' })).toBe(true)
  })

  it('returns true when operator is set', () => {
    expect(isRuleTouched({ ...emptyRule(), operator: '>' })).toBe(true)
  })

  it('returns true when amount is set (including 0)', () => {
    expect(isRuleTouched({ ...emptyRule(), amount: 0 })).toBe(true)
  })

  it('returns true when outcome is set', () => {
    expect(isRuleTouched({ ...emptyRule(), outcome: 'Deny' })).toBe(true)
  })

  it('returns true when a child rule has been touched', () => {
    const parent = { ...emptyRule(), children: [{ ...emptyRule(), id: 'c1', ruleName: 'child' }] }
    expect(isRuleTouched(parent)).toBe(true)
  })

  it('returns false when a child is also an empty draft', () => {
    const parent = { ...emptyRule(), children: [emptyRule()] }
    expect(isRuleTouched(parent)).toBe(false)
  })
})

describe('isEmptyDraft', () => {
  it('returns true for a fully empty draft', () => {
    expect(isEmptyDraft(emptyRule())).toBe(true)
  })

  it('returns false when ruleName is set', () => {
    expect(isEmptyDraft({ ...emptyRule(), ruleName: 'test' })).toBe(false)
  })

  it('returns false when existingAccountOperator is set', () => {
    expect(isEmptyDraft({ ...emptyRule(), existingAccountOperator: '==' })).toBe(false)
  })
})

describe('missingFields', () => {
  it('returns both fields for an empty parent rule', () => {
    expect(missingFields(emptyRule())).toEqual(['rule name', 'outcome'])
  })

  it('returns only outcome when ruleName is filled', () => {
    expect(missingFields({ ...emptyRule(), ruleName: 'Test' })).toEqual(['outcome'])
  })

  it('returns only rule name when outcome is filled', () => {
    expect(missingFields({ ...emptyRule(), outcome: 'Approve' })).toEqual(['rule name'])
  })

  it('returns empty array for a complete parent rule', () => {
    expect(missingFields({ ...emptyRule(), ruleName: 'Test', outcome: 'Approve' })).toEqual([])
  })

  it('omits outcome for child rules when forChild=true', () => {
    expect(missingFields(emptyRule(), true)).toEqual(['rule name'])
  })

  it('returns empty array for a complete child rule', () => {
    expect(missingFields({ ...emptyRule(), ruleName: 'Test' }, true)).toEqual([])
  })
})
