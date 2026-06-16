import React from 'react'
import { useAppStore } from '../store/appStore'

export function RightPanel() {
  const { rightPanelOpen, activeTab } = useAppStore()

  if (!rightPanelOpen) return null

  return (
    <div className="w-[220px] bg-sidepanel-bg border-l border-sidepanel-border flex flex-col text-sm overflow-hidden">
      <div className="px-4 py-2 border-b border-sidepanel-border">
        <span className="text-sidepanel-header text-xs font-semibold uppercase tracking-wider">
          Outline
        </span>
      </div>
      <div className="flex-1 p-3">
        {activeTab ? (
          <div className="text-sidepanel-text text-xs opacity-60">
            No symbols found
          </div>
        ) : (
          <div className="text-sidepanel-text text-xs opacity-40">
            Open a file to see outline
          </div>
        )}
      </div>
    </div>
  )
}
