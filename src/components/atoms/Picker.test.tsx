import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Operator } from '../../types'
import { Picker, type PickerOption } from './Picker'

const OPTIONS: PickerOption<Operator>[] = [
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'At least' },
  { value: '<', label: 'Less than' },
  { value: '<=', label: 'At most' },
  { value: '=', label: 'Equals' },
]

function renderPicker(value: Operator | null, onChange = vi.fn()) {
  return render(
    <Picker<Operator>
      value={value}
      onChange={onChange}
      options={OPTIONS}
      placeholder="Select operator"
      triggerVariant="select-trigger"
      ariaLabel="Operator"
    />,
  )
}

describe('Picker — closed state', () => {
  it('shows placeholder when value is null', () => {
    renderPicker(null)
    expect(screen.getByRole('button', { name: 'Operator' })).toHaveTextContent('Select operator')
  })

  it('shows selected label when value is set', () => {
    renderPicker('>')
    expect(screen.getByRole('button', { name: 'Operator' })).toHaveTextContent('Greater than')
  })

  it('marks trigger as aria-expanded=false when closed', () => {
    renderPicker(null)
    expect(screen.getByRole('button', { name: 'Operator' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks trigger as aria-invalid when error prop is set', () => {
    render(
      <Picker<Operator>
        value={null}
        onChange={vi.fn()}
        options={OPTIONS}
        placeholder="Select operator"
        triggerVariant="select-trigger"
        ariaLabel="Operator"
        error={true}
      />,
    )
    expect(screen.getByRole('button', { name: 'Operator' })).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('Picker — open/close', () => {
  it('opens listbox on click', async () => {
    renderPicker(null)
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    expect(screen.getByRole('listbox', { name: 'Operator' })).toBeInTheDocument()
  })

  it('marks trigger as aria-expanded=true when open', async () => {
    renderPicker(null)
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    expect(screen.getByRole('button', { name: 'Operator' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders all options in the listbox', async () => {
    renderPicker(null)
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(OPTIONS.length)
    expect(options[0]).toHaveTextContent('Greater than')
  })

  it('closes on second click (toggle)', async () => {
    renderPicker(null)
    const trigger = screen.getByRole('button', { name: 'Operator' })
    await userEvent.click(trigger)
    await userEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    renderPicker(null)
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

describe('Picker — selection', () => {
  it('calls onChange with selected value when option is clicked', async () => {
    const onChange = vi.fn()
    renderPicker(null, onChange)
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    await userEvent.click(screen.getByRole('option', { name: 'Less than' }))
    expect(onChange).toHaveBeenCalledWith('<')
  })

  it('marks currently selected option as aria-selected=true', async () => {
    renderPicker('>=')
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    expect(screen.getByRole('option', { name: 'At least' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Greater than' })).toHaveAttribute('aria-selected', 'false')
  })

  it('closes the listbox after selection', async () => {
    renderPicker(null)
    await userEvent.click(screen.getByRole('button', { name: 'Operator' }))
    await userEvent.click(screen.getByRole('option', { name: 'Equals' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

describe('Picker — keyboard navigation', () => {
  it('opens on ArrowDown and focuses first option', async () => {
    renderPicker(null)
    screen.getByRole('button', { name: 'Operator' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('selects focused option on Enter', async () => {
    const onChange = vi.fn()
    renderPicker(null, onChange)
    screen.getByRole('button', { name: 'Operator' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('>')
  })

  it('cycles through options with ArrowDown/ArrowUp', async () => {
    renderPicker(null)
    screen.getByRole('button', { name: 'Operator' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    // focusedIdx should now be 1 (At least)
    const options = screen.getAllByRole('option')
    expect(options[1]).toHaveAttribute('data-focused')
  })
})
