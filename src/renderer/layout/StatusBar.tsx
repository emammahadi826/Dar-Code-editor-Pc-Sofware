import React from 'react'
import { useAppStore } from '../store/appStore'
import { useSettingsStore } from '../store/settingsStore'
import appIcon from '../assets/icon-16.png'

export function StatusBar() {
  const { cursorLine, cursorColumn, activeTab, openTabs, rootPath } = useAppStore()
  const { fontSize } = useSettingsStore()

  const activeFile = openTabs.find((t) => t.path === activeTab)

  return (
    <div className="h-6 bg-statusbar-bg text-statusbar-text flex items-center px-4 text-sm gap-5 shrink-0">
      <img src={appIcon} alt="" className="w-4 h-4" />
      <span className="opacity-80">Ln {cursorLine}, Col {cursorColumn}</span>
      {activeFile && (
        <span className="opacity-80">{activeFile.language}</span>
      )}
      <span className="opacity-80">Spaces: {2}</span>
      <span className="opacity-80">UTF-8</span>
      <div className="flex-1" />
      {rootPath && (
        <span className="opacity-60 truncate max-w-56">{rootPath}</span>
      )}
      <span className="opacity-60">Dar Studio v1.0.0</span>
    </div>
  )
}
