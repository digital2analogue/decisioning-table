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

**Visual baselines are generated ON the CI runner, never locally** — font rasterization differs across machines, so locally-generated baselines fail in CI. After an intentional visual change, run the "Update visual baselines" workflow from the Actions tab — **after your final push to the branch**: the workflow commits back to the branch it ran on, so pushing mid-run races its push (it now rebases + retries, but the run it raced on 2026-07-02 failed; dispatch it last and let it finish). `main` has branch protection requiring the `checks` and `visual` status checks; Dependabot files weekly grouped bumps and the `dependabot-automerge` workflow merges them once CI passes (major npm bumps stay manual — and note `@dependabot` commands posted via API integrations are ignored; use the GitHub UI).

## Token System

This repo consumes the decision-engine brand tokens from the published **`@digital2analogue2/parsimony`** npm package (built and published from the **brand-tokens** repo). It does not define its own color values.

**Agent context packs:** the installed package ships compiled agent context — start at
`node_modules/@digital2analogue2/parsimony/context/system.md` (rules + brand map), with
per-component contracts in `context/components/<tag>.md` and the full token catalog in
`tokens.json`. Prefer these over guessing token names or re-deriving rules from prose.

### Source of truth hierarchy

```
brand-tokens/tokens/brands/decision-engine.tokens.json             ← edit here first
  ↓ build + publish (brand-tokens → @digital2analogue2/parsimony on npm)
node_modules/@digital2analogue2/parsimony/css/decision-engine.css  ← imported directly by src/index.css
  ↓ layered under
src/tokens/variables.css                                           ← app-local overlay only
```

