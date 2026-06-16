import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, FileCode, ChevronRight, CaseSensitive, X } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { SearchResult } from '../../types'
import { useFileSystem } from '../../hooks/useFileSystem'

export function SearchInFiles() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootPath = useAppStore((s) => s.rootPath)
  const addOutputLog = useAppStore((s) => s.addOutputLog)
  const openFile = useAppStore((s) => s.openFile)
  const { readFile } = useFileSystem()
  const searchKeyRef = useRef(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doSearch = useCallback(async (q: string, sensitive: boolean) => {
    if (!q.trim() || !rootPath || !window.electron) {
      setResults([])
      return
    }
    setSearching(true)
    const key = ++searchKeyRef.current
    try {
      const res = await window.electron.searchInFiles({
        rootPath,
        query: q.trim(),
        caseSensitive: sensitive,
        maxResults: 500,
      })
      if (key === searchKeyRef.current) {
        setResults(res)
        addOutputLog(`[Search] "${q}" → ${res.length} results`)
      }
    } catch {
      if (key === searchKeyRef.current) {
        addOutputLog(`[Search] Error searching for "${q}"`)
      }
    } finally {
      if (key === searchKeyRef.current) {
        setSearching(false)
      }
    }
  }, [rootPath, addOutputLog])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || !rootPath) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      doSearch(query, caseSensitive)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, rootPath, caseSensitive, doSearch])

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
      <div className="flex gap-1 mb-2">
        <div className="flex-1 flex items-center gap-1 bg-[var(--bg-input)] rounded border border-[var(--border)] focus-within:border-accent-blue">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                searchKeyRef.current++
                doSearch(query, caseSensitive)
              }
            }}
            placeholder="Search in files..."
            className="flex-1 bg-transparent text-editor-text text-xs px-2 py-1.5 outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }} className="p-1 text-editor-text opacity-50 hover:opacity-100">
              <X size={12} />
            </button>
          )}
        </div>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`px-2 py-1.5 rounded text-xs border transition-colors ${
            caseSensitive
              ? 'bg-accent-blue text-white border-accent-blue'
              : 'bg-transparent text-editor-text opacity-60 border-[var(--border)] hover:opacity-100'
          }`}
          title="Case Sensitive"
        >
          Aa
        </button>
        <button
          onClick={() => {
            searchKeyRef.current++
            doSearch(query, caseSensitive)
          }}
          disabled={searching || !query.trim()}
          className="px-2 py-1.5 bg-accent-blue text-white rounded text-xs hover:bg-accent-blue-h disabled:opacity-50"
        >
          <Search size={12} />
        </button>
      </div>

      {rootPath && (
        <div className="text-xs text-editor-text opacity-40 mb-2 px-1 truncate">
          Searching in: {rootPath}
        </div>
      )}

      {!rootPath && (
        <div className="text-editor-text text-xs opacity-40 text-center py-8">
          Open a folder to search files
        </div>
      )}

      {searching && (
        <div className="text-editor-text text-xs opacity-60 text-center py-4">
          Searching...
        </div>
      )}

      {!searching && query && Object.keys(grouped).length === 0 && (
        <div className="text-editor-text text-xs opacity-40 text-center py-8">No results found</div>
      )}

      {!searching && results.length > 0 && (
        <div className="text-xs text-editor-text opacity-50 mb-2 px-1">
          {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(grouped).length} file{Object.keys(grouped).length !== 1 ? 's' : ''}
        </div>
      )}

      {Object.entries(grouped).map(([file, fileResults]) => (
        <div key={file} className="mb-2">
          <div className="flex items-center gap-1 text-xs text-editor-text opacity-60 mb-1 truncate px-1">
            <FileCode size={12} className="shrink-0" />
            <span className="truncate">{file}</span>
            <span className="opacity-50 shrink-0">({fileResults.length})</span>
          </div>
          {fileResults.map((r, i) => (
            <div
              key={i}
              onClick={() => handleResultClick(r)}
              className="flex items-start gap-1 px-2 py-0.5 cursor-pointer hover:bg-hover rounded-sm text-xs"
            >
              <span className="text-accent-blue shrink-0 w-6 text-right font-mono">{r.line}</span>
              <span className="text-editor-text opacity-70 truncate">{r.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
