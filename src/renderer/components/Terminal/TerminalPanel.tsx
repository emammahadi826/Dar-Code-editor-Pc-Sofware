import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Terminal as TerminalIcon, ChevronDown } from 'lucide-react'
import { useTerminalStore } from '../../store/terminalStore'
import { TerminalTabBar } from './TerminalTabBar'
import { TerminalSplit } from './TerminalSplit'
import { ShellInfo } from '../../types'

export function TerminalPanel() {
  const instances = useTerminalStore((s) => s.instances)
  const addInstance = useTerminalStore((s) => s.addInstance)
  const removeInstance = useTerminalStore((s) => s.removeInstance)
  const rootNodes = useTerminalStore((s) => s.rootNodes)
  const setShellPickerOpen = useTerminalStore((s) => s.setShellPickerOpen)
  const shellPickerOpen = useTerminalStore((s) => s.shellPickerOpen)

  const [shells, setShells] = useState<ShellInfo[]>([])
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      if (!window.electron?.terminal) return
      const available = await window.electron.terminal.getShells()
      setShells(available)
    })()
  }, [])

  useEffect(() => {
    if (!window.electron?.terminal) return
    const unsubExit = window.electron.terminal.onShellExit((id, code) => {
      removeInstance(id)
    })
    return () => { unsubExit() }
  }, [removeInstance])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShellPickerOpen(false)
      }
    }
    if (shellPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [shellPickerOpen, setShellPickerOpen])

  useEffect(() => {
    if (instances.length === 0 && shells.length > 0 && rootNodes.length === 0) {
      createTerminal(shells[0].path)
    }
  }, [shells])

  const createTerminal = useCallback(async (shellPath: string) => {
    if (!window.electron?.terminal) return
    const result = await window.electron.terminal.createNamed(shellPath)
    if (result && result.id > 0) {
      const shellInfo = shells.find((s) => s.path === shellPath)
      addInstance({
        id: result.id,
        name: result.name,
        shellPath: result.shellPath,
        shellName: result.shellName,
        shellIcon: shellInfo?.icon || 'terminal',
        cwd: result.cwd,
        createdAt: result.createdAt,
      })
    }
  }, [shells, addInstance])

  const handleAddClick = useCallback(() => {
    setShellPickerOpen(!shellPickerOpen)
  }, [shellPickerOpen, setShellPickerOpen])

  const handleShellPick = useCallback(async (shellPath: string) => {
    setShellPickerOpen(false)
    await createTerminal(shellPath)
  }, [createTerminal, setShellPickerOpen])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden relative">
      <TerminalTabBar onAddClick={handleAddClick} />

      <TerminalSplit />

      {shellPickerOpen && (
        <div
          ref={pickerRef}
          className="absolute top-[32px] right-2 z-50 bg-[#252526] border border-[#3c3c3c] shadow-xl rounded min-w-[180px]"
        >
          <div className="px-3 py-1.5 text-[11px] text-editor-text opacity-50 border-b border-[#3c3c3c] uppercase tracking-wider">
            Select Shell
          </div>
          {shells.map((s) => (
            <button
              key={s.path}
              onClick={() => handleShellPick(s.path)}
              className="w-full text-left px-3 py-1.5 text-sm text-editor-text hover:bg-[#2d2d2d] flex items-center gap-2"
            >
              <span className="text-[10px] font-bold opacity-60 w-5 text-center">
                {s.icon === 'powershell' || s.icon === 'pwsh' ? 'PS' : s.icon === 'cmd' ? 'C:' : '$'}
              </span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
