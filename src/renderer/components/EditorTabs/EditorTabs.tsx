import React from 'react'
import { X, Circle } from 'lucide-react'
import { Icon } from '@iconify/react'
import { useAppStore } from '../../store/appStore'

const extIconMap: Record<string, string> = {
  js: 'vscode-icons:file-type-js', jsx: 'vscode-icons:file-type-reactjs',
  ts: 'vscode-icons:file-type-typescript', tsx: 'vscode-icons:file-type-reactts',
  mjs: 'vscode-icons:file-type-js', cjs: 'vscode-icons:file-type-js',
  py: 'vscode-icons:file-type-python', rb: 'vscode-icons:file-type-ruby',
  rs: 'vscode-icons:file-type-rust', go: 'vscode-icons:file-type-go',
  java: 'vscode-icons:file-type-java', kt: 'vscode-icons:file-type-kotlin',
  php: 'vscode-icons:file-type-php', cs: 'vscode-icons:file-type-csharp',
  c: 'vscode-icons:file-type-c', cpp: 'vscode-icons:file-type-cpp',
  h: 'vscode-icons:file-type-header', hpp: 'vscode-icons:file-type-header',
  html: 'vscode-icons:file-type-html', htm: 'vscode-icons:file-type-html',
  css: 'vscode-icons:file-type-css', scss: 'vscode-icons:file-type-scss',
  less: 'vscode-icons:file-type-less',
  json: 'vscode-icons:file-type-json', xml: 'vscode-icons:file-type-xml',
  yaml: 'vscode-icons:file-type-yaml', yml: 'vscode-icons:file-type-yaml',
  md: 'vscode-icons:file-type-markdown', mdx: 'vscode-icons:file-type-markdown',
  sql: 'vscode-icons:file-type-sql', sh: 'vscode-icons:file-type-shell',
  bash: 'vscode-icons:file-type-shell', bat: 'vscode-icons:file-type-batch',
  ps1: 'vscode-icons:file-type-powershell',
  svg: 'vscode-icons:file-type-svg', png: 'vscode-icons:file-type-image',
  jpg: 'vscode-icons:file-type-image', jpeg: 'vscode-icons:file-type-image',
  gif: 'vscode-icons:file-type-image', webp: 'vscode-icons:file-type-image',
  bmp: 'vscode-icons:file-type-image', ico: 'vscode-icons:file-type-image',
  avif: 'vscode-icons:file-type-image', tiff: 'vscode-icons:file-type-image',
  tif: 'vscode-icons:file-type-image',
  mp4: 'vscode-icons:file-type-video', webm: 'vscode-icons:file-type-video',
  avi: 'vscode-icons:file-type-video', mov: 'vscode-icons:file-type-video',
  mkv: 'vscode-icons:file-type-video', wmv: 'vscode-icons:file-type-video',
  flv: 'vscode-icons:file-type-video', m4v: 'vscode-icons:file-type-video',
  mpg: 'vscode-icons:file-type-video', mpeg: 'vscode-icons:file-type-video',
  '3gp': 'vscode-icons:file-type-video',
  gitignore: 'vscode-icons:file-type-git',
  lock: 'vscode-icons:file-type-lock', env: 'vscode-icons:file-type-dotenv',
  toml: 'vscode-icons:file-type-toml', ini: 'vscode-icons:file-type-config',
  cfg: 'vscode-icons:file-type-config', conf: 'vscode-icons:file-type-config',
  txt: 'vscode-icons:file-type-text', log: 'vscode-icons:file-type-log',
}

function getFileIconName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return extIconMap[ext] || 'vscode-icons:default-file'
}

export function EditorTabs() {
  const { openTabs, activeTab, setActiveTab, closeTab } = useAppStore()

  if (openTabs.length === 0) return null

  return (
    <div className="flex bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-x-auto shrink-0 min-h-0">
      {openTabs.map((tab) => (
        <div
          key={tab.path}
          onClick={() => setActiveTab(tab.path)}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm cursor-pointer border-r border-[var(--border)] min-w-0 shrink-0 group ${
            activeTab === tab.path
              ? 'bg-editor-bg text-white border-t-2 border-t-accent-blue pt-[7px]'
              : 'text-editor-text opacity-70 hover:opacity-100 hover:bg-hover'
          }`}
        >
          <Icon icon={getFileIconName(tab.name)} width={16} height={16} className="shrink-0" />
          {tab.isDirty && <Circle size={10} className="text-accent-orange fill-accent-orange shrink-0" />}
          <span className="truncate max-w-36">{tab.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.path) }}
            className="ml-1.5 opacity-0 group-hover:opacity-100 hover:bg-active rounded p-0.5 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
