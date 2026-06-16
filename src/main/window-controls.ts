import { BrowserWindow, ipcMain } from 'electron'

export function registerWindowControls() {
  ipcMain.on('win:minimize', () => BrowserWindow.getFocusedWindow()?.minimize())
  ipcMain.on('win:maximize', () => {
    const w = BrowserWindow.getFocusedWindow()
    w?.isMaximized() ? w.unmaximize() : w?.maximize()
  })
  ipcMain.on('win:close', () => BrowserWindow.getFocusedWindow()?.close())
}
