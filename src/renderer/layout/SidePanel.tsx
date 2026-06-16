import React from 'react'
import { useAppStore } from '../store/appStore'
import { FileTree } from '../components/FileTree/FileTree'
import { FolderOpen, Plus } from 'lucide-react'
import { useFileSystem } from '../hooks/useFileSystem'

export function SidePanel() {
  const { sidePanelOpen, rootPath, openFile } = useAppStore()
  const { openFolder, readFile } = useFileSystem()

  const handleFileSelect = async (filePath: string, fileName: string) => {
    const content = await readFile(filePath)
    if (content !== null) {
      openFile(filePath, fileName, content, '')
    }
  }

  if (!sidePanelOpen) return null

  return (
    <div className="w-[280px] bg-sidepanel-bg border-r border-sidepanel-border flex flex-col text-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-sidepanel-border">
        <span className="text-sidepanel-header text-xs font-semibold uppercase tracking-wider">
          Explorer
        </span>
        <button
          onClick={openFolder}
          className="text-sidepanel-text hover:text-white p-0.5 rounded hover:bg-hover transition-colors"
          title="Open Folder"
        >
          <FolderOpen size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {rootPath ? (
          <FileTree rootPath={rootPath} onFileSelect={handleFileSelect} />
        ) : (
          <div className="flex flex-col items-center justify-center mt-12 text-sidepanel-text opacity-60">
            <FolderOpen size={32} className="mb-3" />
            <span className="text-xs mb-3">No folder opened</span>
            <button
              onClick={openFolder}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-accent-blue text-white rounded hover:bg-accent-blue-h transition-colors"
            >
              <Plus size={12} />
              Open Folder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
