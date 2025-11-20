import { NextRequest } from 'next/server'
import { shortPixelClient } from '@/lib/api/shortpixel'
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

    if (!file) {
      return validationErrorResponse('Image file is required')
    }

    // Validate file
    const validation = await validateRequest(imageUploadSchema, {
      image: file,
    })

    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    // Process background removal using ShortPixel
    const result = await shortPixelClient.removeBackground(file)

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

    // Convert blob to base64 for response
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${imageBlob.type};base64,${base64}`

    return successResponse({
      processedImage: dataUrl,
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
