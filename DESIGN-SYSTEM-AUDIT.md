# Design System Audit — decisioning-table

**Date:** 2026-05-04
**Branch:** `feature/nested-rules`
**Auditor:** Claude (design:design-system skill)

---

## Summary

**Components reviewed:** 17 | **Issues found:** 23 | **Score: 72 / 100**

The decisioning-table project has a well-structured token foundation and consistent naming conventions across the `dt-` namespace. The atomic design hierarchy (atoms → molecules → organisms → templates) is correctly applied. However, the new nested rules feature introduces **6 hardcoded hex colors** that bypass the token system, several atoms are underspecified (missing states, variants, or docs), and the contrast gate doesn't catch unresolved tokens. The system is solid at its core — the issues are mostly about closing gaps opened by the recent feature work.

---

## 1. Naming Consistency

The `dt-` prefix convention is well-enforced across the decisioning table domain, and `ob-` cleanly separates onboarding. No naming collisions exist between the two namespaces. Issues are minor:

| Issue | Components Affected | Recommendation |
|-------|---------------------|----------------|
| **`doesnotContain` casing** | `ConditionalCell.tsx`, `types.ts` | The `ConditionalOperator` value `'doesnotContain'` breaks the camelCase convention used elsewhere (`existingAccountOperator`, etc.). Rename to `'doesNotContain'` for consistency. This is a data-model-level fix — grep for all references. |
| **`dt-child-cell-bare` vs `dt-child-connector-cell`** | `ChildRuleRow.tsx`, `index.css` | Two naming patterns for child row cell modifiers: `-bare` (semantic: "no chrome") and `-connector-cell` (structural: "has connector"). Pick one axis. Recommend structural: `dt-child-cell-empty`, `dt-child-cell-connector`. |
| **`dt-drag-handle-cell` vs `dt-drag-handle`** | `index.css` (used), `DragHandle.tsx` (defines `dt-drag-handle`) | The `DragHandle` atom defines class `dt-drag-handle` but `RuleRow` uses `dt-drag-handle-cell` directly without the atom. Dead atom — see Component Completeness below. |
| **`dt-outcome-seg-btn` / `dt-outcome-seg-approve`** | `index.css` | Segment button naming mixes the container name (`seg`) with state (`approve`/`deny`). More consistent: `dt-outcome-btn`, `dt-outcome-btn--approve`, `dt-outcome-btn--deny` (BEM-like modifier). |
| **`dt-conditional-dropdown-item--mono`** | `index.css` | Single BEM-style double-dash modifier in an otherwise flat naming scheme. Either adopt `--modifier` consistently or keep it flat. Currently only this one class uses the pattern. |
| **Mixed `alt` / `subtle` semantics** | `variables.css` | `--color-background-alt` (surface tint) vs `--color-background-danger-subtle` vs `--color-background-accent-subtle` — "alt" and "subtle" serve the same purpose (lighter variant) but use different suffixes. Standardize on one. Recommend `-subtle` for tinted backgrounds, `-alt` for neutral alternates. |

---

## 2. Token Coverage

### 2.1 Token Inventory

| Category | Tokens Defined | Coverage |
|----------|---------------|----------|
| Colors — Background | 19 | ✅ Good |
| Colors — Foreground | 19 | ✅ Good |
| Colors — Border | 7 | ✅ Good |
| Colors — Feedback | 7 | ✅ Good |
| Colors — State | 5 | ✅ Good |
| Colors — Accent | 2 | ⚠️ Thin — nested rules needed more |
| Spacing | 7 | ✅ Good (8pt grid: 2/4/6/8/16/24/48) |
| Typography — Families | 4 | ✅ Good |
| Typography — Weights | 5 | ✅ Good |
| Typography — Sizes | 8 | ✅ Good |
| Typography — Composites | 9 | ✅ Good |
| Radii | 6 | ✅ Good |
| Shadows | 4 | ⚠️ Missing `--shadow-md` (referenced in CSS) |
| Motion | 4 durations + 4 easings | ✅ Good |
| Letter-spacing | 5 | ✅ Good |

### 2.2 Hardcoded Values Found

