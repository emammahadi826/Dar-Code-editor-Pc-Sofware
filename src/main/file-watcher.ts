import { ipcMain, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

let watcher: fs.FSWatcher | null = null
let watchTimer: ReturnType<typeof setTimeout> | null = null
let currentWindow: BrowserWindow | null = null

function sendChange(win: BrowserWindow) {
  if (watchTimer) clearTimeout(watchTimer)
  watchTimer = setTimeout(() => {
    if (!win.isDestroyed()) {
      win.webContents.send('fs:filesChanged')
    }
  }, 300)
}

export function startWatching(dirPath: string, win: BrowserWindow) {
  stopWatching()
  if (!fs.existsSync(dirPath)) return
  currentWindow = win
  try {
    watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        const fullPath = path.join(dirPath, filename)
        const parsed = path.parse(fullPath)
        const skipDirs = ['node_modules', '.git', 'dist', 'out', 'build', '.vite', '.cache', '__pycache__']
        if (skipDirs.includes(parsed.name) || parsed.name.startsWith('.')) return
        sendChange(win)
      }
    })
  } catch {
    watcher = null
  }
}

export function stopWatching() {
  if (watcher) {
    watcher.close()
    watcher = null
  }
  if (watchTimer) {
    clearTimeout(watchTimer)
    watchTimer = null
  }
  currentWindow = null
}

export function registerFileWatcher() {
  ipcMain.handle('fs:watchDir', async (_, dirPath: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) startWatching(dirPath, win)
    return true
  })

  ipcMain.handle('fs:unwatchDir', async () => {
    stopWatching()
    return true
  })
}
