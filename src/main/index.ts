import { app, BrowserWindow, Menu, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import { registerWindowControls } from './window-controls'
import { registerFileSystem } from './file-system'
import { registerSearchFiles } from './search-files'
import { registerShellManager } from './shell-manager'
import { registerFileWatcher } from './file-watcher'

let win: BrowserWindow | null = null

function loadIcon(): Electron.NativeImage {
  const pngPath = path.join(__dirname, '../../Icon/icon-256.png')
  const icoPath = path.join(__dirname, '../../Icon/icon.ico')
  if (fs.existsSync(pngPath)) {
    const img = nativeImage.createFromPath(pngPath)
    if (!img.isEmpty()) return img.resize({ width: 64, height: 64, quality: 'best' })
  }
  if (fs.existsSync(icoPath)) {
    const img = nativeImage.createFromPath(icoPath)
    if (!img.isEmpty()) return img
  }
  return nativeImage.createEmpty()
}

function createWindow() {
  const icon = loadIcon()

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d0d',
    show: true,
    icon: icon.isEmpty() ? undefined : icon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.ELECTRON_VITE_DEV || process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }

  if (!icon.isEmpty()) win.setIcon(icon)
  Menu.setApplicationMenu(null)

  if (process.env.ELECTRON_VITE_DEV || process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.darstudio.app')
  createWindow()
  registerWindowControls()
  registerFileSystem()
  registerSearchFiles()
  registerShellManager()
  registerFileWatcher()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
