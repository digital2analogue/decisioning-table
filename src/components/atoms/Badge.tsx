import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from 'lucide-react'
import type { DataAttribute, Outcome } from '../../types'

// ─── AttributeSelectBadge ────────────────────────────────────────────────────

const ATTRIBUTES: DataAttribute[] = ['Income', 'Expense', 'Asset', 'Liability']

function badgeVariant(value: DataAttribute): string {
  switch (value) {
    case 'Income':   return 'dt-badge-income'
    case 'Expense':  return 'dt-badge-expense'
    case 'Asset':    return 'dt-badge-asset'
    case 'Liability': return 'dt-badge-liability'
  }
}

export interface AttributeSelectBadgeProps {
  value: DataAttribute
  onChange: (v: DataAttribute) => void
}

export function AttributeSelectBadge({ value, onChange }: AttributeSelectBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
        onClick={() => isOpen ? setIsOpen(false) : open()}
        className={`dt-badge dt-badge-select ${badgeVariant(value)}`}
      >
        {value}
        <ChevronDownIcon size={10} className="dt-select-chevron" style={{ flexShrink: 0 }} />
      </button>

      {isOpen && pos && createPortal(
        <div
          className="dt-conditional-dropdown"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, minWidth: 120 }}
        >
          {ATTRIBUTES.map((attr) => (
            <button
              key={attr}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(attr)
                setIsOpen(false)
              }}
              className={`dt-conditional-dropdown-item dt-attr-option ${attr === value ? 'dt-conditional-dropdown-item-active' : ''}`}
            >
              <span className={`dt-attr-dot dt-attr-dot-${attr.toLowerCase()}`} />
              {attr}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── OutcomeBadge ────────────────────────────────────────────────────────────

export interface OutcomeBadgeProps {
  value: Outcome
  onChange: (v: Outcome) => void
}

export function OutcomeBadge({ value, onChange }: OutcomeBadgeProps) {
  return (
    <div className="dt-outcome-seg">
      <button
        onClick={() => onChange('Approve')}
        className={`dt-outcome-seg-btn ${value === 'Approve' ? 'dt-outcome-seg-approve' : ''}`}
      >
        Approve
      </button>
      <button
        onClick={() => onChange('Deny')}
        className={`dt-outcome-seg-btn ${value === 'Deny' ? 'dt-outcome-seg-deny' : ''}`}
      >
        Deny
      </button>
    </div>
  )
}
