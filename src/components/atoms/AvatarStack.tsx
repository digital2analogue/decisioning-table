const AVATARS = [
  { initials: 'JT', bg: 'var(--color-background-accent-indigo-bold)', color: 'var(--color-foreground-accent-on-indigo)' },
  { initials: 'MR', bg: 'var(--color-background-accent-sky-bold)', color: 'var(--color-foreground-accent-on-sky)' },
  { initials: 'AS', bg: 'var(--color-background-accent-green-bold)', color: 'var(--color-foreground-accent-on-green)' },
  { initials: 'DK', bg: 'var(--color-background-accent-amber-bold)', color: '#fff' }, /* DS-debt: accent-on-amber is dark for tints; hardcode white for bold fill */
]

const VISIBLE = 3
const OVERFLOW = AVATARS.length - VISIBLE

export function AvatarStack() {
  return (
    <div className="dt-avatar-stack" role="img" aria-label={`${AVATARS.length} collaborators`} title={`${AVATARS.length} collaborators`}>
      {AVATARS.slice(0, VISIBLE).map((a, i) => (
        <span
          key={i}
          className="dt-avatar"
          style={{ background: a.bg, color: a.color, zIndex: VISIBLE - i }}
          aria-hidden="true"
        >
          {a.initials}
        </span>
      ))}
      {OVERFLOW > 0 && (
        <span className="dt-avatar dt-avatar-overflow" style={{ zIndex: 0 }} aria-hidden="true">
          +{OVERFLOW}
        </span>
      )}
    </div>
  )
}
