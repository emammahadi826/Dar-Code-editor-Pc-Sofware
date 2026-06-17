import React from 'react'
import { FileType } from '../../utils/fileType'

interface MediaPreviewProps {
  fileType: FileType
  mediaUrl: string
  fileName: string
}

export function MediaPreview({ fileType, mediaUrl, fileName }: MediaPreviewProps) {
  if (fileType === 'image') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-editor-bg overflow-auto">
        <div className="flex flex-col items-center gap-2 p-4">
          <span className="text-sm text-editor-text opacity-50">{fileName}</span>
          <img
            src={mediaUrl}
            alt={fileName}
            className="max-w-full max-h-[85vh] object-contain rounded"
            draggable={false}
          />
        </div>
      </div>
    )
  }

  if (fileType === 'video') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-editor-bg overflow-auto">
        <div className="flex flex-col items-center gap-2 p-4">
          <span className="text-sm text-editor-text opacity-50">{fileName}</span>
          <video
            src={mediaUrl}
            controls
            className="max-w-full max-h-[85vh] object-contain rounded"
          >
            Your browser does not support the video element.
          </video>
        </div>
      </div>
    )
  }

  return null
}
