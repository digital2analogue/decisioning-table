import { useEffect, useRef, useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'

export interface RuleSearchProps {
  /** Current debounced query value (controlled by parent). */
  value: string
  onChange: (next: string) => void
  /** Debounce window in ms before propagating typed input upstream. */
  debounceMs?: number
  placeholder?: string
  /** Extra classes forwarded to the wrapper div (e.g. ml-auto for layout). */
  className?: string
}

/**
 * Search input for filtering rules by name. Internal state holds the user's
 * raw typing; the debounced value is pushed to the parent so re-renders only
 * happen when typing pauses, not on every keystroke.
 */
export function RuleSearch({
  value,
  onChange,
  debounceMs = 150,
  placeholder = 'Filter rules',
  className,
}: RuleSearchProps) {
  const [draft, setDraft] = useState(value)
  const timer = useRef<number | null>(null)

  // Keep local draft in sync if parent clears externally
  useEffect(() => {
    setDraft(value)
  }, [value])

  function commit(next: string) {
    setDraft(next)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => onChange(next), debounceMs)
  }

  function clear() {
    if (timer.current) window.clearTimeout(timer.current)
    setDraft('')
    onChange('')
  }

  return (
    <div className={`dt-rule-search${className ? ` ${className}` : ''}`}>
      <SearchIcon size={12} className="dt-rule-search-icon" aria-hidden="true" />
      <input
        type="search"
        value={draft}
        onChange={(e) => commit(e.target.value)}
        placeholder={placeholder}
        className="dt-rule-search-input"
        aria-label="Search rules by name"
      />
      {draft && (
        <button
          type="button"
          onClick={clear}
          className="dt-rule-search-clear"
          aria-label="Clear search"
          title="Clear search"
        >
          <XIcon size={12} />
        </button>
      )}
    </div>
  )
}
