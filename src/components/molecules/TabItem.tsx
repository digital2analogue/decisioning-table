export interface TabItemProps {
  id: string
  name: string
  isActive: boolean
  onClick: (id: string) => void
}

export function TabItem({ id, name, isActive, onClick }: TabItemProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className="px-4 py-3 whitespace-nowrap border-t-2 transition-colors"
      style={{
        fontFamily: 'var(--font-label-medium-family)',
        fontSize: 'var(--font-label-medium-size)',
        lineHeight: 'var(--font-label-medium-line-height)',
        background: 'none',
        cursor: 'pointer',
        borderTopColor: isActive ? 'var(--color-foreground-accent)' : 'transparent',
        color: isActive ? 'var(--color-foreground-accent)' : 'var(--color-foreground-muted)',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
      }}
    >
      {name}
    </button>
  )
}
