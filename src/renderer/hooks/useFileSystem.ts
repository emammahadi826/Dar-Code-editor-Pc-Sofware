import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'

export function useFileSystem() {
  const setFileTree = useAppStore((s) => s.setFileTree)
  const setRootPath = useAppStore((s) => s.setRootPath)
  const addOutputLog = useAppStore((s) => s.addOutputLog)

  const openFolder = useCallback(async () => {
    if (!window.electron) return
    const paths = await window.electron.openFolder()
    if (paths.length > 0) {
      setRootPath(paths[0])
      await refreshTree(paths[0])
      addOutputLog(`[FS] Opened folder: ${paths[0]}`)
    }
  }, [setRootPath, addOutputLog])

  const refreshTree = useCallback(async (dirPath?: string) => {
    if (!window.electron) return
    const root = dirPath || useAppStore.getState().rootPath
    if (!root) return
    const entries = await window.electron.readDir(root)
    setFileTree(entries)
  }, [setFileTree])

  const readFile = useCallback(async (filePath: string) => {
    if (!window.electron) return null
    return window.electron.readFile(filePath)
  }, [])

  const saveFile = useCallback(async (filePath: string, content: string) => {
    if (!window.electron) return false
    const result = await window.electron.writeFile(filePath, content)
    if (result) {
      addOutputLog(`[FS] Saved: ${filePath}`)
    }
    return result
  }, [addOutputLog])

  return { openFolder, refreshTree, readFile, saveFile }
}
