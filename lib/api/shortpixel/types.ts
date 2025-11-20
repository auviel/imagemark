/**
 * ShortPixel API Types
 *
 * Type definitions for ShortPixel API requests and responses
 */

/**
 * Compression modes supported by ShortPixel
 */
export type CompressionMode = 'lossy' | 'lossless' | 'glossy'

/**
 * Image formats supported by ShortPixel
 */
export type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'gif'

/**
 * Resize modes
 */
export type ResizeMode = 'fit' | 'fill' | 'exact'

/**
 * ShortPixel API request options
 */
export interface ShortPixelOptions {
  /** Compression mode: lossy, lossless, or glossy */
  compression?: CompressionMode
  /** Target image format for conversion */
  convertTo?: ImageFormat
  /** Resize options */
  resize?: {
    width?: number
    height?: number
    mode?: ResizeMode
  }
  /** Remove EXIF metadata */
  removeExif?: boolean
  /** Keep EXIF metadata */
  keepExif?: boolean
  /** Webhook URL for async processing */
  webhook?: string
  /** Custom quality level (1-100) */
  quality?: number
}

/**
 * ShortPixel optimization request
 */
export interface OptimizeRequest {
  /** Image file or URL */
  image: File | Blob | string
  /** Optimization options */
  options?: ShortPixelOptions
}

/**
 * ShortPixel bulk optimization request
 */
export interface BulkOptimizeRequest {
  /** Array of image files or URLs */
  images: (File | Blob | string)[]
  /** Optimization options (applied to all images) */
  options?: ShortPixelOptions
}

/**
 * ShortPixel API response status
 */
export type ShortPixelStatus = 'success' | 'pending' | 'error' | 'processing'

/**
 * ShortPixel optimization result
 */
export interface OptimizeResult {
  /** Status of the optimization */
  status: ShortPixelStatus
  /** Original file size in bytes */
  originalSize?: number
  /** Optimized file size in bytes */
  optimizedSize?: number
  /** Compression percentage */
  compression?: number
  /** Optimized image URL or data */
  optimizedImage?: string | Blob
  /** Original image URL */
  originalImage?: string
  /** Error message if status is 'error' */
  error?: string
  /** Additional metadata */
  metadata?: {
    width?: number
    height?: number
    format?: ImageFormat
    quality?: number
  }
}

/**
 * ShortPixel bulk optimization result
 */
export interface BulkOptimizeResult {
  /** Overall status */
  status: ShortPixelStatus
  /** Individual image results */
  results: OptimizeResult[]
  /** Total original size */
  totalOriginalSize?: number
  /** Total optimized size */
  totalOptimizedSize?: number
  /** Overall compression percentage */
  compression?: number
  /** Job ID for async processing */
  jobId?: string
  /** Error message if status is 'error' */
  error?: string
}

/**
 * ShortPixel API error response
 */
export interface ShortPixelErrorResponse {
  status: 'error'
  message: string
  code?: string
  details?: unknown
}

/**
 * ShortPixel API client configuration
 */
export interface ShortPixelClientConfig {
  /** ShortPixel API key */
  apiKey: string
  /** API base URL (defaults to production) */
  baseUrl?: string
  /** Maximum number of retry attempts */
  maxRetries?: number
  /** Retry delay in milliseconds */
  retryDelay?: number
  /** Request timeout in milliseconds */
  timeout?: number
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number
  /** Initial retry delay in milliseconds */
  initialDelay: number
  /** Maximum retry delay in milliseconds */
  maxDelay: number
  /** Exponential backoff multiplier */
  backoffMultiplier: number
  /** Retryable HTTP status codes */
  retryableStatusCodes: number[]
}
