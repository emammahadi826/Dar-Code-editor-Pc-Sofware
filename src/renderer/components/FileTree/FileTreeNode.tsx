import React, { useState, useEffect, useCallback } from 'react'
import { FileEntry } from '../../types'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react'

interface FileTreeNodeProps {
  entry: FileEntry
  depth: number
  expandedDirs: Set<string>
  onToggle: (path: string, isExpanded: boolean) => void
  onFileSelect: (path: string, name: string) => void
}

const icons: Record<string, string> = {
  js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️',
  py: '🐍', rb: '💎', rs: '🦀', go: '🔷',
  java: '☕', c: '⚙️', cpp: '⚙️', cs: '🔷',
  html: '🌐', css: '🎨', scss: '🎨',
  json: '📋', xml: '📄', yaml: '📋', yml: '📋',
  md: '📝', sql: '🗄️', sh: '💻', bat: '🪟', ps1: '🪟',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️',
  ico: '🖼️', webp: '🖼️',
  pdf: '📕', doc: '📘', docx: '📘', xls: '📊', xlsx: '📊',
  zip: '🗜️', rar: '🗜️', '7z': '🗜️', tar: '🗜️', gz: '🗜️',
  mp3: '🎵', wav: '🎵', ogg: '🎵',
  mp4: '🎬', avi: '🎬', mov: '🎬', mkv: '🎬',
  exe: '⚡', dll: '🔧', msi: '📦',
  config: '⚙️', ini: '⚙️', env: '🔐', lock: '🔒',
  cssmap: '🗺️', map: '🗺️',
  log: '📋', txt: '📄', csv: '📊',
}

const iconByExt: Record<string, string> = {
  ...icons,
  jsx: '⚛️', tsx: '⚛️', ts: '📘',
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return iconByExt[ext] || '📄'
}

function getFolderIcon(isOpen: boolean): string {
  return isOpen ? '📂' : '📁'
}

export function FileTreeNode({ entry, depth, expandedDirs, onToggle, onFileSelect }: FileTreeNodeProps) {
  const [children, setChildren] = useState<FileEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const isExpanded = expandedDirs.has(entry.path)

  const loadChildren = useCallback(async () => {
    if (!window.electron || !entry.isDirectory) return
    const result = await window.electron.readDir(entry.path)
    setChildren(result)
    setLoaded(true)
  }, [entry.path, entry.isDirectory])

  useEffect(() => {
    if (isExpanded && !loaded) {
      loadChildren()
    }
  }, [isExpanded, loaded, loadChildren])

  const handleClick = () => {
    if (entry.isDirectory) {
      onToggle(entry.path, isExpanded)
    } else {
      onFileSelect(entry.path, entry.name)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className="flex items-center gap-1 px-2 py-0.5 cursor-pointer text-sidepanel-text hover:bg-sidepanel-hover rounded-sm"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {entry.isDirectory ? (
          <>
            <span className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
            <span className="text-sm">{getFolderIcon(isExpanded)}</span>
            <span className="ml-1 text-xs">{entry.name}</span>
          </>
        ) : (
          <>
            <span className="w-4" />
            <span className="text-sm">{getFileIcon(entry.name)}</span>
            <span className="ml-1 text-xs">{entry.name}</span>
          </>
        )}
      </div>
      {isExpanded && children.map((child) => (
        <FileTreeNode
          key={child.path}
          entry={child}
          depth={depth + 1}
          expandedDirs={expandedDirs}
          onToggle={onToggle}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  )
}
