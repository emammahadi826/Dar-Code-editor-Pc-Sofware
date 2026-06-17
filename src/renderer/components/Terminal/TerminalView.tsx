import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { SearchAddon } from '@xterm/addon-search'
import '@xterm/xterm/css/xterm.css'

const TERMINAL_THEME = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#d4d4d4',
  selectionBackground: '#264f78',
  black: '#000000', red: '#cd3131', green: '#0dbc79', yellow: '#e5e510',
  blue: '#2472c8', magenta: '#bc3fbc', cyan: '#11a8cd', white: '#e5e5e5',
  brightBlack: '#666666', brightRed: '#f14c4c', brightGreen: '#23d18b',
  brightYellow: '#f5f543', brightBlue: '#3b8eea', brightMagenta: '#d670d6',
  brightCyan: '#29b8db', brightWhite: '#e5e5e5',
}

export interface TerminalViewHandle {
  fit: () => void
  terminalId: number
}

interface Props {
  terminalId: number
  onReady?: (terminalId: number) => void
}

export const TerminalView = forwardRef<TerminalViewHandle, Props>(
  function TerminalView({ terminalId, onReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<{ term: Terminal; fitAddon: FitAddon; searchAddon?: SearchAddon } | null>(null)
    const cleanupRef = useRef<(() => void) | null>(null)
    const readyRef = useRef(false)
    const lastTermIdRef = useRef(terminalId)
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [searchResults, setSearchResults] = useState<string>('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      fit: () => {
        try { xtermRef.current?.fitAddon.fit() } catch {}
      },
      terminalId,
    }), [terminalId])

    const handleCopy = useCallback(() => {
      const term = xtermRef.current?.term
      if (!term) return
      const selection = term.getSelection()
      if (selection) {
        navigator.clipboard.writeText(selection)
        term.clearSelection()
      }
    }, [])

    const handlePaste = useCallback(async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (text && lastTermIdRef.current > 0) {
          window.electron?.terminal?.write(lastTermIdRef.current, text)
        }
      } catch {}
    }, [])

    const handleClear = useCallback(() => {
      xtermRef.current?.term.clear()
    }, [])

    const connectTerminal = useCallback(async (id: number) => {
      if (!window.electron?.terminal) return

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'bar',
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: TERMINAL_THEME,
        allowTransparency: false,
        scrollback: 5000,
        altClickMovesCursor: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      try {
        term.loadAddon(new WebglAddon())
      } catch {}

      try {
        term.loadAddon(new Unicode11Addon())
      } catch {}

      const searchAddon = new SearchAddon()
      term.loadAddon(searchAddon)

      searchAddon.onDidChangeResults((results) => {
        const { resultIndex, resultCount } = results
        if (resultCount > 0) {
          setSearchResults(`${resultIndex + 1} of ${resultCount}`)
        } else {
          setSearchResults(resultCount === 0 ? 'No results' : '')
        }
      })

      if (containerRef.current) {
        term.open(containerRef.current)
      }

      setTimeout(() => {
        try { fitAddon.fit() } catch {}
      }, 50)

      const removeDataListener = window.electron.terminal.onData((eventId, data) => {
        if (eventId === id) {
          term.write(data)
        }
      })

      term.attachCustomKeyEventHandler((e) => {
        if (e.type !== 'keydown') return true

        const key = e.key.toLowerCase()

        if (e.ctrlKey && key === 'c') {
          const selection = term.getSelection()
          if (selection) {
            navigator.clipboard.writeText(selection)
            term.clearSelection()
            return false
          }
          return true
        }

        if (e.ctrlKey && e.shiftKey && key === 'c') {
          const selection = term.getSelection()
          if (selection) {
            navigator.clipboard.writeText(selection)
          }
          return false
        }

        if (e.ctrlKey && key === 'v') {
          navigator.clipboard.readText().then((text) => {
            window.electron?.terminal?.write(id, text)
          }).catch(() => {})
          return false
        }

        if (e.ctrlKey && e.shiftKey && key === 'v') {
          navigator.clipboard.readText().then((text) => {
            window.electron?.terminal?.write(id, text)
          }).catch(() => {})
          return false
        }

        if (e.shiftKey && key === 'insert') {
          navigator.clipboard.readText().then((text) => {
            window.electron?.terminal?.write(id, text)
          }).catch(() => {})
          return false
        }

        if (e.ctrlKey && e.shiftKey && key === 'f') {
          setSearchOpen((prev) => !prev)
          setTimeout(() => searchInputRef.current?.focus(), 50)
          return false
        }

        return true
      })

      const handleContextMenuEvent = (e: MouseEvent) => {
        e.preventDefault()
        setCtxMenu({ x: e.clientX, y: e.clientY })
      }
      term.element?.addEventListener('contextmenu', handleContextMenuEvent)

      term.onData((data) => {
        window.electron.terminal.write(id, data)
      })

      term.onResize(({ cols, rows }) => {
        window.electron.terminal.resize(id, cols, rows)
      })

      xtermRef.current = { term, fitAddon, searchAddon }
      cleanupRef.current = () => {
        removeDataListener()
        term.element?.removeEventListener('contextmenu', handleContextMenuEvent)
      }

      readyRef.current = true
      onReady?.(id)
    }, [onReady])

    useEffect(() => {
      if (terminalId <= 0 || readyRef.current) return
      lastTermIdRef.current = terminalId
      connectTerminal(terminalId)
      return () => {
        readyRef.current = false
        if (cleanupRef.current) cleanupRef.current()
        if (xtermRef.current) {
          xtermRef.current.term.dispose()
          xtermRef.current = null
        }
      }
    }, [terminalId, connectTerminal])

    useEffect(() => {
      const handleResize = () => {
        try { xtermRef.current?.fitAddon.fit() } catch {}
      }
      const observer = new ResizeObserver(handleResize)
      if (containerRef.current) observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [])

    useEffect(() => {
      if (!ctxMenu) return
      const close = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('[data-term-ctxmenu]')) {
          setCtxMenu(null)
        }
      }
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setCtxMenu(null)
      }
      document.addEventListener('mousedown', close)
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.removeEventListener('mousedown', close)
        document.removeEventListener('keydown', handleEsc)
      }
    }, [ctxMenu])

    const handleFindNext = useCallback(() => {
      if (searchValue && xtermRef.current?.searchAddon) {
        xtermRef.current.searchAddon.findNext(searchValue, { caseSensitive: false })
      }
    }, [searchValue])

    const handleFindPrev = useCallback(() => {
      if (searchValue && xtermRef.current?.searchAddon) {
        xtermRef.current.searchAddon.findPrevious(searchValue, { caseSensitive: false })
      }
    }, [searchValue])

    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey) {
        handleFindPrev()
      } else if (e.key === 'Enter') {
        handleFindNext()
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchValue('')
        setSearchResults('')
      } else if (e.key === 'F3' && e.shiftKey) {
        e.preventDefault()
        handleFindPrev()
      } else if (e.key === 'F3') {
        e.preventDefault()
        handleFindNext()
      }
    }, [handleFindNext, handleFindPrev])

    const adjustCtxMenu = () => {
      if (!ctxMenu) return {}
      const style: React.CSSProperties = { left: ctxMenu.x, top: ctxMenu.y }
      if (ctxMenu.y + 120 > window.innerHeight) {
        style.top = ctxMenu.y - 120
      }
      if (ctxMenu.x + 140 > window.innerWidth) {
        style.left = ctxMenu.x - 140
      }
      return style
    }

    return (
      <div className="h-full w-full flex flex-col relative">
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden"
          data-terminal-id={terminalId}
        />

        {searchOpen && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#252526] border-t border-[#3c3c3c] shrink-0">
            <svg className="w-3.5 h-3.5 text-editor-text opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Find in terminal..."
              className="flex-1 bg-[#3c3c3c] text-sm text-editor-text px-2 py-0.5 border border-[#007acc] outline-none rounded min-w-0"
            />
            {searchResults && (
              <span className="text-xs text-editor-text opacity-50 shrink-0 min-w-[60px] text-right">
                {searchResults}
              </span>
            )}
            <button
              onClick={handleFindPrev}
              className="p-0.5 text-editor-text opacity-50 hover:opacity-100 hover:bg-[#3c3c3c] rounded shrink-0"
              title="Previous (Shift+Enter)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={handleFindNext}
              className="p-0.5 text-editor-text opacity-50 hover:opacity-100 hover:bg-[#3c3c3c] rounded shrink-0"
              title="Next (Enter)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => { setSearchOpen(false); setSearchValue(''); setSearchResults('') }}
              className="p-0.5 text-editor-text opacity-50 hover:opacity-100 hover:bg-[#3c3c3c] rounded shrink-0"
              title="Close (Escape)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {ctxMenu && createPortal(
          <div
            data-term-ctxmenu
            className="fixed z-[9999] bg-[#252526] border border-[#3c3c3c] shadow-xl rounded py-1 min-w-[160px]"
            style={adjustCtxMenu()}
          >
            <button
              onClick={() => { handleCopy(); setCtxMenu(null) }}
              className="w-full text-left px-3 py-1.5 text-sm text-editor-text hover:bg-[#2d2d2d] flex items-center gap-2"
            >
              <span>Copy</span>
              <span className="ml-auto text-[10px] opacity-30">Ctrl+Shift+C</span>
            </button>
            <button
              onClick={() => { handlePaste(); setCtxMenu(null) }}
              className="w-full text-left px-3 py-1.5 text-sm text-editor-text hover:bg-[#2d2d2d] flex items-center gap-2"
            >
              <span>Paste</span>
              <span className="ml-auto text-[10px] opacity-30">Ctrl+V</span>
            </button>
            <div className="border-t border-[#3c3c3c] my-1 mx-2" />
            <button
              onClick={() => { handleClear(); setCtxMenu(null) }}
              className="w-full text-left px-3 py-1.5 text-sm text-editor-text hover:bg-[#2d2d2d]"
            >
              Clear
            </button>
          </div>,
          document.body
        )}
      </div>
    )
  }
)
