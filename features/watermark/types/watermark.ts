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
  image: HTMLImageElement
  file: File
  canvas?: HTMLCanvasElement
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
