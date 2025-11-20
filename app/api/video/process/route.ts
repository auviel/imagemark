import { NextRequest } from 'next/server'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { validateRequest, videoProcessSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/api/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = await validateRequest(videoProcessSchema, body)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const { filename, watermarkSettings, processingOptions } = validation.data

    const inputPath = join(process.cwd(), 'uploads', filename)

    if (!existsSync(inputPath)) {
      return notFoundResponse('Video file')
    }

    const outputFilename = `processed-${Date.now()}-${filename}`
    const outputPath = join(process.cwd(), 'uploads', outputFilename)

    const inputBuffer = await readFile(inputPath)
    await writeFile(outputPath, inputBuffer)

    return successResponse({
      outputFilename,
      downloadUrl: `/api/video/download/${outputFilename}`,
      processingTime: 2000,
    })
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.VIDEO_PROCESSING_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
