import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface IconButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  title?: string
  style?: CSSProperties
}

export function IconButton({ onClick, children, className, title, style }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn('transition-colors', className)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, ...style }}
    >
      {children}
    </button>
  )
}
