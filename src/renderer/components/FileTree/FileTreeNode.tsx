import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FileEntry } from '../../types'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Icon } from '@iconify/react'

interface DropState {
  targetPath: string
  position: 'before' | 'after' | 'inside'
}

interface FileTreeNodeProps {
  entry: FileEntry
  depth: number
  isLast: boolean
  ancestorVerticalLines: boolean[]
  expandedDirs: Set<string>
  onToggle: (path: string, isExpanded: boolean) => void
  onFileSelect: (path: string, name: string) => void
  onCreateFile: (parentPath: string) => void
  onCreateFolder: (parentPath: string) => void
  onRename: (path: string, name: string) => void
  onDelete: (path: string) => void
  creating: { parentPath: string; type: 'file' | 'folder' } | null
  onCreateSubmit: (name: string) => void
  onCancelCreate: () => void
  selectedPath: string | null
  onSelect: (path: string) => void
  refreshKey: number
  onContextMenu?: (e: React.MouseEvent, entry: FileEntry) => void
  draggedPath: string | null
  renaming: { path: string; name: string } | null
  dropState: DropState | null
  onDragStart: (entry: FileEntry) => void
  onDragEnd: () => void
  onDragOver: (entry: FileEntry, position: 'before' | 'after' | 'inside') => void
  onDragLeave: () => void
  onDrop: (entry: FileEntry, position: 'before' | 'after' | 'inside') => void
}

const extIconMap: Record<string, string> = {
  js: 'vscode-icons:file-type-js', jsx: 'vscode-icons:file-type-reactjs',
  ts: 'vscode-icons:file-type-typescript', tsx: 'vscode-icons:file-type-reactts',
  mjs: 'vscode-icons:file-type-js', cjs: 'vscode-icons:file-type-js',
  py: 'vscode-icons:file-type-python', rb: 'vscode-icons:file-type-ruby',
  rs: 'vscode-icons:file-type-rust', go: 'vscode-icons:file-type-go',
  java: 'vscode-icons:file-type-java', kt: 'vscode-icons:file-type-kotlin',
  scala: 'vscode-icons:file-type-scala',
  php: 'vscode-icons:file-type-php', swift: 'vscode-icons:file-type-swift',
  dart: 'vscode-icons:file-type-dart',
  html: 'vscode-icons:file-type-html', htm: 'vscode-icons:file-type-html',
  css: 'vscode-icons:file-type-css', scss: 'vscode-icons:file-type-scss',
  less: 'vscode-icons:file-type-less',
  json: 'vscode-icons:file-type-json', xml: 'vscode-icons:file-type-xml',
  yaml: 'vscode-icons:file-type-yaml', yml: 'vscode-icons:file-type-yaml',
  toml: 'vscode-icons:file-type-toml', ini: 'vscode-icons:file-type-config',
  cfg: 'vscode-icons:file-type-config', conf: 'vscode-icons:file-type-config',
  env: 'vscode-icons:file-type-dotenv',
  md: 'vscode-icons:file-type-markdown', mdx: 'vscode-icons:file-type-markdown',
  rst: 'vscode-icons:file-type-rst',
  sql: 'vscode-icons:file-type-sql', db: 'vscode-icons:file-type-db',
  sqlite: 'vscode-icons:file-type-sqlite',
  sh: 'vscode-icons:file-type-shell', bash: 'vscode-icons:file-type-shell',
  zsh: 'vscode-icons:file-type-shell',
  bat: 'vscode-icons:file-type-batch', cmd: 'vscode-icons:file-type-batch',
  ps1: 'vscode-icons:file-type-powershell',
  png: 'vscode-icons:file-type-image', jpg: 'vscode-icons:file-type-image',
  jpeg: 'vscode-icons:file-type-image', gif: 'vscode-icons:file-type-image',
  svg: 'vscode-icons:file-type-svg', ico: 'vscode-icons:file-type-image',
  webp: 'vscode-icons:file-type-image', bmp: 'vscode-icons:file-type-image',
  pdf: 'vscode-icons:file-type-pdf',
  zip: 'vscode-icons:file-type-zip', rar: 'vscode-icons:file-type-zip',
  '7z': 'vscode-icons:file-type-zip', tar: 'vscode-icons:file-type-zip',
  gz: 'vscode-icons:file-type-zip',
  mp3: 'vscode-icons:file-type-audio', wav: 'vscode-icons:file-type-audio',
  ogg: 'vscode-icons:file-type-audio', flac: 'vscode-icons:file-type-audio',
  mp4: 'vscode-icons:file-type-video', avi: 'vscode-icons:file-type-video',
  mov: 'vscode-icons:file-type-video', mkv: 'vscode-icons:file-type-video',
  webm: 'vscode-icons:file-type-video',
  exe: 'vscode-icons:file-type-executable', dll: 'vscode-icons:file-type-dll',
  msi: 'vscode-icons:file-type-installer', wasm: 'vscode-icons:file-type-wasm',
  log: 'vscode-icons:file-type-log', txt: 'vscode-icons:file-type-text',
  csv: 'vscode-icons:file-type-csv', tsv: 'vscode-icons:file-type-csv',
  lock: 'vscode-icons:file-type-lock', map: 'vscode-icons:file-type-map',
  gitignore: 'vscode-icons:file-type-git', gitkeep: 'vscode-icons:file-type-git',
  eslintrc: 'vscode-icons:file-type-eslint', prettierrc: 'vscode-icons:file-type-prettier',
  editorconfig: 'vscode-icons:file-type-editorconfig',
  c: 'vscode-icons:file-type-c', h: 'vscode-icons:file-type-header',
  cpp: 'vscode-icons:file-type-cpp', hpp: 'vscode-icons:file-type-header',
  cs: 'vscode-icons:file-type-csharp', fs: 'vscode-icons:file-type-fsharp',
}

