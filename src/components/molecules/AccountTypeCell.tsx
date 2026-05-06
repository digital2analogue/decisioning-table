import { accountTypes } from '../../data'
import { Picker, type PickerOption } from '../atoms/Picker'

const PICKER_OPTIONS: PickerOption<string>[] = accountTypes.map((a) => ({
  value: a.id,
  label: a.label,
}))

export function AccountTypeCell({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Picker<string>
      value={value || null}
      onChange={onChange}
      options={PICKER_OPTIONS}
      placeholder="Select account type"
      triggerVariant="select-trigger"
      width="full"
      ariaLabel="Account type"
      renderOption={(opt) => {
        const acct = accountTypes.find((a) => a.id === opt.value)
        return (
          <span className="flex flex-col">
            <span className="dt-conditional-dropdown-var-name">{opt.label}</span>
            {acct && <span className="dt-conditional-dropdown-desc">{acct.description}</span>}
          </span>
        )
      }}
    />
  )
}
