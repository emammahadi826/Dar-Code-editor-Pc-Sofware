import React from 'react'
import { Files, Search, GitBranch, Puzzle, Settings } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const items = [
  { id: 'Files', icon: Files, label: 'Explorer' },
  { id: 'Search', icon: Search, label: 'Search' },
  { id: 'Git', icon: GitBranch, label: 'Source Control' },
  { id: 'Extensions', icon: Puzzle, label: 'Extensions' },
  { id: 'Settings', icon: Settings, label: 'Settings' },
] as const

export function ActivityBar() {
  const activeModule: string = 'Files'
  const setActiveModule = (id: string) => {
    // future: switch right panel content
  }

  return (
    <div className="w-12 bg-activitybar-bg flex flex-col items-center py-2 gap-1 border-r border-[var(--border)]">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveModule(id)}
          title={label}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors relative ${
            activeModule === id
              ? 'text-activitybar-icon-active'
              : 'text-activitybar-icon hover:text-white'
          }`}
        >
          {activeModule === id && (
            <div className="absolute left-0 w-0.5 h-5 bg-accent-blue rounded-r" />
          )}
          <Icon size={20} />
        </button>
      ))}
    </div>
  )
}
