import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-react'

export interface ActionsMenuProps {
  /** Optional — only render the "Add child rule" item when provided (parent rules only). */
  onAddChild?: () => void
  onDuplicate: () => void
  onDelete: () => void
  /** Reorder handlers — disabled when undefined (top/bottom of list). */
  onMoveUp?: () => void
  onMoveDown?: () => void
  /** When true, delete label reads "Delete child rule" instead of "Delete rule". */
  isChild?: boolean
  /** Accessible label for the trigger button (describes which row this menu belongs to). */
  triggerAriaLabel?: string
}

export function ActionsMenu({
  onAddChild,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isChild,
  triggerAriaLabel = 'More options',
}: ActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={triggerAriaLabel}
          className="dt-icon-btn dt-toolbar-btn"
        >
          <MoreHorizontalIcon size={18} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dt-menu"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Item
            className="dt-menu-item"
            disabled={!onMoveUp}
            onSelect={() => onMoveUp?.()}
          >
            Move up
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="dt-menu-item"
            disabled={!onMoveDown}
            onSelect={() => onMoveDown?.()}
          >
            Move down
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="dt-menu-divider" />

          {onAddChild && (
            <DropdownMenu.Item
              className="dt-menu-item"
              onSelect={onAddChild}
            >
              Add child rule
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item
            className="dt-menu-item"
            onSelect={onDuplicate}
          >
            Duplicate
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="dt-menu-divider" />

          <DropdownMenu.Item
            className="dt-menu-item-danger"
            onSelect={onDelete}
          >
            <Trash2Icon size={13} />
            {isChild ? 'Delete child rule' : 'Delete rule'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