`src/index.css` imports the brand build first, then `variables.css`. The brand build is
the *only* place colour is defined; `variables.css` is an overlay for things the design
system has no opinion on (layout, stacking, control heights, column widths, app-specific
composite shadows) plus a shrinking set of parallel vocabularies still being migrated
(issue #61).

**Hard rule: never define a colour in `variables.css`.** Colour that is not in
brand-tokens does not exist. If you need one, add it to
`brand-tokens/tokens/brands/decision-engine.tokens.json`, publish a new
`@digital2analogue2/parsimony`, then `npm install` — no copying required, the app picks
it up from the import.

**Never re-declare a token the brand already names.** A local copy at the same value is
dead weight that goes stale silently; a local copy at a different value is drift that
wins at runtime. `sync-tokens` reports both.

### The one exception: intentional overrides

When an upstream fix is *merged but not yet published*, this app can legitimately run
ahead of the package. That is the only sanctioned reason for a colour in `variables.css`,
and it comes with obligations:

- Put it in the **intentional-overrides block** at the top of `variables.css`, with a
  comment naming the upstream change that retires it.
- Add a matching entry to `INTENTIONAL_OVERRIDES` in `scripts/sync-tokens.mjs`.
- **Delete both the moment the package catches up.** `sync-tokens` watches for this: once
  upstream matches, the override is reported as *stale* rather than quietly accepted.

This exists so the drift check stays meaningful. The alternative — switching drift
detection off for a token — is what lets a temporary override become permanent.

### `npm run sync-tokens`

Compares the imported brand build against the `variables.css` overlay and reports:

1. **drift** — declared in both with different resolved values. Always a bug; exits 1.
2. **shadowed** — declared in both at the same value. Delete the local copy.
3. **local-only** — not named by the brand. Layout/stacking/app shadows stay by design;
   the parallel vocabularies are migration debt tracked in #61.
4. **intentional / stale** — the allowlisted overrides above. Intentional ones don't fail
   the check; stale ones tell you to delete the override.

Pass `--verbose` to also list brand semantic tokens this app doesn't shadow.

**Status as of `@digital2analogue2/parsimony@0.7.0`:** zero drift, zero shadowed,
**56 local-only**, **1 intentional override**. Of the 56, 22 are genuinely app-local and
`--easing-spring` has no brand equivalent; the remaining 33 are the `--space-*` /
`--font-*` / `--letter-spacing-*` / `--shadow-sm|md|xl` / `--radius-pill` families
awaiting the #61 migration steps. The override is `--color-foreground-alt`
(#60 / parsimony#217).

**Motion is migrated (#61 step 2).** Use `--motion-duration-instant|standard|emphasized`
and `--motion-easing-default|enter|exit|move` — never a local duration. The brand zeroes
`--motion-duration-*` under `prefers-reduced-motion`, so a local duration token silently
opts that surface out of the WCAG 2.3.3 guarantee. Note the brand names easings by
**purpose, not curve**: `enter` is ease-out and `exit` is ease-in, so do not map by name
similarity.

One known dangling reference pre-dating the parsimony adoption: `--font-size-2xs`,
referenced in a comment next to a hardcoded `10px`; the brand now has
`--primitive-font-size-2xs: 0.625rem`, which is the fix. (The other one,
`--color-border-subtle`, is fixed in #63.)

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
- **dnd-kit** (`@dnd-kit/core` + `/sortable` + `/utilities` + `/modifiers`) — rule-row reorder with
  pointer + touch + keyboard sensors (migrated from react-dnd, whose HTML5 backend was mouse-only and
  broke on mobile — see `docs/decisions.md`). Sensors, `DndContext`/`SortableContext`, and `onDragEnd`
  live in `DecisioningTable.tsx`; each `RuleRow` is a `useSortable` item with the grip as activator.
- CSS namespace conventions: `dt-` (decisioning table), `ob-` (onboarding flow)

## Design Tokens in CSS

All color is via CSS custom properties from the imported `@digital2analogue2/parsimony/decision-engine.css`. Components use class names defined in `src/index.css` — inline style overrides are rare and must use token variables, never hex values.

**Cascade-layer trap (real, recurring):** `src/index.css` wraps component rules in `@layer components`. Per CSS layer cascade, **unlayered rules beat layered rules regardless of selector specificity.** If you add a global rule (`input::placeholder`, `select option`, etc.) outside the layer, it will silently override any in-layer override even with stronger selectors. **Keep all rules inside `@layer components`** unless you explicitly want a higher cascade priority.

## Sub-Brand Reference

For decision-engine token values, read the installed `node_modules/@digital2analogue2/parsimony/css/decision-engine.css` directly (or the source in `brand-tokens/build/css/decision-engine.css`). The brand-tokens `ai/DESIGN.md` covers the base dark theme only.

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
- **Parsimony adoption is partway done (issue #61).** Colour, radius, the font compositions, letter-spacing and motion now come from the package. Still to migrate, one family per PR: spacing (`--space-*` → `--spacing-*`), type (`--font-size-*` / `--font-weight-*` / `--font-line-height-*` / `--font-family-body|display` / `--letter-spacing-tight|normal|wide`), then shadow/radius (`--shadow-sm|md|xl`, `--radius-pill`). Two known non-clean mappings to resolve rather than paper over: `--font-size-xl` (1.75rem) has no brand primitive — the ramp jumps 1.5rem → 2rem — and `--letter-spacing-tight` is -0.015em against the brand's -0.01em.
- **`--easing-spring` has no brand equivalent.** The one motion token left in [src/tokens/variables.css](src/tokens/variables.css) after #61 step 2 — the brand's easing set (default/enter/exit/move) has no overshoot curve. Promote it to brand-tokens (motion) or it stays local indefinitely.
- **Save-gating decision deferred.** Validation banner currently counts invalid rules but doesn't block the (nonexistent) save action. When a save flow lands, decide: block save with banner-only warning, or block save with a modal confirmation.
- **No keyboard nav inside `ActionsMenu` dropdown.** Items have hover/focus-visible/active states but no arrow-key navigation, focus trap, or auto-focus first item on open. The audit recommended adopting Radix `DropdownMenu` (already in deps) for a clean fix — ~30 min vs ~4 hr to roll your own correctly. Same applies to the other portal-based pickers (`OperatorSelect`, `LogicOperatorSelect`, `ConditionalCell`).
- **Drag-and-drop edge auto-scroll.** dnd-kit's `AutoScroll` is on by default within the scroll
  container; if long rulesets need window-level auto-scroll during a drag, tune the `autoScroll` prop
  on `DndContext`. (The lift, spring reflow, and touch/keyboard support landed with the dnd-kit
  migration — see `docs/decisions.md`.)
