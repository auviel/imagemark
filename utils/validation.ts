/**
 * File validation utilities
 * Validates file types, sizes, and content using magic bytes
 */

import { ACCEPTED_FILE_TYPES, ACCEPTED_VIDEO_TYPES } from '@/constants/watermark'
import { FILE_SIZE_LIMITS, validateFileSize } from '@/utils/memory'
import { handleError, ErrorCodes } from '@/lib/error-handler'

/**
 * Magic bytes (file signatures) for different file types
 */
const FILE_SIGNATURES: Record<string, number[][]> = {
  // Images
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46],
    [0x57, 0x45, 0x42, 0x50],
  ], // RIFF...WEBP
  'image/bmp': [[0x42, 0x4d]], // BM
  'image/tiff': [
    [0x49, 0x49, 0x2a, 0x00], // II* (little-endian)
    [0x4d, 0x4d, 0x00, 0x2a], // MM* (big-endian)
  ],
  'image/svg+xml': [[0x3c, 0x3f, 0x78, 0x6d, 0x6c]], // <?xml

  // Videos
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32], // ...ftypmp42
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], // ...ftypisom
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32], // ...ftypmp42
  ],
  'video/webm': [[0x1a, 0x45, 0xdf, 0xa3]], // WebM
  'video/quicktime': [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74]], // ...ftypqt
  'video/x-msvideo': [[0x52, 0x49, 0x46, 0x46]], // RIFF (AVI)
  'video/x-matroska': [[0x1a, 0x45, 0xdf, 0xa3]], // Matroska (MKV)
}

/**
 * Validates file type by checking MIME type
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): {
  valid: boolean
  error?: string
} {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Validates file content by checking magic bytes (file signature)
 */
export async function validateFileContent(
  file: File,
  expectedMimeType: string
): Promise<{
  valid: boolean
  error?: string
  detectedType?: string
}> {
  const signatures = FILE_SIGNATURES[expectedMimeType]
  if (!signatures) {
    // If no signature defined, skip content validation
    return { valid: true }
  }

  try {
    // Read first 12 bytes (enough for most signatures)
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Check if any signature matches
    for (const signature of signatures) {
      let matches = true
      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        return { valid: true, detectedType: expectedMimeType }
      }
    }

    // Try to detect actual file type
    const detectedType = detectFileType(bytes)
    if (detectedType) {
      return {
        valid: false,
        error: `File content does not match declared type. Detected type: ${detectedType}, declared: ${expectedMimeType}`,
        detectedType,
      }
    }

    return {
      valid: false,
      error: `File content does not match declared type "${expectedMimeType}"`,
    }
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.FILE_READ_ERROR)
    return {
      valid: false,
      error: appError.message,
    }
  }
}

/**
 * Detects file type from magic bytes
 */
function detectFileType(bytes: Uint8Array): string | null {
  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      let matches = true
      for (let i = 0; i < signature.length && i < bytes.length; i++) {
        if (bytes[i] !== signature[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        return mimeType
      }
    }
  }
  return null
}

/**
 * Sanitizes a filename to prevent path traversal and other security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid characters
    .trim()

  // Limit filename length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    sanitized = sanitized.substring(0, 255 - ext.length) + ext
  }

  // Ensure filename is not empty
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = `file-${Date.now()}`
  }

  return sanitized
}

/**
 * Validates an image file (type, size, content)
 */
export async function validateImageFile(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // Validate file type
  const typeValidation = validateFileType(file, ACCEPTED_FILE_TYPES)
  if (!typeValidation.valid) {
    return {
      valid: false,
      error: typeValidation.error || 'Invalid image file type',
    }
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, 'image')
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  // Validate file content (magic bytes)
  const contentValidation = await validateFileContent(file, file.type)
  if (!contentValidation.valid) {
    return {
      valid: false,
      error: contentValidation.error || 'File content validation failed',
    }
  }

  return { valid: true }
}

/**
 * Validates a video file (type, size, content)
 */
export async function validateVideoFile(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // Validate file type
  const typeValidation = validateFileType(file, ACCEPTED_VIDEO_TYPES)
  if (!typeValidation.valid) {
    return {
      valid: false,
      error: typeValidation.error || 'Invalid video file type',
    }
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, 'video')
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  // Validate file content (magic bytes)
  // Note: Video file signatures can be more complex, so we're lenient here
  const contentValidation = await validateFileContent(file, file.type)
  if (!contentValidation.valid && contentValidation.detectedType) {
    // If we detected a different type, that's a problem
    return {
      valid: false,
      error: contentValidation.error || 'File content validation failed',
    }
  }

  return { valid: true }
}

/**
 * Validates a watermark image file
 */
export async function validateWatermarkFile(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // Only allow PNG and JPEG for watermarks
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'] as const
  const typeValidation = validateFileType(file, allowedTypes)
  if (!typeValidation.valid) {
    return {
      valid: false,
      error: 'Watermark must be a PNG or JPEG image',
    }
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, 'watermark')
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  // Validate file content
  const contentValidation = await validateFileContent(file, file.type)
  if (!contentValidation.valid) {
    return {
      valid: false,
      error: contentValidation.error || 'Invalid watermark image file',
    }
  }

  return { valid: true }
}

/**
 * Validates multiple files
 */
export async function validateFiles(
  files: File[],
  type: 'image' | 'video' | 'watermark'
): Promise<{
  valid: boolean
  errors: string[]
  validFiles: File[]
}> {
  const errors: string[] = []
  const validFiles: File[] = []

  for (const file of files) {
    let validation: { valid: boolean; error?: string }

    switch (type) {
      case 'image':
        validation = await validateImageFile(file)
        break
      case 'video':
        validation = await validateVideoFile(file)
        break
      case 'watermark':
        validation = await validateWatermarkFile(file)
        break
      default:
        validation = { valid: false, error: 'Unknown file type' }
    }

    if (validation.valid) {
      validFiles.push(file)
    } else {
      errors.push(`${file.name}: ${validation.error || 'Validation failed'}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  }
}
