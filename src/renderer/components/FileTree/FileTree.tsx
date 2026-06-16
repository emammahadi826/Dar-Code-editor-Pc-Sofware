import React, { useState, useCallback, useEffect } from 'react'
import { FileTreeNode } from './FileTreeNode'
import { FileEntry } from '../../types'
import { useAppStore } from '../../store/appStore'
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

  if (loading) {
    return <div className="text-sidepanel-text text-sm p-3 opacity-60">Loading...</div>
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between px-3 py-1.5 mb-1">
        <span className="text-sidepanel-header text-sm font-semibold uppercase tracking-wider">
          {rootPath.split('\\').pop() || rootPath.split('/').pop()}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 text-sidepanel-text hover:text-white rounded hover:bg-hover transition-colors"
            title="Refresh"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => handleCreateFile(rootPath)}
            className="p-1 text-sidepanel-text hover:text-white rounded hover:bg-hover transition-colors"
            title="New File"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => handleCreateFolder(rootPath)}
            className="p-1 text-sidepanel-text hover:text-white rounded hover:bg-hover transition-colors"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {creating && (
        <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ paddingLeft: '10px' }}>
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

      {entries.map((entry) => (
        <FileTreeNode
          key={entry.path}
          entry={renaming?.path === entry.path ? { ...entry, name: '' } : entry}
          depth={0}
          expandedDirs={expandedDirs}
          onToggle={handleToggle}
          onFileSelect={onFileSelect}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      ))}

      {renaming && (
        <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ paddingLeft: '28px' }}>
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
    </div>
  )
}
