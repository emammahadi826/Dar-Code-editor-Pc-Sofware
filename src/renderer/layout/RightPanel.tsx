import React from 'react'
import { useAppStore } from '../store/appStore'

export function RightPanel() {
  const { activeTab } = useAppStore()

  return (
    <div className="h-full min-w-[200px] bg-sidepanel-bg border-l border-sidepanel-border flex flex-col text-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-sidepanel-border shrink-0">
        <span className="text-sidepanel-header text-sm font-semibold uppercase tracking-wider">
          Outline
        </span>
      </div>
      <div className="flex-1 p-4">
        {activeTab ? (
          <div className="text-sidepanel-text text-sm opacity-60">
            No symbols found
          </div>
        ) : (
          <div className="text-sidepanel-text text-sm opacity-40">
            Open a file to see outline
          </div>
        )}
      </div>
    </div>
  )
}
