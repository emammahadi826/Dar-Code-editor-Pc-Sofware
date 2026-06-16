import React, { useCallback } from 'react'
import { useSettingsStore, WordWrap, LineNumbers } from '../../store/settingsStore'
import { useAppStore } from '../../store/appStore'
import { Minus, Plus } from 'lucide-react'

function RangeSlider({
  label, value, min, max, step, onChange, suffix,
}: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix?: string
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-sidepanel-text">{label}</span>
        <span className="text-sm text-sidepanel-text opacity-60">{value}{suffix}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - step))} className="text-sidepanel-text hover:text-white p-1">
          <Minus size={14} />
        </button>
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-accent-blue appearance-none bg-[#3c3c3c] rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-blue [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <button onClick={() => onChange(Math.min(max, value + step))} className="text-sidepanel-text hover:text-white p-1">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function ToggleSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-sm text-sidepanel-text">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-accent-blue' : 'bg-[#3c3c3c]'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SelectOption({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-sm text-sidepanel-text">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#3c3c3c] text-sm text-editor-text border border-[#2d2d2d] rounded px-3 py-1.5 outline-none focus:border-accent-blue cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function SettingsModule() {
  const settings = useSettingsStore()
  const addOutputLog = useAppStore((s) => s.addOutputLog)

  const handleChange = useCallback((key: string, value: any) => {
    const setters: Record<string, (v: any) => void> = {
      fontSize: settings.setFontSize,
      tabSize: settings.setTabSize,
      wordWrap: settings.setWordWrap,
      minimap: settings.setMinimap,
      lineNumbers: settings.setLineNumbers,
    }
    setters[key]?.(value)
    addOutputLog(`[Settings] ${key} → ${value}`)
  }, [settings, addOutputLog])

  return (
    <div className="p-5 overflow-y-auto h-full">
      <h2 className="text-sm font-semibold text-sidepanel-header uppercase tracking-wider mb-5">Editor Settings</h2>

      <RangeSlider
        label="Font Size"
        value={settings.fontSize}
        min={10} max={28} step={1}
        suffix="px"
        onChange={(v) => handleChange('fontSize', v)}
      />

      <RangeSlider
        label="Tab Size"
        value={settings.tabSize}
        min={1} max={8} step={1}
        onChange={(v) => handleChange('tabSize', v)}
      />

      <SelectOption
        label="Word Wrap"
        value={settings.wordWrap}
        options={[
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On' },
          { value: 'wordWrapColumn', label: 'Word Wrap Column' },
          { value: 'bounded', label: 'Bounded' },
        ]}
        onChange={(v) => handleChange('wordWrap', v as any)}
      />

      <ToggleSwitch
        label="Minimap"
        value={settings.minimap}
        onChange={(v) => handleChange('minimap', v)}
      />

      <SelectOption
        label="Line Numbers"
        value={settings.lineNumbers}
        options={[
          { value: 'on', label: 'On' },
          { value: 'off', label: 'Off' },
          { value: 'relative', label: 'Relative' },
        ]}
        onChange={(v) => handleChange('lineNumbers', v as any)}
      />

      <div className="mt-8 pt-5 border-t border-sidepanel-border">
        <h3 className="text-sm font-semibold text-sidepanel-header uppercase tracking-wider mb-3">About</h3>
        <div className="text-sm text-sidepanel-text opacity-60 space-y-1.5">
          <p>Dar Studio v1.0.0</p>
          <p>Electron + React + Monaco Editor</p>
          <p>Windows Desktop Code Editor</p>
        </div>
      </div>
    </div>
  )
}
