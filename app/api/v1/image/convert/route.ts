import { NextRequest } from 'next/server'
import { convertImage } from '@/lib/api/shortpixel/clients'
import { validateRequest, imageUploadSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response'
import { z } from 'zod'

/**
 * Format conversion request schema
 */
const convertSchema = z.object({
  format: z.enum(['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif']),
})

/**
 * POST /api/v1/image/convert
 * Convert image to a different format
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const format = formData.get('format') as string | null

    if (!file) {
      return validationErrorResponse('Image file is required')
    }

    if (!format) {
      return validationErrorResponse('Target format is required')
    }

    // Validate format
    const formatValidation = convertSchema.safeParse({ format })
    if (!formatValidation.success) {
      return validationErrorResponse(
        'Invalid format. Supported formats: jpeg, jpg, png, webp, avif, gif'
      )
    }

    // Validate file
    const validation = await validateRequest(imageUploadSchema, {
      image: file,
    })

    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    // Normalize format (jpg -> jpeg for ShortPixel)
    const normalizedFormat = format === 'jpg' ? 'jpeg' : format

    // Convert image format using ShortPixel (lazy-loaded client)
    const result = await convertImage(file, normalizedFormat)

    // Handle pending status (image is still processing)
    if (result.status === 'pending') {
      const { error } = handleError(
        new Error('Image is still being processed. Please try again in a few seconds.'),
        ErrorCodes.IMAGE_PROCESSING_ERROR
      )
      return errorResponse(error, 202, error.code) // 202 Accepted - processing
    }

    // Handle error status
    if (result.status === 'error' || !result.optimizedImage) {
      const { error } = handleError(
        new Error(result.error || 'Format conversion failed'),
        ErrorCodes.IMAGE_PROCESSING_ERROR
      )
      return errorResponse(error, error.statusCode, error.code)
    }

    // If optimizedImage is a URL, fetch it and return as blob
    let imageBlob: Blob
    if (typeof result.optimizedImage === 'string') {
      const imageResponse = await fetch(result.optimizedImage)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch converted image')
      }
      imageBlob = await imageResponse.blob()
    } else {
      imageBlob = result.optimizedImage
    }

    // Ensure correct MIME type based on target format
    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
    }

    const correctMimeType = mimeTypes[normalizedFormat] || imageBlob.type || 'image/jpeg'

    // Create a new blob with the correct MIME type
    // This ensures proper file type recognition by macOS Finder
    const typedBlob = new Blob([imageBlob], { type: correctMimeType })

    // Convert blob to base64 for response
    const arrayBuffer = await typedBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${correctMimeType};base64,${base64}`

    return successResponse({
      convertedImage: dataUrl,
      originalSize: result.originalSize,
      convertedSize: result.optimizedSize,
      compression: result.compression,
      format: normalizedFormat,
      metadata: result.metadata,
    })
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.IMAGE_PROCESSING_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
