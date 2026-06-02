import { successResponse } from '@/lib/api/response'

/**
 * Health check endpoint
 * Returns API status and version information
 */
export async function GET() {
  return successResponse(
    {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
    200,
    {
      timestamp: new Date().toISOString(),
      version: '1.0',
    }
  )
}
