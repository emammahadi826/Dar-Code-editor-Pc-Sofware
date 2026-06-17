const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif', 'tiff', 'tif',
])

const VIDEO_EXTENSIONS = new Set([
  'mp4', 'webm', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'm4v', 'mpg', 'mpeg', '3gp',
])

const BINARY_EXTENSIONS = new Set([
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'o', 'a', 'lib',
  'obj', 'class', 'jar', 'war', 'pyc', 'pyo', 'pyd',
  'iso', 'img', 'dmg', 'vhd', 'vmdk',
  'apk', 'ipa', 'xapk',
  'deb', 'rpm',
  'wasm',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'cur',
])

export type FileType = 'code' | 'image' | 'video' | 'binary'

export function getFileType(filePath: string): FileType {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  if (BINARY_EXTENSIONS.has(ext)) return 'binary'
  return 'code'
}

export function isMediaFile(filePath: string): boolean {
  return getFileType(filePath) !== 'code'
}
