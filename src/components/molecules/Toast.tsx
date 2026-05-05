import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'

export interface ToastProps {
  /** Body text shown in the toast. */
  message: string
  /** Optional action button (e.g., "Undo"). When clicked, runs onAction then dismisses. */
  actionLabel?: string
  onAction?: () => void
  /** Called when the toast is dismissed (timer expiry, action, or close button). */
  onDismiss: () => void
  /** Auto-dismiss after N ms. Defaults to 5000. Pass 0 to disable. */
  durationMs?: number
}

/**
 * Single-toast notification — renders via portal at the bottom-center of the
 * viewport. Auto-dismisses after `durationMs`. Action button is optional;
 * when present, clicking it runs `onAction()` and then dismisses.
 *
 * Designed for use in places where a destructive action should be recoverable
 * (e.g., delete with undo). Caller manages the toast state and clears it
 * via onDismiss.
 */
export function Toast({ message, actionLabel, onAction, onDismiss, durationMs = 5000 }: ToastProps) {
  useEffect(() => {
    if (durationMs <= 0) return
    const t = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(t)
  }, [durationMs, onDismiss])

  return createPortal(
    <div role="status" aria-live="polite" className="dt-toast">
      <span className="dt-toast-message">{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={() => { onAction(); onDismiss() }}
          className="dt-toast-action"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="dt-toast-close"
      >
        <XIcon size={14} />
      </button>
    </div>,
    document.body,
  )
}
