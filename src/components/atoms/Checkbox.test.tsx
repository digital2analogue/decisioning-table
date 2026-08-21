import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders unchecked', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked', () => {
    render(<Checkbox checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('renders indeterminate state', () => {
    render(<Checkbox checked={false} indeterminate={true} onChange={vi.fn()} />)
    const cb = screen.getByRole('checkbox') as HTMLInputElement
    expect(cb.indeterminate).toBe(true)
  })

  it('calls onChange with true when clicked while unchecked', async () => {
    const onChange = vi.fn()
    render(<Checkbox checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when clicked while checked', async () => {
    const onChange = vi.fn()
    render(<Checkbox checked={true} onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})
