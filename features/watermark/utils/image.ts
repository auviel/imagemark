import type { WatermarkSettings } from '../types'
import { ACCEPTED_FILE_TYPES } from '../constants'
import { validateFileSize, createObjectURLSafe } from '@/utils/memory'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import {
  drawImageSourceOnCanvas,
  drawWatermarkOnCanvasCore,
  type DrawOutputSize,
  type SmoothingQuality,
} from './canvas-draw-core'
import { ensureFontsLoaded } from './font-loader'

export const createImageFromFile = async (file: File): Promise<ImageBitmap> => {
  const sizeValidation = validateFileSize(file, 'image')
  if (!sizeValidation.valid) {
    const { error } = handleError(
      new Error(sizeValidation.error || 'File too large'),
      ErrorCodes.FILE_TOO_LARGE
    )
    return Promise.reject(error)
  }

  try {
    return await createImageBitmap(file)
  } catch (cause) {
    const { error } = handleError(
      cause instanceof Error ? cause : new Error(`Failed to load image: ${file.name}`),
      ErrorCodes.IMAGE_LOAD_ERROR
    )
    return Promise.reject(error)
  }
}

export const createWatermarkFromFile = createImageFromFile

/** Draw source image only (no watermark) — for before/after preview */
export const drawImageOnCanvas = (
  image: CanvasImageSource & { width: number; height: number },
  canvas: HTMLCanvasElement,
  outputSize?: DrawOutputSize,
  smoothing: SmoothingQuality = 'high'
): void => {
  drawImageSourceOnCanvas(image, image.width, image.height, canvas, outputSize, smoothing)
}

export const drawWatermarkOnCanvas = async (
  image: CanvasImageSource & { width: number; height: number },
  canvas: HTMLCanvasElement,
  settings: WatermarkSettings,
  watermarkImage?: (CanvasImageSource & { width: number; height: number }) | null,
  outputSize?: DrawOutputSize,
  smoothing: SmoothingQuality = 'high'
): Promise<void> => {
  await ensureFontsLoaded(settings)
  drawWatermarkOnCanvasCore(
    image,
    image.width,
    image.height,
    canvas,
    settings,
    watermarkImage ?? null,
    watermarkImage?.width,
    watermarkImage?.height,
    outputSize,
    smoothing
  )
}

export const downloadBlob = (blob: Blob, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const { url, cleanup: cleanupUrl } = createObjectURLSafe(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        try {
          document.body.removeChild(link)
        } catch {
          /* link removed */
        }
        cleanupUrl()
        resolve()
      }, 100)
    } catch (error) {
      const { error: appError } = handleError(error, ErrorCodes.FILE_PROCESSING_ERROR)
      reject(appError)
    }
  })
}

export { canvasToBlob } from './export-service'

export const validateFileTypes = (files: FileList): File[] => {
  return Array.from(files).filter((file) =>
    ACCEPTED_FILE_TYPES.includes(file.type as (typeof ACCEPTED_FILE_TYPES)[number])
  )
}
