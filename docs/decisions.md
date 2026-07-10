# Decision Log — decisioning-table

Dated entries, newest first. Each records **what** changed, **why**, the **alternatives** weighed, and
**status**. This is the "why" record — the tradeoffs behind the interaction design, kept so they can
feed the Capital One case study (and so future sessions don't re-litigate settled calls).

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
