import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.send('win:minimize'),
  maximize: () => ipcRenderer.send('win:maximize'),
  close: () => ipcRenderer.send('win:close'),

  // File system
  readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  readFileBase64: (filePath: string) => ipcRenderer.invoke('fs:readFileBase64', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  createFile: (filePath: string) => ipcRenderer.invoke('fs:createFile', filePath),
  createDir: (dirPath: string) => ipcRenderer.invoke('fs:createDir', dirPath),
  delete: (targetPath: string) => ipcRenderer.invoke('fs:delete', targetPath),
  rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
  moveFile: (sourcePath: string, destPath: string) => ipcRenderer.invoke('fs:moveFile', sourcePath, destPath),
  exists: (targetPath: string) => ipcRenderer.invoke('fs:exists', targetPath),

  // Dialogs
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (defaultPath?: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath),

  // Persist
  getLastPath: () => ipcRenderer.invoke('app:getLastPath'),
  setLastPath: (dirPath: string) => ipcRenderer.invoke('app:setLastPath', dirPath),

  // Search
  searchInFiles: (p: { rootPath: string; query: string; caseSensitive?: boolean; maxResults?: number }) =>
    ipcRenderer.invoke('search:inFiles', p),

  // Shell / Clipboard
  revealInExplorer: (targetPath: string) => ipcRenderer.invoke('shell:revealInExplorer', targetPath),
  copyToClipboard: (text: string) => ipcRenderer.invoke('app:copyToClipboard', text),

  // Terminal
  terminal: {
    create: (shell: string) => ipcRenderer.invoke('terminal:create', shell),
    createNamed: (shell: string, name?: string, cwd?: string) => ipcRenderer.invoke('terminal:createNamed', shell, name, cwd),
    write: (id: number, data: string) => ipcRenderer.send('terminal:write', id, data),
    resize: (id: number, cols: number, rows: number) => ipcRenderer.send('terminal:resize', id, cols, rows),
    kill: (id: number) => ipcRenderer.send('terminal:kill', id),
    killAll: () => ipcRenderer.send('terminal:killAll'),
    rename: (id: number, name: string) => ipcRenderer.send('terminal:rename', id, name),
    list: () => ipcRenderer.invoke('terminal:list'),
    onData: (callback: (id: number, data: string) => void) => {
      const handler = (_: any, id: number, data: string) => callback(id, data)
      ipcRenderer.on('terminal:data', handler)
      return () => ipcRenderer.removeListener('terminal:data', handler)
    },
    onShellExit: (callback: (id: number, code: number) => void) => {
      const handler = (_: any, id: number, code: number) => callback(id, code)
      ipcRenderer.on('terminal:exited', handler)
      return () => ipcRenderer.removeListener('terminal:exited', handler)
    },
    getShells: () => ipcRenderer.invoke('terminal:getShells'),
  },
})
