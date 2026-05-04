import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlusIcon } from 'lucide-react'

export interface AddRowButtonProps {
  onAddRule: () => void
}

interface PopoverPos { top: number; left: number }

export function AddRowButton({ onAddRule }: AddRowButtonProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<PopoverPos | null>(null)

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
        className="dt-add-row-btn"
        title="Add rule"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Add rule"
      >
        <PlusIcon size={14} />
      </button>

      {isOpen && pos && createPortal(
        <div
          className="dt-conditional-dropdown"
          role="menu"
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: 160, zIndex: 9999 }}
        >
          <button
            type="button"
            role="menuitem"
            onMouseDown={(e) => {
              e.preventDefault()
              onAddRule()
              setIsOpen(false)
            }}
            className="dt-conditional-dropdown-item"
          >
            New rule
          </button>
          <button
            type="button"
            role="menuitem"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsOpen(false)
            }}
            className="dt-conditional-dropdown-item"
          >
            Existing rule
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}
