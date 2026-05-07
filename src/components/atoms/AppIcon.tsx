export function AppIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="appIconGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5AA8FF" />
          <stop offset="100%" stopColor="#1565F9" />
        </linearGradient>
      </defs>
      {/* Document body */}
      <path
        d="M22 12C22 8.7 24.7 6 28 6H76L106 36V100C106 103.3 103.3 106 100 106H28C24.7 106 22 103.3 22 100V12Z"
        fill="url(#appIconGrad)"
      />
      {/* Folded corner */}
      <path d="M76 6L106 36H82C78.7 36 76 33.3 76 30V6Z" fill="#0C56E8" />
      {/* Stems */}
      <path d="M46 68H82" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M64 68V50" stroke="white" strokeWidth="6" strokeLinecap="round" />
      {/* Decision nodes */}
      <circle cx="46" cy="68" r="9" fill="white" />
      <circle cx="82" cy="68" r="9" fill="white" />
      <circle cx="64" cy="50" r="9" fill="white" />
    </svg>
  )
}
