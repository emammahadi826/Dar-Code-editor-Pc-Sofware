import React, { useState, useEffect, useCallback } from 'react'
import { FileEntry } from '../../types'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Icon } from '@iconify/react'
import * as ContextMenu from '@radix-ui/react-context-menu'

interface FileTreeNodeProps {
  entry: FileEntry
  depth: number
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

export function FileTreeNode({ entry, depth, expandedDirs, onToggle, onFileSelect, onCreateFile, onCreateFolder, onRename, onDelete, creating, onCreateSubmit, onCancelCreate, selectedPath, onSelect, refreshKey }: FileTreeNodeProps) {
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

  const isSelected = entry.path === selectedPath
  const isCreatingHere = creating?.parentPath === entry.path

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div>
          <div
            className={`flex items-center gap-1.5 py-1 cursor-pointer group select-none rounded-sm ${
              isSelected ? 'bg-active text-white' : 'hover:bg-hover text-sidepanel-text'
            }`}
            style={{ paddingLeft: `${8 + depth * 14}px` }}
            onClick={handleClick}
            onContextMenu={(e) => {
              e.preventDefault()
              onSelect(entry.path)
            }}
          >
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
            <span className="truncate text-sm">{entry.name}</span>
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
          </div>

          {isCreatingHere && (
            <div
              className="flex items-center gap-1.5 py-1"
              style={{ paddingLeft: `${8 + (depth + 1) * 14}px` }}
            >
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

          {entry.isDirectory && isExpanded && loaded && children.map((child) => (
            <FileTreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
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
            />
          ))}
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Content className="bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 min-w-[180px]">
        <ContextMenu.Item
          className="text-sm text-sidepanel-text px-3 py-1.5 cursor-pointer hover:bg-[#094771] hover:text-white outline-none flex items-center gap-2"
          onClick={() => onSelect(entry.path)}
        >
          <Icon icon={entry.isDirectory ? 'vscode-icons:default-folder-opened' : getFileIconName(entry.name)} width={16} height={16} />
          {entry.name}
        </ContextMenu.Item>
        <ContextMenu.Separator className="h-px bg-[#3c3c3c] mx-2 my-1" />
        <ContextMenu.Item
          className="text-sm text-sidepanel-text px-3 py-1.5 cursor-pointer hover:bg-[#094771] hover:text-white outline-none"
          onClick={() => onRename(entry.path, entry.name)}
        >
          Rename
        </ContextMenu.Item>
        <ContextMenu.Item
          className="text-sm text-red-400 px-3 py-1.5 cursor-pointer hover:bg-[#094771] hover:text-white outline-none"
          onClick={() => onDelete(entry.path)}
        >
          Delete
        </ContextMenu.Item>
        {entry.isDirectory && (
          <>
            <ContextMenu.Separator className="h-px bg-[#3c3c3c] mx-2 my-1" />
            <ContextMenu.Item
              className="text-sm text-sidepanel-text px-3 py-1.5 cursor-pointer hover:bg-[#094771] hover:text-white outline-none"
              onClick={() => onCreateFile(entry.path)}
            >
              New File
            </ContextMenu.Item>
            <ContextMenu.Item
              className="text-sm text-sidepanel-text px-3 py-1.5 cursor-pointer hover:bg-[#094771] hover:text-white outline-none"
              onClick={() => onCreateFolder(entry.path)}
            >
              New Folder
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
