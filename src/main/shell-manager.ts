import { ipcMain, BrowserWindow } from 'electron'
import os from 'os'
import path from 'path'

// dynamic require to bypass Rollup bundling of native module
const nodePty: typeof import('node-pty') = eval('require')('node-pty')
const { spawn } = nodePty

let terminalIdCounter = 0
const terminals = new Map<number, ReturnType<typeof spawn>>()

function detectShells(): { name: string; path: string; icon: string }[] {
  const shells: { name: string; path: string; icon: string }[] = []

  // cmd.exe — always available on Windows
  const comSpec = process.env.COMSPEC
  if (comSpec) {
    shells.push({ name: 'Command Prompt', path: comSpec, icon: 'cmd' })
  }

  // Windows PowerShell (5.1)
  const psPath = path.join(os.homedir(), '..', 'Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  const sysPs = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  if (require('fs').existsSync(sysPs)) {
    shells.push({ name: 'PowerShell 5.1', path: sysPs, icon: 'powershell' })
  }

  // PowerShell Core (pwsh.exe) — check PATH
  const envPath = process.env.PATH || ''
  for (const dir of envPath.split(path.delimiter)) {
    const pwshPath = path.join(dir, 'pwsh.exe')
    if (require('fs').existsSync(pwshPath)) {
      shells.push({ name: 'PowerShell Core', path: pwshPath, icon: 'pwsh' })
      break
    }
  }

  // Git Bash — common install locations
  const bashCandidates = [
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'bin', 'bash.exe'),
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe'),
  ]
  for (const bp of bashCandidates) {
    if (require('fs').existsSync(bp)) {
      shells.push({ name: 'Git Bash', path: bp, icon: 'bash' })
      break
    }
  }

  return shells
}

export function registerShellManager() {
  ipcMain.handle('terminal:getShells', async () => {
    return detectShells()
  })

  ipcMain.handle('terminal:create', async (event, shellPath: string) => {
    const id = ++terminalIdCounter
    const cwd = process.env.USERPROFILE || process.env.HOME || os.homedir()

    try {
      const ptyProcess = spawn(shellPath, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd,
        env: process.env as Record<string, string>,
      })

      terminals.set(id, ptyProcess)

      ptyProcess.onData((data: string) => {
        const win = BrowserWindow.fromWebContents(event.sender)
        if (win) {
          win.webContents.send('terminal:data', id, data)
        }
      })

      ptyProcess.onExit(({ exitCode, signal }) => {
        terminals.delete(id)
        const win = BrowserWindow.fromWebContents(event.sender)
        if (win) {
          win.webContents.send('terminal:data', id, `\r\n[Process exited with code ${exitCode}]\r\n`)
        }
      })

      return id
    } catch (err) {
      console.error('Failed to create terminal:', err)
      return -1
    }
  })

  ipcMain.on('terminal:write', (_, id: number, data: string) => {
    const pty = terminals.get(id)
    if (pty) {
      pty.write(data)
    }
  })

  ipcMain.on('terminal:resize', (_, id: number, cols: number, rows: number) => {
    const pty = terminals.get(id)
    if (pty) {
      pty.resize(cols, rows)
    }
  })

  ipcMain.on('terminal:kill', (_, id: number) => {
    const pty = terminals.get(id)
    if (pty) {
      pty.kill()
      terminals.delete(id)
    }
  })
}
