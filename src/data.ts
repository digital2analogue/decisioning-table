import type { Ruleset, DataElement } from './types'

export interface AccountType {
  id: string
  label: string
  description: string
}

export const accountTypes: AccountType[] = [
  { id: 'checking', label: 'Checking', description: 'Standard demand deposit checking account' },
  { id: 'savings', label: 'Savings', description: 'Interest-bearing personal savings account' },
  { id: 'money-market', label: 'Money Market', description: 'High-yield money market deposit account' },
  { id: 'cd', label: 'CD', description: 'Fixed-term certificate of deposit' },
  { id: 'credit-card', label: 'Credit Card', description: 'Revolving credit card account in good standing' },
  { id: 'auto-loan', label: 'Auto Loan', description: 'Active auto financing installment loan' },
]

export const dataElements: DataElement[] = [
  // Financial
  { id: 'annual-income', label: 'AnnualIncome', description: 'Annual gross income reported on the application', dataType: 'number', attributePath: 'applicant.financial.annual_income', category: 'Financial' },
  { id: 'monthly-expenses', label: 'MonthlyExpenses', description: 'Total recurring monthly expenses including debt payments', dataType: 'number', attributePath: 'applicant.financial.monthly_expenses', category: 'Financial' },
  { id: 'debt-to-income', label: 'DebtToIncomeRatio', description: 'Ratio of total monthly debt payments to gross monthly income', dataType: 'number', attributePath: 'applicant.financial.debt_to_income_ratio', category: 'Financial' },
  { id: 'credit-score', label: 'CreditScore', description: 'FICO score from the primary credit bureau at time of application', dataType: 'number', attributePath: 'applicant.financial.credit_score', category: 'Financial' },
  { id: 'existing-credit-limit', label: 'ExistingCreditLimit', description: 'Sum of current revolving credit limits across all accounts', dataType: 'number', attributePath: 'applicant.financial.existing_credit_limit', category: 'Financial' },
  { id: 'credit-utilization', label: 'CreditUtilization', description: 'Percentage of available revolving credit currently in use', dataType: 'number', attributePath: 'applicant.financial.credit_utilization', category: 'Financial' },
  { id: 'available-credit', label: 'AvailableCredit', description: 'Total unused credit available across all revolving accounts', dataType: 'number', attributePath: 'applicant.financial.available_credit', category: 'Financial' },
  { id: 'net-worth', label: 'NetWorth', description: 'Estimated net worth based on declared assets minus liabilities', dataType: 'number', attributePath: 'applicant.financial.net_worth', category: 'Financial' },
  // Employment
  { id: 'employment-status', label: 'EmploymentStatus', description: 'Current employment status of the applicant', dataType: 'enum', attributePath: 'applicant.employment.status', category: 'Employment' },
  { id: 'employer-name', label: 'EmployerName', description: 'Name of the current employer', dataType: 'string', attributePath: 'applicant.employment.employer_name', category: 'Employment' },
  { id: 'time-at-employer', label: 'TimeAtEmployer', description: 'Length of time at current employer in months', dataType: 'number', attributePath: 'applicant.employment.tenure_months', category: 'Employment' },
  { id: 'occupation-type', label: 'OccupationType', description: 'Job category or industry classification of the applicant', dataType: 'enum', attributePath: 'applicant.employment.occupation_type', category: 'Employment' },
  { id: 'self-employed', label: 'SelfEmployed', description: 'Whether the applicant is self-employed or owns a business', dataType: 'boolean', attributePath: 'applicant.employment.self_employed', category: 'Employment' },
  // Account
  { id: 'existing-account', label: 'ExistingAccount', description: 'Whether the applicant holds an active account with the institution', dataType: 'boolean', attributePath: 'applicant.account.existing_customer', category: 'Account' },
  { id: 'account-age', label: 'AccountAge', description: 'Age of the oldest credit account in months', dataType: 'number', attributePath: 'applicant.account.oldest_account_months', category: 'Account' },
  { id: 'number-of-accounts', label: 'NumberOfAccounts', description: 'Total number of open credit accounts across all bureaus', dataType: 'number', attributePath: 'applicant.account.open_account_count', category: 'Account' },
  { id: 'payment-history', label: 'PaymentHistory', description: 'Percentage of on-time payments over the past 24 months', dataType: 'number', attributePath: 'applicant.account.payment_history_pct', category: 'Account' },
  { id: 'recent-inquiries', label: 'RecentInquiries', description: 'Number of hard credit inquiries in the past 12 months', dataType: 'number', attributePath: 'applicant.account.hard_inquiries_12m', category: 'Account' },
  { id: 'public-records', label: 'PublicRecords', description: 'Number of derogatory public records (bankruptcies, liens, judgments)', dataType: 'number', attributePath: 'applicant.account.public_record_count', category: 'Account' },
  { id: 'collections', label: 'CollectionsCount', description: 'Number of accounts currently in collections', dataType: 'number', attributePath: 'applicant.account.collections_count', category: 'Account' },
  // Identity
  { id: 'age', label: 'Age', description: 'Applicant age in years at time of application', dataType: 'number', attributePath: 'applicant.identity.age', category: 'Identity' },
  { id: 'state-of-residence', label: 'StateOfResidence', description: 'US state of primary residence', dataType: 'string', attributePath: 'applicant.identity.state', category: 'Identity' },
  { id: 'housing-status', label: 'HousingStatus', description: 'Whether applicant owns, rents, or has other housing arrangement', dataType: 'enum', attributePath: 'applicant.identity.housing_status', category: 'Identity' },
  { id: 'time-at-address', label: 'TimeAtAddress', description: 'Length of time at current primary address in months', dataType: 'number', attributePath: 'applicant.identity.address_tenure_months', category: 'Identity' },
]

