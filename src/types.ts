export type DataAttribute = 'Income' | 'Expense' | 'Asset' | 'Liability'
export type Operator = '>' | '>=' | '<' | '<=' | '='
export type ConditionalOperator = 'contains' | 'doesnotContain' | '==' | '!=' | '=null' | '!=null'
export type Outcome = 'Approve' | 'Deny'

// Onboarding types
export type OutcomeType =
  | 'decline'
  | 'credit-limit'
  | 'require-action'
  | 'award-rewards'
  | 'accumulate-rewards'
  | 'minimum-credit-limit'

export type DataElementCategory = 'Financial' | 'Employment' | 'Account' | 'Identity'
export type DataElementType = 'number' | 'string' | 'boolean' | 'enum'

export interface DataElement {
  id: string
  label: string
  description: string
  dataType: DataElementType
  attributePath: string
  category: DataElementCategory
}

export interface ModelConfig {
  outcomeType: OutcomeType
  modelName: string
  modelDescription: string
  selectedDataElements: string[]
}

export type LogicOperator = 'AND' | 'OR'

/**
 * A rule. All semantic fields are nullable so a rule can exist as a
 * draft (unfilled) until the user has supplied every required value.
 * `isRuleValid()` derives validity from field completeness — a rule
 * with any null/empty field will not run as part of the decision model.
 */
export interface Rule {
  id: string
  selected: boolean
  ruleName: string
  dataAttribute: DataAttribute | null
  operator: Operator | null
  amount: number | null
  outcome: Outcome | null
  existingAccountOperator: ConditionalOperator | null
  existingAccountVariable: string
  annualIncomeOperator: ConditionalOperator | null
  annualIncomeVariable: string
  children?: Rule[]
  logicOperator?: LogicOperator
}

/**
 * True when every required field EXCEPT outcome is filled. Shared predicate
 * used both for child-row validity (children inherit parent outcome) and as
 * the gate for revealing the Outcome segmented control on parent rows.
 *
 * Conditional fields (existingAccount*, annualIncome*) are intentionally
 * NOT required — most real rules use the main attribute/operator/amount
 * triple and don't need both gates. Conditionals are scoping refinements,
 * not preconditions.
 */
export function isReadyForOutcome(rule: Rule): boolean {
  return Boolean(
    rule.ruleName.trim() &&
    rule.dataAttribute &&
    rule.operator &&
    rule.amount !== null
  )
}

/**
 * Parent rule validity. Requires outcome on top of everything else.
 * Use isChildRuleValid() for child rules — they inherit outcome from parent.
 */
export function isRuleValid(rule: Rule): boolean {
  return isReadyForOutcome(rule) && Boolean(rule.outcome)
}

/** Child rule validity — same as parent minus outcome. */
export function isChildRuleValid(rule: Rule): boolean {
  return isReadyForOutcome(rule)
}

/**
 * Returns the list of missing required field labels (human-readable),
 * for use in tooltips and the validation banner. The `forChild` flag
 * suppresses the outcome field since children inherit from their parent.
 */
export function missingFields(rule: Rule, forChild = false): string[] {
  const missing: string[] = []
  if (!rule.ruleName.trim())       missing.push('rule name')
  if (!rule.dataAttribute)         missing.push('data attribute')
  if (!rule.operator)              missing.push('operator')
  if (rule.amount === null)        missing.push('amount')
  if (!forChild && !rule.outcome)  missing.push('outcome')
  return missing
}

export interface Ruleset {
  id: string
  name: string
  rules: Rule[]
}

export interface DragItem {
  index: number
  id: string
}
