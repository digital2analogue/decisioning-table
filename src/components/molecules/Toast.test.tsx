import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders the message', () => {
    render(<Toast message="Rule deleted." onDismiss={vi.fn()} durationMs={0} />)
    expect(screen.getByText('Rule deleted.')).toBeInTheDocument()
  })

  it('renders action button when actionLabel is provided', () => {
    render(
      <Toast
        message="Rule deleted."
        actionLabel="Undo"
        onAction={vi.fn()}
        onDismiss={vi.fn()}
        durationMs={0}
      />,
    )
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('does not render action button when actionLabel is omitted', () => {
    render(<Toast message="Saved." onDismiss={vi.fn()} durationMs={0} />)
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
  })

  it('renders a dismiss button', () => {
    render(<Toast message="Saved." onDismiss={vi.fn()} durationMs={0} />)
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiss = vi.fn()
    render(<Toast message="Saved." onDismiss={onDismiss} durationMs={0} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls onAction and onDismiss when action button is clicked', async () => {
    const onAction = vi.fn()
    const onDismiss = vi.fn()
    render(
      <Toast
        message="Rule deleted."
        actionLabel="Undo"
        onAction={onAction}
        onDismiss={onDismiss}
        durationMs={0}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('uses role=status with aria-live=polite', () => {
    render(<Toast message="Saved." onDismiss={vi.fn()} durationMs={0} />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('auto-dismisses after durationMs', async () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast message="Saved." onDismiss={onDismiss} durationMs={3000} />)
    expect(onDismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(onDismiss).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('does not auto-dismiss when durationMs=0', async () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast message="Saved." onDismiss={onDismiss} durationMs={0} />)
    vi.advanceTimersByTime(10000)
    expect(onDismiss).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