export const initialRulesets: Ruleset[] = [
  {
    id: 'rs-1',
    name: 'Primary Ruleset',
    rules: [
      {
        id: 'r-1',
        selected: false,
        ruleName: 'Premium Approval',
        dataAttribute: 'Income',
        operator: '>=',
        amount: 150000,
        outcome: 'Approve',
        existingAccountOperator: null,
        existingAccountVariable: '',
        annualIncomeOperator: null,
        annualIncomeVariable: '',
        children: [
          { id: 'r-1-c1', selected: false, ruleName: 'Premium account holder', dataAttribute: 'Asset', operator: '>=', amount: 50000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: null, annualIncomeVariable: '', logicOperator: 'AND' },
          { id: 'r-1-c2', selected: false, ruleName: 'Credit score 780+', dataAttribute: 'Income', operator: '>=', amount: 780, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '85000', logicOperator: 'AND' },
        ],
      },
      { id: 'r-2', selected: false, ruleName: 'Low Income Denial', dataAttribute: 'Income', operator: '<', amount: 20000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      {
        id: 'r-3',
        selected: false,
        ruleName: 'High Expense Denial',
        dataAttribute: 'Expense',
        operator: '>',
        amount: 50000,
        outcome: 'Deny',
        existingAccountOperator: null,
        existingAccountVariable: '',
        annualIncomeOperator: null,
        annualIncomeVariable: '',
        children: [
          { id: 'r-3-c1', selected: false, ruleName: 'No existing account', dataAttribute: 'Liability', operator: '=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '', logicOperator: 'OR' },
          { id: 'r-3-c2', selected: false, ruleName: 'Recent inquiries 5+', dataAttribute: 'Liability', operator: '>=', amount: 5, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '', logicOperator: 'OR' },
        ],
      },
      { id: 'r-4', selected: false, ruleName: 'Moderate Income Approval', dataAttribute: 'Income', operator: '>=', amount: 40000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-5', selected: false, ruleName: 'Low Expense Approval', dataAttribute: 'Expense', operator: '<=', amount: 15000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-9', selected: false, ruleName: 'Prime Credit Fast Track', dataAttribute: 'Income', operator: '>=', amount: 80000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '100000' },
      { id: 'r-10', selected: false, ruleName: 'Debt Ratio Denial', dataAttribute: 'Income', operator: '<', amount: 35000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-11', selected: false, ruleName: 'Bankruptcy Flag Denial', dataAttribute: 'Income', operator: '=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      {
        id: 'r-12',
        selected: false,
        ruleName: 'Loyal Customer Approval',
        dataAttribute: 'Income',
        operator: '>=',
        amount: 60000,
        outcome: 'Approve',
        existingAccountOperator: null,
        existingAccountVariable: '',
        annualIncomeOperator: null,
        annualIncomeVariable: '',
        children: [
          { id: 'r-12-c1', selected: false, ruleName: 'Existing account holder', dataAttribute: 'Asset', operator: '>=', amount: 0, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: null, annualIncomeVariable: '', logicOperator: 'AND' },
          { id: 'r-12-c2', selected: false, ruleName: 'Account age 12+ months', dataAttribute: 'Income', operator: '>=', amount: 12, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '60000', logicOperator: 'AND' },
        ],
      },
      { id: 'r-13', selected: false, ruleName: 'High Utilization Denial', dataAttribute: 'Income', operator: '<', amount: 50000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '75000' },
      { id: 'r-14', selected: false, ruleName: 'Self-Employed Review', dataAttribute: 'Income', operator: '>=', amount: 90000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-15', selected: false, ruleName: 'Recent Inquiry Limit', dataAttribute: 'Income', operator: '>=', amount: 45000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-16', selected: false, ruleName: 'Collections Flag Denial', dataAttribute: 'Income', operator: '>', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
    ],
  },
  {
    id: 'rs-2',
    name: 'Secondary Ruleset',
    rules: [
      { id: 'r-6', selected: false, ruleName: 'Premium Income Rule', dataAttribute: 'Income', operator: '>', amount: 100000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-7', selected: false, ruleName: 'Expense Threshold', dataAttribute: 'Expense', operator: '=', amount: 30000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-17', selected: false, ruleName: 'Consistent Payment History', dataAttribute: 'Income', operator: '>=', amount: 55000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '55000' },
      { id: 'r-18', selected: false, ruleName: 'New Credit Seeker Denial', dataAttribute: 'Income', operator: '<', amount: 60000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '45000' },
      { id: 'r-19', selected: false, ruleName: 'Net Worth Approval', dataAttribute: 'Income', operator: '>=', amount: 200000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
    ],
  },
  {
    id: 'rs-3',
    name: 'Override Rules',
    rules: [
      { id: 'r-8', selected: false, ruleName: 'Manual Override Approval', dataAttribute: 'Income', operator: '>=', amount: 0, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-20', selected: false, ruleName: 'Fraud Flag Denial', dataAttribute: 'Income', operator: '>=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'r-21', selected: false, ruleName: 'VIP Relationship Approval', dataAttribute: 'Income', operator: '>=', amount: 0, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: null, annualIncomeVariable: '' },
    ],
  },
]

// Primary demo ruleset — every row fully populated for a polished portfolio view
const primaryDemoRuleset: Ruleset = {
  id: 'rs-1',
  name: 'Primary Ruleset',
  rules: [
    {
      id: 'r-1', selected: false, ruleName: 'Premium Approval', dataAttribute: 'Income', operator: '>=', amount: 150000, outcome: 'Approve',
      existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '120000',
      children: [
        { id: 'r-1-c1', selected: false, ruleName: 'Premium account holder', dataAttribute: 'Asset', operator: '>=', amount: 50000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '75000', logicOperator: 'AND' },
        { id: 'r-1-c2', selected: false, ruleName: 'Credit score 780+', dataAttribute: 'Income', operator: '>=', amount: 780, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '85000', logicOperator: 'AND' },
      ],
    },
    { id: 'r-2', selected: false, ruleName: 'Low Income Denial', dataAttribute: 'Income', operator: '<', amount: 20000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '30000' },
    {
      id: 'r-3', selected: false, ruleName: 'High Expense Denial', dataAttribute: 'Expense', operator: '>', amount: 50000, outcome: 'Deny',
      existingAccountOperator: null, existingAccountVariable: 'credit-card', annualIncomeOperator: '<', annualIncomeVariable: '45000',
      children: [
        { id: 'r-3-c1', selected: false, ruleName: 'No existing account', dataAttribute: 'Liability', operator: '=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '20000', logicOperator: 'OR' },
        { id: 'r-3-c2', selected: false, ruleName: 'Recent inquiries 5+', dataAttribute: 'Liability', operator: '>=', amount: 5, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: 'credit-card', annualIncomeOperator: '<', annualIncomeVariable: '40000', logicOperator: 'OR' },
      ],
    },
    { id: 'r-4', selected: false, ruleName: 'Moderate Income Approval', dataAttribute: 'Income', operator: '>=', amount: 40000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'savings', annualIncomeOperator: '>=', annualIncomeVariable: '40000' },
    { id: 'r-5', selected: false, ruleName: 'Low Expense Approval', dataAttribute: 'Expense', operator: '<=', amount: 15000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '35000' },
    { id: 'r-9', selected: false, ruleName: 'Prime Credit Fast Track', dataAttribute: 'Income', operator: '>=', amount: 80000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'money-market', annualIncomeOperator: '>=', annualIncomeVariable: '100000' },
    { id: 'r-10', selected: false, ruleName: 'Debt Ratio Denial', dataAttribute: 'Income', operator: '<', amount: 35000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '35000' },
    { id: 'r-11', selected: false, ruleName: 'Bankruptcy Flag Denial', dataAttribute: 'Income', operator: '=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '25000' },
    {
      id: 'r-12', selected: false, ruleName: 'Loyal Customer Approval', dataAttribute: 'Income', operator: '>=', amount: 60000, outcome: 'Approve',
      existingAccountOperator: null, existingAccountVariable: 'savings', annualIncomeOperator: '>=', annualIncomeVariable: '55000',
      children: [
        { id: 'r-12-c1', selected: false, ruleName: 'Existing account holder', dataAttribute: 'Asset', operator: '>=', amount: 0, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '40000', logicOperator: 'AND' },
        { id: 'r-12-c2', selected: false, ruleName: 'Account age 12+ months', dataAttribute: 'Income', operator: '>=', amount: 12, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '60000', logicOperator: 'AND' },
      ],
    },
    { id: 'r-13', selected: false, ruleName: 'High Utilization Denial', dataAttribute: 'Income', operator: '<', amount: 50000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: 'credit-card', annualIncomeOperator: '<', annualIncomeVariable: '75000' },
    { id: 'r-14', selected: false, ruleName: 'Self-Employed Review', dataAttribute: 'Income', operator: '>=', amount: 90000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '90000' },
    { id: 'r-15', selected: false, ruleName: 'Recent Inquiry Limit', dataAttribute: 'Income', operator: '>=', amount: 45000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '>=', annualIncomeVariable: '45000' },
    { id: 'r-16', selected: false, ruleName: 'Collections Flag Denial', dataAttribute: 'Income', operator: '>', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '20000' },
  ],
}

// Combined demo dataset — ?demo=1
// Primary tab: all complete rules (polished view)
// Secondary tab: mix of complete + incomplete rules (demonstrates the validation system)
// Override Rules tab: simple override rules
export const demoRulesets: Ruleset[] = [
  primaryDemoRuleset,
  {
    id: 'vrs-1',
    name: 'Secondary Ruleset',
    rules: [
      { id: 'vr-1', selected: false, ruleName: 'Premium Approval', dataAttribute: 'Income', operator: '>=', amount: 150000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '150000' },
      { id: 'vr-2', selected: false, ruleName: 'Low Income Denial', dataAttribute: 'Income', operator: null, amount: null, outcome: null, existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'vr-3', selected: false, ruleName: 'High Expense Rule', dataAttribute: 'Expense', operator: '>', amount: 50000, outcome: null, existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'vr-4', selected: false, ruleName: 'Moderate Income Approval', dataAttribute: 'Income', operator: '>=', amount: 40000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'savings', annualIncomeOperator: '>=', annualIncomeVariable: '40000' },
      { id: 'vr-6', selected: false, ruleName: 'Debt Ratio Check', dataAttribute: 'Income', operator: '<', amount: null, outcome: null, existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'vr-7', selected: false, ruleName: 'Prime Credit Fast Track', dataAttribute: 'Income', operator: '>=', amount: 80000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'money-market', annualIncomeOperator: '>=', annualIncomeVariable: '80000' },
      { id: 'vr-8', selected: false, ruleName: 'Low Expense Approval', dataAttribute: 'Expense', operator: '<=', amount: 15000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '<=', annualIncomeVariable: '15000' },
      { id: 'vr-9', selected: false, ruleName: 'Bankruptcy Flag Denial', dataAttribute: 'Income', operator: '=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '15000' },
      { id: 'vr-10', selected: false, ruleName: 'High Utilization Denial', dataAttribute: 'Income', operator: '<', amount: 50000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: 'credit-card', annualIncomeOperator: '<', annualIncomeVariable: '50000' },
      { id: 'vr-11', selected: false, ruleName: 'Loyal Customer Approval', dataAttribute: 'Income', operator: '>=', amount: 60000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'savings', annualIncomeOperator: '>=', annualIncomeVariable: '60000' },
    ],
  },
  {
    id: 'rs-3',
    name: 'Override Rules',
    rules: [
      { id: 'r-8', selected: false, ruleName: 'Manual Override Approval', dataAttribute: 'Income', operator: '>=', amount: 0, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '0' },
      { id: 'r-20', selected: false, ruleName: 'Fraud Flag Denial', dataAttribute: 'Income', operator: '>=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: '<', annualIncomeVariable: '500000' },
      { id: 'r-21', selected: false, ruleName: 'VIP Relationship Approval', dataAttribute: 'Income', operator: '>=', amount: 0, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'checking', annualIncomeOperator: '>=', annualIncomeVariable: '250000' },
    ],
  },
]

// Validation demo — shows the validation system in action.
// Rules are "touched" (have a name) but intentionally incomplete so the
// ValidationBanner and row-level warning icons are both visible.
export const validationRulesets: Ruleset[] = [
  {
    id: 'vrs-1',
    name: 'Primary Ruleset',
    rules: [
      // Complete — gives context for what a finished rule looks like
      { id: 'vr-1', selected: false, ruleName: 'Premium Approval', dataAttribute: 'Income', operator: '>=', amount: 150000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Touched, missing operator + amount + outcome — triggers warning triangle + amber row tint
      { id: 'vr-2', selected: false, ruleName: 'Low Income Denial', dataAttribute: 'Income', operator: null, amount: null, outcome: null, existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Touched, missing outcome only — partially filled, still invalid
      { id: 'vr-3', selected: false, ruleName: 'High Expense Rule', dataAttribute: 'Expense', operator: '>', amount: 50000, outcome: null, existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Complete
      { id: 'vr-4', selected: false, ruleName: 'Moderate Income Approval', dataAttribute: 'Income', operator: '>=', amount: 40000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Touched, missing amount + outcome
      { id: 'vr-6', selected: false, ruleName: 'Debt Ratio Check', dataAttribute: 'Income', operator: '<', amount: null, outcome: null, existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Complete
      { id: 'vr-7', selected: false, ruleName: 'Prime Credit Fast Track', dataAttribute: 'Income', operator: '>=', amount: 80000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Complete
      { id: 'vr-8', selected: false, ruleName: 'Low Expense Approval', dataAttribute: 'Expense', operator: '<=', amount: 15000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Complete
      { id: 'vr-9', selected: false, ruleName: 'Bankruptcy Flag Denial', dataAttribute: 'Income', operator: '=', amount: 0, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Complete
      { id: 'vr-10', selected: false, ruleName: 'High Utilization Denial', dataAttribute: 'Income', operator: '<', amount: 50000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      // Complete
      { id: 'vr-11', selected: false, ruleName: 'Loyal Customer Approval', dataAttribute: 'Income', operator: '>=', amount: 60000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: 'savings', annualIncomeOperator: null, annualIncomeVariable: '' },
    ],
  },
  {
    id: 'vrs-2',
    name: 'Secondary Ruleset',
    rules: [
      { id: 'vr-5', selected: false, ruleName: 'Premium Income Rule', dataAttribute: 'Income', operator: '>', amount: 100000, outcome: 'Approve', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
      { id: 'vr-12', selected: false, ruleName: 'Expense Threshold', dataAttribute: 'Expense', operator: '=', amount: 30000, outcome: 'Deny', existingAccountOperator: null, existingAccountVariable: '', annualIncomeOperator: null, annualIncomeVariable: '' },
    ],
  },
]
