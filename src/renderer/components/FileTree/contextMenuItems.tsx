import React from 'react'
import { FileEntry } from '../../types'
import { ContextMenuItem } from '../ContextMenu/ContextMenuPortal'
import { FileText, FolderPlus, ExternalLink, Terminal, Copy, Scissors, Clipboard, ClipboardPaste, FilePenLine, Trash2, Search, Image } from 'lucide-react'

const iconClass = 'w-3.5 h-3.5 text-[#cccccc]'
const dangerIconClass = 'w-3.5 h-3.5 text-red-400'

function icon(el: React.ReactNode) {
  return <span className="w-4 h-4 flex items-center justify-center shrink-0">{el}</span>
}

function I(name: string) {
  return React.createElement('span', { className: iconClass }, name)
}

export interface ContextMenuCallbacks {
  onCreateFile: (parentPath: string) => void
  onCreateFolder: (parentPath: string) => void
  onRevealInExplorer: (path: string) => void
  onOpenInTerminal: (path: string) => void
  onCopyPath: (path: string) => void
  onCopyRelativePath: (path: string) => void
  onRename: (path: string, name: string) => void
  onDelete: (path: string) => void
  onFindInFolder?: (path: string) => void
  onOpenPreview?: (path: string) => void
  onOpenImagePreview?: (path: string) => void
  isDirectory: (path: string) => boolean
  rootPath: string | null
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'])
const CODE_EXTS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'rs', 'go', 'java', 'kt', 'scala',
  'c', 'cpp', 'h', 'hpp', 'cs', 'fs', 'php', 'swift', 'dart',
  'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
  'css', 'scss', 'less', 'html', 'htm',
  'md', 'mdx', 'rst',
  'sql', 'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1',
  'env', 'gitignore', 'lock', 'map',
  'txt', 'log', 'csv', 'tsv',
])

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || ''
}

export function buildContextMenuItems(
  entry: FileEntry,
  entryParentPath: string,
  cb: ContextMenuCallbacks
): ContextMenuItem[] {
  const items: ContextMenuItem[] = []
  const ext = entry.isDirectory ? '' : getExt(entry.name)
  const parentPath = entry.isDirectory ? entry.path : entryParentPath
  const isDir = entry.isDirectory

  // Universal: New File, New Folder
  items.push({
    label: 'New File...',
    icon: icon(<FileText className={iconClass} />),
    shortcut: '',
    onClick: () => cb.onCreateFile(parentPath),
  })
  items.push({
    label: 'New Folder',
    icon: icon(<FolderPlus className={iconClass} />),
    onClick: () => cb.onCreateFolder(parentPath),
  })

  // Conditional top section (before main separator)
  if (IMAGE_EXTS.has(ext)) {
    items.push({ label: '---' })
    items.push({
      label: 'Open in Images Preview',
      icon: icon(<Image className={iconClass} />),
      onClick: () => cb.onOpenImagePreview?.(entry.path),
    })
  }

  if (ext === 'md') {
    items.push({ label: '---' })
    items.push({
      label: 'Open Preview',
      icon: icon(<ExternalLink className={iconClass} />),
      onClick: () => cb.onOpenPreview?.(entry.path),
    })
  }

  if (isDir) {
    items.push({ label: '---' })
    items.push({
      label: 'Find in Folder...',
      icon: icon(<Search className={iconClass} />),
      onClick: () => cb.onFindInFolder?.(entry.path),
    })
  }

  // Main separator
  items.push({ label: '---' })

  // Reveal + Terminal
  items.push({
    label: 'Reveal in File Explorer',
    icon: icon(<ExternalLink className={iconClass} />),
    onClick: () => cb.onRevealInExplorer(entry.path),
  })
  items.push({
    label: 'Open in Integrated Terminal',
    icon: icon(<Terminal className={iconClass} />),
    onClick: () => cb.onOpenInTerminal(isDir ? entry.path : entryParentPath),
  })

  // Separator before clipboard
  items.push({ label: '---' })

  // Clipboard actions
  items.push({
    label: 'Cut',
    icon: icon(<Scissors className={iconClass} />),
    shortcut: 'Ctrl+X',
    disabled: true,
  })
  items.push({
    label: 'Copy',
    icon: icon(<Copy className={iconClass} />),
    shortcut: 'Ctrl+C',
    onClick: () => cb.onCopyPath(entry.path),
  })
  items.push({
    label: 'Paste',
    icon: icon(<ClipboardPaste className={iconClass} />),
    shortcut: 'Ctrl+V',
    disabled: true,
  })
  items.push({ label: '---' })
  items.push({
    label: 'Copy Path',
    icon: icon(<Clipboard className={iconClass} />),
    shortcut: 'Shift+Alt+C',
    onClick: () => cb.onCopyPath(entry.path),
  })
  items.push({
    label: 'Copy Relative Path',
    icon: icon(<Clipboard className={iconClass} />),
    shortcut: 'Ctrl+K Ctrl+Shift+C',
    onClick: () => cb.onCopyRelativePath(entry.path),
  })

  // Separator before destructive actions
  items.push({ label: '---' })

  // Rename + Delete
  items.push({
    label: 'Rename',
    icon: icon(<FilePenLine className={iconClass} />),
    shortcut: 'F2',
    onClick: () => cb.onRename(entry.path, entry.name),
  })
  items.push({
    label: 'Delete',
    icon: icon(<Trash2 className={dangerIconClass} />),
    shortcut: 'Del',
    danger: true,
    onClick: () => cb.onDelete(entry.path),
  })

  return items
}
