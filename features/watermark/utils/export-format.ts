export type ExportFormatPreference = 'auto' | 'png' | 'jpeg'

export const DEFAULT_JPEG_QUALITY = 0.92

export interface ResolvedExportFormat {
  mime: 'image/png' | 'image/jpeg'
  extension: 'png' | 'jpg'
  quality?: number
}

export function resolveExportFormat(
  fileType: string,
  preference: ExportFormatPreference
): ResolvedExportFormat {
  if (preference === 'png') {
    return { mime: 'image/png', extension: 'png' }
  }
  if (preference === 'jpeg') {
    return {
      mime: 'image/jpeg',
      extension: 'jpg',
      quality: DEFAULT_JPEG_QUALITY,
    }
  }
  const preferPng =
    fileType === 'image/png' || fileType === 'image/gif' || fileType === 'image/svg+xml'
  if (preferPng) {
    return { mime: 'image/png', extension: 'png' }
  }
  return {
    mime: 'image/jpeg',
    extension: 'jpg',
    quality: DEFAULT_JPEG_QUALITY,
  }
}