function getFileIconName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return extIconMap[ext] || 'vscode-icons:default-file'
}

export function FileTreeNode({
  entry, depth, isLast, ancestorVerticalLines,
  expandedDirs, onToggle, onFileSelect,
  onCreateFile, onCreateFolder, onRename, onDelete,
  creating, onCreateSubmit, onCancelCreate,
  selectedPath, onSelect, refreshKey,
  onContextMenu,
  draggedPath, renaming, dropState,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
}: FileTreeNodeProps) {
  const [children, setChildren] = useState<FileEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const isExpanded = expandedDirs.has(entry.path)
  const nodeRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (isExpanded && loaded) {
      setLoaded(false)
    }
  }, [refreshKey])

  const handleClick = () => {
    if (entry.isDirectory) {
      onToggle(entry.path, isExpanded)
    } else {
      onFileSelect(entry.path, entry.name)
    }
    onSelect(entry.path)
  }

  const handleCreateClick = useCallback((type: 'file' | 'folder') => {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      if (type === 'file') onCreateFile(entry.path)
      else onCreateFolder(entry.path)
      onSelect(entry.path)
    }
  }, [entry.path, onCreateFile, onCreateFolder, onSelect])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onSelect(entry.path)
    onContextMenu?.(e, entry)
  }, [entry.path, onSelect, onContextMenu, entry])

  const handleDragStartEvent = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(entry)
  }, [entry, onDragStart])

  const handleDragOverEvent = useCallback((e: React.DragEvent) => {
    if (!draggedPath || draggedPath === entry.path) return
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    const threshold = Math.min(height * 0.25, 8)

    let position: 'before' | 'after' | 'inside'
    if (y < threshold) {
      position = 'before'
    } else if (y > height - threshold) {
      position = 'after'
    } else if (entry.isDirectory) {
      position = 'inside'
    } else {
      position = 'after'
    }

    onDragOver(entry, position)
  }, [draggedPath, entry, onDragOver])

  const handleDragLeaveEvent = useCallback(() => {
    onDragLeave()
  }, [onDragLeave])

  const handleDropEvent = useCallback((e: React.DragEvent) => {
    if (!draggedPath) return
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    const threshold = Math.min(height * 0.25, 8)

    let position: 'before' | 'after' | 'inside'
    if (y < threshold) {
      position = 'before'
    } else if (y > height - threshold) {
      position = 'after'
    } else if (entry.isDirectory) {
      position = 'inside'
    } else {
      position = 'after'
    }

    onDrop(entry, position)
  }, [draggedPath, entry, onDrop])

  const isSelected = entry.path === selectedPath
  const isCreatingHere = creating?.parentPath === entry.path
  const isDragging = draggedPath === entry.path
  const isDropTarget = dropState?.targetPath === entry.path
  const dropPos = isDropTarget ? dropState!.position : null

  let rowClass = `relative flex items-center py-[3px] cursor-pointer group select-none rounded-sm ${
    isSelected ? 'bg-active text-white' : 'hover:bg-hover text-sidepanel-text'
  } ${isDragging ? 'opacity-40' : ''} ${
    dropPos === 'inside' ? 'bg-accent-blue/10 ring-1 ring-accent-blue' : ''
  }`
  if (isDragging) rowClass = rowClass.replace('hover:bg-hover', '')

  return (
    <div>
      <div
        ref={nodeRef}
        data-file-row
        className={rowClass}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable={!creating && !renaming}
        onDragStart={handleDragStartEvent}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOverEvent}
        onDragLeave={handleDragLeaveEvent}
        onDrop={handleDropEvent}
      >
        {ancestorVerticalLines.map((show, idx) =>
          show && (
            <div
              key={idx}
              className="absolute top-0 bottom-0 w-px bg-[#3c3c3c]"
              style={{ left: `${8 + idx * 14 + 7}px` }}
            />
          )
        )}

        {depth > 0 && (
          <>
            <div
              className="absolute w-px bg-[#3c3c3c]"
              style={{ left: `${8 + (depth - 1) * 14 + 7}px`, top: 0, bottom: '50%' }}
            />
            {!isLast && (
              <div
                className="absolute w-px bg-[#3c3c3c]"
                style={{ left: `${8 + (depth - 1) * 14 + 7}px`, top: '50%', bottom: 0 }}
              />
            )}
            <div
              className="absolute h-px bg-[#3c3c3c]"
              style={{ left: `${8 + (depth - 1) * 14 + 7}px`, width: '7px', top: '50%' }}
            />
          </>
        )}

        {entry.isDirectory && (
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!entry.isDirectory && <span className="w-4" />}
        <Icon
          icon={entry.isDirectory
            ? (isExpanded ? 'vscode-icons:default-folder-opened' : 'vscode-icons:default-folder')
            : getFileIconName(entry.name)
          }
          width={18}
          height={18}
          className="shrink-0"
        />
        <span className="truncate text-sm ml-1">{entry.name}</span>
        {entry.isDirectory && (
          <div className="ml-auto hidden group-hover:flex items-center gap-0.5 pr-1">
            <button
              onClick={handleCreateClick('file')}
              className="p-0.5 text-sidepanel-text hover:text-white rounded hover:bg-[#3c3c3c] transition-colors"
              title="New File"
            >
              <Icon icon="vscode-icons:default-file" width={14} height={14} />
            </button>
            <button
              onClick={handleCreateClick('folder')}
              className="p-0.5 text-sidepanel-text hover:text-white rounded hover:bg-[#3c3c3c] transition-colors"
              title="New Folder"
            >
              <Icon icon="vscode-icons:default-folder" width={14} height={14} />
            </button>
          </div>
        )}

        {dropPos === 'before' && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-blue pointer-events-none z-10" />
        )}
        {dropPos === 'after' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue pointer-events-none z-10" />
        )}
      </div>

      {isCreatingHere && (
        <div
          className="relative flex items-center gap-1.5 py-[3px]"
          style={{ paddingLeft: `${8 + (depth + 1) * 14}px` }}
        >
          {[...ancestorVerticalLines, !isLast].map((show, idx) =>
            show && (
              <div
                key={idx}
                className="absolute top-0 bottom-0 w-px bg-[#3c3c3c]"
                style={{ left: `${8 + idx * 14 + 7}px` }}
              />
            )
          )}
          {depth + 1 > 0 && (
            <>
              <div
                className="absolute w-px bg-[#3c3c3c]"
                style={{ left: `${8 + depth * 14 + 7}px`, top: 0, bottom: '50%' }}
              />
              <div
                className="absolute h-px bg-[#3c3c3c]"
                style={{ left: `${8 + depth * 14 + 7}px`, width: '7px', top: '50%' }}
              />
            </>
          )}
          <Icon
            icon={creating?.type === 'folder' ? 'vscode-icons:default-folder' : 'vscode-icons:default-file'}
            width={18}
            height={18}
          />
          <input
            autoFocus
            type="text"
            placeholder={creating?.type === 'file' ? 'filename.ext' : 'folder-name'}
            className="flex-1 bg-[#3c3c3c] text-sm text-editor-text px-2 py-1 border border-[#007acc] outline-none rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreateSubmit((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') onCancelCreate()
            }}
            onBlur={(e) => {
              if (e.target.value) onCreateSubmit(e.target.value)
              else onCancelCreate()
            }}
          />
        </div>
      )}

      {entry.isDirectory && isExpanded && loaded && children.map((child, idx) => (
        <FileTreeNode
          key={child.path}
          entry={child}
          depth={depth + 1}
          isLast={idx === children.length - 1}
          ancestorVerticalLines={[...ancestorVerticalLines, !isLast]}
          expandedDirs={expandedDirs}
          onToggle={onToggle}
          onFileSelect={onFileSelect}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onRename={onRename}
          onDelete={onDelete}
          creating={creating}
          onCreateSubmit={onCreateSubmit}
          onCancelCreate={onCancelCreate}
          selectedPath={selectedPath}
          onSelect={onSelect}
          refreshKey={refreshKey}
          onContextMenu={onContextMenu}
          draggedPath={draggedPath}
          dropState={dropState}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      ))}
    </div>
  )
}
