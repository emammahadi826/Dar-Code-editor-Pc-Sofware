import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { ShellInfo } from '../../types'
import { useAppStore } from '../../store/appStore'
import { Terminal as TerminalIcon } from 'lucide-react'

let terminalCounter = 0

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<{ term: Terminal; fitAddon: FitAddon; id: number } | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [shells, setShells] = useState<ShellInfo[]>([])
  const [activeShell, setActiveShell] = useState<string>('')
  const [connected, setConnected] = useState(false)
  const addOutputLog = useAppStore((s) => s.addOutputLog)

  useEffect(() => {
    ;(async () => {
      if (!window.electron?.terminal) return
      const available = await window.electron.terminal.getShells()
      setShells(available)
      if (available.length > 0) {
        setActiveShell(available[0].path)
      }
    })()
  }, [])

  const connectTerminal = useCallback(async (shellPath: string) => {
    if (!window.electron?.terminal || !terminalRef.current) return

    if (xtermRef.current) {
      xtermRef.current.term.dispose()
    }
    if (cleanupRef.current) {
      cleanupRef.current()
    }

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        selectionBackground: '#264f78',
        black: '#000000', red: '#cd3131', green: '#0dbc79', yellow: '#e5e510',
        blue: '#2472c8', magenta: '#bc3fbc', cyan: '#11a8cd', white: '#e5e5e5',
        brightBlack: '#666666', brightRed: '#f14c4c', brightGreen: '#23d18b',
        brightYellow: '#f5f543', brightBlue: '#3b8eea', brightMagenta: '#d670d6',
        brightCyan: '#29b8db', brightWhite: '#e5e5e5',
      },
      allowTransparency: false,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    const termId = ++terminalCounter
    const id = await window.electron.terminal.create(shellPath)
    if (id === -1) {
      term.write(`\r\nFailed to start terminal\r\n`)
      return
    }

    const removeListener = window.electron.terminal.onData((termIdFromEvent, data) => {
      if (termIdFromEvent === id) {
        term.write(data)
      }
    })

    term.onData((data) => {
      window.electron.terminal.write(id, data)
    })

    term.onResize(({ cols, rows }) => {
      window.electron.terminal.resize(id, cols, rows)
    })

    xtermRef.current = { term, fitAddon, id }
    cleanupRef.current = () => {
      removeListener()
      window.electron.terminal.kill(id)
    }
    setConnected(true)
  }, [])

  const handleShellChange = useCallback((shellPath: string) => {
    setActiveShell(shellPath)
    setConnected(false)
    setTimeout(() => connectTerminal(shellPath), 100)
  }, [connectTerminal])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeShell && !connected && terminalRef.current) {
        connectTerminal(activeShell)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [activeShell, connected, connectTerminal])

  useEffect(() => {
    const handleResize = () => {
      if (xtermRef.current?.fitAddon) {
        xtermRef.current.fitAddon.fit()
      }
    }
    window.addEventListener('resize', handleResize)
    const observer = new ResizeObserver(handleResize)
    if (terminalRef.current) observer.observe(terminalRef.current)
    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <TerminalIcon size={14} className="text-editor-text opacity-60" />
        <select
          value={activeShell}
          onChange={(e) => handleShellChange(e.target.value)}
          className="bg-transparent text-sm text-editor-text opacity-60 border-none outline-none cursor-pointer hover:opacity-100"
        >
          {shells.map((s) => (
            <option key={s.path} value={s.path} className="bg-[#252526]">
              {s.name}
            </option>
          ))}
        </select>
        {!connected && (
          <span className="text-xs text-yellow-500 ml-1">starting...</span>
        )}
      </div>
      <div ref={terminalRef} className="flex-1" />
    </div>
  )
}
