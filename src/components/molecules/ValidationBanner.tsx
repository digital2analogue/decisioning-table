import { AlertTriangleIcon } from 'lucide-react'
import type { Ruleset } from '../../types'
import { isRuleValid, isChildRuleValid, isRuleTouched } from '../../types'

export interface ValidationBannerProps {
  ruleset: Ruleset
}

interface InvalidRef {
  ruleId: string
  isChild: boolean
}

/** Walks the active ruleset and returns every invalid rule (parent or child) in display order. */
function collectInvalid(ruleset: Ruleset): InvalidRef[] {
  const out: InvalidRef[] = []
  for (const rule of ruleset.rules) {
    // Untouched draft rules are skipped — a brand-new "+ Add rule" with no
    // input shouldn't show as invalid. Once any field is set the rule is
    // considered intentional and validation kicks in.
    if (isRuleTouched(rule) && !isRuleValid(rule)) out.push({ ruleId: rule.id, isChild: false })
    for (const child of rule.children ?? []) {
      if (isRuleTouched(child) && !isChildRuleValid(child)) out.push({ ruleId: child.id, isChild: true })
    }
  }
  return out
}

/**
 * Page-level amber alert summarizing invalid (incomplete) rules in the active
 * ruleset. CTA scrolls to the first problematic row and focuses its first
 * empty cell. Hidden when every rule is valid.
 */
export function ValidationBanner({ ruleset }: ValidationBannerProps) {
  const invalid = collectInvalid(ruleset)
  if (invalid.length === 0) return null

  const first = invalid[0]
  const count = invalid.length
  const noun = count === 1 ? 'rule' : 'rules'

  function scrollToFirst() {
    const row = document.querySelector<HTMLTableRowElement>(`[data-rule-id="${first.ruleId}"]`)
    if (!row) return
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the first empty input/button inside the row so the user can start typing.
    // We retry after the smooth scroll has had time to settle.
    window.setTimeout(() => {
      const target = row.querySelector<HTMLElement>(
        'input:placeholder-shown, [class*="-empty"], [aria-expanded="false"]',
      )
      target?.focus()
    }, 350)
  }

  return (
    <div role="alert" className="dt-validation-banner">
      <span className="dt-validation-banner-icon" aria-hidden="true">
        <AlertTriangleIcon size={14} strokeWidth={2} />
      </span>
      <p className="dt-validation-banner-text">
        <strong><span className="dt-metric">{count}</span> incomplete {noun}</strong> must be filled in before this decision model can run.{' '}
        <button type="button" onClick={scrollToFirst} className="dt-validation-banner-cta">
          Fix incomplete rules
        </button>
      </p>
    </div>
  )
}
