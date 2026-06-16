import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

interface SearchResult {
  file: string
  line: number
  column: number
  text: string
}

function searchInFile(filePath: string, query: string, caseSensitive: boolean): SearchResult[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const results: SearchResult[] = []
    const flags = caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)

    for (let i = 0; i < lines.length; i++) {
      const match = regex.exec(lines[i])
      if (match) {
        results.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          text: lines[i].trim(),
        })
      }
    }
    return results
  } catch {
    return []
  }
}

function searchDir(dirPath: string, query: string, caseSensitive: boolean, maxResults: number): SearchResult[] {
  const results: SearchResult[] = []
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (results.length >= maxResults) break
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        results.push(...searchDir(fullPath, query, caseSensitive, maxResults - results.length))
      } else if (entry.isFile()) {
        results.push(...searchInFile(fullPath, query, caseSensitive))
      }
    }
  } catch {
    // skip
  }
  return results
}

export function registerSearchFiles() {
  ipcMain.handle('search:inFiles', async (_, { rootPath, query, caseSensitive = false, maxResults = 200 }) => {
    return searchDir(rootPath, query, caseSensitive, maxResults)
  })
}
