import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionsMenu } from './ActionsMenu'

// Radix DropdownMenu uses PointerEvent internally — jsdom doesn't ship it.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    // Minimal stub so Radix can dispatch pointer events in jsdom.
    class PointerEvent extends MouseEvent {
      constructor(type: string, init?: PointerEventInit) {
        super(type, init)
      }
    }
    // @ts-expect-error patching global
    window.PointerEvent = PointerEvent
  }
  // Radix uses ResizeObserver for the portal/content sizing.
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})

function renderMenu(overrides: Partial<Parameters<typeof ActionsMenu>[0]> = {}) {
  const defaults = {
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
  }
  return render(<ActionsMenu {...defaults} {...overrides} />)
}

describe('ActionsMenu', () => {
  it('renders trigger button with aria-label "More options" by default', () => {
    renderMenu()
    expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument()
  })

  it('renders trigger with custom triggerAriaLabel', () => {
    renderMenu({ triggerAriaLabel: 'Row actions for Rule 1' })
    expect(screen.getByRole('button', { name: 'Row actions for Rule 1' })).toBeInTheDocument()
  })

  it('menu is closed on initial render', () => {
    renderMenu()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens menu on trigger click', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('shows Move up, Move down, Duplicate, and Delete rule items when open', async () => {
    const user = userEvent.setup()
    renderMenu({ onMoveUp: vi.fn(), onMoveDown: vi.fn() })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move down' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Delete rule/ })).toBeInTheDocument()
  })

  it('shows "Add child rule" when onAddChild is provided', async () => {
    const user = userEvent.setup()
    renderMenu({ onAddChild: vi.fn() })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.getByRole('menuitem', { name: 'Add child rule' })).toBeInTheDocument()
  })

  it('does not show "Add child rule" when onAddChild is omitted', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.queryByRole('menuitem', { name: 'Add child rule' })).not.toBeInTheDocument()
  })

  it('shows "Delete child rule" when isChild=true', async () => {
    const user = userEvent.setup()
    renderMenu({ isChild: true })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.getByRole('menuitem', { name: /Delete child rule/ })).toBeInTheDocument()
  })

  it('closes menu on Escape', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('calls onDuplicate when Duplicate is selected', async () => {
    const user = userEvent.setup()
    const onDuplicate = vi.fn()
    renderMenu({ onDuplicate })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }))
    expect(onDuplicate).toHaveBeenCalledOnce()
  })

  it('calls onDelete when Delete rule is selected', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderMenu({ onDelete })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    await user.click(screen.getByRole('menuitem', { name: /Delete rule/ }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('calls onMoveUp when Move up is selected', async () => {
    const user = userEvent.setup()
    const onMoveUp = vi.fn()
    renderMenu({ onMoveUp })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    await user.click(screen.getByRole('menuitem', { name: 'Move up' }))
    expect(onMoveUp).toHaveBeenCalledOnce()
  })

  it('Move up item is disabled when onMoveUp is not provided', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'More options' }))
    const moveUpItem = screen.getByRole('menuitem', { name: 'Move up' })
    expect(moveUpItem).toHaveAttribute('data-disabled')
  })

  it('Move down item is disabled when onMoveDown is not provided', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByRole('button', { name: 'More options' }))
    const moveDownItem = screen.getByRole('menuitem', { name: 'Move down' })
    expect(moveDownItem).toHaveAttribute('data-disabled')
  })

  it('navigates items with arrow keys', async () => {
    const user = userEvent.setup()
    renderMenu({ onMoveUp: vi.fn(), onMoveDown: vi.fn() })
    await user.click(screen.getByRole('button', { name: 'More options' }))
    // Menu should be open and the menu container should have focus.
    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()
    // Press arrow down twice — Radix moves highlight through items.
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    // After two ArrowDown presses from the top, "Move down" item should be highlighted.
    expect(screen.getByRole('menuitem', { name: 'Move down' })).toHaveAttribute('data-highlighted')
  })
})
