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
      className="px-4 py-3 text-sm font-medium border-t-2 whitespace-nowrap transition-colors"
      style={
        isActive
          ? {
              borderColor: 'var(--dt-color-accent-default)',
              color: 'var(--dt-color-accent-text)',
            }
          : {
              borderColor: 'transparent',
              color: 'var(--dt-color-text-secondary)',
            }
      }
    >
      {name}
    </button>
  )
}
