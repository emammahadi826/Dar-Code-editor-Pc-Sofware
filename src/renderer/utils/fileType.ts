const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif', 'tiff', 'tif',
])

const VIDEO_EXTENSIONS = new Set([
  'mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'm4v', 'mpg', 'mpeg', '3gp',
])

export type FileType = 'code' | 'image' | 'video'

export function getFileType(filePath: string): FileType {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  return 'code'
}

export function isMediaFile(filePath: string): boolean {
  return getFileType(filePath) !== 'code'
}
