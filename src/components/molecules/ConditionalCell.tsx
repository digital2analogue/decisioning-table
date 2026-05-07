import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ConditionalOperator } from '../../types'
import { dataElements } from '../../data'
import { cn } from '../../lib/utils'
import { Picker, type PickerOption } from '../atoms/Picker'
import { AmountCell } from '../atoms/AmountCell'
import { computePortalPos, type PortalPos } from '../../lib/portalPosition'
import '../../index.css'

const CONDITIONAL_OPERATOR_OPTIONS: PickerOption<ConditionalOperator>[] = [
  { value: '==', label: '==' },
  { value: '!=', label: '!=' },
  { value: '<', label: '<' },
  { value: '<=', label: '≤' },
  { value: '>', label: '>' },
  { value: '>=', label: '≥' },
  { value: '=null', label: 'is Null' },
  { value: '!=null', label: 'is Not Null' },
]

export interface ConditionalCellProps {
  operator: ConditionalOperator | null
  variable: string
  onOperatorChange: (operator: ConditionalOperator) => void
  onVariableChange: (variable: string) => void
  /** Placeholder text for the variable input when no variable is selected. */
  variablePlaceholder?: string
  /** 'search' = data-element combobox (default); 'amount' = dollar amount input; 'number' = plain number input (no prefix) */
  variableType?: 'search' | 'amount' | 'number'
}

export function ConditionalCell({
  operator,
  variable,
  onOperatorChange,
  onVariableChange,
  variablePlaceholder = 'Enter value',
  variableType = 'search',
}: ConditionalCellProps) {
  const [isVariableOpen, setIsVariableOpen] = useState(false)
  const [variableSearch, setVariableSearch] = useState('')
  const [variablePos, setVariablePos] = useState<PortalPos | null>(null)
  const variableRef = useRef<HTMLDivElement>(null)
  const variableInputRef = useRef<HTMLInputElement>(null)

  const filteredVariables = dataElements.filter((el) =>
    el.label.toLowerCase().includes(variableSearch.toLowerCase()) ||
    el.description.toLowerCase().includes(variableSearch.toLowerCase())
  )

  const selectedVariable = dataElements.find((el) => el.id === variable)

  const openVariable = useCallback(() => {
    if (variableRef.current) {
      setVariablePos(computePortalPos(variableRef.current, 'below-left'))
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
    <div className="dt-conditional-cell">
      {/* Operator picker */}
      <Picker<ConditionalOperator>
        value={operator}
        onChange={onOperatorChange}
        options={CONDITIONAL_OPERATOR_OPTIONS}
        placeholder="Condition"
        triggerVariant="conditional-op"
        ariaLabel="Condition operator"
      />

      {/* Variable input — amount input, plain number, or data-element search combobox */}
      {variableType === 'amount' ? (
        <div className="min-w-0 flex-1">
          <AmountCell
            value={variable ? parseFloat(variable) : null}
            onChange={(v) => onVariableChange(v !== null ? String(v) : '')}
          />
        </div>
      ) : variableType === 'number' ? (
        <div className="min-w-0 flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={variable ?? ''}
            placeholder={variablePlaceholder}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              onVariableChange(raw)
            }}
            className={cn('dt-amount-input dt-number-input', !variable && 'dt-conditional-operator-empty')}
          />
        </div>
      ) : (
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
              variable && selectedVariable && 'dt-conditional-variable--filled',
            )}
          />
        </div>
      )}

      {(variableType === 'search' || variableType === undefined) && isVariableOpen && variablePos && filteredVariables.length > 0 && createPortal(
        <div
          className="dt-conditional-dropdown"
          style={{
            position: 'fixed',
            top: variablePos.top,
            left: variablePos.left,
            width: variablePos.width ?? undefined,
            maxHeight: 192,   // --dropdown-max-height
            overflowY: 'auto',
            zIndex: 9999,     // --z-dropdown
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
