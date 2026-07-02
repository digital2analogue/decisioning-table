# decisioning-table

Decision Model Table — a data-dense light-mode UI for building and managing decision rules. Sub-brand of the River Romney design system (decision-engine theme).

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # contrast check → tsc → vite build (contrast gate blocks on failure)
npm run check-contrast # Run WCAG AA check in isolation
npm run sync-tokens    # Compare local variables.css against the installed @digital2analogue2/parsimony package
npm run screenshots    # Puppeteer screenshot capture
npm run test           # Vitest unit tests (tests/unit — covers the src/types.ts validation helpers)
npm run test:visual    # Playwright visual regression (tests/visual; onboarding, ?demo=1 table, ?demo=validation states)
npm run test:visual:update # Regenerate baselines after intentional visual changes (prefer the CI workflow — see below)
```

## Testing & Automation

Vitest unit tests + Playwright visual regression run in CI (`.github/workflows/ci.yml`, jobs `checks` + `visual`, both blocking) and the pre-commit hook runs lint-staged + unit tests + the contrast gate.

**Visual baselines are generated ON the CI runner, never locally** — font rasterization differs across machines, so locally-generated baselines fail in CI. After an intentional visual change, run the "Update visual baselines" workflow from the Actions tab. `main` has branch protection requiring the `checks` and `visual` status checks; Dependabot files weekly grouped bumps and the `dependabot-automerge` workflow merges them once CI passes (major npm bumps stay manual).

## Token System

This repo consumes the decision-engine brand tokens from the published **`@digital2analogue2/parsimony`** npm package (built and published from the **brand-tokens** repo). It does not define its own color values.

### Source of truth hierarchy

```
brand-tokens/tokens/brands/decision-engine.tokens.json         ← edit here first
  ↓ build + publish (brand-tokens → @digital2analogue2/parsimony on npm)
node_modules/@digital2analogue2/parsimony/decision-engine.css  ← installed brand build
  ↓ sync-tokens compares against
src/tokens/variables.css                                       ← local flat CSS, consumed by Tailwind + components
```

**Hard rule: `variables.css` is a sync target, not a place to define tokens.**

The flow is always: **brand-tokens → publish parsimony → npm install → variables.css**. Never the reverse.

- **Never define a new color token in `variables.css` directly.** If you need a new token, add it to `brand-tokens/tokens/brands/decision-engine.tokens.json`, publish a new `@digital2analogue2/parsimony` version, `npm install` it, then copy the resolved value into `variables.css`.
- **Never write a hex value, `color-mix()`, or `var()` expression into `variables.css` for a new token.** If it's not in brand-tokens first, it doesn't exist.
- If a token is needed urgently mid-session, you may add it locally with `/* TODO: move to brand-tokens */` — but treat this as a debt marker, not a pattern. The next thing you do is add it properly to brand-tokens and remove the comment.
- After any token work, run `npm run sync-tokens` (it diffs `variables.css` against the installed `@digital2analogue2/parsimony` package). The expected output is the drift set documented below; anything outside it is a bug.

### Known drifts vs the published brand

`sync-tokens` diffs `variables.css` against the published `@digital2analogue2/parsimony`
decision-engine build. The brand has drifted from this live prototype; the broad
reconciliation (brand should adopt the prototype's light-mode values) is tracked in
**brand-tokens#70**. Until that lands, the drifts below are expected. Do not "fix" the
intentional ones by syncing them to brand values — that would break the light theme.

**Arctic light-mode surfaces (bluer tint — intentional):**
- `--color-background-default` — local `#f5f8fc` vs brand `#ffffff`
- `--color-background-alt` — local `#ebf0f8` vs brand `#f5f6f7`
- `--color-background-elevated` — local `#f0f4fa` vs brand `#ffffff`

**Cooler-gray borders (intentional):**
- `--color-border-default` — local `#c8d6ea` vs brand `#d8dce0`
- `--color-border-elevated` — local `#b0c4d8` vs brand `#c0c4ce`
- `--color-border-muted` — local `#d8e4f0` vs brand `#e8eaed`

**Light-mode contrast override (intentional):**
- `--color-foreground-on-warning` — local `#1a1a2e` (dark navy) vs brand `#ffffff`. White-on-amber would fail AA here.

