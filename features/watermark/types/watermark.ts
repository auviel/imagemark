import type React from 'react'
export interface WatermarkSettings {
  type: 'text' | 'image'
  text: string
  font: string
  fontSize: number
  fontMode: 'light' | 'dark' | 'custom'
  customColor: string
  opacity: number
  rotation: number
  positionX: number
  positionY: number
  positionPreset: string
  imageSize: number
}

export interface ImageItem {
  id: string
  /** Decoded via createImageBitmap — call .close() when removing */
  image: ImageBitmap
  file: File
  canvas?: HTMLCanvasElement
  /** Cached downscaled original for preview toggle */
  previewOriginalCanvas?: HTMLCanvasElement
  customSettings?: WatermarkSettings
}

export interface PositionPreset {
  id: string
  name: string
  x: number
  y: number
  icon: React.ReactNode
}

export interface FontOption {
  name: string
  family: string
  category: string
}
