import React from 'react'
import { Files, Search, GitBranch, Puzzle, Settings } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const items = [
  { id: 'Files' as const, icon: Files, label: 'Explorer' },
  { id: 'Search' as const, icon: Search, label: 'Search' },
  { id: 'Git' as const, icon: GitBranch, label: 'Source Control' },
  { id: 'Extensions' as const, icon: Puzzle, label: 'Extensions' },
  { id: 'Settings' as const, icon: Settings, label: 'Settings' },
]

export function ActivityBar() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  return (
    <div className="w-14 bg-activitybar-bg flex flex-col items-center py-3 gap-1 border-r border-[var(--border)] shrink-0">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveModule(id)}
          title={label}
          className={`w-11 h-11 flex items-center justify-center rounded transition-colors relative ${
            activeModule === id
              ? 'text-activitybar-icon-active'
              : 'text-activitybar-icon hover:text-white'
          }`}
        >
          {activeModule === id && (
            <div className="absolute left-0 w-0.5 h-6 bg-accent-blue rounded-r" />
          )}
          <Icon size={24} />
        </button>
      ))}
    </div>
  )
}
