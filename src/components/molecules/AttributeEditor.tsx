import type { DataAttribute } from '../../types'
import { SelectMenu } from '../atoms/SelectMenu'
import type { SelectMenuOption } from '../atoms/SelectMenu'

export interface AttributeEditorProps {
  value: DataAttribute
  onChange: (v: DataAttribute) => void
  onClose: () => void
}

const OPTIONS: SelectMenuOption<DataAttribute>[] = [
  {
    value: 'Income',
    label: 'Income',
    description: 'Money coming in',
    leading: <span className="dt-attr-swatch dt-attr-swatch-income" aria-hidden />,
  },
  {
    value: 'Expense',
    label: 'Expense',
    description: 'Money going out',
    leading: <span className="dt-attr-swatch dt-attr-swatch-expense" aria-hidden />,
  },
  {
    value: 'Asset',
    label: 'Asset',
    description: 'Something owned',
    leading: <span className="dt-attr-swatch dt-attr-swatch-asset" aria-hidden />,
  },
  {
    value: 'Liability',
    label: 'Liability',
    description: 'Something owed',
    leading: <span className="dt-attr-swatch dt-attr-swatch-liability" aria-hidden />,
  },
]

export function AttributeEditor({ value, onChange, onClose }: AttributeEditorProps) {
  return (
    <SelectMenu<DataAttribute>
      value={value}
      options={OPTIONS}
      onChange={onChange}
      onClose={onClose}
      ariaLabel="Data attribute"
    />
  )
}
