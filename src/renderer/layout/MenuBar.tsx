import React, { useState, useRef, useEffect, useCallback } from 'react'
import { RotateCw } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useSettingsStore } from '../store/settingsStore'
import { getFileType } from '../utils/fileType'

interface MenuItemDef {
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  disabled?: boolean
}

interface MenuGroupDef {
  label: string
  items: MenuItemDef[]
}

function triggerKey(key: string, ctrl = true, shift = false, alt = false) {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
    ctrlKey: ctrl,
    shiftKey: shift,
    altKey: alt,
    metaKey: false,
    bubbles: true,
    cancelable: true,
  }))
}

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [openMenu])

  const doAction = (action?: () => void) => {
    action?.()
    setOpenMenu(null)
  }

  const menus: MenuGroupDef[] = [
    {
      label: 'File',
      items: [
        {
          label: 'New File', shortcut: 'Ctrl+N',
          action: () => {
            const name = window.prompt('Enter file name:')
            if (!name) return
            const root = useAppStore.getState().rootPath
            if (!root) return alert('Open a folder first')
            window.electron?.createFile(root + '\\' + name).then(() => {
              useAppStore.getState().addOutputLog(`[FS] Created: ${name}`)
            }).catch(() => alert('Failed to create file'))
          },
        },
        {
          label: 'Open File...', shortcut: 'Ctrl+O',
          action: async () => {
            if (!window.electron) return
            const files = await window.electron.openFile()
            for (const filePath of files) {
              const name = filePath.split('\\').pop() || filePath.split('/').pop() || ''
              const fileType = getFileType(filePath)
              if (fileType === 'binary') {
                useAppStore.getState().openFile(filePath, name, '', '', 'binary')
              } else if (fileType !== 'code') {
                const base64 = await window.electron.readFileBase64(filePath)
                if (base64) {
                  const ext = name.split('.').pop()?.toLowerCase() || ''
                  const mimeType = `${fileType}/${ext}`
                  const mediaUrl = `data:${mimeType};base64,${base64}`
                  useAppStore.getState().openFile(filePath, name, '', '', fileType, mediaUrl)
                }
              } else {
                const content = await window.electron.readFile(filePath)
                if (content !== null) {
                  useAppStore.getState().openFile(filePath, name, content, '')
                }
              }
            }
          },
        },
        {
          label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O',
          action: async () => {
            if (!window.electron) return
            const paths = await window.electron.openFolder()
            if (paths.length > 0) {
              const s = useAppStore.getState()
              s.setRootPath(paths[0])
              s.addOutputLog(`[FS] Opened folder: ${paths[0]}`)
              const entries = await window.electron.readDir(paths[0])
              s.setFileTree(entries)
              await window.electron.setLastPath(paths[0])
            }
          },
        },
        { separator: true },
        {
          label: 'Save', shortcut: 'Ctrl+S',
          action: () => {
            const s = useAppStore.getState()
            if (!s.activeTab) return
            const tab = s.openTabs.find((t) => t.path === s.activeTab)
            if (tab) {
              window.electron?.writeFile(tab.path, tab.content).then((ok) => {
                if (ok) { s.markTabClean(tab.path); s.addOutputLog(`[FS] Saved: ${tab.name}`) }
              })
            }
          },
        },
        {
          label: 'Save As...', shortcut: 'Ctrl+Shift+S',
          action: () => {
            const tab = useAppStore.getState().openTabs.find((t) => t.path === useAppStore.getState().activeTab)
            if (tab) window.electron?.saveFile(tab.path)
          },
        },
        { separator: true },
        {
          label: 'Close', shortcut: 'Ctrl+W',
          action: () => {
            const s = useAppStore.getState()
            if (s.activeTab) s.closeTab(s.activeTab)
          },
        },
        {
          label: 'Close All',
          action: () => {
            const s = useAppStore.getState()
            s.openTabs.forEach((t) => s.closeTab(t.path))
          },
        },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => triggerKey('z') },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => triggerKey('z', true, true) },
        { separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => triggerKey('x') },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => triggerKey('c') },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => triggerKey('v') },
        { separator: true },
        {
          label: 'Find', shortcut: 'Ctrl+F',
          action: () => {
            useAppStore.getState().setActiveModule('Search')
            useAppStore.getState().toggleSidePanel()
          },
        },
        {
          label: 'Replace', shortcut: 'Ctrl+H',
          action: () => {
            useAppStore.getState().setActiveModule('Search')
            useAppStore.getState().toggleSidePanel()
          },
        },
      ],
    },
    {
      label: 'Selection',
      items: [
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => triggerKey('a') },
      ],
    },
    {
      label: 'View',
      items: [
        {
          label: 'Command Palette', shortcut: 'Ctrl+Shift+P',
          action: () => {
            useAppStore.getState().addOutputLog('[View] Command Palette coming soon')
          },
        },
        { separator: true },
        {
          label: 'Toggle Sidebar', shortcut: 'Ctrl+B',
          action: () => useAppStore.getState().toggleSidePanel(),
        },
        {
          label: 'Toggle Panel', shortcut: 'Ctrl+J',
          action: () => useAppStore.getState().toggleBottomPanel(),
        },
        { separator: true },
        {
          label: 'Zoom In', shortcut: 'Ctrl+=',
          action: () => {
            const { fontSize, setFontSize } = useSettingsStore.getState()
            setFontSize(Math.min(32, fontSize + 2))
          },
        },
        {
          label: 'Zoom Out', shortcut: 'Ctrl+-',
          action: () => {
            const { fontSize, setFontSize } = useSettingsStore.getState()
            setFontSize(Math.max(8, fontSize - 2))
          },
        },
        {
          label: 'Reset Zoom',
          action: () => useSettingsStore.getState().setFontSize(14),
        },
      ],
    },
    {
      label: 'Go',
      items: [
        {
          label: 'Go to Line...', shortcut: 'Ctrl+G',
          action: () => {
            const line = window.prompt('Enter line number:')
            if (line) {
              const n = parseInt(line, 10)
              if (!isNaN(n)) useAppStore.getState().setCursor(n, 1)
            }
          },
        },
        {
          label: 'Go to File...', shortcut: 'Ctrl+P',
          action: () => {
            useAppStore.getState().setActiveModule('Search')
            useAppStore.getState().toggleSidePanel()
          },
        },
      ],
    },
    {
      label: 'Run',
      items: [
        {
          label: 'Run Code', shortcut: 'F5',
          action: () => useAppStore.getState().addOutputLog('[Run] Run feature coming soon'),
        },
        {
          label: 'Stop',
          action: () => {
            const state = useAppStore.getState()
            state.addOutputLog('[Run] Stopped execution')
            state.setBottomPanelTab('OUTPUT')
          },
        },
      ],
    },
    {
      label: 'Terminal',
      items: [
        {
          label: 'New Terminal', shortcut: 'Ctrl+`',
          action: () => {
            useAppStore.getState().setBottomPanelTab('TERMINAL')
            useAppStore.getState().toggleBottomPanel()
            window.electron?.terminal.create('powershell.exe').catch(() => {})
          },
        },
        {
          label: 'Toggle Terminal', shortcut: 'Ctrl+`',
          action: () => useAppStore.getState().toggleBottomPanel(),
        },
      ],
    },
    {
      label: 'Help',
      items: [
        {
          label: 'About Dar Studio',
          action: () => {
            alert('Dar Studio v1.1.1\nA modern code editor built with Electron + React + Monaco\n\nMade by Mahadi')
          },
        },
        {
          label: 'Documentation',
          action: () => {
            useAppStore.getState().addOutputLog('[Help] Documentation: https://github.com/emammahadi826')
          },
        },
      ],
    },
  ]

  return (
    <div
      ref={menuRef}
      className="flex items-center h-full"
      style={{ WebkitAppRegion: 'no-drag' } as any}
    >
      {menus.map((menu) => (
        <div key={menu.label} className="relative h-full flex items-center">
          <button
            onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
            onMouseEnter={() => {
              if (openMenu) setOpenMenu(menu.label)
            }}
            className={`px-3 h-full text-sm transition-colors select-none ${
              openMenu === menu.label
                ? 'bg-[#2a2d2e] text-white'
                : 'text-titlebar-text hover:text-white hover:bg-hover'
            }`}
          >
            {menu.label}
          </button>
          {openMenu === menu.label && (
            <div
              className="absolute top-full left-0 min-w-[240px] bg-[#252526] border border-[#3c3c3c] rounded shadow-2xl py-1 z-[100]"
              style={{ WebkitAppRegion: 'no-drag' } as any}
            >
              {menu.items.map((item, i) => {
                if (item.separator) {
                  return <div key={i} className="h-px bg-[#3c3c3c] mx-2 my-1" />
                }
                return (
                  <button
                    key={i}
                    onClick={() => doAction(item.action)}
                    disabled={item.disabled}
                    className="w-full flex items-center justify-between px-4 py-1.5 text-sm text-sidepanel-text hover:bg-[#094771] hover:text-white disabled:opacity-40 select-none"
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs opacity-50 ml-8">{item.shortcut}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
      <div className="h-full flex items-center px-1">
        <button
          onClick={() => window.location.reload()}
          title="Refresh Editor"
          className="h-full px-2 text-titlebar-text hover:text-white hover:bg-hover transition-colors"
        >
          <RotateCw size={14} />
        </button>
      </div>
    </div>
  )
}
