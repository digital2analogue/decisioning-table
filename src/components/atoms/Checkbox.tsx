import { useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

export interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked, indeterminate, onChange, className }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={cn('rounded border-slate-300 text-indigo-600 cursor-pointer', className)}
    />
  )
}
