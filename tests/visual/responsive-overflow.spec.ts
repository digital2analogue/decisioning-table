import { test, expect, type Page } from '@playwright/test'

/**
 * Guards issue #16: the rules table used to overflow the page horizontally on
 * viewports narrower than ~1200px, because the six fixed column widths in
 * variables.css total ~1210px before the sticky `#` column and padding. On a
 * phone in "Request Desktop Site" mode (~980-1024px layout viewport) the app
 * read as broken.
 *
 * The fix was to make the table its own scroller rather than to reflow it:
 * `.dt-page` is clamped with `overflow-x: hidden; max-width: 100vw`, and
 * `.dt-table-edge` scrolls horizontally with the `#`/name columns pinned. That
 * is a deliberate product decision — this is a data-dense desktop-first tool
 * and horizontal scrolling is the accepted mobile pattern, not a fallback.
 *
 * Because the page is CLAMPED rather than scrollable, a control pushed past the
 * viewport is not merely awkward, it is unreachable. So this spec checks two
 * things at each width: that the page itself never scrolls sideways, and that
 * nothing interactive ends up outside a scrollable region.
 *
 * Geometry and reachability only — no screenshots, so this never needs a
 * baseline regen.
 */

// 390: common phone. 980/1024: the "Request Desktop Site" viewports the issue
// was filed about. 1200: just under the table's intrinsic width. 1440: the
// baseline viewport, where the table still exceeds the frame.
const WIDTHS = [390, 640, 768, 980, 1024, 1200, 1440]

async function settle(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

for (const width of WIDTHS) {
  test(`page never scrolls horizontally at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await settle(page, '/?demo=1')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, `document overflows the viewport by ${overflow}px`).toBeLessThanOrEqual(0)
  })

  test(`every interactive control is reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await settle(page, '/?demo=1')

    // A control outside the viewport is fine *if* some ancestor scrolls
    // horizontally to bring it in — that is how both the table
    // (.dt-table-edge) and the ruleset tab strip (.dt-tabs-bar) work. It is
    // only a defect when nothing can scroll it into view, because .dt-page
    // clips rather than scrolls.
    const stranded = await page.evaluate(() => {
      const vw = window.innerWidth
      const hasScrollableAncestor = (el: Element) => {
        let node = el.parentElement
        while (node && node !== document.body) {
          const { overflowX } = getComputedStyle(node)
          if (/(auto|scroll)/.test(overflowX) && node.scrollWidth > node.clientWidth + 1) return true
          node = node.parentElement
        }
        return false
      }
      return [...document.querySelectorAll('button, input, select, textarea, [role="button"]')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) return false // hidden
          const outside = r.right > vw + 1 || r.left < -1
          return outside && !hasScrollableAncestor(el)
        })
        .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`)
    })

    expect(stranded, `controls outside the viewport with no way to scroll to them: ${stranded.join(', ')}`).toEqual([])
  })
}

test('the table is the horizontal scroller, with # and name pinned', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await settle(page, '/?demo=1')

  const edge = page.locator('.dt-table-edge')
  const metrics = await edge.evaluate((el) => ({
    scrolls: el.scrollWidth > el.clientWidth + 1,
    clientWidth: el.clientWidth,
  }))

  // The table genuinely exceeds the frame here — that is the point, and it is
  // why the scroller has to exist rather than the columns reflowing.
  expect(metrics.scrolls, 'the table should scroll inside its own container').toBe(true)
  expect(metrics.clientWidth).toBeLessThanOrEqual(1024)

  // The pinned columns are what makes that scrolling usable: scroll to the far
  // end and the row is still identifiable.
  //
  // Note this asserts they do not scroll AWAY, not that they never move. A
  // sticky cell sits at its natural position until the scroll passes its
  // threshold, so at rest these start wherever the table content begins inside
  // the container and only then settle onto left: 0 / left: 56px. Comparing
  // rest position to pinned position would fail on correct behaviour.
  const pinned = await page.evaluate(() => {
    const container = document.querySelector('.dt-table-edge') as HTMLElement
    container.scrollLeft = container.scrollWidth
    const box = container.getBoundingClientRect()
    const read = (sel: string) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { offsetFromContainer: Math.round((r.left - box.left) * 100) / 100, width: Math.round(r.width) }
    }
    return { num: read('.dt-col-sticky-num'), name: read('.dt-col-sticky'), scrolled: container.scrollLeft }
  })

  expect(pinned.scrolled, 'the table should actually have scrolled').toBeGreaterThan(0)
  expect(pinned.num, '# column should still be in the DOM').not.toBeNull()
  expect(pinned.name, 'name column should still be in the DOM').not.toBeNull()

  // Without sticky these would be at roughly -scrollLeft; pinned they sit at
  // their declared offsets against the container's left edge.
  expect(pinned.num!.offsetFromContainer, '# column should be pinned to the container edge').toBeCloseTo(0, 0)
  expect(pinned.name!.offsetFromContainer, 'name column should be pinned just after the # column').toBeCloseTo(56, 0)
})
