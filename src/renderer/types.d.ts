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

export interface TerminalInstanceInfo {
  id: number
  name: string
  shellName: string
  shellPath: string
  cwd: string
  createdAt: number
}

export interface TerminalAPI {
  create: (shell: string) => Promise<TerminalInstanceInfo | null>
  createNamed: (shell: string, name?: string, cwd?: string) => Promise<TerminalInstanceInfo | null>
  write: (id: number, data: string) => void
  resize: (id: number, cols: number, rows: number) => void
  kill: (id: number) => void
  killAll: () => void
  rename: (id: number, name: string) => void
  list: () => Promise<TerminalInstanceInfo[]>
  onData: (callback: (id: number, data: string) => void) => () => void
  onShellExit: (callback: (id: number, code: number) => void) => () => void
  getShells: () => Promise<ShellInfo[]>
}

export interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void

  readDir: (dirPath: string) => Promise<FileEntry[]>
  readFile: (filePath: string) => Promise<string | null>
  readFileBase64: (filePath: string) => Promise<string | null>
  writeFile: (filePath: string, content: string) => Promise<boolean>
  createFile: (filePath: string) => Promise<boolean>
  createDir: (dirPath: string) => Promise<boolean>
  delete: (targetPath: string) => Promise<boolean>
  rename: (oldPath: string, newPath: string) => Promise<boolean>
  exists: (targetPath: string) => Promise<boolean>

  openFile: () => Promise<string[]>
  openFolder: () => Promise<string[]>
  saveFile: (defaultPath?: string) => Promise<string | null>

  getLastPath: () => Promise<string | null>
  setLastPath: (dirPath: string) => Promise<void>

  searchInFiles: (p: { rootPath: string; query: string; caseSensitive?: boolean; maxResults?: number }) => Promise<SearchResult[]>

  revealInExplorer: (targetPath: string) => Promise<void>
  copyToClipboard: (text: string) => Promise<void>

  terminal: TerminalAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
