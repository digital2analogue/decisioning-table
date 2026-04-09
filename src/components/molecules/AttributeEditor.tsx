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
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-red-100 text-red-700 border-red-300'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
          )}
        >
          {attr}
        </button>
      ))}
      <IconButton onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <XIcon size={12} />
      </IconButton>
    </div>
  )
}
