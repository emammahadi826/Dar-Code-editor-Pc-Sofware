import React from 'react'
import { Minus, Square, X } from 'lucide-react'

export function TitleBar() {
  const handleMinimize = () => window.electron?.minimize()
  const handleMaximize = () => window.electron?.maximize()
  const handleClose = () => window.electron?.close()

  return (
    <div
      className="h-10 flex items-center justify-between bg-titlebar-bg select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-2 px-4">
        <svg className="w-5 h-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span className="text-titlebar-text text-sm font-medium">Dar Studio</span>
      </div>
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className="w-11 h-10 flex items-center justify-center text-titlebar-text hover:bg-hover transition-colors"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-11 h-10 flex items-center justify-center text-titlebar-text hover:bg-hover transition-colors"
        >
          <Square size={12} />
        </button>
        <button
          onClick={handleClose}
          className="w-11 h-10 flex items-center justify-center text-titlebar-text hover:bg-accent-red hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
