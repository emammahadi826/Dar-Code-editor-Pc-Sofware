import { ipcMain, BrowserWindow } from 'electron'
import os from 'os'
import path from 'path'
import fs from 'fs'

const nodePty: typeof import('node-pty') = eval('require')('node-pty')
const { spawn } = nodePty

interface TerminalMeta {
  id: number
  name: string
  shellName: string
  shellPath: string
  cwd: string
  createdAt: number
}

interface PtyRecord {
  pty: ReturnType<typeof spawn>
  meta: TerminalMeta
}

let terminalIdCounter = 0
const terminals = new Map<number, PtyRecord>()
const nameCounters = new Map<string, number>()

function nextName(shellName: string): string {
  const count = (nameCounters.get(shellName) ?? 0) + 1
  nameCounters.set(shellName, count)
  return `${shellName} ${count}`
}

function detectShells(): { name: string; path: string; icon: string }[] {
  const shells: { name: string; path: string; icon: string }[] = []

  const comSpec = process.env.COMSPEC
  if (comSpec) {
    shells.push({ name: 'Command Prompt', path: comSpec, icon: 'cmd' })
  }

  const sysPs = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  if (fs.existsSync(sysPs)) {
    shells.push({ name: 'PowerShell 5.1', path: sysPs, icon: 'powershell' })
  }

  const envPath = process.env.PATH || ''
  for (const dir of envPath.split(path.delimiter)) {
    const pwshPath = path.join(dir, 'pwsh.exe')
    if (fs.existsSync(pwshPath)) {
      shells.push({ name: 'PowerShell Core', path: pwshPath, icon: 'pwsh' })
      break
    }
  }

  const bashCandidates = [
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'bin', 'bash.exe'),
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe'),
  ]
  for (const bp of bashCandidates) {
    if (fs.existsSync(bp)) {
      shells.push({ name: 'Git Bash', path: bp, icon: 'bash' })
      break
    }
  }

  return shells
}

function createPty(shellPath: string, name: string, shellName: string, cwd: string, sender: Electron.WebContents): number {
  const id = ++terminalIdCounter

  try {
    const ptyProcess = spawn(shellPath, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: cwd || process.env.USERPROFILE || process.env.HOME || os.homedir(),
      env: process.env as Record<string, string>,
    })

    const meta: TerminalMeta = {
      id,
      name,
      shellName,
      shellPath,
      cwd: cwd || process.env.USERPROFILE || process.env.HOME || os.homedir(),
      createdAt: Date.now(),
    }

    terminals.set(id, { pty: ptyProcess, meta })

    ptyProcess.onData((data: string) => {
      try {
        sender.send('terminal:data', id, data)
      } catch {}
    })

    ptyProcess.onExit(({ exitCode, signal }) => {
      terminals.delete(id)
      try {
        sender.send('terminal:data', id, `\r\n[Process exited with code ${exitCode}]\r\n`)
        sender.send('terminal:exited', id, exitCode ?? 0)
      } catch {}
    })

    return id
  } catch (err) {
    console.error('Failed to create terminal:', err)
    return -1
  }
}

export function registerShellManager() {
  ipcMain.handle('terminal:getShells', async () => {
    return detectShells()
  })

  ipcMain.handle('terminal:create', async (event, shellPath: string) => {
    const shells = detectShells()
    const shellInfo = shells.find((s) => s.path === shellPath) ?? shells[0]
    if (!shellInfo) return null
    const name = nextName(shellInfo.name)
    const id = createPty(shellPath, name, shellInfo.name, '', event.sender)
    if (id === -1) return null
    const record = terminals.get(id)
    return record ? { ...record.meta } : null
  })

  ipcMain.handle('terminal:createNamed', async (event, shellPath: string, customName?: string, cwd?: string) => {
    const shells = detectShells()
    const shellInfo = shells.find((s) => s.path === shellPath) ?? shells[0]
    if (!shellInfo) return null
    const name = customName || nextName(shellInfo.name)
    const id = createPty(shellPath, name, shellInfo.name, cwd || '', event.sender)
    if (id === -1) return null
    const record = terminals.get(id)
    return record ? { ...record.meta } : null
  })

  ipcMain.handle('terminal:list', async () => {
    const result: TerminalMeta[] = []
    for (const record of terminals.values()) {
      result.push({ ...record.meta })
    }
    return result.sort((a, b) => a.createdAt - b.createdAt)
  })

  ipcMain.on('terminal:rename', (_, id: number, name: string) => {
    const record = terminals.get(id)
    if (record) {
      record.meta.name = name
    }
  })

  ipcMain.on('terminal:write', (_, id: number, data: string) => {
    const record = terminals.get(id)
    if (record) {
      record.pty.write(data)
    }
  })

  ipcMain.on('terminal:resize', (_, id: number, cols: number, rows: number) => {
    const record = terminals.get(id)
    if (record) {
      record.pty.resize(cols, rows)
    }
  })

  ipcMain.on('terminal:kill', (_, id: number) => {
    const record = terminals.get(id)
    if (record) {
      record.pty.kill()
      terminals.delete(id)
    }
  })

  ipcMain.on('terminal:killAll', () => {
    for (const [id, record] of terminals) {
      try { record.pty.kill() } catch {}
      terminals.delete(id)
    }
    nameCounters.clear()
  })
}