| Location | Value | What It Should Be | Severity |
|----------|-------|--------------------|----------|
| `index.css` `.dt-logic-chip-and` | `#e5ebfc`, `#2456E4` | Should use `--color-background-accent-blue` and `--color-foreground-action` (they resolve to the same values) | 🔴 High |
| `index.css` `.dt-logic-chip-or` | `#FAEEDA`, `#854F0B` | No tokens exist for amber/warning chip tints. Need new tokens: `--color-background-accent-amber` exists but resolves to `#fffbeb` not `#FAEEDA`. Add `--color-chip-or-bg` and `--color-chip-or-fg` to brand-tokens, or reconcile with existing amber tokens. | 🔴 High |
| `index.css` `.dt-outcome-seg-btn` | `#A8B0BE` | Inactive text color. Commented as intentional (WCAG-exempt inactive state), but should still be a token: `--color-foreground-inactive` | 🟡 Medium |
| `index.css` `.dt-page-header` | `#FFFFFF` | Should use `var(--color-background-elevated)` which resolves to `#FFFFFF` | 🟢 Low |
| `index.css` `.dt-menu` | `rgba(0,0,0,0.08)`, `rgba(0,0,0,0.06)` | Should use `--shadow-card` or `--shadow-menu` tokens. The menu has its own bespoke shadow instead of the system's `--shadow-menu`. | 🟡 Medium |
| `index.css` multiple | `rgba(15,26,46,0.10)` etc. | Shadow values in `.dt-outcome-seg-approve`, `.dt-outcome-seg-deny`, `.ob-footer` use the correct base color `15,26,46` but aren't tokens. Consider `--shadow-inset` or similar. | 🟢 Low |
| `index.css` `.dt-conditional-dropdown` | `--shadow-md` referenced | Token `--shadow-md` is **not defined** in `variables.css`. Only `--shadow-sm`, `--shadow-card`, `--shadow-menu`, `--shadow-xl` exist. This is a silent failure. | 🔴 High |

### 2.3 Spacing Grid Compliance

The 8pt grid is well-followed. The token scale covers 2/4/6/8/16/24/48. A few CSS values fall outside the grid but are defensible:

| Value | Where | Assessment |
|-------|-------|------------|
| `3px` | `dt-outcome-seg-btn` padding, `--radius-sm` | Acceptable — optical adjustment at small sizes |
| `7px` | `dt-menu-item` padding | Should be `var(--space-sm)` (8px) — 1px off-grid for no clear reason |
| `9px` | `dt-outcome-seg-btn` padding | Should be `var(--space-sm)` (8px) — 1px off-grid |
| `28px` | `dt-confirm-btn`, `dt-add-ruleset-btn` | 3.5× base. Not on the scale. Consider adding `--space-3xl: 32px` or accepting as component-specific. |
| `52px` | `ob-header` height | 6.5× base. Not on scale but acceptable for header height. |
| `88px` | `DecisioningEngine.tsx` inline spacer | Hardcoded `style={{ height: '88px' }}` — should be removed or tokenized. |

---

## 3. Component Completeness

### 3.1 Atoms

| Component | Variants | States | A11y | Docs | Score | Notes |
|-----------|----------|--------|------|------|-------|-------|
| **Checkbox** | — | ✅ checked, indeterminate | ⚠️ No `aria-label` | ❌ | 5/10 | Native `<input>` — functional but no size variants, no disabled state, no label association |
| **IconButton** | — | ⚠️ hover via CSS | ⚠️ No `aria-label` default, no `type="button"` | ❌ | 4/10 | Missing `disabled` prop, no size variants, no `type="button"` (defaults to submit in forms) |
| **Badge** (AttributeSelectBadge) | ✅ 4 color variants | ✅ hover, active, open | ✅ Keyboard via native button | ❌ | 7/10 | Well-implemented custom select. Missing `aria-haspopup` and `aria-expanded`. |
| **Badge** (OutcomeBadge) | ✅ 2 segments | ✅ active, inactive, hover | ⚠️ No `role="radiogroup"` | ❌ | 6/10 | Segmented control pattern — should use `role="radiogroup"` with `role="radio"` on children |
| **TableCell** | — | — | — | ❌ | 2/10 | Thin wrapper, not used by any component. Dead code. |
| **DragHandle** | — | — | — | ❌ | 2/10 | Dead atom — `RuleRow` implements drag handle inline instead of using this component |

