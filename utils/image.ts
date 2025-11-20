import type { WatermarkSettings } from '@/types/watermark'
import { FONT_OPTIONS, ANALYSIS_SIZE, ACCEPTED_FILE_TYPES } from '@/constants/watermark'
import { validateFileSize, cleanupImage, createObjectURLSafe } from '@/utils/memory'
import { handleError, ErrorCodes } from '@/lib/error-handler'

export const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  // Validate file size
  const sizeValidation = validateFileSize(file, 'image')
  if (!sizeValidation.valid) {
    const { error } = handleError(
      new Error(sizeValidation.error || 'File too large'),
      ErrorCodes.FILE_TOO_LARGE
    )
    return Promise.reject(error)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    // Create object URL with cleanup tracking
    const { url: imageUrl, cleanup: cleanupUrl } = createObjectURLSafe(file)
    img.src = imageUrl

    const cleanup = () => {
      cleanupUrl()
      cleanupImage(img)
    }

    img.onload = () => {
      cleanup()
      resolve(img)
    }

    img.onerror = () => {
      cleanup()
      const { error } = handleError(
        new Error(`Failed to load image: ${file.name}`),
        ErrorCodes.IMAGE_LOAD_ERROR
      )
      reject(error)
    }
  })
}

export const analyzeImageBrightness = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
): 'light' | 'dark' => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return 'light'

  canvas.width = ANALYSIS_SIZE
  canvas.height = ANALYSIS_SIZE

  ctx.drawImage(image, 0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE)

  const imageData = ctx.getImageData(0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE)
  const data = imageData.data

  let totalBrightness = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    totalBrightness += brightness
  }

  const averageBrightness = (totalBrightness / pixelCount) * 100
  return averageBrightness < 50 ? 'light' : 'dark'
}

export const drawWatermarkOnCanvas = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  settings: WatermarkSettings,
  watermarkImage?: HTMLImageElement | null
): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = image.width
  canvas.height = image.height

  // Clear and draw base image
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0)

  // Early return if no watermark content
  const hasTextWatermark = settings.type === 'text' && settings.text.trim()
  const hasImageWatermark = settings.type === 'image' && watermarkImage

  if (!hasTextWatermark && !hasImageWatermark) return

  // Apply watermark
  ctx.save()
  ctx.globalAlpha = settings.opacity / 100

  if (hasTextWatermark) {
    drawTextWatermark(ctx, image, settings)
  } else if (hasImageWatermark && watermarkImage) {
    drawImageWatermark(ctx, image, settings, watermarkImage)
  }

  ctx.restore()
}

const drawTextWatermark = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  settings: WatermarkSettings
): void => {
  const fontSize = (settings.fontSize / 100) * image.width
  const selectedFont = FONT_OPTIONS.find((f) => f.name === settings.font)
  const fontFamily = selectedFont?.family ?? 'Inter, sans-serif'

  ctx.font = `bold ${fontSize}px ${fontFamily}`

  // Set color based on font mode
  switch (settings.fontMode) {
    case 'light':
      ctx.fillStyle = '#D1D5DB'
      break
    case 'dark':
      ctx.fillStyle = '#374151'
      break
    default:
      ctx.fillStyle = settings.customColor
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const x = (settings.positionX / 100) * image.width
  const y = (settings.positionY / 100) * image.height

  ctx.translate(x, y)
  ctx.rotate((settings.rotation * Math.PI) / 180)
  ctx.fillText(settings.text, 0, 0)
}

const drawImageWatermark = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  settings: WatermarkSettings,
  watermarkImage: HTMLImageElement
): void => {
  // Calculate watermark size based on imageSize setting
  const watermarkWidth = (settings.imageSize / 100) * image.width
  const aspectRatio = watermarkImage.height / watermarkImage.width
  const watermarkHeight = watermarkWidth * aspectRatio

  // Calculate position
  const x = (settings.positionX / 100) * image.width - watermarkWidth / 2
  const y = (settings.positionY / 100) * image.height - watermarkHeight / 2

  // Apply rotation if needed
  if (settings.rotation !== 0) {
    const centerX = (settings.positionX / 100) * image.width
    const centerY = (settings.positionY / 100) * image.height
    ctx.translate(centerX, centerY)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)
  }

  // Draw the watermark image
  ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight)
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

      // Cleanup with slight delay to ensure download starts
      setTimeout(() => {
        try {
          document.body.removeChild(link)
        } catch (error) {
          // Link might already be removed
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

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      },
      'image/png',
      1.0
    )
  })
}

export const validateFileTypes = (files: FileList): File[] => {
  return Array.from(files).filter((file) => ACCEPTED_FILE_TYPES.includes(file.type as any))
}
