/**
 * Memory management utilities for preventing leaks
 * Handles cleanup of object URLs, canvases, and other resources
 */

/**
 * Maximum file sizes (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 50 * 1024 * 1024, // 50 MB
  VIDEO: 500 * 1024 * 1024, // 500 MB
  WATERMARK_IMAGE: 10 * 1024 * 1024, // 10 MB
} as const

/**
 * Validates file size against limits
 */
export function validateFileSize(
  file: File,
  type: 'image' | 'video' | 'watermark'
): {
  valid: boolean
  error?: string
} {
  const limit =
    FILE_SIZE_LIMITS[
      type === 'watermark' ? 'WATERMARK_IMAGE' : (type.toUpperCase() as 'IMAGE' | 'VIDEO')
    ]
  const maxSizeMB = limit / (1024 * 1024)

  if (file.size > limit) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB. Please choose a smaller file.`,
    }
  }

  return { valid: true }
}

/**
 * Safely creates an object URL and tracks it for cleanup
 */
export class ObjectURLManager {
  private urls: Set<string> = new Set()

  /**
   * Creates an object URL and tracks it
   */
  create(blob: Blob): string {
    const url = URL.createObjectURL(blob)
    this.urls.add(url)
    return url
  }

  /**
   * Revokes a specific object URL
   */
  revoke(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url)
      this.urls.delete(url)
    }
  }

  /**
   * Revokes all tracked object URLs
   */
  revokeAll(): void {
    this.urls.forEach((url) => {
      try {
        URL.revokeObjectURL(url)
      } catch (error) {
        // Ignore errors when revoking (URL might already be revoked)
      }
    })
    this.urls.clear()
  }

  /**
   * Gets the number of active object URLs
   */
  get count(): number {
    return this.urls.size
  }
}

/**
 * Safely cleans up a canvas element
 */
export function cleanupCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) return

  try {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Reset canvas dimensions to free memory
    canvas.width = 0
    canvas.height = 0
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Safely cleans up a video element
 */
export function cleanupVideo(video: HTMLVideoElement | null): void {
  if (!video) return

  try {
    // Pause and reset video
    video.pause()
    video.src = ''
    video.load()

    // Remove event listeners by cloning
    const newVideo = video.cloneNode(false) as HTMLVideoElement
    video.parentNode?.replaceChild(newVideo, video)
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Safely cleans up an image element
 */
export function cleanupImage(img: HTMLImageElement | null): void {
  if (!img) return

  try {
    // Clear the image source
    img.src = ''
    img.onload = null
    img.onerror = null
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Creates a cleanup function that revokes an object URL
 */
export function createObjectURLCleanup(url: string): () => void {
  return () => {
    try {
      URL.revokeObjectURL(url)
    } catch (error) {
      // Ignore errors when revoking
    }
  }
}

/**
 * Safely creates an object URL with automatic cleanup on error
 */
export function createObjectURLSafe(blob: Blob): {
  url: string
  cleanup: () => void
} {
  const url = URL.createObjectURL(blob)
  return {
    url,
    cleanup: createObjectURLCleanup(url),
  }
}

/**
 * Memory usage utilities
 */
export const MemoryUtils = {
  /**
   * Estimates memory usage of an image
   */
  estimateImageMemory(width: number, height: number, channels: number = 4): number {
    return width * height * channels
  },

  /**
   * Estimates memory usage of a video frame
   */
  estimateVideoFrameMemory(width: number, height: number, fps: number, duration: number): number {
    const frameMemory = width * height * 4 // RGBA
    const frameCount = fps * duration
    return frameMemory * frameCount
  },

  /**
   * Formats bytes to human-readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  },
}
