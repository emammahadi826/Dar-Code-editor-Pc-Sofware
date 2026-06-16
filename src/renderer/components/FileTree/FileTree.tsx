import React, { useState, useCallback, useEffect } from 'react'
import { FileTreeNode } from './FileTreeNode'
import { FileEntry } from '../../types'
import { useFileSystem } from '../../hooks/useFileSystem'

interface FileTreeProps {
  rootPath: string
  onFileSelect: (path: string, name: string) => void
}

export function FileTree({ rootPath, onFileSelect }: FileTreeProps) {
  const { refreshTree } = useFileSystem()
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadEntries(rootPath)
  }, [rootPath])

  const loadEntries = async (dirPath: string) => {
    if (!window.electron) return
    const result = await window.electron.readDir(dirPath)
    setEntries(result)
    setLoading(false)
  }

  const handleToggle = useCallback(async (dirPath: string, isExpanded: boolean) => {
    const next = new Set(expandedDirs)
    if (isExpanded) {
      next.delete(dirPath)
    } else {
      next.add(dirPath)
    }
    setExpandedDirs(next)
  }, [expandedDirs])

  if (loading) {
    return <div className="text-sidepanel-text text-xs p-2 opacity-60">Loading...</div>
  }

  return (
    <div className="text-sm">
      <div className="text-sidepanel-header text-xs font-semibold uppercase tracking-wider px-2 py-1 mb-1">
        {rootPath.split('\\').pop() || rootPath.split('/').pop()}
      </div>
      {entries.map((entry) => (
        <FileTreeNode
          key={entry.path}
          entry={entry}
          depth={0}
          expandedDirs={expandedDirs}
          onToggle={handleToggle}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  )
}
