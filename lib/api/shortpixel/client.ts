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
  ShortPixelStatus,
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

      formData.append('key', this.config.apiKey)

      if (request.image instanceof File || request.image instanceof Blob) {
        const fileName = request.image instanceof File ? request.image.name : 'image.jpg'
        formData.append('file1', request.image)
        formData.append('file_paths', JSON.stringify({ file1: fileName }))
      } else if (typeof request.image === 'string') {
        formData.append('urllist', JSON.stringify([request.image]))
      } else {
        throw new ShortPixelError(
          'Invalid image input. Must be File, Blob, or URL string.',
          ShortPixelErrorCodes.INVALID_FORMAT,
          400
        )
      }

      if (request.options) {
        this.addOptionsToFormData(formData, request.options)
      }

      formData.append('wait', '30')

      const response = await this.makeRequest('/post-reducer.php', {
        method: 'POST',
        body: formData,
      })

      return this.parseOptimizeResponse(response)
    })
  }

  /**
   * Optimize multiple images (bulk)
   * Uses ShortPixel's Reducer API with urllist parameter
   */
  async bulkOptimize(request: BulkOptimizeRequest): Promise<BulkOptimizeResult> {
    return this.executeWithRetry(async () => {
      const formData = new FormData()

      formData.append('key', this.config.apiKey)

      const urls: string[] = []
      const files: (File | Blob)[] = []

      request.images.forEach((image) => {
        if (image instanceof File || image instanceof Blob) {
          files.push(image)
        } else if (typeof image === 'string') {
          urls.push(image)
        }
      })

      if (urls.length > 0) {
        formData.append('urllist', JSON.stringify(urls))
      }

      files.forEach((file, index) => {
        formData.append(`file${index > 0 ? `_${index}` : ''}`, file)
      })

      if (request.options) {
        this.addOptionsToFormData(formData, request.options)
      }

      const response = await this.makeRequest('/post-reducer.php', {
        method: 'POST',
        body: formData,
      })

      return this.parseBulkOptimizeResponse(response)
    })
  }

  /**
   * Convert image format
   */
  async convert(
    image: File | Blob | string,
    targetFormat: string,
    compression: 'lossless' | 'lossy' = 'lossless'
  ): Promise<OptimizeResult> {
    return this.executeWithRetry(async () => {
      const formData = new FormData()

      formData.append('key', this.config.apiKey)

      if (image instanceof File || image instanceof Blob) {
        const fileName = image instanceof File ? image.name : 'image.jpg'
        formData.append('file1', image)
        formData.append('file_paths', JSON.stringify({ file1: fileName }))
      } else if (typeof image === 'string') {
        formData.append('urllist', JSON.stringify([image]))
      } else {
        throw new ShortPixelError(
          'Invalid image input. Must be File, Blob, or URL string.',
          ShortPixelErrorCodes.INVALID_FORMAT,
          400
        )
      }

      formData.append('convertto', `+${targetFormat}`)
      formData.append('lossy', compression === 'lossy' ? '1' : '0')
      formData.append('wait', '30')

      const response = await this.makeRequest('/post-reducer.php', {
        method: 'POST',
        body: formData,
      })

      return this.parseOptimizeResponse(response, { targetFormat, compression })
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
   * Remove background from image using AI
   * Uses ShortPixel's Reducer API with bg_remove parameter
   *
   * @param image - Image file, blob, or URL
   * @param backgroundColor - Optional: 'transparent' (default), color code '#rrggbbxx', or image URL
   * @returns Optimized image with background removed
   *
   * @see https://shortpixel.com/api-docs - ShortPixel API Documentation
   *
   * @note IMPORTANT: Background removal works best with PNG files for transparent backgrounds.
   *       JPG files will have white background (JPG doesn't support transparency).
   *       TODO: Convert JPG to PNG first before background removal for better results.
   *       This should be implemented after the format conversion feature is complete.
   *       See: https://github.com/your-repo/issues/background-removal-jpg-support
   */
  async removeBackground(
    image: File | Blob | string,
    backgroundColor: 'transparent' | string = 'transparent',
    compression: 'lossless' | 'lossy' = 'lossless'
  ): Promise<OptimizeResult> {
    return this.executeWithRetry(async () => {
      const formData = new FormData()

      const apiKey = this.config.apiKey.trim()
      formData.append('key', apiKey)

      if (image instanceof File || image instanceof Blob) {
        const fileName = image instanceof File ? image.name : 'image.jpg'
        formData.append('file1', image)
        formData.append('file_paths', JSON.stringify({ file1: fileName }))
        if (process.env.NODE_ENV === 'development') {
          console.log('[ShortPixel] Uploading file:', {
            name: fileName,
            type: image.type,
            size: image.size,
          })
        }
      } else if (typeof image === 'string') {
        formData.append('urllist', JSON.stringify([image]))
        if (process.env.NODE_ENV === 'development') {
          console.log('[ShortPixel] Processing URL:', image)
        }
      } else {
        throw new ShortPixelError(
          'Invalid image input. Must be File, Blob, or URL string.',
          ShortPixelErrorCodes.INVALID_FORMAT,
          400
        )
      }

      if (backgroundColor === 'transparent') {
        formData.append('bg_remove', '1')
      } else if (backgroundColor.startsWith('#')) {
        formData.append('bg_remove', backgroundColor)
      } else if (backgroundColor.startsWith('http://') || backgroundColor.startsWith('https://')) {
        formData.append('bg_remove', backgroundColor)
      } else {
        formData.append('bg_remove', '1')
      }

      // Set compression: '0' = lossless, '1' = lossy
      formData.append('lossy', compression === 'lossy' ? '1' : '0')

      formData.append('wait', '30')
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[ShortPixel] API Key:',
          apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5)
        )
        const entries: Array<[string, string]> = []
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'object' && value !== null && 'size' in value && 'type' in value) {
            // It's a File or Blob
            const file = value as File | Blob
            entries.push([key, `File(${file.size} bytes, ${file.type})`])
          } else {
            // It's a string
            const strValue = String(value)
            entries.push([key, strValue.length > 50 ? strValue.substring(0, 50) + '...' : strValue])
          }
        }
        console.log('[ShortPixel] FormData entries:', entries)
        console.log('[ShortPixel] Request parameters:', {
          endpoint: '/post-reducer.php',
          bg_remove: backgroundColor === 'transparent' ? '1' : backgroundColor,
          hasFile: image instanceof File || image instanceof Blob,
          hasUrl: typeof image === 'string',
        })
      }

      const response = await this.makeRequest('/post-reducer.php', {
        method: 'POST',
        body: formData,
      })

      return this.parseOptimizeResponse(response, {
        isBackgroundRemoval: true,
        compression,
      })
    })
  }

  /**
   * Execute a request with automatic retry logic
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, attempt: number = 0): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const isRetryable = this.isRetryableError(error, attempt)

      if (isRetryable && attempt < this.retryConfig.maxRetries) {
        const delay = this.calculateRetryDelay(attempt)
        await this.sleep(delay)

        return this.executeWithRetry(operation, attempt + 1)
      }

      throw error
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown, attempt: number): boolean {
    if (error instanceof ShortPixelError) {
      return (
        error.shortPixelCode === ShortPixelErrorCodes.RATE_LIMIT ||
        error.shortPixelCode === ShortPixelErrorCodes.NETWORK_ERROR ||
        error.shortPixelCode === ShortPixelErrorCodes.TIMEOUT
      )
    }

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
   * Note: ShortPixel API uses 'key' in form data, not header authentication
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
      // Log error response in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[ShortPixel] Error response:', JSON.stringify(errorData, null, 2))
      }
    } catch {
      const text = await response.text()
      errorData = { message: response.statusText, body: text }
      if (process.env.NODE_ENV === 'development') {
        console.error('[ShortPixel] Error response (non-JSON):', text)
      }
    }

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
   * Maps ShortPixelOptions to ShortPixel API parameters
   *
   * @see https://shortpixel.com/api-docs - ShortPixel API Documentation
   */
  private addOptionsToFormData(formData: FormData, options: ShortPixelOptions): void {
    if (options.compression) {
      const lossyValue =
        options.compression === 'lossy' ? '1' : options.compression === 'glossy' ? '2' : '0'
      formData.append('lossy', lossyValue)
    } else {
      formData.append('lossy', '1')
    }

    if (options.convertTo) {
      formData.append('convertto', `+${options.convertTo}`)
    }

    if (options.resize) {
      if (options.resize.width) {
        formData.append('resize_width', options.resize.width.toString())
      }
      if (options.resize.height) {
        formData.append('resize_height', options.resize.height.toString())
      }
      if (options.resize.mode) {
        const resizeValue =
          options.resize.mode === 'fit' ? '1' : options.resize.mode === 'fill' ? '2' : '3'
        formData.append('resize', resizeValue)
      }
    }

    if (options.removeExif) {
      formData.append('remove_exif', '1')
    }

    if (options.keepExif) {
      formData.append('keep_exif', '1')
    }

    if (options.webhook) {
      formData.append('webhook', options.webhook)
    }

    if (options.quality !== undefined) {
      formData.append('quality', options.quality.toString())
    }
  }

  /**
   * Parse optimization response from ShortPixel API
   * Handles ShortPixel's response format
   *
   * @param response - HTTP response from ShortPixel API
   * @param context - Optional context (e.g., target format for conversion)
   * @see https://shortpixel.com/api-docs - ShortPixel API Documentation
   */
  private async parseOptimizeResponse(
    response: Response,
    context?: {
      targetFormat?: string
      isBackgroundRemoval?: boolean
      compression?: 'lossless' | 'lossy'
    }
  ): Promise<OptimizeResult> {
    const data = await response.json()

    if (process.env.NODE_ENV === 'development') {
      console.log('[ShortPixel] Response:', JSON.stringify(data, null, 2))
    }

    const result = Array.isArray(data) ? data[0] : data

    if (result?.Status && typeof result.Status === 'object' && result.Status.Code !== undefined) {
      const statusCode =
        typeof result.Status.Code === 'string'
          ? parseInt(result.Status.Code, 10)
          : result.Status.Code
      const statusMessage = result.Status.Message || 'Processing failed'

      if (statusCode < 0) {
        let errorCode: ShortPixelErrorCode
        if (statusCode === -401) {
          errorCode = ShortPixelErrorCodes.API_KEY_INVALID
        } else if (statusCode === -402) {
          errorCode = ShortPixelErrorCodes.QUOTA_EXCEEDED
        } else if (statusCode === -413) {
          errorCode = ShortPixelErrorCodes.FILE_TOO_LARGE
        } else if (statusCode === -415) {
          errorCode = ShortPixelErrorCodes.INVALID_FORMAT
        } else {
          errorCode = ShortPixelErrorCodes.PROCESSING_FAILED
        }

        throw new ShortPixelError(statusMessage, errorCode, 400, result)
      }

      if (statusCode === 1) {
        return {
          status: 'pending',
          originalSize: result.OriginalSize,
          optimizedSize: undefined,
          compression: undefined,
          optimizedImage: undefined,
          originalImage: result.OriginalURL,
          metadata: undefined,
        }
      }

      if (statusCode === 2) {
        const bgRemovedUrl =
          (result as any).BgRemovedURL ||
          (result as any).BgRemovedLosslessURL ||
          (result as any).BgRemovedLossyURL

        const isValidUrl = (url: any): url is string => {
          return typeof url === 'string' && url !== 'NA' && url.trim().length > 0 && url !== 'null'
        }

        let optimizedImageUrl: string | undefined

        if (context?.targetFormat) {
          const targetFormat = context.targetFormat.toLowerCase()
          const preferLossless = context?.compression !== 'lossy'

          if (targetFormat === 'webp' || targetFormat === '+webp') {
            if (preferLossless) {
              optimizedImageUrl = isValidUrl(result.WebPLosslessURL)
                ? result.WebPLosslessURL
                : isValidUrl(result.WebPLossyURL)
                  ? result.WebPLossyURL
                  : undefined
            } else {
              optimizedImageUrl = isValidUrl(result.WebPLossyURL)
                ? result.WebPLossyURL
                : isValidUrl(result.WebPLosslessURL)
                  ? result.WebPLosslessURL
                  : undefined
            }
          } else if (targetFormat === 'avif' || targetFormat === '+avif') {
            if (preferLossless) {
              optimizedImageUrl = isValidUrl(result.AVIFLosslessURL)
                ? result.AVIFLosslessURL
                : isValidUrl(result.AVIFLossyURL)
                  ? result.AVIFLossyURL
                  : undefined
            } else {
              optimizedImageUrl = isValidUrl(result.AVIFLossyURL)
                ? result.AVIFLossyURL
                : isValidUrl(result.AVIFLosslessURL)
                  ? result.AVIFLosslessURL
                  : undefined
            }
          } else if (
            targetFormat === 'jpeg' ||
            targetFormat === 'jpg' ||
            targetFormat === '+jpeg' ||
            targetFormat === '+jpg'
          ) {
            if (preferLossless) {
              optimizedImageUrl = isValidUrl(result.JpgLosslessURL)
                ? result.JpgLosslessURL
                : isValidUrl(result.JpgLossyURL)
                  ? result.JpgLossyURL
                  : undefined
            } else {
              optimizedImageUrl = isValidUrl(result.JpgLossyURL)
                ? result.JpgLossyURL
                : isValidUrl(result.JpgLosslessURL)
                  ? result.JpgLosslessURL
                  : undefined
            }
          } else if (targetFormat === 'png' || targetFormat === '+png') {
            // ShortPixel returns PngLosslessURL and PngLossyURL for PNG conversions
            const pngLossless = (result as any).PngLosslessURL
            const pngLossy = (result as any).PngLossyURL
            if (preferLossless) {
              optimizedImageUrl = isValidUrl(pngLossless)
                ? pngLossless
                : isValidUrl(pngLossy)
                  ? pngLossy
                  : undefined
            } else {
              optimizedImageUrl = isValidUrl(pngLossy)
                ? pngLossy
                : isValidUrl(pngLossless)
                  ? pngLossless
                  : undefined
            }
          }
        }

        if (!optimizedImageUrl) {
          optimizedImageUrl =
            bgRemovedUrl ||
            (isValidUrl(result.LosslessURL) ? result.LosslessURL : undefined) ||
            (isValidUrl(result.LossyURL) ? result.LossyURL : undefined) ||
            (isValidUrl(result.url) ? result.url : undefined)
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[ShortPixel] Response URLs:', {
            BgRemovedURL: bgRemovedUrl,
            LosslessURL: result.LosslessURL,
            LossyURL: result.LossyURL,
            WebPLosslessURL: result.WebPLosslessURL,
            WebPLossyURL: result.WebPLossyURL,
            AVIFLosslessURL: result.AVIFLosslessURL,
            AVIFLossyURL: result.AVIFLossyURL,
            JpgLosslessURL: result.JpgLosslessURL,
            JpgLossyURL: result.JpgLossyURL,
            PngLosslessURL: (result as any).PngLosslessURL,
            PngLossyURL: (result as any).PngLossyURL,
            SelectedURL: optimizedImageUrl,
            TargetFormat: context?.targetFormat,
            IsBackgroundRemoval: context?.isBackgroundRemoval,
            Compression: context?.compression,
          })

          if (context?.isBackgroundRemoval && result.LosslessURL && !bgRemovedUrl) {
            console.log('[ShortPixel] ℹ️  Background removal requested.')
            console.log(
              '[ShortPixel] ShortPixel returns background-removed image in LosslessURL/LossyURL.'
            )
            console.log(
              '[ShortPixel] Note: JPG files will have WHITE background (not transparent).'
            )
            console.log('[ShortPixel] Note: PNG files will have TRANSPARENT background.')
            console.log('[ShortPixel] The LosslessURL should contain the background-removed image.')
          }

          if (context?.targetFormat) {
            const targetFormat = context.targetFormat.toLowerCase()
            const formatUrls: Record<string, any> = {
              webp: { lossless: result.WebPLosslessURL, lossy: result.WebPLossyURL },
              avif: { lossless: result.AVIFLosslessURL, lossy: result.AVIFLossyURL },
              jpeg: { lossless: result.JpgLosslessURL, lossy: result.JpgLossyURL },
              jpg: { lossless: result.JpgLosslessURL, lossy: result.JpgLossyURL },
              png: { lossless: (result as any).PngLosslessURL, lossy: (result as any).PngLossyURL },
            }

            const formatInfo = formatUrls[targetFormat]
            if (formatInfo) {
              if (formatInfo.lossless === 'NA' && formatInfo.lossy === 'NA') {
                console.log(
                  `[ShortPixel] ⚠️  Format conversion to ${targetFormat.toUpperCase()} returned "NA" URLs.`
                )
                console.log(
                  '[ShortPixel] Falling back to standard format. ShortPixel may need more time to process format conversion.'
                )
              } else {
                console.log(
                  `[ShortPixel] ✅ Format conversion to ${targetFormat.toUpperCase()} successful.`
                )
              }
            }
          }
        }

        return {
          status: 'success',
          originalSize: result.OriginalSize || result.originalSize,
          optimizedSize: result.LosslessSize || result.LossySize || result.optimizedSize,
          compression: result.PercentImprovement
            ? parseFloat(String(result.PercentImprovement))
            : result.compression,
          optimizedImage: optimizedImageUrl,
          originalImage: result.OriginalURL || result.originalImage,
          metadata: {
            width: result.Width || result.width,
            height: result.Height || result.height,
            format: result.Type || result.format,
            quality: result.Quality || result.quality,
          },
        }
      }
    }

    const status = result?.Status || result?.status
    const statusCode = result?.StatusCode

    if (
      result?.Message &&
      (result.Message.toLowerCase().includes('error') ||
        result.Message.toLowerCase().includes('invalid'))
    ) {
      throw createShortPixelError(result, result.Message)
    }

    if (status === 'Success' || statusCode === 1 || status === 1) {
      return {
        status: 'success',
        originalSize: result.OriginalSize || result.originalSize,
        optimizedSize: result.LossySize || result.LosslessSize || result.optimizedSize,
        compression: result.PercentImprovement || result.compression,
        optimizedImage: result.LossyURL || result.LosslessURL || result.WebPLossyURL || result.url,
        originalImage: result.OriginalURL || result.originalImage,
        metadata: {
          width: result.Width || result.width,
          height: result.Height || result.height,
          format: result.Type || result.format,
          quality: result.Quality || result.quality,
        },
      }
    }

    if (status === 'Pending' || statusCode === 2 || status === 2) {
      return {
        status: 'pending',
        originalSize: result.OriginalSize,
        optimizedSize: undefined,
        compression: undefined,
        optimizedImage: undefined,
        originalImage: result.OriginalURL,
        metadata: undefined,
      }
    }

    if (
      status === 'Error' ||
      statusCode === -1 ||
      statusCode === -2 ||
      status === -1 ||
      status === -2
    ) {
      const errorMessage = result.Message || result.message || 'Processing failed'
      throw createShortPixelError(result, errorMessage)
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[ShortPixel] Unexpected response format:', {
        status,
        statusCode,
        result,
        data,
      })
    }

    throw createShortPixelError(result || data, 'Unexpected response format from ShortPixel API')
  }

  /**
   * Parse bulk optimization response from ShortPixel API
   * ShortPixel returns an array of results for bulk operations
   */
  private async parseBulkOptimizeResponse(response: Response): Promise<BulkOptimizeResult> {
    const data = await response.json()

    const results = Array.isArray(data) ? data : [data]

    const allSuccess = results.every(
      (r: any) => r.Status === 'Success' || r.Status === 1 || r.status === 'success'
    )
    const hasErrors = results.some(
      (r: any) => r.Status === 'Error' || r.Status === -1 || r.status === 'error'
    )

    if (allSuccess || !hasErrors) {
      const parsedResults: OptimizeResult[] = results.map((r: any) => ({
        status: (r.Status === 'Success' || r.Status === 1
          ? 'success'
          : 'pending') as ShortPixelStatus,
        originalSize: r.OriginalSize,
        optimizedSize: r.LossySize || r.LosslessSize,
        compression: r.PercentImprovement,
        optimizedImage: r.LossyURL || r.LosslessURL || r.WebPLossyURL,
        originalImage: r.OriginalURL,
        metadata: {
          width: r.Width,
          height: r.Height,
          format: r.Type,
          quality: r.Quality,
        },
      }))

      const totalOriginalSize = parsedResults.reduce((sum, r) => sum + (r.originalSize || 0), 0)
      const totalOptimizedSize = parsedResults.reduce((sum, r) => sum + (r.optimizedSize || 0), 0)

      return {
        status: allSuccess ? 'success' : 'pending',
        results: parsedResults,
        totalOriginalSize,
        totalOptimizedSize,
        compression:
          totalOriginalSize > 0
            ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100
            : undefined,
      }
    }

    const errorResult = results.find(
      (r: any) => r.Status === 'Error' || r.Status === -1 || r.status === 'error'
    )
    if (errorResult) {
      throw createShortPixelError(
        errorResult,
        errorResult.Message || errorResult.message || 'Bulk processing failed'
      )
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
