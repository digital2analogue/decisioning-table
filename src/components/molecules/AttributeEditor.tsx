import { XIcon } from 'lucide-react'
import type { DataAttribute } from '../../types'
import { IconButton } from '../atoms/IconButton'

export interface AttributeEditorProps {
  value: DataAttribute
  onChange: (v: DataAttribute) => void
  onClose: () => void
}

export function AttributeEditor({ value, onChange, onClose }: AttributeEditorProps) {
  return (
    <div className="flex items-center gap-1">
      {(['Income', 'Expense'] as DataAttribute[]).map((attr) => (
        <button
          key={attr}
          onClick={() => onChange(attr)}
          className={`dt-attr-btn ${
            attr === value
              ? attr === 'Income'
                ? 'dt-attr-btn-active-income'
                : 'dt-attr-btn-active-expense'
              : ''
          }`}
        >
          {attr}
        </button>
      ))}
      <IconButton onClick={onClose}>
        <XIcon size={12} />
      </IconButton>
    </div>
  )
}
