import React from 'react'
import { Minus, Square, X } from 'lucide-react'
import appIcon from '../assets/icon-32.png'
import { MenuBar } from './MenuBar'

export function TitleBar() {
  const handleMinimize = () => window.electron?.minimize()
  const handleMaximize = () => window.electron?.maximize()
  const handleClose = () => window.electron?.close()

  return (
    <div
      className="h-10 flex items-center justify-between bg-titlebar-bg select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-3 px-3 shrink-0">
        <img src={appIcon} alt="Dar Studio" className="w-8 h-8" />
        <span className="text-titlebar-text text-sm font-semibold">Dar Studio</span>
      </div>
      <div className="flex-1 h-full flex items-center justify-center">
        <MenuBar />
      </div>
      <div className="flex shrink-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className="w-11 h-10 flex items-center justify-center text-titlebar-text hover:bg-hover transition-colors"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={handleMaximize}
          className="w-11 h-10 flex items-center justify-center text-titlebar-text hover:bg-hover transition-colors"
        >
          <Square size={13} />
        </button>
        <button
          onClick={handleClose}
          className="w-11 h-10 flex items-center justify-center text-titlebar-text hover:bg-accent-red hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
