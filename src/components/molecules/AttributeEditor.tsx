import { XIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
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
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
            attr === value
              ? attr === 'Income'
                ? 'bg-[var(--dt-color-success-muted)] text-[var(--dt-color-success-text)] border-[var(--dt-color-success-default)]'
                : 'bg-[var(--dt-color-danger-muted)] text-[var(--dt-color-danger-text)] border-[var(--dt-color-danger-default)]'
              : 'bg-[var(--dt-color-bg-raised)] text-[var(--dt-color-text-secondary)] border-[var(--dt-color-border-default)] hover:border-[var(--dt-color-border-emphasis)]',
          )}
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
