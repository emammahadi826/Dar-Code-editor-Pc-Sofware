import React from 'react'
import { Copy, ArrowRight, X } from 'lucide-react'

interface ExternalDropDialogProps {
  files: { name: string; path: string; isDirectory: boolean }[]
  onCopy: () => void
  onMove: () => void
  onCancel: () => void
}

export function ExternalDropDialog({ files, onCopy, onMove, onCancel }: ExternalDropDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg shadow-2xl w-[400px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2d2d]">
          <span className="text-sm font-semibold text-white">Drop Options</span>
          <button
            onClick={onCancel}
            className="p-1 text-[#9d9d9d] hover:text-white rounded hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="text-xs text-[#9d9d9d] mb-2">Items being dropped:</div>
          <div className="max-h-[120px] overflow-y-auto space-y-1 mb-3">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#cccccc]">
                <span className="shrink-0">{f.isDirectory ? '📁' : '📄'}</span>
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-[#888] text-xs">{f.isDirectory ? 'folder' : 'file'}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#888]">Choose what to do with the dropped items:</p>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-[#2d2d2d] justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-[#cccccc] bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCopy}
            className="px-4 py-1.5 text-sm text-white bg-[#007acc] hover:bg-[#1b8cdb] rounded transition-colors flex items-center gap-1.5"
          >
            <Copy size={14} />
            Copy
          </button>
          <button
            onClick={onMove}
            className="px-4 py-1.5 text-sm text-white bg-[#4ec9b0] hover:bg-[#3db89e] rounded transition-colors flex items-center gap-1.5"
          >
            <ArrowRight size={14} />
            Move
          </button>
        </div>
      </div>
    </div>
  )
}
