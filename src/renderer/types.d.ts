export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
}

export interface SearchResult {
  file: string
  line: number
  column: number
  text: string
}

export interface ShellInfo {
  name: string
  path: string
  icon: string
}

export interface TerminalAPI {
  create: (shell: string) => Promise<number>
  write: (id: number, data: string) => void
  resize: (id: number, cols: number, rows: number) => void
  kill: (id: number) => void
  onData: (callback: (id: number, data: string) => void) => () => void
  getShells: () => Promise<ShellInfo[]>
}

export interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void

  readDir: (dirPath: string) => Promise<FileEntry[]>
  readFile: (filePath: string) => Promise<string | null>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  createFile: (filePath: string) => Promise<boolean>
  createDir: (dirPath: string) => Promise<boolean>
  delete: (targetPath: string) => Promise<boolean>
  rename: (oldPath: string, newPath: string) => Promise<boolean>
  exists: (targetPath: string) => Promise<boolean>

  openFile: () => Promise<string[]>
  openFolder: () => Promise<string[]>
  saveFile: (defaultPath?: string) => Promise<string | null>

  searchInFiles: (p: { rootPath: string; query: string; caseSensitive?: boolean; maxResults?: number }) => Promise<SearchResult[]>

  terminal: TerminalAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
