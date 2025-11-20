/**
 * Background Removal Client
 *
 * Lightweight wrapper for background removal operations.
 * Only loads background removal-specific code.
 */

import { getShortPixelClient } from '../lazy-client'
import type { OptimizeResult } from '../types'

/**
 * Remove background from an image using AI
 *
 * @param image - Image file, blob, or URL
 * @param backgroundColor - Optional: 'transparent' (default), color code '#rrggbbxx', or image URL
 * @returns Processed image with background removed
 *
 * @example
 * ```ts
 * const result = await removeBackground(file)
 * ```
 */
export async function removeBackground(
  image: File | Blob | string,
  backgroundColor: 'transparent' | string = 'transparent'
): Promise<OptimizeResult> {
  const client = getShortPixelClient()
  return client.removeBackground(image, backgroundColor)
}
