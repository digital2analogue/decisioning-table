# Decision Log — decisioning-table

Dated entries, newest first. Each records **what** changed, **why**, the **alternatives** weighed, and
**status**. This is the "why" record — the tradeoffs behind the interaction design, kept so they can
feed the Capital One case study (and so future sessions don't re-litigate settled calls).

---

## 2026-07-13 — Embed-driven fixes: page overflow, connector centering, header width, subtitle

**What.** Four fixes surfaced by embedding the demo (`/?demo=1`) as a live iframe in the Capital One
case study (portfolio-vercel #31), on phones and desktop. Shipped as PRs #36–#38 (all merged).

- **Page never scrolls sideways (#36).** `.dt-page` gets `overflow-x: hidden` + `max-width: 100vw`, and
  the header wraps under a new `@media (max-width: 640px)`. The wide rules table's own `.dt-table-edge`
  is now the *only* horizontal scroller (sticky `#`/name columns pinned); the page/header stay clamped
  to the frame instead of pushing controls off to the right.
- **AND/OR connector elbow centered on every row (#36).** The tree connector drew the vertical line and
  the L-elbow on one element with the elbow at `50%` of that element's height; the last-child crop
  (`bottom: 30%`) shortened the element and dragged the elbow to ~35% — so single-child groups (and the
  last row of any group) pointed above the badge. Split it: `::before` is the croppable vertical line,
  `::after` is the elbow anchored to the now-always-full-height box → arm sits at the badge's vertical
  center on first/middle/last/single-child rows alike.
- **Description field stops clipping the toolbar (#38).** `.dt-desc-area` was a fixed `width: 560px`, so
  it reserved 560px regardless of text/viewport and (with `.dt-page`'s overflow clip) shoved the
  filter/avatars/Share/Add-rule off the right on narrow frames — visible in the desktop embed and when
  editing the description. Now `width: 100%; max-width: 560px`, and the header's left block gets
  `min-w-0 flex-1` so title/description can actually shrink. (It only behaved ≤640px before because the
  responsive rule there already constrained the left block.)
- **Shorter demo subtitle (#37).** Trimmed the default model description to one line
  ("Automated credit approval policy for consumer loans.") so the header reads cleanly at phone width.

**Why / alternatives.** The header-push root cause was a *fixed-width* field, not a flex bug — the fix is
to let it flex, not to widen the frame. On the portfolio side we considered a CSS-only iOS iframe hack
(`width:1px;min-width:100%`) but it flipped the app to its desktop layout; the portfolio instead falls
back to a poster + "open the live prototype" link ≤700px and full-bleeds the embed on wide screens, so a
1520px table only scrolls below ~1520px viewports (accepted — scaling would shrink everything). Baselines
regenerate on CI; the header/connector/subtitle changes stayed within the 1440px visual tolerance.

**Status.** Shipped to production (`decisioning-table.vercel.app`). Portfolio case study leads with the
live embed (portfolio-vercel #31, merged).

## 2026-07-10 — Fix: drag had no live visual movement — DragOverlay (sticky-cell vs transform)

**What.** Right after the dnd-kit migration, reorder was *functionally* correct but *visually* broken:
pressing a row activated the drag (drop-shadow appeared) but dragging didn't move the row or part its
neighbours — on release the row **jumped** to its new slot. Switched the drag visual to a **`DragOverlay`**
(a floating clone of the row that follows the pointer), dimmed the source row to a ghost, and added a
drop-indicator line for the landing slot. Also removed the extraneous `restrictToParentElement` modifier.

**Why.** dnd-kit moves a sortable item with a CSS `transform` on the element — here the `<tr>`. Every
parent row has **two `position: sticky` cells** (the `#` and rule-name columns, kept visible while the
wide table scrolls horizontally). A `position: sticky` child inside a `transform`ed ancestor is a
spec-level conflict: the sticky cells anchor to the scroll container and browsers **drop the row's
transform**, so the `<tr>` never visibly translated. Collision detection runs off the **pointer**, so the
reorder still computed the right index → the "magic jump."

**Alternatives weighed (the tradeoffs).**
- **Neutralise sticky during drag** (`position: static` so the `<tr>` transform renders) — **rejected**:
  on mobile the grip is always reachable via the sticky `#` column *even when horizontally scrolled*, so
  dropping sticky mid-drag would snap the pinned columns and cause a worse jump.
- **`DragOverlay`** is the canonical, scroll-safe fix — a fixed-position portal, no `<tr>` transform, so
  sticky columns are irrelevant to it. **Chosen.**
- **Faithful clone** via captured `outerHTML` + measured column widths (`table-layout: fixed` + a
  `<colgroup>`), with controlled `<input>` values serialized into attributes so the clone isn't blank. A
  condensed/simplified preview was the lighter alternative; chose faithful for craft.
- **Neighbours can't part** (same sticky reason), so a transform-free **drop-indicator line** marks the
  landing slot instead of an opening gap.
- **Verification lesson**: the migration was "verified" only by final row order — which passed even
  though nothing moved visually. Now verified with **mid-drag screenshots** (mouse + CDP touch) asserting
  the overlay's on-screen position tracks the pointer.

**Status.** Implemented on `claude/portfolio-design-system-audit-c8kb32` (PR #35). Motion-only vs rest
frames — the three visual baselines are unchanged.

---

## 2026-07-10 — Rule-row drag-and-drop: react-dnd → dnd-kit (touch + keyboard support)

**What.** Replaced `react-dnd` (`HTML5Backend`) with **dnd-kit** (`@dnd-kit/core` + `/sortable` +
`/utilities` + `/modifiers`). `DndContext` / `SortableContext` / sensors / `onDragEnd` now live in
`DecisioningTable.tsx`; each `RuleRow` is a `useSortable` item whose **grip** is the drag activator.

**Why.** HTML5 drag-and-drop is a **mouse/desktop-only** API — touchscreens never fire its
`dragstart`/`dragover`/`drop` events, so on a phone the reorder didn't drag at all; the browser fell
back to text-selection / scrolling / the long-press callout, which read as "buggy." The app is
**embedded in the Capital One portfolio case study**, which people open on their phones, so touch
reorder is a requirement, not a nice-to-have.

**Alternatives weighed (the tradeoffs).**
- **dnd-kit legacy stable (`@dnd-kit/core` + `/sortable`) vs. the new pre-1.0 `@dnd-kit/react`** →
  chose **legacy stable**: it's the battle-tested, canonical sortable pattern, React 19 compatible, and
  we didn't want a pre-1.0 API on a production surface guarded by visual-regression baselines.
- **`react-dnd-touch-backend` (smaller change) vs. a full dnd-kit migration** → chose **dnd-kit**: it
  unifies **pointer + touch + keyboard** in one model, has stronger accessibility, and gives keyboard
  reordering for free. The touch-backend route would still have needed a custom drag layer and kept us
  on the older library.
- **Sensor activation constraints** (the crux of "swipe scrolls, hold drags"): `TouchSensor` with
  `delay: 180ms` + `tolerance: 6px` so a plain vertical swipe still **scrolls the page** and only a
  deliberate **press-and-hold on the grip** starts a drag; `MouseSensor` with `distance: 6px` so a
  click isn't mistaken for a drag. `touch-action: none` on the grip hands the gesture to dnd-kit.
- **Grip-only activator** (`setActivatorNodeRef` + listeners on the grip, not the whole row) so the
  row's inputs stay editable, the rest of the cell (chevron, row number) stays tappable, and the row
  still scrolls under touch.
- **Removed the custom FLIP hook** added days earlier (see next entry): dnd-kit's `SortableContext`
  animates the reflow natively via per-item `transform`/`transition`. Keeping both would double-animate.
- **Lift preserved** by composing dnd-kit's positional translate (`CSS.Translate`) with the pickup
  `scale`/`rotate` in the inline style, so the lift isn't clobbered by dnd-kit's default transform.
- **Children stay menu-reorder** (Move up / Move down) — they're buttons, already touch-fine — rather
  than being made drag-sortable, to bound scope. Minor cost: child menu-reorder no longer FLIP-animates
  (it snaps, as it did before the motion pass). Expanded parents drag as a single row and their
  children snap under on drop — parity with the prior behavior, not a regression.

**Status.** Implemented on `claude/portfolio-design-system-audit-c8kb32` (PR #35). Motion-only against
rest frames — the three Playwright visual baselines are unchanged (no regen).

---

## 2026-07-10 — Motion pass: make the rule row *move* (lift + reflow + spring)

**What.** Added a high-craft motion layer to the signature interactions: a real drag **lift** (raise +
depth shadow), **FLIP** reflow of neighbouring rows, a **spring** on the outcome segmented control,
origin-aware **popover** opens, a validation-triangle **draw-in**, and a new `--easing-spring` token.

**Why.** The case study presented the decision engine as static PNGs, which undersold a working app.
The most convincing proof a design system is real is watching it move; the rule row is the signature
moment, so that's where the craft went.

**Alternatives weighed (the tradeoffs).**
- **Kept every change motion-only** so the visual-regression gate (Playwright runs
  `animations: 'disabled'` + `reducedMotion: 'reduce'`) sees **identical rest frames** — no baseline
  regeneration, lower risk. Rest-frame ideas (invalid-row background tint, a real "jump to first
  incomplete" scroll, an onboarding→table view transition) were **deliberately deferred** because they
  would force a baseline regen and mix concerns.
- **Original lift mechanism**: suppressed react-dnd's native drag ghost (`getEmptyImage`) so the
  in-place row became the lifted element with full CSS control, with a hand-written FLIP hook animating
  the neighbours. A react-dnd `useDragLayer` custom layer was **rejected** — rendering a table row with
  sticky columns in a portal is fragile.
- **Every new animation is reduced-motion-gated** (CSS block + the FLIP hook early-returned under
  `prefers-reduced-motion`).

**Status.** Shipped in PR #35. **Superseded in part** by the dnd-kit migration above: the visual craft
(lift, spring, reflow) carried over, but the `getEmptyImage` + hand-written FLIP *mechanism* was
replaced by dnd-kit's native sortable animation once touch support became the priority. Recorded here
because the mechanism swap is exactly the kind of tradeoff worth showing in the case study.
