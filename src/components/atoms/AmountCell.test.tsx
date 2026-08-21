import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AmountCell } from './AmountCell'

describe('AmountCell', () => {
  it('renders empty when value is null', () => {
    render(<AmountCell value={null} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Amount')).toHaveValue('')
  })

  it('renders a formatted value when blurred', () => {
    render(<AmountCell value={50000} onChange={vi.fn()} />)
    // Blurred state shows locale-formatted value as text input
    expect(screen.getByDisplayValue('50,000')).toBeInTheDocument()
  })

  it('applies error class when error=true', () => {
    const { container } = render(<AmountCell value={null} error={true} onChange={vi.fn()} />)
    expect(container.firstChild).toHaveClass('dt-cell-error')
  })

  it('calls onChange with parsed number on input', () => {
    const onChange = vi.fn()
    render(<AmountCell value={null} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '75000' } })
    expect(onChange).toHaveBeenCalledWith(75000)
  })

  it('calls onChange with null when input is cleared', () => {
    const onChange = vi.fn()
    // Render with a filled value so the change event actually mutates the input
    render(<AmountCell value={50000} onChange={onChange} />)
    fireEvent.change(screen.getByDisplayValue('50,000'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('strips commas from pasted values', () => {
    const onChange = vi.fn()
    render(<AmountCell value={null} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1,250,000' } })
    expect(onChange).toHaveBeenCalledWith(1250000)
  })
})
