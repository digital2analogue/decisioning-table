import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface IconButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  title?: string
  ariaLabel: string
  /** Set when the button toggles a popover/menu so screen readers announce expanded state. */
  ariaHasPopup?: 'menu' | 'listbox' | 'dialog' | 'tree' | 'grid' | 'true'
  ariaExpanded?: boolean
}

export function IconButton({
  onClick,
  children,
  className,
  title,
  ariaLabel,
  ariaHasPopup,
  ariaExpanded,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaHasPopup ? ariaExpanded : undefined}
      className={cn('dt-icon-btn transition-colors', className)}
    >
      {children}
    </button>
  )
}
