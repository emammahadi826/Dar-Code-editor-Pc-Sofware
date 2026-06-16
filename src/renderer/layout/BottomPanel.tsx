import React from 'react'
import { useAppStore } from '../store/appStore'
import { TerminalPanel } from '../components/Terminal/TerminalPanel'

const tabs = ['OUTPUT', 'TERMINAL', 'PROBLEMS'] as const

export function BottomPanel() {
  const { toggleBottomPanel, bottomPanelTab, setBottomPanelTab, outputLogs } = useAppStore()

  return (
    <div className="h-full bg-panel border-t border-panel-border flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 shrink-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setBottomPanelTab(tab)}
              className={`px-4 py-2 text-sm border-t-2 transition-colors ${
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
          className="text-panel-tab-text text-sm px-2 hover:text-white"
        >
          ─
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {bottomPanelTab === 'TERMINAL' ? (
          <TerminalPanel />
        ) : bottomPanelTab === 'OUTPUT' ? (
          <div className="p-4 font-mono text-sm bg-editor-bg h-full overflow-y-auto">
            {outputLogs.map((log, i) => (
              <div key={i} className="text-editor-text opacity-80">{log}</div>
            ))}
          </div>
        ) : (
          <div className="p-4 font-mono text-sm bg-editor-bg h-full text-editor-text opacity-40 overflow-y-auto">
            No problems detected
          </div>
        )}
      </div>
    </div>
  )
}
