'use client'

import { useCallback, useMemo } from 'react'
import type { WatermarkSettings, ImageItem } from '../types'
import { drawImageOnCanvas, drawWatermarkOnCanvas } from '../utils'
import { ensureFontsLoaded } from '../utils/font-loader'
import { getPreviewDimensions } from '../utils/canvas-scale'

export type ProcessQuality = 'preview' | 'full'

export const useWatermark = (
  globalSettings: WatermarkSettings,
  watermarkImage: ImageBitmap | null
) => {
  const processImage = useCallback(
    async (
      imageItem: ImageItem,
      withWatermark = true,
      quality: ProcessQuality = 'full'
    ): Promise<HTMLCanvasElement> => {
      const isPreview = quality === 'preview'
      const outputSize = isPreview
        ? getPreviewDimensions(imageItem.image.width, imageItem.image.height)
        : undefined
      const smoothing = isPreview ? 'medium' : 'high'
      const reuseCanvas = isPreview
        ? withWatermark
          ? imageItem.canvas
          : imageItem.previewOriginalCanvas
        : undefined
      const canvas = reuseCanvas ?? document.createElement('canvas')

      if (!withWatermark) {
        drawImageOnCanvas(imageItem.image, canvas, outputSize, smoothing)
        return canvas
      }

      const settings = imageItem.customSettings || globalSettings
      await drawWatermarkOnCanvas(
        imageItem.image,
        canvas,
        settings,
        watermarkImage,
        outputSize,
        smoothing
      )
      return canvas
    },
    [globalSettings, watermarkImage]
  )

  const hasWatermark = useMemo(() => {
    return (
      (globalSettings.type === 'text' && globalSettings.text.trim()) ||
      (globalSettings.type === 'image' && watermarkImage)
    )
  }, [globalSettings.type, globalSettings.text, watermarkImage])

  return {
    processImage,
    hasWatermark,
  }
}
