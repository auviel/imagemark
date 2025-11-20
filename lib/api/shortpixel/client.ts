/**
 * ShortPixel API Client
 *
 * Provides a type-safe client for interacting with the ShortPixel API
 * with automatic retry logic and comprehensive error handling.
 */

import { getRequiredEnv } from '@/lib/env'
import type {
  ShortPixelClientConfig,
  ShortPixelOptions,
  OptimizeRequest,
  OptimizeResult,
  BulkOptimizeRequest,
  BulkOptimizeResult,
  RetryConfig,
} from './types'
import {
  ShortPixelError,
  ShortPixelErrorCodes,
  createShortPixelError,
  type ShortPixelErrorCode,
} from './errors'

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [429, 500, 502, 503, 504],
}

/**
 * Default client configuration
 */
const DEFAULT_CONFIG: Required<Omit<ShortPixelClientConfig, 'apiKey'>> = {
  baseUrl: 'https://api.shortpixel.com/v2',
  maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
  retryDelay: DEFAULT_RETRY_CONFIG.initialDelay,
  timeout: 30000, // 30 seconds
}

/**
 * ShortPixel API Client
 */
export class ShortPixelClient {
  private config: ShortPixelClientConfig & typeof DEFAULT_CONFIG
  private retryConfig: RetryConfig

