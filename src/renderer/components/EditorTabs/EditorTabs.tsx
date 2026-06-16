import React from 'react'
import { X, Circle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

export function EditorTabs() {
  const { openTabs, activeTab, setActiveTab, closeTab } = useAppStore()

  if (openTabs.length === 0) return null

  return (
    <div className="flex bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-x-auto">
      {openTabs.map((tab) => (
        <div
          key={tab.path}
          onClick={() => setActiveTab(tab.path)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer border-r border-[var(--border)] min-w-0 shrink-0 group ${
            activeTab === tab.path
              ? 'bg-editor-bg text-white border-t-2 border-t-accent-blue pt-[5px]'
              : 'text-editor-text opacity-70 hover:opacity-100 hover:bg-hover'
          }`}
        >
          {tab.isDirty && <Circle size={8} className="text-accent-orange fill-accent-orange shrink-0" />}
          <span className="truncate max-w-32">{tab.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.path) }}
            className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-active rounded p-0.5 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
