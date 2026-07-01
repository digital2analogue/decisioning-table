# Testing Guide — decisioning-table

This guide explains how to run unit and visual regression tests for the decisioning table.

## Quick Start

```bash
# Install dependencies
npm install

# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:ui

# Run visual regression tests (requires dev server on http://localhost:5173)
npm run test:visual

# Run visual regression tests in headed mode
npx playwright test --headed
```

## Unit Testing (Vitest)

Unit tests validate individual components, utilities, and validation logic.

**Framework:** Vitest (modern, fast, ESM-first)  
**Test files:** `tests/unit/**/*.spec.ts`

### Testing components

```typescript
// tests/unit/RuleRow.spec.ts
import { describe, it, expect } from 'vitest'
import { isRuleValid, missingFields } from '../../src/types'

describe('Rule Validation', () => {
  it('identifies invalid rules', () => {
    const rule = { ruleName: '', dataAttribute: '', operator: null }
    expect(isRuleValid(rule)).toBe(false)
  })

  it('lists missing required fields', () => {
    const rule = { ruleName: 'My Rule', dataAttribute: '', operator: 'equals' }
    const missing = missingFields(rule)
    expect(missing).toContain('dataAttribute')
  })
})
```

### Run unit tests

```bash
# Run all unit tests
npm run test

# Run in watch mode (re-runs on file changes)
npm run test:ui

# Run with coverage
npm run test -- --coverage

# Run a specific test file
npm run test tests/unit/example.spec.ts
```

## Visual Regression Testing (Playwright)

Visual regression tests compare screenshots of the table against baselines to catch unintended visual changes — especially important for data-dense UIs.

**Framework:** Playwright (open-source, powerful)  
**Test files:** `tests/visual/**/*.spec.ts`

### How it works

1. **First run** — Playwright captures screenshots and saves them as baselines
2. **Subsequent runs** — New screenshots are compared. Differences fail the test.
3. **Review & approve** — If a change is intentional, update baselines with `--update-snapshots`

### Run visual tests

```bash
# Run all visual regression tests (dev server must be running)
npm run test:visual

# Run in headed mode (see browser)
npx playwright test --headed

# Update baselines after intentional visual changes
npm run test:visual -- --update-snapshots

# Run a specific test
npx playwright test app.spec.ts

# Debug with step-by-step execution
npx playwright test --debug
```

## Testing Complex Interactions

For the decisioning table's drag-and-drop and validation UI:

```typescript
test('drag-and-drop reorders rows', async ({ page }) => {
  await page.goto('/')
  
  // Drag first row to second position
  const firstRow = await page.locator('[data-rule-id="rule-1"]')
  await firstRow.drag('[data-rule-id="rule-2"]')
  
  // Take screenshot to verify visual change
  await expect(page).toHaveScreenshot('after-reorder.png')
})

test('validation error highlights invalid row', async ({ page }) => {
  await page.goto('/')
  
  // Add rule without required field
  await page.click('button:has-text("Add rule")')
  await page.locator('input[aria-invalid]').waitFor()
  
  // Snapshot shows visual error state
  await expect(page.locator('[data-rule-invalid]')).toHaveScreenshot('invalid-row.png')
})
```

## CI/CD Integration

Tests run in CI with:
- Single worker for visual test consistency
- 2 retries for flaky network conditions
- HTML reports in `test-results/`

## Best Practices

- **Snapshot before & after interactions** — Shows intent
- **Test state transitions** — Invalid → Valid, Expanded → Collapsed
- **Use data attributes** — Selectors like `[data-rule-id]` are more stable than classes
- **Review diffs carefully** — Visual regression catches design drift
- **Update baselines only for intentional changes**

## Troubleshooting

**Tests fail: "baseURL not responding"** — Start dev server: `npm run dev`

**Flaky visual tests** — Add explicit waits:
```typescript
await page.waitForLoadState('networkidle')
await page.locator('[role="table"]').isVisible()
```

**Snapshot mismatch after CSS change** — Review the diff, then:
```bash
npm run test:visual -- --update-snapshots
```
