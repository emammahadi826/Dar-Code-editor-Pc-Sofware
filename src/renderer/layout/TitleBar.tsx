import React from 'react'
import { Minus, Square, X } from 'lucide-react'
import appIcon from '../assets/icon-32.png'

export function TitleBar() {
  const handleMinimize = () => window.electron?.minimize()
  const handleMaximize = () => window.electron?.maximize()
  const handleClose = () => window.electron?.close()

  return (
    <div
      className="h-12 flex items-center justify-between bg-titlebar-bg select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-3 px-5">
        <img src={appIcon} alt="Dar Studio" className="w-7 h-7" />
        <span className="text-titlebar-text text-base font-semibold">Dar Studio</span>
      </div>
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className="w-12 h-12 flex items-center justify-center text-titlebar-text hover:bg-hover transition-colors"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-12 flex items-center justify-center text-titlebar-text hover:bg-hover transition-colors"
        >
          <Square size={14} />
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-12 flex items-center justify-center text-titlebar-text hover:bg-accent-red hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
