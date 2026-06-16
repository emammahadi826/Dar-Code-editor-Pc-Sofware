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
}

const extIconMap: Record<string, string> = {
  // Scripts & code
  js: 'vscode-icons:file-type-js', jsx: 'vscode-icons:file-type-reactjs',
  ts: 'vscode-icons:file-type-typescript', tsx: 'vscode-icons:file-type-reactts',
  mjs: 'vscode-icons:file-type-js', cjs: 'vscode-icons:file-type-js',
  py: 'vscode-icons:file-type-python', rb: 'vscode-icons:file-type-ruby',
  rs: 'vscode-icons:file-type-rust', go: 'vscode-icons:file-type-go',
  java: 'vscode-icons:file-type-java', kt: 'vscode-icons:file-type-kotlin',
  scala: 'vscode-icons:file-type-scala',
  php: 'vscode-icons:file-type-php', swift: 'vscode-icons:file-type-swift',
  dart: 'vscode-icons:file-type-dart',
  // Web
  html: 'vscode-icons:file-type-html', htm: 'vscode-icons:file-type-html',
  css: 'vscode-icons:file-type-css', scss: 'vscode-icons:file-type-scss',
  less: 'vscode-icons:file-type-less',
  // Config & data
  json: 'vscode-icons:file-type-json', xml: 'vscode-icons:file-type-xml',
  yaml: 'vscode-icons:file-type-yaml', yml: 'vscode-icons:file-type-yaml',
  toml: 'vscode-icons:file-type-toml', ini: 'vscode-icons:file-type-config',
  cfg: 'vscode-icons:file-type-config', conf: 'vscode-icons:file-type-config',
  env: 'vscode-icons:file-type-dotenv',
  // Documentation
  md: 'vscode-icons:file-type-markdown', mdx: 'vscode-icons:file-type-markdown',
  rst: 'vscode-icons:file-type-rst',
  // Database
  sql: 'vscode-icons:file-type-sql', db: 'vscode-icons:file-type-db',
  sqlite: 'vscode-icons:file-type-sqlite',
  // Shell & scripts
  sh: 'vscode-icons:file-type-shell', bash: 'vscode-icons:file-type-shell',
  zsh: 'vscode-icons:file-type-shell',
  bat: 'vscode-icons:file-type-batch', cmd: 'vscode-icons:file-type-batch',
  ps1: 'vscode-icons:file-type-powershell',
  // Images
  png: 'vscode-icons:file-type-image', jpg: 'vscode-icons:file-type-image',
  jpeg: 'vscode-icons:file-type-image', gif: 'vscode-icons:file-type-image',
  svg: 'vscode-icons:file-type-svg', ico: 'vscode-icons:file-type-image',
  webp: 'vscode-icons:file-type-image', bmp: 'vscode-icons:file-type-image',
  // Documents
  pdf: 'vscode-icons:file-type-pdf',
  // Archives
  zip: 'vscode-icons:file-type-zip', rar: 'vscode-icons:file-type-zip',
  '7z': 'vscode-icons:file-type-zip', tar: 'vscode-icons:file-type-zip',
  gz: 'vscode-icons:file-type-zip',
  // Media
  mp3: 'vscode-icons:file-type-audio', wav: 'vscode-icons:file-type-audio',
  ogg: 'vscode-icons:file-type-audio', flac: 'vscode-icons:file-type-audio',
  mp4: 'vscode-icons:file-type-video', avi: 'vscode-icons:file-type-video',
  mov: 'vscode-icons:file-type-video', mkv: 'vscode-icons:file-type-video',
  webm: 'vscode-icons:file-type-video',
  // Binary
  exe: 'vscode-icons:file-type-executable', dll: 'vscode-icons:file-type-dll',
  msi: 'vscode-icons:file-type-installer', wasm: 'vscode-icons:file-type-wasm',
  // Generic
  log: 'vscode-icons:file-type-log', txt: 'vscode-icons:file-type-text',
  csv: 'vscode-icons:file-type-csv', tsv: 'vscode-icons:file-type-csv',
  lock: 'vscode-icons:file-type-lock', map: 'vscode-icons:file-type-map',
  // Git
  gitignore: 'vscode-icons:file-type-git', gitkeep: 'vscode-icons:file-type-git',
  // Code quality
  eslintrc: 'vscode-icons:file-type-eslint', prettierrc: 'vscode-icons:file-type-prettier',
  editorconfig: 'vscode-icons:file-type-editorconfig',
  // C/C++
  c: 'vscode-icons:file-type-c', h: 'vscode-icons:file-type-header',
  cpp: 'vscode-icons:file-type-cpp', hpp: 'vscode-icons:file-type-header',
  cs: 'vscode-icons:file-type-csharp', fs: 'vscode-icons:file-type-fsharp',
}

function getFileIconName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return extIconMap[ext] || 'vscode-icons:default-file'
}

export function FileTreeNode({ entry, depth, expandedDirs, onToggle, onFileSelect, onCreateFile, onCreateFolder, onRename, onDelete }: FileTreeNodeProps) {
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

  const iconName = entry.isDirectory
    ? (isExpanded ? 'vscode-icons:default-folder-opened' : 'vscode-icons:default-folder')
    : getFileIconName(entry.name)

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div>
          <div
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-sidepanel-text hover:bg-sidepanel-hover rounded-sm"
            style={{ paddingLeft: `${depth * 18 + 10}px` }}
          >
            {entry.isDirectory ? (
              <>
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <Icon icon={iconName} width={18} height={18} className="shrink-0" />
                <span className="ml-1.5 text-sm truncate">{entry.name}</span>
              </>
            ) : (
              <>
                <span className="w-4 shrink-0" />
                <Icon icon={iconName} width={18} height={18} className="shrink-0" />
                <span className="ml-1.5 text-sm truncate">{entry.name}</span>
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
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[200px] bg-[#252526] border border-[#454545] rounded py-1.5 shadow-xl z-50"
          alignOffset={-4}
        >
          {entry.isDirectory && (
            <>
              <ContextMenu.Item
                onSelect={() => onCreateFile(entry.path)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#cccccc] cursor-pointer hover:bg-[#094771] outline-none"
              >
                <Icon icon="vscode-icons:file-type-text" width={16} height={16} />
                New File
              </ContextMenu.Item>
              <ContextMenu.Item
                onSelect={() => onCreateFolder(entry.path)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[#cccccc] cursor-pointer hover:bg-[#094771] outline-none"
              >
                <Icon icon="vscode-icons:default-folder" width={16} height={16} />
                New Folder
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-[#3c3c3c] mx-3 my-1" />
            </>
          )}
          <ContextMenu.Item
            onSelect={() => onRename(entry.path, entry.name)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#cccccc] cursor-pointer hover:bg-[#094771] outline-none"
          >
            <Icon icon="vscode-icons:default-file" width={16} height={16} />
            Rename
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() => onDelete(entry.path)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#cccccc] cursor-pointer hover:bg-[#094771] outline-none"
          >
            <Icon icon="vscode-icons:file-type-binary" width={16} height={16} />
            Delete
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-[#3c3c3c] mx-3 my-1" />
          <ContextMenu.Item
            onSelect={() => navigator.clipboard.writeText(entry.path)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-[#cccccc] cursor-pointer hover:bg-[#094771] outline-none"
          >
            <Icon icon="vscode-icons:file-type-text" width={16} height={16} />
            Copy Path
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
