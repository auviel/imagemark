/**
 * Error handling utilities and custom error classes
 */

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * Returns a user-friendly error message
   */
  getUserMessage(): string {
    return this.userMessage || this.message
  }

  /**
   * Converts error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      userMessage: this.userMessage,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    }
  }
}

/**
 * Error codes for different error types
 */
export const ErrorCodes = {
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_PROCESSING_ERROR: 'FILE_PROCESSING_ERROR',

  // Video errors
  VIDEO_LOAD_ERROR: 'VIDEO_LOAD_ERROR',
  VIDEO_PROCESSING_ERROR: 'VIDEO_PROCESSING_ERROR',
  VIDEO_ENCODING_ERROR: 'VIDEO_ENCODING_ERROR',

  // Image errors
  IMAGE_LOAD_ERROR: 'IMAGE_LOAD_ERROR',
  IMAGE_PROCESSING_ERROR: 'IMAGE_PROCESSING_ERROR',
  CANVAS_ERROR: 'CANVAS_ERROR',

  // Watermark errors
  WATERMARK_LOAD_ERROR: 'WATERMARK_LOAD_ERROR',
  WATERMARK_APPLY_ERROR: 'WATERMARK_APPLY_ERROR',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Memory errors
  MEMORY_ERROR: 'MEMORY_ERROR',
  OUT_OF_MEMORY: 'OUT_OF_MEMORY',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Creates a user-friendly error message based on error code
 */
export function getUserFriendlyMessage(code: ErrorCode, details?: string): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCodes.FILE_TOO_LARGE]: 'The file is too large. Please choose a smaller file.',
    [ErrorCodes.INVALID_FILE_TYPE]:
      'The file type is not supported. Please choose a different file.',
    [ErrorCodes.FILE_READ_ERROR]: 'Unable to read the file. Please try again.',
    [ErrorCodes.FILE_PROCESSING_ERROR]:
      'An error occurred while processing the file. Please try again.',

    [ErrorCodes.VIDEO_LOAD_ERROR]: 'Unable to load the video. Please check the file and try again.',
    [ErrorCodes.VIDEO_PROCESSING_ERROR]:
      'An error occurred while processing the video. Please try again.',
    [ErrorCodes.VIDEO_ENCODING_ERROR]: 'Unable to encode the video. Please try a different format.',

    [ErrorCodes.IMAGE_LOAD_ERROR]: 'Unable to load the image. Please check the file and try again.',
    [ErrorCodes.IMAGE_PROCESSING_ERROR]:
      'An error occurred while processing the image. Please try again.',
    [ErrorCodes.CANVAS_ERROR]: 'An error occurred while rendering. Please try again.',

    [ErrorCodes.WATERMARK_LOAD_ERROR]:
      'Unable to load the watermark image. Please check the file and try again.',
    [ErrorCodes.WATERMARK_APPLY_ERROR]:
      'An error occurred while applying the watermark. Please try again.',

    [ErrorCodes.NETWORK_ERROR]:
      'A network error occurred. Please check your connection and try again.',
    [ErrorCodes.API_ERROR]: 'An API error occurred. Please try again later.',
    [ErrorCodes.TIMEOUT_ERROR]: 'The operation timed out. Please try again.',

    [ErrorCodes.MEMORY_ERROR]: 'A memory error occurred. Please try with a smaller file.',
    [ErrorCodes.OUT_OF_MEMORY]:
      'Not enough memory to process this file. Please try with a smaller file.',

    [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    [ErrorCodes.VALIDATION_ERROR]: details || 'Validation failed. Please check your input.',
    [ErrorCodes.INTERNAL_ERROR]: 'An internal server error occurred. Please try again later.',
    [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to access this resource.',
    [ErrorCodes.FORBIDDEN]: 'You do not have permission to access this resource.',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later.',
  }

  return messages[code] || messages[ErrorCodes.UNKNOWN_ERROR]
}

/**
 * Creates an AppError from an unknown error
 */
export function createAppError(
  error: unknown,
  code: ErrorCode = ErrorCodes.UNKNOWN_ERROR,
  userMessage?: string
): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      code,
      500,
      userMessage || getUserFriendlyMessage(code),
      error
    )
  }

  if (typeof error === 'string') {
    return new AppError(error, code, 500, userMessage || getUserFriendlyMessage(code))
  }

  return new AppError(
    'An unknown error occurred',
    code,
    500,
    userMessage || getUserFriendlyMessage(code)
  )
}

/**
 * Logs an error (to be replaced with proper error tracking service)
 */
export function logError(error: Error | AppError, context?: Record<string, unknown>): void {
  // Error logging will be implemented with error tracking service
}

/**
 * Handles an error and returns a user-friendly message
 */
export function handleError(
  error: unknown,
  code?: ErrorCode
): {
  message: string
  error: AppError
} {
  const appError = createAppError(error, code)
  logError(appError)
  return {
    message: appError.getUserMessage(),
    error: appError,
  }
}
