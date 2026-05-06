const AVATARS = [
  { initials: 'JT', bg: '#6366f1', color: '#fff' },
  { initials: 'MR', bg: '#0ea5e9', color: '#fff' },
  { initials: 'AS', bg: '#10b981', color: '#fff' },
  { initials: 'DK', bg: '#f59e0b', color: '#fff' },
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
