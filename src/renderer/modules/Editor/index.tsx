import React, { useRef, useCallback, useEffect, useState } from 'react'
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { FileCode, Loader } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useFileSystem } from '../../hooks/useFileSystem'
import { MediaPreview } from '../../components/Preview/MediaPreview'
import { BinaryFileWarning } from '../../components/Editor/BinaryFileWarning'

loader.config({ monaco })

export function EditorModule() {
  const editorRef = useRef<any>(null)
  const { openTabs, activeTab, updateTabContent, markTabClean, setCursor, closeTab, openFile } = useAppStore()
  const { fontSize, tabSize, wordWrap, minimap, lineNumbers } = useSettingsStore()
  const { saveFile, readFile } = useFileSystem()
  const [mounted, setMounted] = useState(false)

  const activeFile = openTabs.find((t) => t.path === activeTab)

  useEffect(() => {
    console.log('[Editor] activeFile:', activeFile?.name)
  }, [activeFile])

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    console.log('[Editor] mounted:', activeFile?.name)
    editorRef.current = editor
    setMounted(true)
    editor.onDidChangeCursorPosition((e: any) => {
      setCursor(e.position.lineNumber, e.position.column)
    })

    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [2048 | 49],
      run: async () => {
        if (activeTab) {
          const content = editor.getValue()
          await saveFile(activeTab, content)
          markTabClean(activeTab)
        }
      },
    })
  }, [activeTab, saveFile, markTabClean])

  const handleChange: OnChange = useCallback((value) => {
    if (activeTab && value !== undefined) {
      updateTabContent(activeTab, value)
    }
  }, [activeTab, updateTabContent])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (activeTab && editorRef.current) {
          const content = editorRef.current.getValue()
          await saveFile(activeTab, content)
          markTabClean(activeTab)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, saveFile, markTabClean])

  if (!activeFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-editor-text opacity-40">
        <FileCode size={48} className="mb-4" />
        <span className="text-lg mb-1">Code Editor</span>
        <span className="text-sm">Open a folder or file to get started</span>
      </div>
    )
  }

  if (activeFile.fileType === 'binary') {
    return (
      <BinaryFileWarning
        fileName={activeFile.name}
        onOpenAnyway={async () => {
          const content = await readFile(activeFile.path)
          if (content !== null) {
            closeTab(activeFile.path)
            openFile(activeFile.path, activeFile.name, content, '', 'code')
          }
        }}
      />
    )
  }

  if (activeFile.fileType !== 'code') {
    if (activeFile.mediaUrl) {
      return (
        <MediaPreview
          fileType={activeFile.fileType}
          mediaUrl={activeFile.mediaUrl}
          fileName={activeFile.name}
        />
      )
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-editor-text opacity-40">
        <FileCode size={48} className="mb-4" />
        <span className="text-lg mb-1">Unable to load preview</span>
        <span className="text-sm">The media file could not be read</span>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0">
      <Editor
        key={activeFile.path}
        height="100%"
        defaultLanguage={activeFile.language}
        language={activeFile.language}
        value={activeFile.content}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full text-editor-text opacity-50">
            <Loader size={20} className="animate-spin mr-2" />
            Loading editor...
          </div>
        }
        options={{
          fontSize,
          tabSize,
          wordWrap,
          minimap: { enabled: minimap },
          lineNumbers,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          autoIndent: 'full',
          formatOnPaste: true,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 8 },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
