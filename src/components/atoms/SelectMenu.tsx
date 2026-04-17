import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { CheckIcon } from 'lucide-react'

export interface SelectMenuOption<T extends string> {
  value: T
  label: string
  description?: string
  leading?: ReactNode
}

export interface SelectMenuProps<T extends string> {
  value: T
  options: SelectMenuOption<T>[]
  onChange: (value: T) => void
  onClose: () => void
  ariaLabel?: string
  /** Horizontal anchor of the popover relative to its positioned parent. Defaults to 'left'. */
  align?: 'left' | 'right'
}

export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  onClose,
  ariaLabel,
  align = 'left',
}: SelectMenuProps<T>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div ref={ref} role="menu" aria-label={ariaLabel} className={`dt-select-menu dt-select-menu-align-${align}`}>
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`dt-select-menu-item ${selected ? 'dt-select-menu-item-selected' : ''}`}
          >
            {opt.leading && <span className="dt-select-menu-item-leading">{opt.leading}</span>}
            <span className="dt-select-menu-item-text">
              <span className="dt-select-menu-item-label">{opt.label}</span>
              {opt.description && <span className="dt-select-menu-item-desc">{opt.description}</span>}
            </span>
            {selected && <CheckIcon size={12} className="dt-select-menu-item-check" aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}
