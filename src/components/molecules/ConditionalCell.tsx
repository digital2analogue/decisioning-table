import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ConditionalOperator } from '../../types'
import { dataElements } from '../../data'
import { cn } from '../../lib/utils'
import { Picker, type PickerOption } from '../atoms/Picker'
import '../../index.css'

interface DropdownPos { top: number; left: number; width?: number }

const CONDITIONAL_OPERATOR_OPTIONS: PickerOption<ConditionalOperator>[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'doesnotContain', label: "Doesn't contain" },
  { value: '==', label: '==' },
  { value: '!=', label: '!=' },
  { value: '=null', label: '=null' },
  { value: '!=null', label: '!=null' },
]

export interface ConditionalCellProps {
  operator: ConditionalOperator | null
  variable: string
  onOperatorChange: (operator: ConditionalOperator) => void
  onVariableChange: (variable: string) => void
  /** Placeholder text for the variable input when no variable is selected. */
  variablePlaceholder?: string
}

export function ConditionalCell({
  operator,
  variable,
  onOperatorChange,
  onVariableChange,
  variablePlaceholder = 'Enter value',
}: ConditionalCellProps) {
  const [isVariableOpen, setIsVariableOpen] = useState(false)
  const [variableSearch, setVariableSearch] = useState('')
  const [variablePos, setVariablePos] = useState<DropdownPos | null>(null)
  const variableRef = useRef<HTMLDivElement>(null)
  const variableInputRef = useRef<HTMLInputElement>(null)

  const filteredVariables = dataElements.filter((el) =>
    el.label.toLowerCase().includes(variableSearch.toLowerCase()) ||
    el.description.toLowerCase().includes(variableSearch.toLowerCase())
  )

  const selectedVariable = dataElements.find((el) => el.id === variable)

  const openVariable = useCallback(() => {
    if (variableRef.current) {
      const r = variableRef.current.getBoundingClientRect()
      setVariablePos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setIsVariableOpen(true)
  }, [])

  // Variable combobox close on outside click / scroll. Operator dropdown is
  // managed by the Picker primitive, so only the variable side needs handling here.
  useEffect(() => {
    function handleClose(e: MouseEvent) {
      if (variableRef.current && !variableRef.current.contains(e.target as Node)) {
        setIsVariableOpen(false)
      }
    }
    function handleScroll() {
      setIsVariableOpen(false)
    }
    document.addEventListener('mousedown', handleClose)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClose)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  return (
    <div className="flex flex-row items-center gap-1.5">
      {/* Operator picker */}
      <div className="flex-shrink-0">
        <Picker<ConditionalOperator>
          value={operator}
          onChange={onOperatorChange}
          options={CONDITIONAL_OPERATOR_OPTIONS}
          placeholder="Select condition"
          triggerVariant="conditional-op"
          ariaLabel="Condition operator"
        />
      </div>

      {/* Variable search combobox — search-as-you-type, not a Picker. */}
      <div ref={variableRef} className="relative min-w-0 flex-1">
        <input
          ref={variableInputRef}
          type="text"
          placeholder={variable && selectedVariable ? selectedVariable.label : variablePlaceholder}
          value={variableSearch}
          onChange={(e) => {
            setVariableSearch(e.target.value)
            openVariable()
          }}
          onFocus={openVariable}
          className={cn(
            'dt-conditional-variable',
            // Selected variable label is shown via the ::placeholder slot so
            // the user can search-filter on focus. The --filled modifier
            // overrides the muted placeholder color so a SELECTED value
            // reads like a value, not a placeholder prompt.
            variable && selectedVariable && 'dt-conditional-variable--filled',
          )}
        />
      </div>

      {isVariableOpen && variablePos && filteredVariables.length > 0 && createPortal(
        <div
          className="dt-conditional-dropdown"
          style={{
            position: 'fixed',
            top: variablePos.top,
            left: variablePos.left,
            width: variablePos.width,
            maxHeight: 192,
            overflowY: 'auto',
            zIndex: 9999,
          }}
        >
          {filteredVariables.map((el) => (
            <button
              key={el.id}
              onMouseDown={(e) => {
                e.preventDefault()
                onVariableChange(el.id)
                setVariableSearch('')
                setIsVariableOpen(false)
              }}
              className={cn(
                'dt-conditional-dropdown-item flex flex-col',
                variable === el.id && 'dt-conditional-dropdown-item-active'
              )}
            >
              <span className="dt-conditional-dropdown-var-name">{el.label}</span>
              <span className="dt-conditional-dropdown-desc">{el.description}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
