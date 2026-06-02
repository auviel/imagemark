/**
 * Canvas draw routines shared by main thread and export worker (no DOM deps).
 */
import type { WatermarkSettings } from '../types'
import { getFontFamily } from '../constants/fonts'

export type DrawOutputSize = { width: number; height: number }
export type SmoothingQuality = 'low' | 'medium' | 'high'
export type CanvasLike = HTMLCanvasElement | OffscreenCanvas
export type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function applySmoothing(ctx: CanvasContext, quality: SmoothingQuality): void {
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = quality
}

export function drawImageSourceOnCanvas(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  canvas: CanvasLike,
  outputSize?: DrawOutputSize,
  smoothing: SmoothingQuality = 'high'
): void {
  const ctx = canvas.getContext('2d') as CanvasContext | null
  if (!ctx) return
  applySmoothing(ctx, smoothing)
  const width = outputSize?.width ?? sourceWidth
  const height = outputSize?.height ?? sourceHeight
  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(source, 0, 0, width, height)
}

export function drawWatermarkOnCanvasCore(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  canvas: CanvasLike,
  settings: WatermarkSettings,
  watermarkSource?: CanvasImageSource | null,
  watermarkSourceWidth?: number,
  watermarkSourceHeight?: number,
  outputSize?: DrawOutputSize,
  smoothing: SmoothingQuality = 'high'
): void {
  const ctx = canvas.getContext('2d') as CanvasContext | null
  if (!ctx) return

  applySmoothing(ctx, smoothing)

  const width = outputSize?.width ?? sourceWidth
  const height = outputSize?.height ?? sourceHeight

  canvas.width = width
  canvas.height = height

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(source, 0, 0, width, height)

  const hasTextWatermark = settings.type === 'text' && settings.text.trim()
  const hasImageWatermark =
    settings.type === 'image' && watermarkSource && watermarkSourceWidth && watermarkSourceHeight

  if (!hasTextWatermark && !hasImageWatermark) return

  ctx.save()
  ctx.globalAlpha = settings.opacity / 100

  if (hasTextWatermark) {
    drawTextWatermark(ctx, width, height, settings)
  } else if (hasImageWatermark && watermarkSource) {
    drawImageWatermark(
      ctx,
      width,
      height,
      settings,
      watermarkSource,
      watermarkSourceWidth,
      watermarkSourceHeight
    )
  }

  ctx.restore()
}

function drawTextWatermark(
  ctx: CanvasContext,
  width: number,
  height: number,
  settings: WatermarkSettings
): void {
  const fontSize = (settings.fontSize / 100) * width
  const fontFamily = getFontFamily(settings.font)

  ctx.font = `bold ${fontSize}px ${fontFamily}`

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

  const x = (settings.positionX / 100) * width
  const y = (settings.positionY / 100) * height

  ctx.translate(x, y)
  ctx.rotate((settings.rotation * Math.PI) / 180)
  ctx.fillText(settings.text, 0, 0)
}

function drawImageWatermark(
  ctx: CanvasContext,
  width: number,
  height: number,
  settings: WatermarkSettings,
  watermarkSource: CanvasImageSource,
  wmWidth: number,
  wmHeight: number
): void {
  const watermarkWidth = (settings.imageSize / 100) * width
  const aspectRatio = wmHeight / wmWidth
  const watermarkHeight = watermarkWidth * aspectRatio

  const x = (settings.positionX / 100) * width - watermarkWidth / 2
  const y = (settings.positionY / 100) * height - watermarkHeight / 2

  if (settings.rotation !== 0) {
    const centerX = (settings.positionX / 100) * width
    const centerY = (settings.positionY / 100) * height
    ctx.translate(centerX, centerY)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)
  }

  ctx.drawImage(watermarkSource, x, y, watermarkWidth, watermarkHeight)
}
