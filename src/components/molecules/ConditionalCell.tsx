import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from 'lucide-react'
import type { ConditionalOperator } from '../../types'
import { dataElements } from '../../data'
import { cn } from '../../lib/utils'
import '../../index.css'

interface DropdownPos { top: number; left: number; width?: number }

const CONDITIONAL_OPERATORS: ConditionalOperator[] = [
  'contains',
  'doesnotContain',
  '==',
  '!=',
  '=null',
  '!=null',
]

const OPERATOR_DISPLAY: Record<ConditionalOperator, string> = {
  'contains': 'Contains',
  'doesnotContain': 'doesnotContain',
  '==': '==',
  '!=': '!=',
  '=null': '=null',
  '!=null': '!=null',
}

export interface ConditionalCellProps {
  operator: ConditionalOperator | null
  variable: string
  onOperatorChange: (operator: ConditionalOperator) => void
  onVariableChange: (variable: string) => void
}

export function ConditionalCell({
  operator,
  variable,
  onOperatorChange,
  onVariableChange,
}: ConditionalCellProps) {
  const [isOperatorOpen, setIsOperatorOpen] = useState(false)
  const [isVariableOpen, setIsVariableOpen] = useState(false)
  const [variableSearch, setVariableSearch] = useState('')
  const [operatorPos, setOperatorPos] = useState<DropdownPos | null>(null)
  const [variablePos, setVariablePos] = useState<DropdownPos | null>(null)
  const operatorRef = useRef<HTMLDivElement>(null)
  const variableRef = useRef<HTMLDivElement>(null)
  const variableInputRef = useRef<HTMLInputElement>(null)

  const filteredVariables = dataElements.filter((el) =>
    el.label.toLowerCase().includes(variableSearch.toLowerCase()) ||
    el.description.toLowerCase().includes(variableSearch.toLowerCase())
  )

  const selectedVariable = dataElements.find((el) => el.id === variable)

  const openOperator = useCallback(() => {
    if (operatorRef.current) {
      const r = operatorRef.current.getBoundingClientRect()
      setOperatorPos({ top: r.bottom + 4, left: r.left })
    }
    setIsOperatorOpen(true)
  }, [])

  const openVariable = useCallback(() => {
    if (variableRef.current) {
      const r = variableRef.current.getBoundingClientRect()
      setVariablePos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setIsVariableOpen(true)
  }, [])

  // Close portals on outside click or scroll
  useEffect(() => {
    function handleClose(e: MouseEvent) {
      if (operatorRef.current && !operatorRef.current.contains(e.target as Node)) {
        setIsOperatorOpen(false)
      }
      if (variableRef.current && !variableRef.current.contains(e.target as Node)) {
        setIsVariableOpen(false)
      }
    }
    function handleScroll() {
      setIsOperatorOpen(false)
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
      {/* Operator button */}
      <div ref={operatorRef} className="flex-shrink-0">
        <button
          type="button"
          onClick={() => isOperatorOpen ? setIsOperatorOpen(false) : openOperator()}
          className={operator ? 'dt-conditional-operator' : 'dt-conditional-operator dt-conditional-operator-empty'}
          aria-haspopup="listbox"
          aria-expanded={isOperatorOpen}
        >
          <span>{operator ? OPERATOR_DISPLAY[operator] : 'Select condition'}</span>
          <ChevronDownIcon size={12} />
        </button>
      </div>

      {isOperatorOpen && operatorPos && createPortal(
        <div
          className="dt-conditional-dropdown"
          style={{ position: 'fixed', top: operatorPos.top, left: operatorPos.left, zIndex: 9999 }}
        >
          {CONDITIONAL_OPERATORS.map((op) => (
            <button
              key={op}
              onMouseDown={(e) => {
                e.preventDefault()
                onOperatorChange(op)
                setIsOperatorOpen(false)
              }}
              className={cn(
                'dt-conditional-dropdown-item',
                operator === op && 'dt-conditional-dropdown-item-active'
              )}
            >
              {OPERATOR_DISPLAY[op]}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Variable search input */}
      <div ref={variableRef} className="relative min-w-0 flex-1">
        <input
          ref={variableInputRef}
          type="text"
          placeholder={variable && selectedVariable ? selectedVariable.label : 'Select value…'}
          value={variableSearch}
          onChange={(e) => {
            setVariableSearch(e.target.value)
            openVariable()
          }}
          onFocus={openVariable}
          className="dt-conditional-variable"
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
