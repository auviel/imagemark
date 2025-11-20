import { NextRequest, NextResponse } from 'next/server'
import { getJobProgress } from '@/lib/jobs/progress'
import { validatePathParams, videoProgressSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    // Validate path parameters
    const validation = validatePathParams(videoProgressSchema, { jobId })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const job = getJobProgress(validation.data.jobId)

    if (!job) {
      const { error } = handleError(new Error('Job not found'), ErrorCodes.VALIDATION_ERROR)
      return NextResponse.json({ error: error.getUserMessage() }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.API_ERROR)
    return NextResponse.json({ error: appError.getUserMessage() }, { status: appError.statusCode })
  }
}
