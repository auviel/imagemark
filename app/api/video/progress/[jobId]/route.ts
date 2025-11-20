import { NextRequest, NextResponse } from 'next/server'
import { getJobProgress } from '@/lib/jobs/progress'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    const job = getJobProgress(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Progress check error:', error)
    return NextResponse.json({ error: 'Failed to check progress' }, { status: 500 })
  }
}
