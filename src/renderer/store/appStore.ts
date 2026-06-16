import { create } from 'zustand'
import { FileEntry } from '../types'

interface OpenTab {
  path: string
  name: string
  content: string
  isDirty: boolean
  language: string
}

interface AppState {
  sidePanelOpen: boolean
  toggleSidePanel: () => void
  bottomPanelOpen: boolean
  toggleBottomPanel: () => void
  rightPanelOpen: boolean
  toggleRightPanel: () => void
  bottomPanelTab: 'OUTPUT' | 'TERMINAL' | 'PROBLEMS'
  setBottomPanelTab: (t: 'OUTPUT' | 'TERMINAL' | 'PROBLEMS') => void

  activeModule: 'Files' | 'Search' | 'Git' | 'Extensions' | 'Settings'
  setActiveModule: (m: 'Files' | 'Search' | 'Git' | 'Extensions' | 'Settings') => void

  openTabs: OpenTab[]
  activeTab: string | null
  openFile: (path: string, name: string, content: string, language: string) => void
  closeTab: (path: string) => void
  setActiveTab: (path: string) => void
  updateTabContent: (path: string, content: string) => void
  markTabClean: (path: string) => void

  rootPath: string | null
  setRootPath: (path: string | null) => void
  fileTree: FileEntry[]
  setFileTree: (entries: FileEntry[]) => void

  cursorLine: number
  cursorColumn: number
  setCursor: (line: number, col: number) => void

  outputLogs: string[]
  addOutputLog: (log: string) => void
}

function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java',
    c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php', swift: 'swift',
    html: 'html', css: 'css', scss: 'scss', less: 'less',
    json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sql: 'sql', sh: 'shell', bash: 'shell',
    txt: 'plaintext', gitignore: 'plaintext',
  }
  return map[ext] || 'plaintext'
}

export const useAppStore = create<AppState>((set) => ({
  sidePanelOpen: true,
  toggleSidePanel: () => set((s) => ({ sidePanelOpen: !s.sidePanelOpen })),
  bottomPanelOpen: true,
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  rightPanelOpen: true,
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  bottomPanelTab: 'TERMINAL',
  setBottomPanelTab: (t) => set({ bottomPanelTab: t }),

  activeModule: 'Files',
  setActiveModule: (m) => set({ activeModule: m }),

  openTabs: [],
  activeTab: null,
  openFile: (path, name, content, language) =>
    set((s) => {
      const exists = s.openTabs.find((t) => t.path === path)
      if (exists) return { activeTab: path }
      return {
        openTabs: [...s.openTabs, { path, name, content, isDirty: false, language: language || detectLanguage(name) }],
        activeTab: path,
      }
    }),
  closeTab: (path) =>
    set((s) => {
      const tabs = s.openTabs.filter((t) => t.path !== path)
      let active = s.activeTab
      if (active === path) {
        const idx = s.openTabs.findIndex((t) => t.path === path)
        active = tabs[Math.min(idx, tabs.length - 1)]?.path || null
      }
      return { openTabs: tabs, activeTab: active }
    }),
  setActiveTab: (path) => set({ activeTab: path }),
  updateTabContent: (path, content) =>
    set((s) => ({
      openTabs: s.openTabs.map((t) => (t.path === path ? { ...t, content, isDirty: true } : t)),
    })),
  markTabClean: (path) =>
    set((s) => ({
      openTabs: s.openTabs.map((t) => (t.path === path ? { ...t, isDirty: false } : t)),
    })),

  rootPath: null,
  setRootPath: (path) => set({ rootPath: path }),
  fileTree: [],
  setFileTree: (entries) => set({ fileTree: entries }),

  cursorLine: 1,
  cursorColumn: 1,
  setCursor: (line, col) => set({ cursorLine: line, cursorColumn: col }),

  outputLogs: ['[System] Code Editor initialized'],
  addOutputLog: (log) => set((s) => ({ outputLogs: [...s.outputLogs, log] })),
}))
