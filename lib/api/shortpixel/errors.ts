/**
 * ShortPixel API-specific errors
 */

import { AppError, ErrorCodes } from '@/lib/error-handler'

/**
 * ShortPixel-specific error codes
 */
export const ShortPixelErrorCodes = {
  API_KEY_MISSING: 'SHORTPIXEL_API_KEY_MISSING',
  API_KEY_INVALID: 'SHORTPIXEL_API_KEY_INVALID',
  QUOTA_EXCEEDED: 'SHORTPIXEL_QUOTA_EXCEEDED',
  FILE_TOO_LARGE: 'SHORTPIXEL_FILE_TOO_LARGE',
  INVALID_FORMAT: 'SHORTPIXEL_INVALID_FORMAT',
  PROCESSING_FAILED: 'SHORTPIXEL_PROCESSING_FAILED',
  NETWORK_ERROR: 'SHORTPIXEL_NETWORK_ERROR',
  TIMEOUT: 'SHORTPIXEL_TIMEOUT',
  RATE_LIMIT: 'SHORTPIXEL_RATE_LIMIT',
} as const

export type ShortPixelErrorCode = (typeof ShortPixelErrorCodes)[keyof typeof ShortPixelErrorCodes]

/**
 * Custom error class for ShortPixel API errors
 */
export class ShortPixelError extends AppError {
  constructor(
    message: string,
    public shortPixelCode: ShortPixelErrorCode,
    statusCode: number = 500,
    public originalResponse?: unknown
  ) {
    super(message, shortPixelCode, statusCode, getUserFriendlyMessage(shortPixelCode))
    this.name = 'ShortPixelError'
  }
}

/**
 * Creates a user-friendly error message based on ShortPixel error code
 */
function getUserFriendlyMessage(code: ShortPixelErrorCode): string {
  const messages: Record<ShortPixelErrorCode, string> = {
    [ShortPixelErrorCodes.API_KEY_MISSING]:
      'ShortPixel API key is not configured. Please configure your API key.',
    [ShortPixelErrorCodes.API_KEY_INVALID]:
      'Invalid ShortPixel API key. Please check your API key configuration.',
    [ShortPixelErrorCodes.QUOTA_EXCEEDED]:
      'ShortPixel API quota exceeded. Please upgrade your plan or wait for quota reset.',
    [ShortPixelErrorCodes.FILE_TOO_LARGE]:
      'File is too large for ShortPixel processing. Please use a smaller file.',
    [ShortPixelErrorCodes.INVALID_FORMAT]:
      'File format is not supported by ShortPixel. Please use a supported image format.',
    [ShortPixelErrorCodes.PROCESSING_FAILED]:
      'ShortPixel processing failed. Please try again or contact support.',
    [ShortPixelErrorCodes.NETWORK_ERROR]:
      'Network error while communicating with ShortPixel API. Please check your connection.',
    [ShortPixelErrorCodes.TIMEOUT]: 'Request to ShortPixel API timed out. Please try again.',
    [ShortPixelErrorCodes.RATE_LIMIT]:
      'Rate limit exceeded for ShortPixel API. Please try again later.',
  }

  return messages[code] || 'An error occurred with ShortPixel API.'
}

/**
 * Creates a ShortPixelError from an API response
 */
export function createShortPixelError(
  response: unknown,
  defaultMessage: string = 'ShortPixel API error'
): ShortPixelError {
  if (typeof response === 'object' && response !== null && 'message' in response) {
    const errorResponse = response as { message: string; code?: string }
    const code = errorResponse.code as ShortPixelErrorCode | undefined

    if (code && Object.values(ShortPixelErrorCodes).includes(code)) {
      return new ShortPixelError(errorResponse.message || defaultMessage, code, 400, response)
    }
  }

  return new ShortPixelError(defaultMessage, ShortPixelErrorCodes.PROCESSING_FAILED, 500, response)
}
