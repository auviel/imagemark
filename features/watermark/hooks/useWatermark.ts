'use client'

import { useCallback, useRef, useMemo } from 'react'
import type { WatermarkSettings, ImageItem } from '../types'
import { analyzeImageBrightness, drawImageOnCanvas, drawWatermarkOnCanvas } from '../utils'

export const useWatermark = (
  globalSettings: WatermarkSettings,
  watermarkImage: HTMLImageElement | null
) => {
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null)

  const analyzeBrightness = useCallback((image: HTMLImageElement): 'light' | 'dark' => {
    const canvas = analysisCanvasRef.current
    if (!canvas) return 'light'
    return analyzeImageBrightness(image, canvas)
  }, [])

  const processImage = useCallback(
    (imageItem: ImageItem, withWatermark = true): HTMLCanvasElement => {
      const canvas = document.createElement('canvas')
      if (!withWatermark) {
        drawImageOnCanvas(imageItem.image, canvas)
        return canvas
      }
      const settings = imageItem.customSettings || globalSettings
      drawWatermarkOnCanvas(imageItem.image, canvas, settings, watermarkImage)
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
    analysisCanvasRef,
    analyzeBrightness,
    processImage,
    hasWatermark,
  }
}
