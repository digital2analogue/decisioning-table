import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from 'lucide-react'
import type { LogicOperator } from '../../types'
import { cn } from '../../lib/utils'

export interface LogicOperatorSelectProps {
  value: LogicOperator
  onChange: (v: LogicOperator) => void
}

const OPTIONS: LogicOperator[] = ['AND', 'OR']

interface DropdownPos { top: number; left: number }

export function LogicOperatorSelect({ value, onChange }: LogicOperatorSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<DropdownPos | null>(null)

  const open = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left })
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
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : open()}
        className={cn(
          'dt-logic-chip',
          value === 'AND' ? 'dt-logic-chip-and' : 'dt-logic-chip-or',
        )}
        title={`Logic: ${value}`}
        aria-label={`Logic operator: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value}</span>
        <ChevronDownIcon size={10} className="dt-logic-chip-chevron" aria-hidden="true" />
      </button>

      {isOpen && pos && createPortal(
        <div
          role="listbox"
          aria-label="Logic operator"
          className="dt-conditional-dropdown"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: 80, zIndex: 9999 }}
        >
          {OPTIONS.map((op) => (
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
                value === op && 'dt-conditional-dropdown-item-active',
              )}
            >
              {op}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
