import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface TableCellProps {
  children?: ReactNode
  className?: string
  colSpan?: number
}

export function TableCell({ children, className, colSpan }: TableCellProps) {
  return (
    <td
      className={cn('px-3 py-2.5 text-[var(--dt-color-text-primary)]', className)}
      colSpan={colSpan}
    >
      {children}
    </td>
  )
}
