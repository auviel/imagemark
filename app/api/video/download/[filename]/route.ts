import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { validatePathParams, videoDownloadSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Validate path parameters
    const validation = validatePathParams(videoDownloadSchema, { filename })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const sanitizedFilename = validation.data.filename

    const filepath = join(process.cwd(), 'uploads', sanitizedFilename)

    if (!existsSync(filepath)) {
      const { error } = handleError(new Error('File not found'), ErrorCodes.FILE_READ_ERROR)
      return NextResponse.json({ error: error.getUserMessage() }, { status: 404 })
    }

    const fileBuffer = await readFile(filepath)

    // Set appropriate headers for video download
    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Disposition', `attachment; filename="${sanitizedFilename}"`)
    headers.set('Content-Length', fileBuffer.length.toString())

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    })
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.FILE_READ_ERROR)
    return NextResponse.json({ error: appError.getUserMessage() }, { status: appError.statusCode })
  }
}
