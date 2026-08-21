import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { useState } from 'react'
import { Toast } from './Toast'

const meta: Meta<typeof Toast> = {
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
    onAction: { action: 'action clicked' },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

export const MessageOnly: Story = {
  args: {
    message: 'Rule deleted.',
    durationMs: 0,
    onDismiss: fn(),
  },
}

export const WithUndo: Story = {
  args: {
    message: 'Rule deleted.',
    actionLabel: 'Undo',
    durationMs: 0,
    onDismiss: fn(),
    onAction: fn(),
  },
}

export const AutoDismiss: Story = {
  args: {
    message: 'Changes saved.',
    durationMs: 3000,
    onDismiss: fn(),
  },
}

export const Interactive: Story = {
  render: () => {
    const [visible, setVisible] = useState(false)
    return (
      <div style={{ padding: 32 }}>
        <button
          type="button"
          className="dt-btn dt-btn-primary"
          onClick={() => setVisible(true)}
        >
          Delete a rule
        </button>
        {visible && (
          <Toast
            message="Rule 3 deleted."
            actionLabel="Undo"
            onAction={() => setVisible(false)}
            onDismiss={() => setVisible(false)}
            durationMs={5000}
          />
        )}
      </div>
    )
  },
}
