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
      className={`px-4 py-3 text-sm font-medium border-t-2 whitespace-nowrap transition-colors ${
        isActive
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {name}
    </button>
  )
}
