import { AlertTriangle } from 'lucide-react'

interface Props {
  fileName: string
  onOpenAnyway: () => void
}

export function BinaryFileWarning({ fileName, onOpenAnyway }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-editor-text">
      <div className="flex flex-col items-center max-w-md text-center">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Binary File</h2>
        <p className="text-sm text-editor-text opacity-70 mb-1">
          The file <span className="font-mono text-yellow-500">{fileName}</span> is binary or uses an unsupported text encoding.
        </p>
        <p className="text-sm text-editor-text opacity-70 mb-6">
          It cannot be displayed normally in the editor.
        </p>
        <button
          onClick={onOpenAnyway}
          className="px-4 py-2 bg-accent-blue text-white text-sm rounded hover:bg-accent-blue-h transition-colors"
        >
          Open Anyway
        </button>
      </div>
    </div>
  )
}
