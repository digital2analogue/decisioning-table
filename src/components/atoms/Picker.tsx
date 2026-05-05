import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface PickerOption<T> {
  value: T
  label: string
  /** Optional class for a leading colored dot (used by AttributeSelectBadge). */
  leadingDotClass?: string
}

export type PickerTriggerVariant =
  | 'select-trigger'
  | 'conditional-op'
  | 'badge'
  | 'logic-chip'

export interface PickerProps<T extends string> {
  value: T | null
  onChange: (v: T) => void
  options: PickerOption<T>[]
  placeholder?: string
  triggerVariant: PickerTriggerVariant
  /** Pixel width for the trigger. Pass `'auto'` for natural sizing. */
  width?: number | 'auto'
  ariaLabel: string
  title?: string
  /** Marks the trigger in error state — consumed by Phase 3 per-cell error styling. */
  error?: boolean
  /** Optional custom trigger renderer. Receives the resolved label + open state. */
  renderTrigger?: (args: {
    value: T | null
    label: string
    isOpen: boolean
  }) => ReactNode
  /** Optional custom option renderer (for the dropdown items). */
  renderOption?: (option: PickerOption<T>, isActive: boolean) => ReactNode
}

interface DropdownPos {
  top: number
  left: number
  width?: number
}

const TRIGGER_CLASS: Record<PickerTriggerVariant, string> = {
  'select-trigger': 'dt-select-trigger',
  'conditional-op': 'dt-conditional-operator',
  badge: 'dt-badge dt-badge-select',
  'logic-chip': 'dt-logic-chip',
}

const EMPTY_CLASS: Partial<Record<PickerTriggerVariant, string>> = {
  'select-trigger': 'dt-select-trigger-empty',
  'conditional-op': 'dt-conditional-operator-empty',
  badge: 'dt-badge-empty',
}

export function Picker<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  triggerVariant,
  width,
  ariaLabel,
  title,
  error,
  renderTrigger,
  renderOption,
}: PickerProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState<DropdownPos | null>(null)
  const [focusedIdx, setFocusedIdx] = useState<number>(-1)
  const typeaheadBuffer = useRef<{ str: string; timer: number | null }>({
    str: '',
    timer: null,
  })

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  )

  const triggerLabel = selectedOption?.label ?? placeholder
  const isEmpty = value === null || value === undefined

  const open = useCallback(
    (focusFirst?: 'first' | 'selected') => {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 4, left: r.left, width: r.width })
      }
      setIsOpen(true)
      const startIdx =
        focusFirst === 'selected' && selectedOption
          ? options.findIndex((o) => o.value === selectedOption.value)
          : 0
      setFocusedIdx(focusFirst ? Math.max(0, startIdx) : -1)
    },
    [options, selectedOption],
  )

  const close = useCallback(() => {
    setIsOpen(false)
    setFocusedIdx(-1)
  }, [])

  const select = useCallback(
    (v: T) => {
      onChange(v)
      close()
      // Return focus to trigger so subsequent keyboard nav works
      triggerRef.current?.focus()
    },
    [onChange, close],
  )

  // Outside-click + scroll close
  useEffect(() => {
    if (!isOpen) return
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        listboxRef.current?.contains(target)
      ) {
        return
      }
      close()
    }
    function handleScroll(e: Event) {
      // Ignore scroll inside the listbox itself
      if (listboxRef.current?.contains(e.target as Node)) return
      close()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, close])

  // Trigger keyboard handling
  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        open('selected')
      } else {
        cycleFocus(e.key === 'ArrowDown' ? 1 : -1)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault()
        open('selected')
      } else if (focusedIdx >= 0 && focusedIdx < options.length) {
        e.preventDefault()
        select(options[focusedIdx].value)
      }
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab' && isOpen) {
      close()
    } else if (isOpen && e.key.length === 1 && /\S/.test(e.key)) {
      // Type-ahead: jump to first option whose label starts with the buffered chars
      e.preventDefault()
      const next = typeaheadBuffer.current.str + e.key.toLowerCase()
      typeaheadBuffer.current.str = next
      if (typeaheadBuffer.current.timer) {
        window.clearTimeout(typeaheadBuffer.current.timer)
      }
      typeaheadBuffer.current.timer = window.setTimeout(() => {
        typeaheadBuffer.current.str = ''
      }, 600)
      const matchIdx = options.findIndex((o) =>
        o.label.toLowerCase().startsWith(next),
      )
      if (matchIdx >= 0) setFocusedIdx(matchIdx)
    }
  }

  function cycleFocus(dir: 1 | -1) {
    if (options.length === 0) return
    setFocusedIdx((idx) => {
      const next = idx === -1 ? (dir === 1 ? 0 : options.length - 1) : idx + dir
      if (next < 0) return options.length - 1
      if (next >= options.length) return 0
      return next
    })
  }

  // Scroll focused option into view
  useEffect(() => {
    if (!isOpen || focusedIdx < 0 || !listboxRef.current) return
    const items = listboxRef.current.querySelectorAll<HTMLElement>('[role="option"]')
    items[focusedIdx]?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, focusedIdx])

  const triggerClass = cn(
    TRIGGER_CLASS[triggerVariant],
    isEmpty && EMPTY_CLASS[triggerVariant],
    error && 'dt-cell-error',
  )

  const triggerStyle: React.CSSProperties =
    typeof width === 'number' ? { width } : {}

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        className={triggerClass}
        title={title ?? triggerLabel}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={error || undefined}
        style={triggerStyle}
      >
        {renderTrigger ? (
          renderTrigger({ value, label: triggerLabel, isOpen })
        ) : (
          <>
            <span>{triggerLabel}</span>
            <ChevronDownIcon
              size={12}
              className={
                triggerVariant === 'logic-chip'
                  ? 'dt-logic-chip-chevron'
                  : 'dt-select-chevron'
              }
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {isOpen && pos && createPortal(
        <div
          ref={listboxRef}
          role="listbox"
          aria-label={ariaLabel}
          className="dt-conditional-dropdown"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            minWidth: pos.width,
            zIndex: 9999,
          }}
        >
          {options.map((opt, idx) => {
            const isActive = opt.value === value
            const isFocused = idx === focusedIdx
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isActive}
                tabIndex={-1}
                data-focused={isFocused || undefined}
                onMouseEnter={() => setFocusedIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(opt.value)
                }}
                className={cn(
                  'dt-conditional-dropdown-item',
                  isActive && 'dt-conditional-dropdown-item-active',
                  isFocused && 'dt-conditional-dropdown-item-focused',
                )}
              >
                {renderOption ? (
                  renderOption(opt, isActive)
                ) : opt.leadingDotClass ? (
                  <span className="dt-attr-option">
                    <span className={cn('dt-attr-dot', opt.leadingDotClass)} />
                    {opt.label}
                  </span>
                ) : (
                  opt.label
                )}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}
