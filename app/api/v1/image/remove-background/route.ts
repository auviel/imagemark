import { NextRequest } from 'next/server'
import { removeBackground } from '@/lib/api/shortpixel/clients'
import { validateRequest, imageUploadSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response'

/**
 * POST /api/v1/image/remove-background
 * Remove background from an image using AI
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const compression = (formData.get('compression') as string | null) || 'lossless'

    if (!file) {
      return validationErrorResponse('Image file is required')
    }

    if (compression !== 'lossless' && compression !== 'lossy') {
      return validationErrorResponse('Invalid compression. Must be "lossless" or "lossy"')
    }

    const validation = await validateRequest(imageUploadSchema, {
      image: file,
    })

    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const result = await removeBackground(file, 'transparent', compression as 'lossless' | 'lossy')

    if (result.status === 'pending') {
      const { error } = handleError(
        new Error('Image is still being processed. Please try again in a few seconds.'),
        ErrorCodes.IMAGE_PROCESSING_ERROR
      )
      return errorResponse(error, 202, error.code) // 202 Accepted - processing
    }

    if (result.status === 'error' || !result.optimizedImage) {
      const { error } = handleError(
        new Error(result.error || 'Background removal failed'),
        ErrorCodes.IMAGE_PROCESSING_ERROR
      )
      return errorResponse(error, error.statusCode, error.code)
    }

    // If optimizedImage is a URL, fetch it and return as blob
    let imageBlob: Blob
    if (typeof result.optimizedImage === 'string') {
      const imageResponse = await fetch(result.optimizedImage)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch processed image')
      }
      imageBlob = await imageResponse.blob()
    } else {
      imageBlob = result.optimizedImage
    }

    const typedBlob = new Blob([imageBlob], { type: 'image/png' })

    const arrayBuffer = await typedBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return successResponse({
      processedImage: dataUrl,
      processedImageUrl:
        typeof result.optimizedImage === 'string' ? result.optimizedImage : undefined,
      originalSize: result.originalSize,
      processedSize: result.optimizedSize,
      compression: result.compression,
      metadata: result.metadata,
    })
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.IMAGE_PROCESSING_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
