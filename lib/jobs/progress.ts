// In-memory storage for demo purposes
// In production, use Redis or a database
const processingJobs = new Map<
  string,
  {
    status: 'processing' | 'completed' | 'error'
    progress: number
    outputUrl?: string
    error?: string
  }
>()

/**
 * Get job progress by ID
 */
export function getJobProgress(jobId: string) {
  return processingJobs.get(jobId)
}

/**
 * Update job progress
 * This will be replaced with Redis in Phase 3
 */
export function updateJobProgress(
  jobId: string,
  progress: number,
  status: 'processing' | 'completed' | 'error',
  outputUrl?: string,
  error?: string
) {
  processingJobs.set(jobId, {
    status,
    progress,
    outputUrl,
    error,
  })
}

/**
 * Delete job (cleanup)
 */
export function deleteJob(jobId: string) {
  processingJobs.delete(jobId)
}
