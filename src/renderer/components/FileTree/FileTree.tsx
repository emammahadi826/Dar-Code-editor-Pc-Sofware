import React, { useState, useCallback, useEffect, useRef } from 'react'
import { FileTreeNode } from './FileTreeNode'
import { FileEntry } from '../../types'
import { useAppStore } from '../../store/appStore'
import { useTerminalStore } from '../../store/terminalStore'
import { ContextMenuPortal, ContextMenuItem } from '../ContextMenu/ContextMenuPortal'
import { buildContextMenuItems, ContextMenuCallbacks } from './contextMenuItems'
import { ExternalDropDialog } from './ExternalDropDialog'
import { Icon } from '@iconify/react'
import { Plus, FolderPlus, RotateCw } from 'lucide-react'

interface DropState {
  targetPath: string
  position: 'before' | 'after' | 'inside'
}

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
  const [clipboard, setClipboard] = useState<{
    paths: string[]
    action: 'copy' | 'cut'
  } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; entry: FileEntry } | null>(null)
  const [draggedPath, setDraggedPath] = useState<string | null>(null)
  const [dropState, setDropState] = useState<DropState | null>(null)
  const [externalDropOver, setExternalDropOver] = useState(false)
  const [externalDropFiles, setExternalDropFiles] = useState<{ name: string; path: string }[]>([])
  const [showExternalDropDialog, setShowExternalDropDialog] = useState(false)
  const [pendingDropInfo, setPendingDropInfo] = useState<{
    entries: { name: string; path: string }[]
    destPath: string
  } | null>(null)

  const loadEntries = useCallback(async (dirPath: string) => {
    if (!window.electron) return
    const result = await window.electron.readDir(dirPath)
    setEntries(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEntries(rootPath)
  }, [rootPath, refreshKey, loadEntries])

  useEffect(() => {
    if (!window.electron?.watchDir) return
    window.electron.watchDir(rootPath)
    const unsub = window.electron.onFilesChanged(() => {
      setRefreshKey((k) => k + 1)
    })
    return () => {
      unsub()
      window.electron?.unwatchDir()
    }
  }, [rootPath])

  const handleToggle = useCallback(async (dirPath: string, isExpanded: boolean) => {
    const next = new Set(expandedDirs)
    if (isExpanded) next.delete(dirPath)
    else next.add(dirPath)
    setExpandedDirs(next)
  }, [expandedDirs])

  const handleSelect = useCallback((path: string, multi?: boolean) => {
    if (multi) {
      setSelectedPaths((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
    } else {
      setSelectedPaths(new Set([path]))
    }
  }, [])

  const getCreateParent = useCallback(() => {
    const firstSel = selectedPaths.values().next().value
    if (firstSel) {
      const entry = entries.find(e => e.path === firstSel)
      if (entry?.isDirectory) return firstSel
    }
    return rootPath
  }, [selectedPaths, entries, rootPath])

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

  const handleDragStart = useCallback((entry: FileEntry) => {
    setDraggedPath(entry.path)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedPath(null)
    setDropState(null)
  }, [])

  const handleDragOver = useCallback((entry: FileEntry, position: 'before' | 'after' | 'inside') => {
    setDropState({ targetPath: entry.path, position })
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropState(null)
  }, [])

  const handleDrop = useCallback(async (targetEntry: FileEntry, position: 'before' | 'after' | 'inside', e: React.DragEvent) => {
    if (e.dataTransfer.files.length > 0) {
      // External drop — show dialog
      e.preventDefault()
      const newParent = position === 'inside' && targetEntry.isDirectory
        ? targetEntry.path
        : getEntryParentPath(targetEntry.path)
      const files = Array.from(e.dataTransfer.files)
        .map((f) => ({ name: f.name, path: (f as any).path }))
        .filter((f) => f.path && f.path !== newParent + '\\' + f.name)
      if (files.length === 0) {
        setDropState(null)
        return
      }
      setExternalDropFiles(files)
      setPendingDropInfo({ entries: files, destPath: newParent })
      setShowExternalDropDialog(true)
      setExternalDropOver(false)
      setDropState(null)
      return
    }

    if (!draggedPath) return

    const draggedName = draggedPath.split('\\').pop() || draggedPath.split('/').pop() || ''

    let newParent: string
    if (position === 'inside' && targetEntry.isDirectory) {
      newParent = targetEntry.path
    } else {
      newParent = getEntryParentPath(targetEntry.path)
    }

    const newPath = newParent + '\\' + draggedName

    if (newPath === draggedPath) {
      addOutputLog(`[FS] ${draggedName} is already in this location`)
      setDraggedPath(null)
      setDropState(null)
      return
    }

    if (draggedPath.startsWith(newParent + '\\')) {
      const relPath = draggedPath.slice(newParent.length + 1)
      if (relPath.startsWith(draggedName + '\\')) {
        addOutputLog(`[FS] Cannot move a folder into itself`)
        setDraggedPath(null)
        setDropState(null)
        return
      }
    }

    const destExists = await window.electron?.exists(newPath)
    if (destExists) {
      addOutputLog(`[FS] Cannot move: "${draggedName}" already exists at destination`)
      setDraggedPath(null)
      setDropState(null)
      return
    }

    await window.electron?.rename(draggedPath, newPath)
    addOutputLog(`[FS] Moved: ${draggedName}`)

    const openTabs = useAppStore.getState().openTabs
    const tabToUpdate = openTabs.find(t => t.path === draggedPath)
    if (tabToUpdate) {
      useAppStore.getState().closeTab(draggedPath)
    }

    setDraggedPath(null)
    setDropState(null)
    setRefreshKey((k) => k + 1)
  }, [draggedPath, addOutputLog])

  const handleRootDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setExternalDropOver(false)

    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
        .map((f) => ({ name: f.name, path: (f as any).path }))
        .filter((f) => f.path && f.path !== rootPath + '\\' + f.name)
      if (files.length === 0) return
      setExternalDropFiles(files)
      setPendingDropInfo({ entries: files, destPath: rootPath })
      setShowExternalDropDialog(true)
      return
    }

    if (!draggedPath) return

    const draggedName = draggedPath.split('\\').pop() || draggedPath.split('/').pop() || ''
    const newPath = rootPath + '\\' + draggedName

    if (newPath === draggedPath) {
      setDraggedPath(null)
      setDropState(null)
      return
    }

    await window.electron?.rename(draggedPath, newPath)
    addOutputLog(`[FS] Moved: ${draggedName} → root`)

    setDraggedPath(null)
    setDropState(null)
    setRefreshKey((k) => k + 1)
  }, [draggedPath, rootPath, addOutputLog])

  const handleExternalCopy = useCallback(async () => {
    if (!pendingDropInfo) return
    const { entries, destPath } = pendingDropInfo
    const destName = destPath.split('\\').pop() || 'root'
    for (const file of entries) {
      const destFilePath = destPath + '\\' + file.name
      await window.electron?.copyFile(file.path, destFilePath)
      addOutputLog(`[FS] Copied: ${file.name} → ${destName}`)
    }
    setShowExternalDropDialog(false)
    setExternalDropFiles([])
    setPendingDropInfo(null)
    setRefreshKey((k) => k + 1)
  }, [pendingDropInfo, addOutputLog])

  const handleExternalMove = useCallback(async () => {
    if (!pendingDropInfo) return
    const { entries, destPath } = pendingDropInfo
    const destName = destPath.split('\\').pop() || 'root'
    for (const file of entries) {
      const destFilePath = destPath + '\\' + file.name
      await window.electron?.moveFile(file.path, destFilePath)
      addOutputLog(`[FS] Moved: ${file.name} → ${destName}`)
    }
    setShowExternalDropDialog(false)
    setExternalDropFiles([])
    setPendingDropInfo(null)
    setRefreshKey((k) => k + 1)
  }, [pendingDropInfo, addOutputLog])

  const handleCloseExternalDropDialog = useCallback(() => {
    setShowExternalDropDialog(false)
    setExternalDropFiles([])
    setPendingDropInfo(null)
  }, [])

  const getClipboardIndicator = useCallback(() => {
    if (!clipboard) return null
    const label = clipboard.action === 'copy' ? 'copied' : 'cut'
    return `${clipboard.paths.length} item${clipboard.paths.length > 1 ? 's' : ''} ${label}`
  }, [clipboard])

  const handleCopy = useCallback(() => {
    const paths = Array.from(selectedPaths)
    if (paths.length === 0) return
    setClipboard({ paths, action: 'copy' })
    const label = paths.length === 1 ? paths[0].split('\\').pop() : `${paths.length} items`
    addOutputLog(`[Clipboard] Copied: ${label}`)
  }, [selectedPaths, addOutputLog])

  const handleCut = useCallback(() => {
    const paths = Array.from(selectedPaths)
    if (paths.length === 0) return
    setClipboard({ paths, action: 'cut' })
    const label = paths.length === 1 ? paths[0].split('\\').pop() : `${paths.length} items`
    addOutputLog(`[Clipboard] Cut: ${label}`)
  }, [selectedPaths, addOutputLog])

  const getUniquePath = useCallback(async (basePath: string): Promise<string> => {
    const exists = await window.electron?.exists(basePath)
    if (!exists) return basePath
    const dir = basePath.substring(0, basePath.lastIndexOf('\\'))
    const name = basePath.split('\\').pop() || ''
    const dotIdx = name.lastIndexOf('.')
    if (dotIdx > 0) {
      const stem = name.substring(0, dotIdx)
      const ext = name.substring(dotIdx)
      let counter = 1
      while (true) {
        const candidate = `${dir}\\${stem} - Copy${counter > 1 ? ` (${counter})` : ''}${ext}`
        const candidateExists = await window.electron?.exists(candidate)
        if (!candidateExists) return candidate
        counter++
      }
    } else {
      let counter = 1
      while (true) {
        const candidate = `${dir}\\${name} - Copy${counter > 1 ? ` (${counter})` : ''}`
        const candidateExists = await window.electron?.exists(candidate)
        if (!candidateExists) return candidate
        counter++
      }
    }
  }, [])

  const handlePaste = useCallback(async () => {
    if (!clipboard || clipboard.paths.length === 0) return
    const firstSel = selectedPaths.values().next().value
    const targetDir = firstSel && entries.find(e => e.path === firstSel)?.isDirectory
      ? firstSel
      : firstSel
        ? firstSel.substring(0, firstSel.lastIndexOf('\\'))
        : rootPath
    const destName = targetDir.split('\\').pop() || 'root'
    let successCount = 0
    for (const srcPath of clipboard.paths) {
      const name = srcPath.split('\\').pop() || ''
      const destPath = targetDir + '\\' + name
      const finalPath = await getUniquePath(destPath)
      if (clipboard.action === 'copy') {
        const ok = await window.electron?.copyFile(srcPath, finalPath)
        if (ok) {
          addOutputLog(`[FS] Copied: ${name} → ${destName}`)
          successCount++
        }
      } else {
        if (destPath === srcPath) {
          addOutputLog(`[FS] Cannot paste in the same location`)
          continue
        }
        const ok = await window.electron?.moveFile(srcPath, finalPath)
        if (ok) {
          addOutputLog(`[FS] Moved: ${name} → ${destName}`)
          successCount++
          const openTabs = useAppStore.getState().openTabs
          const tabToUpdate = openTabs.find(t => t.path === srcPath)
          if (tabToUpdate) {
            useAppStore.getState().closeTab(srcPath)
          }
        }
      }
    }
    if (clipboard.action === 'cut') setClipboard(null)
    if (successCount > 0) setRefreshKey((k) => k + 1)
  }, [clipboard, selectedPaths, entries, rootPath, addOutputLog, getUniquePath])

  const handleClearClipboard = useCallback(() => {
    setClipboard(null)
  }, [])

  const treeRef = useRef<HTMLDivElement>(null)

  // Global keyboard shortcuts — work from anywhere (VS Code style)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return

      const isCtrl = e.ctrlKey || e.metaKey
      const pathsArr = Array.from(selectedPaths)

      if (isCtrl && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        const firstSel = pathsArr[0]
        const parent = firstSel && entries.find(ent => ent.path === firstSel)?.isDirectory
          ? firstSel
          : rootPath
        handleCreateFile(parent)
        return
      }

      if (isCtrl && e.key === 'c') {
        e.preventDefault()
        if (pathsArr.length > 0) handleCopy()
        return
      }

      if (isCtrl && e.key === 'x') {
        e.preventDefault()
        if (pathsArr.length > 0) handleCut()
        return
      }

      if (isCtrl && e.key === 'v') {
        e.preventDefault()
        handlePaste()
        return
      }

      if (isCtrl && e.key === 'a') {
        e.preventDefault()
        if (entries.length > 0) {
          setSelectedPaths(new Set(entries.map(e => e.path)))
          if (!entries[0].isDirectory && entries[0].path) {
            treeRef.current?.focus()
          }
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Del') {
        const firstSel = pathsArr[0]
        if (firstSel) {
          e.preventDefault()
          handleDelete(firstSel)
        }
        return
      }

      if (e.key === 'F2') {
        const firstSel = pathsArr[0]
        if (firstSel) {
          e.preventDefault()
          const entry = entries.find(ent => ent.path === firstSel)
          if (entry) handleRename(entry.path, entry.name)
        }
        return
      }

      if (e.key === 'Enter') {
        const firstSel = pathsArr[0]
        if (firstSel) {
          e.preventDefault()
          const entry = entries.find(ent => ent.path === firstSel)
          if (entry && !entry.isDirectory) {
            const name = entry.path.split('\\').pop() || entry.path.split('/').pop() || ''
            onFileSelect(entry.path, name)
          }
        }
        return
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedPaths, entries, rootPath, handleCopy, handleCut, handlePaste, handleDelete, handleRename, handleCreateFile, onFileSelect])

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
      const name = path.split('\\').pop() || path.split('/').pop() || ''
      onFileSelect(path, name)
    },
    onOpenImagePreview: (path) => {
      const name = path.split('\\').pop() || path.split('/').pop() || ''
      onFileSelect(path, name)
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

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('[data-file-row]')) {
      setSelectedPaths(new Set())
    }
  }, [])

  if (loading) {
    return <div className="text-sidepanel-text text-sm p-3 opacity-60 h-full">Loading...</div>
  }

  return (
      <div
        ref={treeRef}
        tabIndex={-1}
        className={`text-sm h-full flex flex-col overflow-y-auto outline-none ${externalDropOver ? 'bg-accent-blue/5' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!draggedPath && e.dataTransfer.types.includes('Files')) {
            setExternalDropOver(true)
          }
        }}
        onDragEnter={(e) => {
          if (!draggedPath && e.dataTransfer.types.includes('Files')) {
            setExternalDropOver(true)
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setExternalDropOver(false)
          }
        }}
        onDrop={handleRootDrop}
        onDragEnd={handleDragEnd}
      >
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

      {externalDropOver && (
        <div className="px-3 py-8 text-center text-sidepanel-text opacity-60 border-2 border-dashed border-accent-blue/40 rounded mx-3 mb-2">
          Drop files here to move to workspace
        </div>
      )}

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
          selectedPaths={selectedPaths}
          onSelect={handleSelect}
          refreshKey={refreshKey}
          onContextMenu={handleContextMenu}
          draggedPath={draggedPath}
          renaming={renaming}
          dropState={dropState}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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

      <div className="flex-1 min-h-[2px]" onClick={handleContainerClick} />

      {clipboard && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[#2d2d2d] bg-[#1a1a1a] shrink-0">
          <span className="text-xs text-[#9d9d9d]">📋 {getClipboardIndicator()}</span>
          <button
            onClick={handleClearClipboard}
            className="ml-auto text-xs text-[#666] hover:text-[#ccc] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <ContextMenuPortal
        visible={!!ctxMenu}
        x={ctxMenu?.x ?? 0}
        y={ctxMenu?.y ?? 0}
        items={ctxMenuItems}
        onClose={handleCloseContextMenu}
      />

      {showExternalDropDialog && pendingDropInfo && (
        <ExternalDropDialog
          files={externalDropFiles}
          destName={pendingDropInfo.destPath.split('\\').pop() || 'root'}
          onCopy={handleExternalCopy}
          onMove={handleExternalMove}
          onCancel={handleCloseExternalDropDialog}
        />
      )}
    </div>
  )
}
