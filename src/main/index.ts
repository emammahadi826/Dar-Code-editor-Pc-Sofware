import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'
import { registerWindowControls } from './window-controls'
import { registerFileSystem } from './file-system'
import { registerSearchFiles } from './search-files'

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d0d',
    show: true,
    icon: path.join(__dirname, '../../Icon/icon-64.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  Menu.setApplicationMenu(null)

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  registerWindowControls()
  registerFileSystem()
  registerSearchFiles()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
