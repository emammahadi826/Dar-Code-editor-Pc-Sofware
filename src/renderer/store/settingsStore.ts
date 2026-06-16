import { create } from 'zustand'

interface SettingsState {
  fontSize: number
  setFontSize: (s: number) => void
  tabSize: number
  setTabSize: (s: number) => void
  wordWrap: 'on' | 'off'
  setWordWrap: (w: 'on' | 'off') => void
  minimap: boolean
  setMinimap: (m: boolean) => void
  lineNumbers: 'on' | 'off' | 'relative'
  setLineNumbers: (l: 'on' | 'off' | 'relative') => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 14,
  setFontSize: (s) => set({ fontSize: s }),
  tabSize: 2,
  setTabSize: (s) => set({ tabSize: s }),
  wordWrap: 'off',
  setWordWrap: (w) => set({ wordWrap: w }),
  minimap: true,
  setMinimap: (m) => set({ minimap: m }),
  lineNumbers: 'on',
  setLineNumbers: (l) => set({ lineNumbers: l }),
}))
