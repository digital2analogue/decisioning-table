# decisioning-table

Decision Model Table — a data-dense light-mode UI for building and managing decision rules. Sub-brand of the River Romney design system (decision-engine theme).

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # contrast check → tsc → vite build (contrast gate blocks on failure)
npm run check-contrast # Run WCAG AA check in isolation
npm run sync-tokens    # Compare local variables.css against brand-tokens build output
npm run screenshots    # Puppeteer screenshot capture
```

## Token System

This repo consumes tokens from the **brand-tokens** repo (`../brand-tokens`). It does not define its own color values.

### Source of truth hierarchy

```
brand-tokens/tokens/brands/decision-engine.tokens.json  ← edit here first
  ↓ build (node scripts/build-brands.mjs in brand-tokens)
brand-tokens/build/css/decision-engine.css              ← built output
  ↓ sync-tokens compares against
src/tokens/variables.css                                ← local flat CSS, consumed by Tailwind + components
```

**Hard rule: `variables.css` is a sync target, not a place to define tokens.**

The flow is always: **brand-tokens → build → variables.css**. Never the reverse.

- **Never define a new color token in `variables.css` directly.** If you need a new token, add it to `brand-tokens/tokens/brands/decision-engine.tokens.json`, rebuild brand-tokens, then copy the resolved value into `variables.css`.
- **Never write a hex value, `color-mix()`, or `var()` expression into `variables.css` for a new token.** If it's not in brand-tokens first, it doesn't exist.
- If a token is needed urgently mid-session, you may add it locally with `/* TODO: move to brand-tokens */` — but treat this as a debt marker, not a pattern. The next thing you do is add it properly to brand-tokens and remove the comment.
- After any token work, run `npm run sync-tokens`. The only acceptable output is the 6 known drifts listed below. Any additional local-only token is a bug.

### Known intentional drifts (do not fix these)

brand-tokens ships a **dark theme only**. This repo is a **light-mode** sub-brand, so a small set of tokens are deliberately overridden locally. Do not "fix" these by syncing them back to brand-tokens values — that would break the light theme.

Bluer-tint surface/border palette (hand-tuned for DE light mode, not yet backported):
- `--color-background-alt`
- `--color-background-default`
- `--color-border-default`
- `--color-border-elevated` — local `#c6cad1` vs brand `#c0c4ce`. Slightly cooler-gray border for elevated surfaces in light mode.
- `--color-border-muted` — local `#eaecef` vs brand `#e8eaed`. Same intent — bluer cast for the light theme's row separators.

Light-mode contrast overrides (brand-tokens values are correct for dark theme but unreadable in light mode):
- `--color-foreground-on-warning` — `#1A1A2E` locally (dark navy) vs `#ffffff` in brand-tokens. White-on-amber would fail AA in this context.

(Cosmetic-only, not counted: `--shadow-none` differs syntactically — `0 0 0 0 transparent` locally vs `0 0 0 0 rgba(0,0,0,0)` upstream — but resolves to the same paint. No fix needed.)

Everything else should match. If `sync-tokens` reports new drifts outside this list, investigate.

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
- **Radix UI primitives** — Dialog, Dropdown, Select, Tabs, Checkbox
- **react-dnd** — drag-and-drop for rule row reordering
- CSS namespace conventions: `dt-` (decisioning table), `ob-` (onboarding flow)

## Design Tokens in CSS

All color is via CSS custom properties from `src/tokens/variables.css`. Components use class names defined in `src/index.css` — inline style overrides are rare and must use token variables, never hex values.

## Sub-Brand Reference

For decision-engine token values, read `../brand-tokens/build/css/decision-engine.css` directly. The brand-tokens `ai/DESIGN.md` covers the base dark theme only.

## Known issues / follow-ups

- **Pre-existing TS build error in [src/components/templates/DecisioningEngine.tsx:76](src/components/templates/DecisioningEngine.tsx#L76).** The `Rule` type in [src/types.ts](src/types.ts) gained four required fields (`existingAccountOperator`, `existingAccountVariable`, `annualIncomeOperator`, `annualIncomeVariable`) but the seed/initial Rule literal at line 76 wasn't updated. Blocks `npm run build` (vite step) until fixed.
- **`scripts/check-contrast.mjs` silently skips unresolved pairs.** When a token in the PAIRINGS manifest can't be resolved, the script logs `[unresolved] <label>` but does not increment `failed` and still reports "all pass". This masked the `--color-foreground-primary` / `--color-foreground-accent` / `--color-feedback-error` undefined-token bugs for some time. Harden by treating unresolved as a failure.
