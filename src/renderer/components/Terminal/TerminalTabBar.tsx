import React from 'react'
import { useTerminalStore, TerminalInstanceData } from '../../store/terminalStore'
import { X, Plus, Terminal } from 'lucide-react'

interface Props {
  onAddClick: () => void
}

const SHELL_ICONS: Record<string, string> = {
  cmd: 'C:',
  powershell: 'PS',
  pwsh: 'PS',
  bash: 'bash',
}

export function TerminalTabBar({ onAddClick }: Props) {
  const instances = useTerminalStore((s) => s.instances)
  const activeTerminalId = useTerminalStore((s) => s.activeTerminalId)
  const setActiveTerminal = useTerminalStore((s) => s.setActiveTerminal)
  const closeTerminal = useTerminalStore((s) => s.closeTerminal)

  if (instances.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border-b border-[#3c3c3c] shrink-0 min-h-[32px]">
        <span className="text-xs text-editor-text opacity-40">no terminals</span>
      </div>
    )
  }

  return (
    <div className="flex items-center bg-[#252526] border-b border-[#3c3c3c] shrink-0 min-h-[32px] overflow-hidden">
      <div className="flex-1 flex items-center overflow-x-auto">
        {instances.map((inst) => (
          <TerminalTab
            key={inst.id}
            instance={inst}
            isActive={inst.id === activeTerminalId}
            onSelect={() => setActiveTerminal(inst.id)}
            onClose={() => closeTerminal(inst.id)}
          />
        ))}
      </div>
      <button
        onClick={onAddClick}
        className="px-2 py-1 text-editor-text opacity-50 hover:opacity-100 hover:bg-[#2d2d2d] shrink-0"
        title="New Terminal"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

function TerminalTab({ instance, isActive, onSelect, onClose }: {
  instance: TerminalInstanceData
  isActive: boolean
  onSelect: () => void
  onClose: () => void
}) {
  const icon = SHELL_ICONS[instance.shellIcon] || '$'

  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center gap-1.5 px-3 py-1 text-sm cursor-pointer select-none shrink-0
        border-r border-[#3c3c3c] min-w-0 max-w-[180px]
        ${isActive
          ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#0078d4] pt-[2px]'
          : 'text-editor-text opacity-60 hover:opacity-90 hover:bg-[#2d2d2d]'
        }
      `}
    >
      <span className="text-[10px] font-bold opacity-70 shrink-0">{icon}</span>
      <span className="truncate text-xs">{instance.name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] hover:opacity-100 shrink-0"
        style={{ opacity: isActive ? undefined : undefined }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.opacity = '0' }}
      >
        <X size={10} />
      </button>
    </div>
  )
}
