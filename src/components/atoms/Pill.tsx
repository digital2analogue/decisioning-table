import type { ReactNode, MouseEvent, ButtonHTMLAttributes } from 'react'

export type PillTone = 'neutral' | 'muted' | 'blue' | 'green' | 'red' | 'purple'
export type PillVariant = 'soft' | 'outline-dashed'

export interface PillProps {
  tone?: PillTone
  variant?: PillVariant
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  title?: string
  ariaLabel?: string
  ariaHasPopup?: ButtonHTMLAttributes<HTMLButtonElement>['aria-haspopup']
  className?: string
  children: ReactNode
}

export function Pill({
  tone = 'neutral',
  variant = 'soft',
  leading,
  trailing,
  onClick,
  title,
  ariaLabel,
  ariaHasPopup,
  className,
  children,
}: PillProps) {
  const classes = [
    'dt-pill',
    `dt-pill-tone-${tone}`,
    variant !== 'soft' && `dt-pill-variant-${variant}`,
    onClick && 'dt-pill-interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      {leading}
      <span className="dt-pill-label">{children}</span>
      {trailing}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={ariaLabel}
        aria-haspopup={ariaHasPopup}
        className={classes}
      >
        {inner}
      </button>
    )
  }

  return (
    <span title={title} aria-label={ariaLabel} className={classes}>
      {inner}
    </span>
  )
}
