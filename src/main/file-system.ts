import { ipcMain, dialog, app, shell, clipboard } from 'electron'
import fs from 'fs'
import path from 'path'

export function registerFileSystem() {
  ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      return entries.map((e) => ({
        name: e.name,
        path: path.join(dirPath, e.name),
        isDirectory: e.isDirectory(),
        isFile: e.isFile(),
      }))
    } catch {
      return []
    }
  })

  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch {
      return null
    }
  })

  ipcMain.handle('fs:readFileBase64', async (_, filePath: string) => {
    try {
      const buffer = fs.readFileSync(filePath)
      return buffer.toString('base64')
    } catch {
      return null
    }
  })

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8')
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('fs:createFile', async (_, filePath: string) => {
    try {
      fs.writeFileSync(filePath, '', 'utf-8')
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('fs:createDir', async (_, dirPath: string) => {
    try {
      fs.mkdirSync(dirPath, { recursive: true })
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('fs:delete', async (_, targetPath: string) => {
    try {
      fs.rmSync(targetPath, { recursive: true, force: true })
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('fs:rename', async (_, oldPath: string, newPath: string) => {
    try {
      fs.renameSync(oldPath, newPath)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('fs:exists', async (_, targetPath: string) => {
    return fs.existsSync(targetPath)
  })

  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'All Files', extensions: ['*'] }],
    })
    return result.filePaths
  })

  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    return result.filePaths
  })

  ipcMain.handle('dialog:saveFile', async (_, defaultPath?: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath,
      filters: [{ name: 'All Files', extensions: ['*'] }],
    })
    return result.filePath
  })

  ipcMain.handle('app:getLastPath', async () => {
    try {
      const p = path.join(app.getPath('userData'), 'last-path.json')
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'))
      return null
    } catch {
      return null
    }
  })

  ipcMain.handle('app:setLastPath', async (_, dirPath: string) => {
    try {
      const p = path.join(app.getPath('userData'), 'last-path.json')
      fs.writeFileSync(p, JSON.stringify(dirPath), 'utf-8')
    } catch {}
  })

  ipcMain.handle('shell:revealInExplorer', async (_, targetPath: string) => {
    try {
      shell.showItemInFolder(targetPath)
    } catch {}
  })

  ipcMain.handle('app:copyToClipboard', async (_, text: string) => {
    try {
      clipboard.writeText(text)
    } catch {}
  })
}
