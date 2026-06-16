import React, { useState, useCallback } from 'react'
import { Search, FileCode, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { SearchResult } from '../../types'
import { useFileSystem } from '../../hooks/useFileSystem'

export function SearchInFiles() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const rootPath = useAppStore((s) => s.rootPath)
  const addOutputLog = useAppStore((s) => s.addOutputLog)
  const openFile = useAppStore((s) => s.openFile)
  const { readFile } = useFileSystem()

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !rootPath || !window.electron) return
    setSearching(true)
    try {
      const res = await window.electron.searchInFiles({
        rootPath,
        query: query.trim(),
        caseSensitive: false,
      })
      setResults(res)
      addOutputLog(`[Search] "${query}" → ${res.length} results`)
    } catch {
      addOutputLog(`[Search] Error searching for "${query}"`)
    } finally {
      setSearching(false)
    }
  }, [query, rootPath, addOutputLog])

  const handleResultClick = useCallback(async (result: SearchResult) => {
    const content = await readFile(result.file)
    if (content !== null) {
      const name = result.file.split('\\').pop() || result.file.split('/').pop() || ''
      openFile(result.file, name, content, '')
    }
  }, [readFile, openFile])

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.file]) acc[r.file] = []
    acc[r.file].push(r)
    return acc
  }, {})

  return (
    <div className="p-2">
      <div className="flex gap-1 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search in files..."
          className="flex-1 bg-[var(--bg-input)] text-editor-text text-xs px-2 py-1.5 rounded border border-[var(--border)] focus:outline-none focus:border-accent-blue"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-2 py-1.5 bg-accent-blue text-white rounded text-xs hover:bg-accent-blue-h disabled:opacity-50"
        >
          <Search size={12} />
        </button>
      </div>

      {Object.keys(grouped).length === 0 && query && !searching && (
        <div className="text-editor-text text-xs opacity-40 text-center py-8">No results found</div>
      )}

      {Object.entries(grouped).map(([file, fileResults]) => (
        <div key={file} className="mb-2">
          <div className="text-xs text-editor-text opacity-60 mb-1 truncate">
            {file}
          </div>
          {fileResults.map((r, i) => (
            <div
              key={i}
              onClick={() => handleResultClick(r)}
              className="flex items-start gap-1 px-2 py-0.5 cursor-pointer hover:bg-hover rounded-sm text-xs"
            >
              <span className="text-accent-blue shrink-0 w-6 text-right">{r.line}</span>
              <span className="text-editor-text opacity-70 truncate">{r.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
