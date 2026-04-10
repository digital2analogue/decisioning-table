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
      className={`dt-tab-item ${isActive ? 'dt-tab-item-active' : ''}`}
    >
      {name}
    </button>
  )
}
