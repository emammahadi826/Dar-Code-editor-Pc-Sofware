import React from 'react'
import { useAppStore } from '../store/appStore'
import { TerminalPanel } from '../components/Terminal/TerminalPanel'

const tabs = ['OUTPUT', 'TERMINAL', 'PROBLEMS'] as const

export function BottomPanel() {
  const { bottomPanelOpen, toggleBottomPanel, bottomPanelTab, setBottomPanelTab, outputLogs } = useAppStore()

  return (
    <div className="bg-panel border-t border-panel-border flex flex-col">
      <div className="flex items-center justify-between px-2">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setBottomPanelTab(tab)}
              className={`px-3 py-1.5 text-xs border-t-2 transition-colors ${
                bottomPanelTab === tab
                  ? 'text-panel-tab-active border-accent-blue bg-editor-bg'
                  : 'text-panel-tab-text border-transparent hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={toggleBottomPanel}
          className="text-panel-tab-text text-xs px-2 hover:text-white"
        >
          {bottomPanelOpen ? '─' : '+'}
        </button>
      </div>
      {bottomPanelOpen && (
        <div className="h-[200px] overflow-y-auto">
          {bottomPanelTab === 'TERMINAL' ? (
            <TerminalPanel />
          ) : bottomPanelTab === 'OUTPUT' ? (
            <div className="p-3 font-mono text-xs bg-editor-bg h-full">
              {outputLogs.map((log, i) => (
                <div key={i} className="text-editor-text opacity-80">{log}</div>
              ))}
            </div>
          ) : (
            <div className="p-3 font-mono text-xs bg-editor-bg h-full text-editor-text opacity-40">
              No problems detected
            </div>
          )}
        </div>
      )}
    </div>
  )
}
