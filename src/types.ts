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

export interface Rule {
  id: string
  selected: boolean
  ruleName: string
  dataAttribute: DataAttribute
  operator: Operator
  amount: number
  outcome: Outcome
  existingAccountOperator: ConditionalOperator
  existingAccountVariable: string
  annualIncomeOperator: ConditionalOperator
  annualIncomeVariable: string
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
