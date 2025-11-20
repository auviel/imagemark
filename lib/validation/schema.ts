/**
 * Zod validation schemas for API routes
 */

import { z } from 'zod'
import { ACCEPTED_FILE_TYPES, ACCEPTED_VIDEO_TYPES } from '@/constants/watermark'
import { FILE_SIZE_LIMITS } from '@/utils/memory'

/**
 * Watermark settings schema
 */
export const watermarkSettingsSchema = z.object({
  type: z.enum(['text', 'image']),
  text: z.string().optional(),
  font: z.string().optional(),
  fontSize: z.number().min(5).max(30).optional(),
  fontMode: z.enum(['light', 'dark', 'custom']).optional(),
  customColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  opacity: z.number().min(1).max(100).optional(),
  rotation: z.number().min(-180).max(180).optional(),
  positionX: z.number().min(0).max(100).optional(),
  positionY: z.number().min(0).max(100).optional(),
  positionPreset: z.string().optional(),
  imageSize: z.number().min(5).max(50).optional(),
})

export type WatermarkSettingsInput = z.infer<typeof watermarkSettingsSchema>

/**
 * Video processing options schema
 */
export const videoProcessingOptionsSchema = z.object({
  quality: z.enum(['low', 'medium', 'high']).optional(),
  format: z.enum(['mp4', 'webm']).optional(),
  resolution: z
    .object({
      width: z.number().positive().int(),
      height: z.number().positive().int(),
    })
    .optional(),
})

export type VideoProcessingOptionsInput = z.infer<typeof videoProcessingOptionsSchema>

/**
 * Video upload request schema
 */
export const videoUploadSchema = z.object({
  video: z
    .instanceof(File, { message: 'Video file is required' })
    .refine((file) => ACCEPTED_VIDEO_TYPES.includes(file.type as any), {
      message: `Invalid video type. Allowed types: ${ACCEPTED_VIDEO_TYPES.join(', ')}`,
    })
    .refine((file) => file.size <= FILE_SIZE_LIMITS.VIDEO, {
      message: `File size exceeds maximum allowed size of ${FILE_SIZE_LIMITS.VIDEO / (1024 * 1024)}MB`,
    }),
})

/**
 * Video process request schema
 */
export const videoProcessSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename format'),
  watermarkSettings: watermarkSettingsSchema.optional(),
  processingOptions: videoProcessingOptionsSchema.optional(),
})

/**
 * Video progress request schema
 */
export const videoProgressSchema = z.object({
  jobId: z
    .string()
    .min(1, 'Job ID is required')
    .max(100, 'Job ID too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid job ID format'),
})

/**
 * Video download request schema (path parameter)
 */
export const videoDownloadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename format'),
})

/**
 * Image upload request schema
 */
export const imageUploadSchema = z.object({
  image: z
    .instanceof(File, { message: 'Image file is required' })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type as any), {
      message: `Invalid image type. Allowed types: ${ACCEPTED_FILE_TYPES.join(', ')}`,
    })
    .refine((file) => file.size <= FILE_SIZE_LIMITS.IMAGE, {
      message: `File size exceeds maximum allowed size of ${FILE_SIZE_LIMITS.IMAGE / (1024 * 1024)}MB`,
    }),
})

/**
 * Watermark image upload schema
 */
export const watermarkImageUploadSchema = z.object({
  watermark: z
    .instanceof(File, { message: 'Watermark image is required' })
    .refine((file) => ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type), {
      message: 'Watermark must be a PNG or JPEG image',
    })
    .refine((file) => file.size <= FILE_SIZE_LIMITS.WATERMARK_IMAGE, {
      message: `Watermark file size exceeds maximum allowed size of ${FILE_SIZE_LIMITS.WATERMARK_IMAGE / (1024 * 1024)}MB`,
    }),
})

/**
 * Helper function to validate and parse request body
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string; details?: z.ZodError }> {
  try {
    const parsed = await schema.parseAsync(data)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        error: errorMessage,
        details: error,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    }
  }
}

/**
 * Helper function to validate path parameters
 */
export function validatePathParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown
): { success: true; data: T } | { success: false; error: string; details?: z.ZodError } {
  try {
    const parsed = schema.parse(params)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        success: false,
        error: errorMessage,
        details: error,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    }
  }
}

/**
 * Sanitizes a filename to prevent path traversal
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
