import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import { Unicode11Addon } from '@xterm/addon-unicode11'
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
    const xtermRef = useRef<{ term: Terminal; fitAddon: FitAddon } | null>(null)
    const cleanupRef = useRef<(() => void) | null>(null)
    const readyRef = useRef(false)

    useImperativeHandle(ref, () => ({
      fit: () => {
        try { xtermRef.current?.fitAddon.fit() } catch {}
      },
      terminalId,
    }), [terminalId])

    const connectTerminal = useCallback(async (id: number) => {
      if (!window.electron?.terminal) return

      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'bar',
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: TERMINAL_THEME,
        allowTransparency: false,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      try {
        const webglAddon = new WebglAddon()
        term.loadAddon(webglAddon)
      } catch {
        // WebGL fallback to canvas — fine
      }

      try {
        term.loadAddon(new Unicode11Addon())
      } catch {}

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

      term.onData((data) => {
        window.electron.terminal.write(id, data)
      })

      term.onResize(({ cols, rows }) => {
        window.electron.terminal.resize(id, cols, rows)
      })

      xtermRef.current = { term, fitAddon }
      cleanupRef.current = () => {
        removeDataListener()
      }

      readyRef.current = true
      onReady?.(id)
    }, [onReady])

    useEffect(() => {
      if (terminalId <= 0 || readyRef.current) return
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

    return (
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden"
        data-terminal-id={terminalId}
      />
    )
  }
)
