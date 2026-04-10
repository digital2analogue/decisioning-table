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
      {(['Income', 'Expense'] as DataAttribute[]).map((attr) => {
        const isSelected = attr === value
        const isIncome = attr === 'Income'
        return (
          <button
            key={attr}
            onClick={() => onChange(attr)}
            style={{
              padding: '2px var(--space-sm)',
              borderRadius: '9999px',
              fontFamily: 'var(--font-label-small-family)',
              fontSize: 'var(--font-label-small-size)',
              border: '1px solid',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
              color: isSelected
                ? isIncome ? 'var(--color-foreground-accent)' : 'var(--color-foreground-danger)'
                : 'var(--color-foreground-muted)',
              borderColor: isSelected
                ? isIncome ? 'var(--color-border-accent)' : 'var(--color-foreground-danger)'
                : 'var(--color-border-muted)',
              backgroundColor: isSelected
                ? isIncome ? 'var(--color-background-accent-subtle)' : 'var(--color-background-danger-subtle)'
                : 'transparent',
            }}
          >
            {attr}
          </button>
        )
      })}
      <IconButton
        onClick={onClose}
        style={{ color: 'var(--color-foreground-muted)' }}
      >
        <XIcon size={12} />
      </IconButton>
    </div>
  )
}
