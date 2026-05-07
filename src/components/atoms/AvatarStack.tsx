const AVATARS = [
  { initials: 'JT', bg: 'var(--color-avatar-indigo)', color: '#fff' },
  { initials: 'MR', bg: 'var(--color-avatar-sky)', color: '#fff' },
  { initials: 'AS', bg: 'var(--color-avatar-emerald)', color: '#fff' },
  { initials: 'DK', bg: 'var(--color-avatar-amber)', color: '#fff' },
]

const VISIBLE = 3
const OVERFLOW = AVATARS.length - VISIBLE

export function AvatarStack() {
  return (
    <div className="dt-avatar-stack" aria-label={`${AVATARS.length} collaborators`} title={`${AVATARS.length} collaborators`}>
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
