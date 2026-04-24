import { useEffect, useRef } from 'react'
import type { DataAttribute } from '../../types'

export interface AttributeEditorProps {
  value: DataAttribute
  onChange: (v: DataAttribute) => void
  onClose: () => void
}

const ATTRIBUTES: DataAttribute[] = ['Income', 'Expense', 'Asset', 'Liability']

function badgeClass(attr: DataAttribute): string {
  switch (attr) {
    case 'Income':
      return 'dt-attr-btn dt-attr-btn-active-income'
    case 'Expense':
      return 'dt-attr-btn dt-attr-btn-active-expense'
    case 'Asset':
      return 'dt-attr-btn dt-attr-btn-active-asset'
    case 'Liability':
      return 'dt-attr-btn dt-attr-btn-active-liability'
  }
}

export function AttributeEditor({ onChange, onClose }: AttributeEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} className="dt-attr-popover">
      {ATTRIBUTES.map((attr) => (
        <button
          key={attr}
          onClick={() => onChange(attr)}
          className={badgeClass(attr)}
        >
          {attr}
        </button>
      ))}
    </div>
  )
}
