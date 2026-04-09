import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface IconButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  title?: string
}

export function IconButton({ onClick, children, className, title }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn('transition-colors', className)}
    >
      {children}
    </button>
  )
}
