/**
 * Lazy ShortPixel Client Factory
 *
 * Provides lazy initialization of the ShortPixel client to reduce
 * initial module load time and improve tree-shaking.
 *
 * The client is only initialized when first accessed, not at module load time.
 */

import { createShortPixelClient, type ShortPixelClient } from './client'

/**
 * Singleton client instance (lazy initialized)
 */
let clientInstance: ShortPixelClient | null = null

/**
 * Get or create the ShortPixel client instance
 *
 * Uses lazy initialization - the client is only created on first access.
 * This reduces initial module load time and allows better tree-shaking.
 *
 * @returns ShortPixelClient instance
 *
 * @example
 * ```ts
 * // In route handler
 * const client = getShortPixelClient()
 * const result = await client.convert(file, 'webp')
 * ```
 */
export function getShortPixelClient(): ShortPixelClient {
  if (!clientInstance) {
    clientInstance = createShortPixelClient()
  }
  return clientInstance
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetShortPixelClient(): void {
  clientInstance = null
}
