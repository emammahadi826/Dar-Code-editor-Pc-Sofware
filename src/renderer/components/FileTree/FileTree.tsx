import React, { useState, useCallback, useEffect } from 'react'
import { FileTreeNode } from './FileTreeNode'
import { FileEntry } from '../../types'
import { useAppStore } from '../../store/appStore'
import { useTerminalStore } from '../../store/terminalStore'
import { ContextMenuPortal, ContextMenuItem } from '../ContextMenu/ContextMenuPortal'
import { buildContextMenuItems, ContextMenuCallbacks } from './contextMenuItems'
import { Icon } from '@iconify/react'
import { Plus, FolderPlus, RotateCw } from 'lucide-react'

interface FileTreeProps {
  rootPath: string
  onFileSelect: (path: string, name: string) => void
}

export function FileTree({ rootPath, onFileSelect }: FileTreeProps) {
  const addOutputLog = useAppStore((s) => s.addOutputLog)
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<{ path: string; name: string } | null>(null)
  const [creating, setCreating] = useState<{ parentPath: string; type: 'file' | 'folder' } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; entry: FileEntry } | null>(null)

  const loadEntries = useCallback(async (dirPath: string) => {
    if (!window.electron) return
    const result = await window.electron.readDir(dirPath)
    setEntries(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEntries(rootPath)
  }, [rootPath, refreshKey, loadEntries])

  const handleToggle = useCallback(async (dirPath: string, isExpanded: boolean) => {
    const next = new Set(expandedDirs)
    if (isExpanded) next.delete(dirPath)
    else next.add(dirPath)
    setExpandedDirs(next)
  }, [expandedDirs])

  const handleSelect = useCallback((path: string) => {
    setSelectedPath(path)
  }, [])

  const getCreateParent = useCallback(() => {
    if (selectedPath) {
      const entry = entries.find(e => e.path === selectedPath)
      if (entry?.isDirectory) return selectedPath
    }
    return rootPath
  }, [selectedPath, entries, rootPath])

  const handleCreateFile = useCallback(async (parentPath: string) => {
    setCreating({ parentPath, type: 'file' })
  }, [])

  const handleCreateFolder = useCallback(async (parentPath: string) => {
    setCreating({ parentPath, type: 'folder' })
  }, [])

  const handleCreateSubmit = useCallback(async (name: string) => {
    if (!creating) return
    const fullPath = creating.parentPath + '\\' + name
    try {
      if (creating.type === 'file') {
        await window.electron.createFile(fullPath)
        addOutputLog(`[FS] Created file: ${name}`)
      } else {
        await window.electron.createDir(fullPath)
        addOutputLog(`[FS] Created folder: ${name}`)
      }
      setCreating(null)
      setRefreshKey((k) => k + 1)
    } catch {
      addOutputLog(`[FS] Failed to create ${name}`)
    }
  }, [creating, addOutputLog])

  const handleRename = useCallback(async (path: string, name: string) => {
    setRenaming({ path, name })
  }, [])

  const handleRenameSubmit = useCallback(async (newName: string) => {
    if (!renaming) return
    const parent = renaming.path.substring(0, renaming.path.lastIndexOf('\\'))
    const newPath = parent + '\\' + newName
    try {
      await window.electron.rename(renaming.path, newPath)
      addOutputLog(`[FS] Renamed: ${renaming.name} → ${newName}`)
      setRenaming(null)
      setRefreshKey((k) => k + 1)
    } catch {
      addOutputLog(`[FS] Failed to rename ${renaming.name}`)
    }
  }, [renaming, addOutputLog])

  const handleDelete = useCallback(async (path: string) => {
    try {
      await window.electron.delete(path)
      addOutputLog(`[FS] Deleted: ${path.split('\\').pop()}`)
      setRefreshKey((k) => k + 1)
    } catch {
      addOutputLog(`[FS] Failed to delete`)
    }
  }, [addOutputLog])

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
    addOutputLog('[FS] Refreshed file tree')
  }, [addOutputLog])

  const handleContextMenu = useCallback((e: React.MouseEvent, entry: FileEntry) => {
    setCtxMenu({ x: e.clientX, y: e.clientY, entry })
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setCtxMenu(null)
  }, [])

  const getEntryParentPath = useCallback((entry: FileEntry): string => {
    return entry.path.substring(0, entry.path.lastIndexOf('\\'))
  }, [])

  const isDirectory = useCallback((path: string): boolean => {
    if (path === rootPath) return true
    return entries.some(e => e.path === path && e.isDirectory) || false
  }, [rootPath, entries])

  // Context menu callbacks
  const ctxCallbacks: ContextMenuCallbacks = {
    onCreateFile: (parentPath) => {
      handleCreateFile(parentPath)
    },
    onCreateFolder: (parentPath) => {
      handleCreateFolder(parentPath)
    },
    onRevealInExplorer: async (path) => {
      if (window.electron?.revealInExplorer) {
        await window.electron.revealInExplorer(path)
      }
    },
    onOpenInTerminal: async (path) => {
      const shellPath = (await window.electron?.terminal?.getShells())?.[0]?.path
      if (!shellPath) return
      const result = await window.electron?.terminal?.createNamed(shellPath, undefined, path)
      if (result && result.id > 0) {
        const shellInfo = (await window.electron?.terminal?.getShells())?.find(s => s.path === shellPath)
        useTerminalStore.getState().addInstance({
          id: result.id,
          name: result.name,
          shellPath: result.shellPath,
          shellName: result.shellName,
          shellIcon: shellInfo?.icon || 'terminal',
          cwd: result.cwd,
          createdAt: result.createdAt,
        })
      }
    },
    onCopyPath: async (path) => {
      if (window.electron?.copyToClipboard) {
        await window.electron.copyToClipboard(path)
        addOutputLog(`[Clipboard] Copied path: ${path}`)
      }
    },
    onCopyRelativePath: async (path) => {
      if (!window.electron?.copyToClipboard) return
      const relative = path.replace(rootPath, '').replace(/^[\\\/]/, '')
      await window.electron.copyToClipboard(relative)
      addOutputLog(`[Clipboard] Copied relative path: ${relative}`)
    },
    onRename: (path, name) => {
      handleRename(path, name)
    },
    onDelete: (path) => {
      handleDelete(path)
    },
    onFindInFolder: (path) => {
      addOutputLog(`[Search] Find in folder: ${path} (not yet implemented)`)
    },
    onOpenPreview: (path) => {
      addOutputLog(`[Preview] Open preview: ${path} (not yet implemented)`)
    },
    onOpenImagePreview: (path) => {
      addOutputLog(`[Preview] Open image: ${path} (not yet implemented)`)
    },
    isDirectory,
    rootPath,
  }

  const ctxMenuItems: ContextMenuItem[] = ctxMenu
    ? buildContextMenuItems(ctxMenu.entry, getEntryParentPath(ctxMenu.entry), ctxCallbacks)
    : []

  const createParent = getCreateParent()
  const createParentName = createParent === rootPath
    ? (rootPath.split('\\').pop() || rootPath.split('/').pop() || 'root')
    : (createParent.split('\\').pop() || createParent.split('/').pop() || 'folder')

  if (loading) {
    return <div className="text-sidepanel-text text-sm p-3 opacity-60">Loading...</div>
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 mb-1">
        <span className="text-sidepanel-header text-sm font-semibold uppercase tracking-wider truncate">
          {rootPath.split('\\').pop() || rootPath.split('/').pop()}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-1 text-sidepanel-text hover:text-white rounded hover:bg-hover transition-colors"
            title="Refresh"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => handleCreateFile(createParent)}
            className="p-1 text-sidepanel-text hover:text-white rounded hover:bg-hover transition-colors"
            title={`New File in ${createParentName}`}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => handleCreateFolder(createParent)}
            className="p-1 text-sidepanel-text hover:text-white rounded hover:bg-hover transition-colors"
            title={`New Folder in ${createParentName}`}
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      <div className="px-3 pb-1">
        <span className="text-xs text-sidepanel-text opacity-40">
          Creating in: {createParentName}
        </span>
      </div>

      {creating && creating.parentPath === rootPath && (
        <div className="relative flex items-center gap-1.5 py-[3px]" style={{ paddingLeft: '8px' }}>
          <span className="w-4" />
          <Icon
            icon={creating.type === 'folder' ? 'vscode-icons:default-folder' : 'vscode-icons:default-file'}
            width={18}
            height={18}
          />
          <input
            autoFocus
            type="text"
            placeholder={creating.type === 'file' ? 'filename.ext' : 'folder-name'}
            className="flex-1 bg-[#3c3c3c] text-sm text-editor-text px-2 py-1 border border-[#007acc] outline-none rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') setCreating(null)
            }}
            onBlur={(e) => {
              if (e.target.value) handleCreateSubmit(e.target.value)
              else setCreating(null)
            }}
          />
        </div>
      )}

      {entries.map((entry, idx) => (
        <FileTreeNode
          key={entry.path}
          entry={renaming?.path === entry.path ? { ...entry, name: '' } : entry}
          depth={0}
          isLast={idx === entries.length - 1}
          ancestorVerticalLines={[]}
          expandedDirs={expandedDirs}
          onToggle={handleToggle}
          onFileSelect={onFileSelect}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onRename={handleRename}
          onDelete={handleDelete}
          creating={creating}
          onCreateSubmit={handleCreateSubmit}
          onCancelCreate={() => setCreating(null)}
          selectedPath={selectedPath}
          onSelect={handleSelect}
          refreshKey={refreshKey}
          onContextMenu={handleContextMenu}
        />
      ))}

      {renaming && (
        <div className="relative flex items-center gap-1.5 py-[3px]" style={{ paddingLeft: `${8 + 0 * 14}px` }}>
          <span className="w-4" />
          <input
            autoFocus
            type="text"
            defaultValue={renaming.name}
            className="flex-1 bg-[#3c3c3c] text-sm text-editor-text px-2 py-1 border border-[#007acc] outline-none rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') setRenaming(null)
            }}
            onBlur={(e) => {
              if (e.target.value && e.target.value !== renaming.name) handleRenameSubmit(e.target.value)
              setRenaming(null)
            }}
          />
        </div>
      )}

      <ContextMenuPortal
        visible={!!ctxMenu}
        x={ctxMenu?.x ?? 0}
        y={ctxMenu?.y ?? 0}
        items={ctxMenuItems}
        onClose={handleCloseContextMenu}
      />
    </div>
  )
}
