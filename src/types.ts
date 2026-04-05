export type DataAttribute = 'Income' | 'Expense'
export type Operator = '>' | '>=' | '<' | '<=' | '='
export type Outcome = 'Approve' | 'Deny'

export interface Rule {
  id: string
  selected: boolean
  ruleName: string
  dataAttribute: DataAttribute
  operator: Operator
  amount: number
  outcome: Outcome
}

export interface Ruleset {
  id: string
  name: string
  rules: Rule[]
}
