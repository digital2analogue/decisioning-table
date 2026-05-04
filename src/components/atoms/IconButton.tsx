import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface IconButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  title?: string
  ariaLabel: string
}

export function IconButton({ onClick, children, className, title, ariaLabel }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={cn('dt-icon-btn transition-colors', className)}
    >
      {children}
    </button>
  )
}
