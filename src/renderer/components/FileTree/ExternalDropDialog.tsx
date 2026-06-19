import React, { useState } from 'react'
import { Copy, ArrowRight, X, File, Folder, Loader2 } from 'lucide-react'

interface DropFile {
  name: string
  path: string
}

interface ExternalDropDialogProps {
  files: DropFile[]
  destName: string
  onCopy: () => Promise<void>
  onMove: () => Promise<void>
  onCancel: () => void
}

function getFileIcon(name: string) {
  const hasExt = name.includes('.')
  return hasExt ? <File size={16} className="shrink-0 text-[#9d9d9d]" /> : <Folder size={16} className="shrink-0 text-[#d4a84b]" />
}

export function ExternalDropDialog({ files, destName, onCopy, onMove, onCancel }: ExternalDropDialogProps) {
  const [loading, setLoading] = useState<'copy' | 'move' | null>(null)

  const handleCopy = async () => {
    setLoading('copy')
    try {
      await onCopy()
    } finally {
      setLoading(null)
    }
  }

  const handleMove = async () => {
    setLoading('move')
    try {
      await onMove()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-[420px] overflow-hidden animate-in"
        style={{ animation: 'fadeScaleIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2d2d2d]">
          <span className="text-sm font-semibold text-white">Drop to <span className="text-[#007acc]">{destName}</span></span>
          <button
            onClick={loading ? undefined : onCancel}
            className="p-1 text-[#9d9d9d] hover:text-white rounded-md hover:bg-[#2a2a2a] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="text-xs text-[#888] mb-2.5 tracking-wide uppercase">Selected Items</div>
          <div className="max-h-[140px] overflow-y-auto space-y-1.5 mb-3 pr-1 scrollbar-thin">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-[#cccccc] bg-[#2a2a2a] rounded-md px-3 py-2">
                {getFileIcon(f.name)}
                <span className="truncate flex-1">{f.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#666]">Choose what to do with these items:</p>
        </div>

        <div className="flex gap-2.5 px-5 py-3.5 border-t border-[#2d2d2d] justify-end">
          <button
            onClick={loading ? undefined : onCancel}
            disabled={!!loading}
            className="px-4 py-2 text-sm text-[#cccccc] bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded-lg transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={!!loading}
            className="px-4 py-2 text-sm text-white bg-[#007acc] hover:bg-[#1b8cdb] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading === 'copy' ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
            {loading === 'copy' ? 'Copying...' : 'Copy'}
          </button>
          <button
            onClick={handleMove}
            disabled={!!loading}
            className="px-4 py-2 text-sm text-white bg-[#2d8c5a] hover:bg-[#3db89e] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading === 'move' ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            {loading === 'move' ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  )
}
