import { create } from 'zustand'

export type WordWrap = 'off' | 'on' | 'wordWrapColumn' | 'bounded'
export type LineNumbers = 'on' | 'off' | 'relative'

interface SettingsState {
  fontSize: number
  setFontSize: (s: number) => void
  tabSize: number
  setTabSize: (s: number) => void
  wordWrap: WordWrap
  setWordWrap: (w: WordWrap) => void
  minimap: boolean
  setMinimap: (m: boolean) => void
  lineNumbers: LineNumbers
  setLineNumbers: (l: LineNumbers) => void
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
