export function AppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="20" height="20" rx="3" fill="#2456E4" />
      <rect x="2" y="2" width="16" height="5" rx="1" fill="#3D6BF0" />
      <line x1="6.5" y1="2" x2="6.5" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
      <line x1="12" y1="2" x2="12" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
      <line x1="2" y1="7" x2="18" y2="7" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
      <line x1="2" y1="12.5" x2="18" y2="12.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
    </svg>
  )
}