  constructor(config?: Partial<ShortPixelClientConfig>) {
    // Get API key from environment or config
    const apiKey = config?.apiKey || getRequiredEnv('SHORTPIXEL_API_KEY', undefined)

    if (!apiKey) {
      throw new ShortPixelError(
        'ShortPixel API key is required',
        ShortPixelErrorCodes.API_KEY_MISSING,
        500
      )
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      apiKey,
    }

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxRetries: this.config.maxRetries,
      initialDelay: this.config.retryDelay,
    }
  }

  /**
   * Optimize a single image
   */
  async optimize(request: OptimizeRequest): Promise<OptimizeResult> {
    return this.executeWithRetry(async () => {
      const formData = new FormData()

      // Handle image input (File, Blob, or URL)
      if (request.image instanceof File || request.image instanceof Blob) {
        formData.append('file', request.image)
      } else if (typeof request.image === 'string') {
        formData.append('url', request.image)
      } else {
        throw new ShortPixelError(
          'Invalid image input. Must be File, Blob, or URL string.',
          ShortPixelErrorCodes.INVALID_FORMAT,
          400
        )
      }

      // Add options
      if (request.options) {
        this.addOptionsToFormData(formData, request.options)
      }

      const response = await this.makeRequest('/optimize', {
        method: 'POST',
        body: formData,
      })

      return this.parseOptimizeResponse(response)
    })
  }

  /**
   * Optimize multiple images (bulk)
   */
  async bulkOptimize(request: BulkOptimizeRequest): Promise<BulkOptimizeResult> {
    return this.executeWithRetry(async () => {
      const formData = new FormData()

      // Add all images
      request.images.forEach((image, index) => {
        if (image instanceof File || image instanceof Blob) {
          formData.append(`file_${index}`, image)
        } else if (typeof image === 'string') {
          formData.append(`url_${index}`, image)
        }
      })

      // Add options
      if (request.options) {
        this.addOptionsToFormData(formData, request.options)
      }

      const response = await this.makeRequest('/bulk-optimize', {
        method: 'POST',
        body: formData,
      })

      return this.parseBulkOptimizeResponse(response)
    })
  }

  /**
   * Convert image format
   */
  async convert(image: File | Blob | string, targetFormat: string): Promise<OptimizeResult> {
    return this.optimize({
      image,
      options: {
        convertTo: targetFormat as any,
      },
    })
  }

  /**
   * Resize image
   */
  async resize(
    image: File | Blob | string,
    width?: number,
    height?: number,
    mode: 'fit' | 'fill' | 'exact' = 'fit'
  ): Promise<OptimizeResult> {
    return this.optimize({
      image,
      options: {
        resize: {
          width,
          height,
          mode,
        },
      },
    })
  }

  /**
   * Remove EXIF metadata
   */
  async removeExif(image: File | Blob | string): Promise<OptimizeResult> {
    return this.optimize({
      image,
      options: {
        removeExif: true,
      },
    })
  }

  /**
   * Execute a request with automatic retry logic
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, attempt: number = 0): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      // Check if error is retryable
      const isRetryable = this.isRetryableError(error, attempt)

      if (isRetryable && attempt < this.retryConfig.maxRetries) {
        const delay = this.calculateRetryDelay(attempt)
        await this.sleep(delay)

        return this.executeWithRetry(operation, attempt + 1)
      }

      // Not retryable or max retries reached
      throw error
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown, attempt: number): boolean {
    if (error instanceof ShortPixelError) {
      // Retry on rate limit and network errors
      return (
        error.shortPixelCode === ShortPixelErrorCodes.RATE_LIMIT ||
        error.shortPixelCode === ShortPixelErrorCodes.NETWORK_ERROR ||
        error.shortPixelCode === ShortPixelErrorCodes.TIMEOUT
      )
    }

    // Retry on network errors
    if (error instanceof Error) {
      return (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT')
      )
    }

    return false
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay =
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt)

    return Math.min(delay, this.retryConfig.maxDelay)
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Make HTTP request to ShortPixel API
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'X-API-Key': this.config.apiKey,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        await this.handleErrorResponse(response)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ShortPixelError('Request timeout', ShortPixelErrorCodes.TIMEOUT, 408)
      }

      if (error instanceof ShortPixelError) {
        throw error
      }

      throw new ShortPixelError(
        error instanceof Error ? error.message : 'Network error',
        ShortPixelErrorCodes.NETWORK_ERROR,
        500,
        error
      )
    }
  }

  /**
   * Handle error responses from ShortPixel API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: unknown

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    // Map HTTP status codes to ShortPixel error codes
    let errorCode: ShortPixelErrorCode = ShortPixelErrorCodes.PROCESSING_FAILED

    switch (response.status) {
      case 401:
        errorCode = ShortPixelErrorCodes.API_KEY_INVALID
        break
      case 402:
        errorCode = ShortPixelErrorCodes.QUOTA_EXCEEDED
        break
      case 413:
        errorCode = ShortPixelErrorCodes.FILE_TOO_LARGE
        break
      case 415:
        errorCode = ShortPixelErrorCodes.INVALID_FORMAT
        break
      case 429:
        errorCode = ShortPixelErrorCodes.RATE_LIMIT
        break
      case 500:
      case 502:
      case 503:
      case 504:
        errorCode = ShortPixelErrorCodes.PROCESSING_FAILED
        break
    }

    throw createShortPixelError(errorData, response.statusText)
  }

  /**
   * Add options to FormData
   */
  private addOptionsToFormData(formData: FormData, options: ShortPixelOptions): void {
    if (options.compression) {
      formData.append('compression', options.compression)
    }

    if (options.convertTo) {
      formData.append('convertTo', options.convertTo)
    }

    if (options.resize) {
      if (options.resize.width) {
        formData.append('width', options.resize.width.toString())
      }
      if (options.resize.height) {
        formData.append('height', options.resize.height.toString())
      }
      if (options.resize.mode) {
        formData.append('resizeMode', options.resize.mode)
      }
    }

    if (options.removeExif) {
      formData.append('removeExif', '1')
    }

    if (options.keepExif) {
      formData.append('keepExif', '1')
    }

    if (options.webhook) {
      formData.append('webhook', options.webhook)
    }

    if (options.quality !== undefined) {
      formData.append('quality', options.quality.toString())
    }
  }

  /**
   * Parse optimization response
   */
  private async parseOptimizeResponse(response: Response): Promise<OptimizeResult> {
    const data = await response.json()

    // Handle different response formats from ShortPixel
    if (data.status === 'success' || data.status === 'pending') {
      return {
        status: data.status,
        originalSize: data.originalSize,
        optimizedSize: data.optimizedSize,
        compression: data.compression,
        optimizedImage: data.optimizedImage || data.url,
        originalImage: data.originalImage,
        metadata: {
          width: data.width,
          height: data.height,
          format: data.format,
          quality: data.quality,
        },
      }
    }

    if (data.status === 'error') {
      throw createShortPixelError(data, data.message || 'Processing failed')
    }

    throw createShortPixelError(data, 'Unexpected response format from ShortPixel API')
  }

  /**
   * Parse bulk optimization response
   */
  private async parseBulkOptimizeResponse(response: Response): Promise<BulkOptimizeResult> {
    const data = await response.json()

    if (data.status === 'success' || data.status === 'pending') {
      return {
        status: data.status,
        results: data.results || [],
        totalOriginalSize: data.totalOriginalSize,
        totalOptimizedSize: data.totalOptimizedSize,
        compression: data.compression,
        jobId: data.jobId,
      }
    }

    if (data.status === 'error') {
      throw createShortPixelError(data, data.message || 'Bulk processing failed')
    }

    throw createShortPixelError(data, 'Unexpected response format from ShortPixel API')
  }
}

/**
 * Create a ShortPixel client instance
 *
 * @param config - Optional client configuration
 * @returns ShortPixelClient instance
 *
 * @example
 * ```ts
 * const client = createShortPixelClient()
 * const result = await client.optimize({
 *   image: file,
 *   options: { compression: 'lossy' }
 * })
 * ```
 */
export function createShortPixelClient(config?: Partial<ShortPixelClientConfig>): ShortPixelClient {
  return new ShortPixelClient(config)
}

/**
 * Default ShortPixel client instance
 * Uses environment variables for configuration
 */
export const shortPixelClient = createShortPixelClient()
