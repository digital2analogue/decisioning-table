import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from 'lucide-react'
import type { Operator } from '../../types'
import { cn } from '../../lib/utils'

export interface OperatorSelectProps {
  value: Operator | null
  onChange: (v: Operator) => void
}

const operators: Operator[] = ['>', '>=', '<', '<=', '=']

const labels: Record<Operator, string> = {
  '>':  'Greater than',
  '>=': 'At least',
  '<':  'Less than',
  '<=': 'At most',
  '=':  'Equals',
}

interface DropdownPos { top: number; left: number; width: number }

export function OperatorSelect({ value, onChange }: OperatorSelectProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<DropdownPos | null>(null)

  const open = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setIsOpen(true)
  }, [])

  useEffect(() => {
    function handleClose(e: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleScroll() { setIsOpen(false) }
    document.addEventListener('mousedown', handleClose)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClose)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  return (
    <div ref={triggerRef} className="inline-block">
      <button
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : open()}
        className={value ? 'dt-select-trigger' : 'dt-select-trigger dt-select-trigger-empty'}
        title={value ? labels[value] : 'Select operator'}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value ? labels[value] : 'Select operator'}</span>
        <ChevronDownIcon size={12} className="dt-select-chevron" />
      </button>

      {isOpen && pos && createPortal(
        <div
          className="dt-conditional-dropdown"
          role="listbox"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
        >
          {operators.map((op) => (
            <button
              key={op}
              type="button"
              role="option"
              aria-selected={value === op}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(op)
                setIsOpen(false)
              }}
              className={cn(
                'dt-conditional-dropdown-item',
                value === op && 'dt-conditional-dropdown-item-active'
              )}
            >
              {labels[op]}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
