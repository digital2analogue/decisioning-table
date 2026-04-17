import type { RuleStatus } from '../../types'
import { SelectMenu } from '../atoms/SelectMenu'
import type { SelectMenuOption } from '../atoms/SelectMenu'

export interface StatusEditorProps {
  value: RuleStatus
  onChange: (v: RuleStatus) => void
  onClose: () => void
}

const OPTIONS: SelectMenuOption<RuleStatus>[] = [
  {
    value: 'active',
    label: 'Active',
    description: 'Rule is live and evaluated',
    leading: <span className="dt-status-dot dt-status-dot-active" aria-hidden />,
  },
  {
    value: 'draft',
    label: 'Draft',
    description: 'Work in progress, not evaluated',
    leading: <span className="dt-status-dot dt-status-dot-draft" aria-hidden />,
  },
  {
    value: 'disabled',
    label: 'Disabled',
    description: 'Temporarily turned off',
    leading: <span className="dt-status-dot dt-status-dot-disabled" aria-hidden />,
  },
]

export function StatusEditor({ value, onChange, onClose }: StatusEditorProps) {
  return (
    <SelectMenu<RuleStatus>
      value={value}
      options={OPTIONS}
      onChange={onChange}
      onClose={onClose}
      ariaLabel="Rule status"
    />
  )
}