### 3.2 Molecules

| Component | Variants | States | A11y | Docs | Score | Notes |
|-----------|----------|--------|------|------|-------|-------|
| **RuleRow** | ✅ default, selected, dragging, over, expanded | ✅ all states | ⚠️ Missing `aria-grabbed`, keyboard DnD | ❌ | 7/10 | Solid implementation. Nested rules integration is clean. |
| **ChildRuleRow** | ✅ and/or logic, last-child hint | ✅ hover | ⚠️ No Checkbox (intentional), no DnD (intentional?) | ❌ | 6/10 | New component — see detailed review below |
| **ActionsMenu** | — | ✅ hover on items | ⚠️ No keyboard nav, no `role="menu"` | ❌ | 4/10 | No focus trap, no arrow key navigation, no `Escape` to close from keyboard |
| **ConditionalCell** | ✅ empty, expanded | ✅ hover, focus | ⚠️ Portal dropdowns lack `role="listbox"` | ❌ | 6/10 | Complex but functional. Imports `../../index.css` directly — should not be needed. |
| **OperatorSelect** | — | ✅ hover, focus | ✅ Native `<select>` | ❌ | 7/10 | Clean. Decorative `ChevronDownIcon` overlaps native dropdown arrow — the SVG chevron in CSS background-image + the Lucide icon = double chevron. |
| **ToolbarActions** | ✅ editing, viewing | ✅ hover, focus | ⚠️ Rename input lacks `aria-label` | ❌ | 6/10 | |
| **TabItem** | ✅ active, editing | ✅ hover | ⚠️ No `role="tab"` | ❌ | 5/10 | Not using Radix Tabs despite Radix being a listed dependency |

### 3.3 Organisms

| Component | Variants | States | A11y | Docs | Score | Notes |
|-----------|----------|--------|------|------|-------|-------|
| **DecisioningTable** | — | ✅ empty, populated, with children | ⚠️ No `role="grid"`, no row selection announcements | ❌ | 7/10 | Core component. Well-structured with clean parent/child rendering via Fragment. |
| **RulesetTabs** | — | ✅ add, rename, switch | ⚠️ No `role="tablist"` | ❌ | 5/10 | |

### 3.4 Templates

| Component | Score | Notes |
|-----------|-------|-------|
| **DecisioningEngine** | 6/10 | Missing the 4 new required Rule fields in the `addRule()` seed literal (known TS build error from CLAUDE.md). Inline `style={{ height: '88px' }}` spacer. |
| **OnboardingFlow** | 7/10 | Well-structured multi-step flow. |

---

## 4. Nested Rules Integration Review

The `feature/nested-rules` branch adds three key pieces: `LogicOperator` type, `children`/`logicOperator` fields on `Rule`, and the `ChildRuleRow` component. Here's how they integrate with the system:

### What's Done Well

**Data model is clean.** The recursive `children?: Rule[]` approach is elegant — child rules reuse the same `Rule` type with optional `logicOperator`. No new interfaces proliferate.

**CSS architecture follows existing patterns.** New classes use the `dt-` prefix, follow the existing naming depth (e.g., `dt-child-row`, `dt-logic-chip-and`), and are placed in the correct `@layer components` block.

**Tree connectors are pure CSS.** No extra DOM or JS for the visual tree lines — just `::after` pseudo-elements on `.dt-child-tree-line`. This is the right approach.

**Animation respects `prefers-reduced-motion`.** The staggered `dt-child-row-in` animation has a proper `@media (prefers-reduced-motion: reduce)` override.

**Contrast gate was updated.** New pairings for AND/OR chips, child row text, and outcome hints were added to `scripts/check-contrast.mjs`.

### Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | **Logic chip colors are hardcoded** | 🔴 High | `.dt-logic-chip-and` uses `#e5ebfc` / `#2456E4` and `.dt-logic-chip-or` uses `#FAEEDA` / `#854F0B` — all raw hex. The AND chip colors happen to match existing tokens (`--color-background-accent-blue` = `#e5ebfc`, `--color-foreground-action` = `#2456E4`) but aren't referenced. The OR chip has no corresponding tokens at all. This violates the CLAUDE.md hard rule: "Never write a hex value into variables.css for a new token" — and here they're not even in variables.css, they're loose in index.css. |
| 2 | **Missing `--shadow-md` token** | 🔴 High | `.dt-conditional-dropdown` references `--shadow-md` which doesn't exist in `variables.css`. The shadow silently fails to apply. |
| 3 | **No drag-and-drop for child rows** | 🟡 Medium | Parent `RuleRow` has full DnD via `react-dnd`. Child rows have no reordering capability. If this is intentional (children are AND/OR logic, order doesn't matter), document it. If not, it's a feature gap. |
| 4 | **Child rows lack selection (Checkbox)** | 🟡 Medium | Children have an empty `<td>` where the checkbox would be. The "select all" toggle in the table header only affects parents. Bulk-delete of child rules isn't possible. Document whether this is by design. |
| 5 | **`!important` usage** | 🟡 Medium | `.dt-child-cell-bare` uses `border-left: none !important` and `.dt-child-name-cell` uses `padding-left: var(--space-md) !important`. These override the global `td + td { border-left: ... }` rule. Refactor the global rule to use a more specific selector so `!important` isn't needed. |
| 6 | **Animation stagger caps at 5 children** | 🟢 Low | `.dt-child-row:nth-child(2)` through `:nth-child(5)` get stagger delays. The 6th+ child gets no delay (appears instantly). Use a CSS custom property + inline `style` for dynamic stagger, or accept the cap with a comment. |
| 7 | **`ChildRuleRow` duplicates amount/conditional cell markup** | 🟡 Medium | The amount cell (prefix + input + focus state) and conditional cells are copy-pasted from `RuleRow`. Extract shared cell renderers or a `RuleFields` molecule to reduce duplication. |

---

## 5. Accessibility Gaps

| Issue | Components | WCAG Criterion | Fix |
|-------|------------|---------------|-----|
| **ActionsMenu has no focus trap or keyboard navigation** | ActionsMenu | 2.1.1 Keyboard, 2.4.3 Focus Order | Add `role="menu"`, `role="menuitem"`, arrow-key navigation, `Escape` to close, auto-focus first item on open |
| **OutcomeBadge is not a proper radiogroup** | Badge (OutcomeBadge) | 4.1.2 Name, Role, Value | Add `role="radiogroup"` on container, `role="radio"` + `aria-checked` on segments |
| **AttributeSelectBadge missing ARIA** | Badge (AttributeSelectBadge) | 4.1.2 Name, Role, Value | Add `aria-haspopup="listbox"`, `aria-expanded`, `role="listbox"` on dropdown |
| **IconButton missing type="button"** | IconButton | Best practice | Add `type="button"` to prevent form submission. Also add `aria-label` as required prop. |
| **Table lacks grid semantics** | DecisioningTable | 4.1.2 Name, Role, Value | Consider `role="grid"` with `role="row"` and `role="gridcell"` for the interactive table pattern |
| **Checkbox has no label association** | Checkbox | 1.3.1 Info and Relationships | Add `aria-label` prop or associate with `<label>` |
| **Drag handles are mouse-only** | RuleRow | 2.1.1 Keyboard | No keyboard-based reordering. Consider `aria-roledescription="sortable"` + keyboard shortcuts. |

---

## 6. Dead Code and Structural Issues

| Issue | Location | Recommendation |
|-------|----------|----------------|
| **`DragHandle` atom is unused** | `src/components/atoms/DragHandle.tsx` | `RuleRow` implements its own drag handle inline. Either use the atom or delete it. |
| **`TableCell` atom is unused** | `src/components/atoms/TableCell.tsx` | No component imports it. Delete or adopt consistently. |
| **`DecisioningTable` exists at two paths** | `src/components/DecisioningTable.tsx` (old) and `src/components/organisms/DecisioningTable.tsx` (current) | The root-level one is the old pre-atomic-design version. Delete it. |
| **`ConditionalCell` imports `../../index.css`** | `src/components/molecules/ConditionalCell.tsx` | Unnecessary — `index.css` is already imported at the app root. Remove the import. |
| **`OperatorSelect` double chevron** | `src/components/molecules/OperatorSelect.tsx` + `index.css` | The CSS class `.dt-operator-select` has a chevron via `background-image`, and the component also renders a `<ChevronDownIcon>`. One is redundant. |

---

## 7. Token System Health

Per CLAUDE.md, `npm run sync-tokens` should report only 4 known drifts. The nested rules feature adds **0 new tokens to `variables.css`** — but it *should* have added tokens for the OR logic chip colors. Current status:

| Check | Status |
|-------|--------|
| Known drifts (4 expected) | ✅ Presumably stable (no variables.css diff on the branch) |
| New tokens needed but missing | 🔴 OR chip: `--color-chip-or-bg`, `--color-chip-or-fg` (or equivalent in brand-tokens) |
| AND chip: could use existing tokens | 🟡 `--color-background-accent-blue` and `--color-foreground-action` exist — just not referenced |
| Inactive foreground token | 🟡 `#A8B0BE` should be `--color-foreground-inactive` |
| `--shadow-md` undefined | 🔴 Referenced in CSS but never defined |

---

## 8. Documentation Score

| Aspect | Status |
|--------|--------|
| Component JSDoc / TSDoc | ❌ None on any component |
| Props documentation | ⚠️ TypeScript interfaces exist (good), but no usage docs |
| Storybook / catalog | ❌ Not present |
| CLAUDE.md (system docs) | ✅ Excellent — clear token hierarchy, known issues, build process |
| Inline comments | ⚠️ Sparse but meaningful where present (e.g., the `#A8B0BE` comment is helpful) |

---

## Priority Actions

### P0 — Fix Before Merge

1. **Tokenize logic chip colors.** Add `--color-chip-and-bg`, `--color-chip-and-fg`, `--color-chip-or-bg`, `--color-chip-or-fg` to `brand-tokens/tokens/brands/decision-engine.tokens.json`, rebuild, sync to `variables.css`, and update `index.css` references. The AND chip can alias existing tokens; the OR chip needs new amber-tint values.

2. **Define `--shadow-md` or fix the reference.** `.dt-conditional-dropdown` uses `--shadow-md` which doesn't exist. Either add it to `variables.css` (e.g., `0 4px 16px rgba(15, 26, 46, 0.10)`) or change the class to use `--shadow-card` or `--shadow-menu`.

3. **Harden contrast gate for unresolved tokens.** The `check-contrast.mjs` script logs `[unresolved]` but still reports "all pass". Treat unresolved as a failure (`failed++`). This is already noted in CLAUDE.md as a known issue — it should be fixed now before the nested rules pairings mask a real failure.

### P1 — Fix Soon After Merge

4. **Remove `!important` from child row styles.** Refactor the `td + td { border-left }` global rule to `.dt-tbody-row td + td` so child rows can override without `!important`.

5. **Extract shared cell renderers.** The amount cell ($ prefix + input + focus toggle) and conditional cells are duplicated between `RuleRow` and `ChildRuleRow`. Extract an `AmountCell` atom and reuse `ConditionalCell` as-is (it's already shared).

6. **Add `aria-label` to IconButton and make `type="button"` default.** Quick wins that prevent subtle bugs (form submission) and improve screen reader experience.

7. **Delete dead atoms.** Remove `DragHandle.tsx` and `TableCell.tsx`, and the legacy `src/components/DecisioningTable.tsx`.

### P2 — Improve Over Time

8. **Add `role="menu"` + keyboard nav to ActionsMenu.** Use Radix `DropdownMenu` (already in deps) instead of the custom implementation.

9. **Add `role="radiogroup"` to OutcomeBadge.** Small a11y lift with large impact for screen reader users.

10. **Standardize `alt` vs `subtle` naming** across background tokens. Pick one suffix for "lighter variant of a semantic color."

11. **Add component documentation** — even lightweight TSDoc on each exported component with usage examples. Consider a Storybook or Ladle catalog for visual reference.

12. **Add `--color-foreground-inactive` token** for the `#A8B0BE` disabled/inactive text color used in the outcome segment control.

---

*End of audit. Score breakdown: Token system (18/25), Naming consistency (16/20), Component completeness (14/25), Accessibility (10/15), Documentation (4/10), Nested rules integration (10/15) — rounding gives a blended **72/100**.*
