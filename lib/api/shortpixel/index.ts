/**
 * ShortPixel API Client
 *
 * Barrel export for ShortPixel API client, types, and errors
 */
export { ShortPixelClient, createShortPixelClient, shortPixelClient } from './client'
export type {
  ShortPixelClientConfig,
  ShortPixelOptions,
  OptimizeRequest,
  OptimizeResult,
  BulkOptimizeRequest,
  BulkOptimizeResult,
  CompressionMode,
  ImageFormat,
  ResizeMode,
  ShortPixelStatus,
} from './types'
export { ShortPixelError, ShortPixelErrorCodes, createShortPixelError } from './errors'
export type { ShortPixelErrorCode } from './errors'
