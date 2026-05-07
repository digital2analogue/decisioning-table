import { useState, useEffect, type RefObject } from 'react'

/**
 * Placement strategies for portal-positioned menus and dropdowns.
 *
 *   below-right — drop below the anchor, right-align to anchor's right edge
 *   above-right — rise above the anchor, right-align to anchor's right edge
 *   below-left  — drop below the anchor, left-align + match anchor width
 */
export type PortalPlacement = 'below-right' | 'above-right' | 'below-left'

export interface PortalPos {
  top?: number
  bottom?: number
  right?: number
  left?: number
  width?: number
}

/**
 * Compute portal fixed-position coords from an anchor element.
 * Call inside event handlers or effects after the anchor is in the DOM.
 *
 * @example
 *   const r = anchorRef.current!
 *   const pos = computePortalPos(r, 'below-right')
 *   // → { top: r.bottom + 4, right: window.innerWidth - r.right }
 */
export function computePortalPos(
  anchor: Element,
  placement: PortalPlacement,
  offset = 4,
): PortalPos {
  const r = anchor.getBoundingClientRect()
  if (placement === 'below-right') {
    return { top: r.bottom + offset, right: window.innerWidth - r.right }
  }
  if (placement === 'above-right') {
    return { bottom: window.innerHeight - r.top + offset, right: window.innerWidth - r.right }
  }
  // below-left
  return { top: r.bottom + offset, left: r.left, width: r.width }
}

/**
 * Hook variant — computes position once on mount (when the anchor ref is ready).
 * Best for menus rendered after a user action where the anchor is already visible:
 * ActionsMenu, ColumnHeaderMenu.
 *
 * For event-driven opens (Picker, ConditionalCell, TabItem) prefer `computePortalPos`
 * called directly inside the open handler.
 */
export function usePortalPosition(
  anchorRef: RefObject<Element | null>,
  placement: PortalPlacement,
  offset = 4,
): PortalPos | null {
  const [pos, setPos] = useState<PortalPos | null>(null)

  useEffect(() => {
    if (!anchorRef.current) return
    setPos(computePortalPos(anchorRef.current, placement, offset))
  }, [anchorRef, placement, offset])

  return pos
}
