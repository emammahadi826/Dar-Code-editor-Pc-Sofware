import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { FileTree } from '../components/FileTree/FileTree'
import { SearchInFiles } from '../modules/SearchInFiles'
import { SettingsModule } from '../modules/Settings'
import { FolderOpen, Plus, GitBranch, Puzzle } from 'lucide-react'
import { useFileSystem } from '../hooks/useFileSystem'
import { getFileType } from '../utils/fileType'

const MIME_MAP: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
  bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif',
  tiff: 'image/tiff', tif: 'image/tiff',
  mp4: 'video/mp4', webm: 'video/webm', avi: 'video/x-msvideo',
  mov: 'video/quicktime', mkv: 'video/x-matroska', wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv', m4v: 'video/mp4', mpg: 'video/mpeg',
  mpeg: 'video/mpeg', '3gp': 'video/3gpp',
}

function getMimeType(fileName: string, fileType: 'image' | 'video'): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return MIME_MAP[ext] || `${fileType}/${ext}`
}

function PlaceholderView({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center mt-16 text-sidepanel-text opacity-50">
      <Icon size={36} className="mb-3" />
      <span className="text-sm font-medium mb-1">{title}</span>
      <span className="text-sm opacity-60 px-8 text-center">{description}</span>
    </div>
  )
}

export function SidePanel() {
  const { rootPath, openFile, activeModule, addOutputLog, setRootPath } = useAppStore()
  const { openFolder, readFile } = useFileSystem()

  useEffect(() => {
    if (!window.electron) return
    window.electron.getLastPath().then(async (lastPath) => {
      if (!lastPath) return
      const stillExists = await window.electron.exists(lastPath)
      if (stillExists) {
        setRootPath(lastPath)
      }
    }).catch(() => {
      addOutputLog('[App] Could not restore last folder')
    })
  }, [setRootPath, addOutputLog])

  const handleFileSelect = async (filePath: string, fileName: string) => {
    const fileType = getFileType(filePath)
    if (fileType === 'binary') {
      openFile(filePath, fileName, '', '', 'binary')
      return
    }
    if (fileType !== 'code') {
      const base64 = window.electron ? await window.electron.readFileBase64(filePath) : null
      if (base64) {
        const mimeType = getMimeType(fileName, fileType)
        const mediaUrl = `data:${mimeType};base64,${base64}`
        openFile(filePath, fileName, '', '', fileType, mediaUrl)
      } else {
        addOutputLog(`[FS] Failed to read media file: ${fileName}`)
      }
      return
    }
    const content = await readFile(filePath)
    if (content !== null) {
      openFile(filePath, fileName, content, '')
    } else {
      addOutputLog(`[FS] Failed to read file: ${fileName}`)
    }
  }

  const headerTitle = activeModule === 'Files' ? 'Explorer'
    : activeModule === 'Search' ? 'Search'
    : activeModule === 'Git' ? 'Source Control'
    : activeModule === 'Extensions' ? 'Extensions'
    : activeModule === 'Settings' ? 'Settings'
    : 'Explorer'

  return (
    <div className="h-full min-w-[260px] bg-sidepanel-bg border-r border-sidepanel-border flex flex-col text-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidepanel-border shrink-0">
        <span className="text-sidepanel-header text-sm font-semibold uppercase tracking-wider">
          {headerTitle}
        </span>
        {activeModule === 'Files' && rootPath && (
          <button
            onClick={openFolder}
            className="text-sidepanel-text hover:text-white p-1 rounded hover:bg-hover transition-colors"
            title="Open Folder"
          >
            <FolderOpen size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeModule === 'Files' && (
          rootPath ? (
            <div className="p-3 h-full">
              <FileTree rootPath={rootPath} onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-16 text-sidepanel-text opacity-60 px-6">
              <FolderOpen size={40} className="mb-4" />
              <span className="text-sm mb-4">No folder opened</span>
              <button
                onClick={openFolder}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue-h transition-colors"
              >
                <Plus size={14} />
                Open Folder
              </button>
            </div>
          )
        )}

        {activeModule === 'Search' && <SearchInFiles />}
        {activeModule === 'Settings' && <SettingsModule />}
        {activeModule === 'Git' && (
          <PlaceholderView icon={GitBranch} title="Source Control" description="Git integration coming soon" />
        )}
        {activeModule === 'Extensions' && (
          <PlaceholderView icon={Puzzle} title="Extensions" description="Extension marketplace coming soon" />
        )}
      </div>
    </div>
  )
}