**Stale — prototype is behind the brand (fix forward, NOT a keep):**
- `--color-background-danger` — local `#d03027` vs brand `#c8002e`. Brand was intentionally moved to red.600 for DE button contrast; `variables.css` should adopt `#c8002e` (brand-tokens#70 §B).

(Cosmetic-only, not counted: `--shadow-none` differs syntactically — `0 0 0 0 transparent` locally vs `0 0 0 0 rgba(0,0,0,0)` upstream — but resolves to the same paint.)

`sync-tokens` also lists local-only color tokens (not yet in the brand) and brand-only
tokens (unused here) as informational — these are catalogued in brand-tokens#70 (§D/§E).
If `sync-tokens` reports drifts outside this list, investigate.

## Contrast Gate

`scripts/check-contrast.mjs` runs before every build. It validates every text/background color pairing in the UI against WCAG AA (4.5:1 minimum).

**When you add a new color pairing to the UI, you must add it to the `PAIRINGS` array in `scripts/check-contrast.mjs`.** The build will not catch it otherwise — the gate only checks what's in the manifest.

Format:
```js
{ text: '--color-foreground-default', bg: WHITE, label: 'My new component label' }
```

`bg` can be a token name, a resolved hex string, or a `resolveColorMix()` call for computed backgrounds.

## Architecture

- **React 19 + Vite 8** — no framework router, single-page app
- **Tailwind CSS v4** — utility layer; design tokens bridged via `@theme inline` in CSS
- **Radix UI primitives** — Dialog, Dropdown, Select, Tabs, Checkbox (in deps; not all wired up)
- **react-dnd** — drag-and-drop for rule row reordering
- CSS namespace conventions: `dt-` (decisioning table), `ob-` (onboarding flow)

## Design Tokens in CSS

All color is via CSS custom properties from `src/tokens/variables.css`. Components use class names defined in `src/index.css` — inline style overrides are rare and must use token variables, never hex values.

**Cascade-layer trap (real, recurring):** `src/index.css` wraps component rules in `@layer components`. Per CSS layer cascade, **unlayered rules beat layered rules regardless of selector specificity.** If you add a global rule (`input::placeholder`, `select option`, etc.) outside the layer, it will silently override any in-layer override even with stronger selectors. **Keep all rules inside `@layer components`** unless you explicitly want a higher cascade priority.

## Sub-Brand Reference

For decision-engine token values, read the installed `node_modules/@digital2analogue2/parsimony/decision-engine.css` directly (or the source in `brand-tokens/build/css/decision-engine.css`). The brand-tokens `ai/DESIGN.md` covers the base dark theme only.

## Patterns & Conventions

### Validation system
- Required fields per Rule: `ruleName`, `dataAttribute`, `operator`, `amount`, `outcome` (parents only — children inherit outcome). Conditional fields are **optional** — they're scoping refinements, not preconditions.
- Helpers live in [src/types.ts](src/types.ts): `isRuleValid()`, `isChildRuleValid()`, `isReadyForOutcome()`, `missingFields()`.
- Invalid rule → row gets `data-rule-invalid="true"` + `aria-invalid="true"` on the `<tr>`. Two paired visual signals: warning triangle replaces the row number in the `#` column, AND the row gains a `--color-background-warning-subtle` tint. Selected state still wins (rows can be both invalid and selected; user choice trumps).
- `ValidationBanner` (page-width amber) at top of page: counts incomplete rules in the active ruleset, "Jump to first incomplete →" CTA scrolls to first invalid row by `data-rule-id` and focuses its first empty input.

### Draft rules
- New rules from `addRule()` / `addChild()` start with all required fields null/empty. The user fills in cells as they go.
- "Untouched draft" rows auto-cleanup on focusout if `relatedTarget` is outside the row AND no fields have been touched (see `isEmptyDraft()` in `RuleRow.tsx`).
- `autoFocusRuleId` flows DecisioningEngine → DecisioningTable → RuleRow/ChildRuleRow as a per-id marker; the matching row focuses its name input on mount and clears the marker.

### Add affordances (4 entry points by design)
- **Top split-button** (`+ Add rule` blue) — primary CTA in the page header
- **Bottom chromeless `+ Add rule` row** — sits in the tbody after the last rule, table-wide context
- **Per-parent inline `+ Add sub-condition` row** — at the bottom of the expanded children group; chromeless, no tree connector
- **Parent overflow menu → "Add sub-condition"** — always available, handles the no-children-yet case (parent has no expand chevron). Auto-expands the parent.

### Toast + undo
Destructive actions (delete rule, delete sub-condition) capture the removed item + position and show a `Toast` with an Undo action. Undo restores at the original index. See `DecisioningTable.tsx` `deleteRule` / `deleteChild`.

### State coverage recipe
Every interactive element should have rest, hover, focus-visible, and (if the action is destructive or stateful) active. Focus-visible recipes:
- **Standard outset ring** (most elements): `outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-background-action) 18%, transparent);` (use `--color-foreground-danger` 18% for destructive elements).
- **Inset ring** (elements inside `overflow: hidden` parents OR with existing depth shadows): `outline: none; box-shadow: inset 0 0 0 2px var(--color-border-focus);` (e.g., `.dt-outcome-seg-btn`, `.dt-conditional-dropdown-item`).
- Always use `:focus-visible` (not `:focus`) so mouse clicks don't trigger the ring.

### Empty / draft picker styling
Dashed border + muted text on `.dt-*-empty` modifier (`.dt-badge-empty`, `.dt-select-trigger-empty`, `.dt-conditional-operator.dt-conditional-operator-empty`). Hover transitions to action color + accent-blue tint.

### Active dropdown item
`.dt-conditional-dropdown-item-active` uses `--color-background-accent-blue` bg + `--color-foreground-action` text — distinct from hover (`bg-alt`). Used uniformly across every picker.

### Row rail intensity hierarchy
Three semantically distinct states with three visual weights, all on `td:first-child` via `box-shadow: inset 3px 0 0 ...`:
1. **Hover** (transient, only fires on rows that aren't selected/expanded): `color-mix(action 50%, transparent)`
2. **Expanded** (structural state): `color-mix(action 70%, transparent)`
3. **Selected** (strongest, user-driven): solid `var(--color-foreground-action)`

## Components inventory

**Atoms** ([src/components/atoms/](src/components/atoms/)): `IconButton`, `Checkbox`, `Badge` (`AttributeSelectBadge`, `OutcomeBadge`), `AmountCell`

**Molecules** ([src/components/molecules/](src/components/molecules/)): `RuleRow`, `ChildRuleRow`, `OperatorSelect`, `LogicOperatorSelect`, `ConditionalCell`, `ActionsMenu`, `Toast`, `ValidationBanner`, `OperatorSelect`, `TabItem`, `ToolbarActions`

**Organisms** ([src/components/organisms/](src/components/organisms/)): `DecisioningTable`, `RulesetTabs`

**Templates** ([src/components/templates/](src/components/templates/)): `DecisioningEngine`, `OnboardingFlow`

## Known follow-ups (not bugs, just deferred)

- **Data Element schema is incomplete.** Per the product spec ("Select data element(s)" modal), each `DataElement` has `Status`, `Description`, `Datatype`, `Attribute Path`, `Valid Values`, `Exception Values`. Current `DataElement` type in [src/types.ts](src/types.ts) has only `id`, `label`, `description`, `dataType`, `attributePath`, `category` — missing `status`, `validValues`, `exceptionValues`. Add when wiring the data-element selector modal.
- **Stale field naming.** `existingAccountVariable` / `annualIncomeVariable` on `Rule` should conceptually be `existingAccountDataElement` / `annualIncomeDataElement` per the data model. Worth a rename pass when next touching this surface.
- **TODO-marked local tokens.** Three tokens in [src/tokens/variables.css](src/tokens/variables.css) are flagged `/* TODO: move to brand-tokens */`: `--color-background-warning-subtle`, `--color-foreground-warning-dark`, `--shadow-md`, `--color-foreground-inactive`. Plus three composite shadow tokens (`--shadow-inset-trough`, `--shadow-segment-raised`, `--shadow-footer-up`). Backport when stable.
- **Save-gating decision deferred.** Validation banner currently counts invalid rules but doesn't block the (nonexistent) save action. When a save flow lands, decide: block save with banner-only warning, or block save with a modal confirmation.
- **No keyboard nav inside `ActionsMenu` dropdown.** Items have hover/focus-visible/active states but no arrow-key navigation, focus trap, or auto-focus first item on open. The audit recommended adopting Radix `DropdownMenu` (already in deps) for a clean fix — ~30 min vs ~4 hr to roll your own correctly. Same applies to the other portal-based pickers (`OperatorSelect`, `LogicOperatorSelect`, `ConditionalCell`).
- **Drag-and-drop polish.** Drop indicator is a single 2px top border. Drag preview is `opacity: 0.4` with no "lift" effect. No edge auto-scroll. Out of scope for this work; its own session.
