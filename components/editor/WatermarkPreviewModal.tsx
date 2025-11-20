/**
 * Interactive Watermark Preview Modal
 *
 * Allows users to visually position, resize, and rotate watermarks
 * with drag-and-drop, pinch-to-zoom, and rotation gestures.
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, RotateCw, ZoomIn, ZoomOut, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WatermarkSettings } from '@/features/watermark/types'
import { FONT_OPTIONS } from '@/features/watermark/constants'
import { createImageFromFile } from '@/features/watermark/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface WatermarkPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (settings: WatermarkSettings, watermarkImage: HTMLImageElement | null) => void
  imageUrl: string
  settings: WatermarkSettings
  watermarkImage: HTMLImageElement | null
  onSettingsChange: (settings: WatermarkSettings) => void
  onWatermarkImageChange?: (image: HTMLImageElement | null) => void
}

export function WatermarkPreviewModal({
  isOpen,
  onClose,
  onApply,
  imageUrl,
  settings,
  watermarkImage,
  onSettingsChange,
  onWatermarkImageChange,
}: WatermarkPreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })
  const [initialRotation, setInitialRotation] = useState(0)
  const [initialSize, setInitialSize] = useState(0)
  const [initialDistance, setInitialDistance] = useState(0)
  const [scale, setScale] = useState(1)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const watermarkFileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  // Load image and calculate container size
  useEffect(() => {
    if (!isOpen || !imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      updateCanvas()

      // Calculate container size to fit image
      const mobile = window.innerWidth < 768
      const maxWidth = mobile ? window.innerWidth * 0.95 : window.innerWidth * 0.9
      const maxHeight = mobile ? window.innerHeight * 0.4 : window.innerHeight * 0.8
      const aspectRatio = img.width / img.height

      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      setContainerSize({ width, height })
      setScale(width / img.width)
    }
    img.src = imageUrl
  }, [isOpen, imageUrl])

  // Update canvas when settings change
  useEffect(() => {
    if (isOpen && imageRef.current) {
      updateCanvas()
    }
  }, [settings, watermarkImage, isOpen, scale])

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    canvas.width = containerSize.width || img.width
    canvas.height = containerSize.height || img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw image scaled to canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Draw watermark overlay
    if (settings.type === 'text' && settings.text.trim()) {
      drawWatermarkOverlay(ctx, canvas, img)
    } else if (settings.type === 'image' && watermarkImage) {
      drawWatermarkImageOverlay(ctx, canvas, img)
    }
  }, [settings, watermarkImage, containerSize, scale])

  const drawWatermarkOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement
  ) => {
    ctx.save()
    ctx.globalAlpha = settings.opacity / 100

    const fontSize = (settings.fontSize / 100) * img.width * scale
    const selectedFont = FONT_OPTIONS.find((f) => f.name === settings.font)
    const fontFamily = selectedFont?.family ?? 'Inter, sans-serif'
    ctx.font = `bold ${fontSize}px ${fontFamily}`

    // Set color
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

    const x = (settings.positionX / 100) * canvas.width
    const y = (settings.positionY / 100) * canvas.height

    ctx.translate(x, y)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    ctx.fillText(settings.text, 0, 0)
    ctx.restore()
  }

  const drawWatermarkImageOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement
  ) => {
    if (!watermarkImage) return

    ctx.save()
    ctx.globalAlpha = settings.opacity / 100

    const watermarkWidth = (settings.imageSize / 100) * img.width * scale
    const aspectRatio = watermarkImage.height / watermarkImage.width
    const watermarkHeight = watermarkWidth * aspectRatio

    const x = (settings.positionX / 100) * canvas.width - watermarkWidth / 2
    const y = (settings.positionY / 100) * canvas.height - watermarkHeight / 2

    if (settings.rotation !== 0) {
      const centerX = (settings.positionX / 100) * canvas.width
      const centerY = (settings.positionY / 100) * canvas.height
      ctx.translate(centerX, centerY)
      ctx.rotate((settings.rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }

    ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight)
    ctx.restore()
  }

  const getPositionFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const rect = containerRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return

      const pos = getPositionFromEvent(e)
      setIsDragging(true)
      setDragStart(pos)
      setInitialPosition({ x: settings.positionX, y: settings.positionY })
    },
    [settings.positionX, settings.positionY]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const pos = getPositionFromEvent(e)
      const deltaX = pos.x - dragStart.x
      const deltaY = pos.y - dragStart.y

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight

      const newX = Math.max(0, Math.min(100, initialPosition.x + (deltaX / containerWidth) * 100))
      const newY = Math.max(0, Math.min(100, initialPosition.y + (deltaY / containerHeight) * 100))

      onSettingsChange({
        ...settings,
        positionX: newX,
        positionY: newY,
        positionPreset: 'custom',
      })
    },
    [isDragging, dragStart, initialPosition, settings, onSettingsChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault() // Prevent scrolling
        const pos = getPositionFromEvent(e)
        setIsDragging(true)
        setDragStart(pos)
        setInitialPosition({ x: settings.positionX, y: settings.positionY })
      } else if (e.touches.length === 2) {
        e.preventDefault() // Prevent pinch zoom on page
        // Pinch to zoom
        setIsResizing(true)
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        setInitialDistance(distance)
        setInitialSize(settings.type === 'image' ? settings.imageSize : settings.fontSize)
      }
    },
    [settings]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault() // Prevent scrolling

      if (e.touches.length === 1 && isDragging) {
        const pos = getPositionFromEvent(e)
        const deltaX = pos.x - dragStart.x
        const deltaY = pos.y - dragStart.y

        if (!containerRef.current) return
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = containerRef.current.offsetHeight

        const newX = Math.max(0, Math.min(100, initialPosition.x + (deltaX / containerWidth) * 100))
        const newY = Math.max(
          0,
          Math.min(100, initialPosition.y + (deltaY / containerHeight) * 100)
        )

        onSettingsChange({
          ...settings,
          positionX: newX,
          positionY: newY,
          positionPreset: 'custom',
        })
      } else if (e.touches.length === 2 && isResizing && initialDistance > 0) {
        e.preventDefault() // Prevent pinch zoom on page
        // Pinch to zoom
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        const scaleFactor = distance / initialDistance
        const newSize = Math.max(5, Math.min(100, initialSize * scaleFactor))

        if (settings.type === 'image') {
          onSettingsChange({
            ...settings,
            imageSize: newSize,
          })
        } else {
          onSettingsChange({
            ...settings,
            fontSize: newSize,
          })
        }
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      initialPosition,
      initialSize,
      initialDistance,
      settings,
      onSettingsChange,
    ]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setInitialDistance(0)
  }, [])

  const handleRotate = useCallback(
    (delta: number) => {
      const newRotation = (settings.rotation + delta) % 360
      onSettingsChange({
        ...settings,
        rotation: newRotation,
      })
    },
    [settings, onSettingsChange]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 sm:p-4">
      <div
        className={`bg-white ${isMobile ? 'w-full h-full rounded-none' : 'rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh]'} flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Preview & Position Watermark
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content: Controls on Left (Desktop) / Bottom (Mobile), Image on Right (Desktop) / Top (Mobile) */}
        <div className={`flex-1 ${isMobile ? 'flex-col-reverse' : 'flex'} overflow-hidden`}>
          {/* Preview - Right Side (Desktop) / Top (Mobile) - Canvas Container */}
          <div
            className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'p-4'} flex items-center justify-center`}
          >
            <div
              ref={containerRef}
              className="relative bg-gray-100 rounded-lg overflow-hidden cursor-move"
              style={{
                width: containerSize.width || 'auto',
                height: containerSize.height || 'auto',
                maxWidth: isMobile ? '100%' : 'none',
                maxHeight: isMobile ? '100%' : 'none',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ touchAction: 'none' }}
              />
            </div>
          </div>

          {/* Controls - Left Sidebar (Desktop) / Bottom Section (Mobile) */}
          <div
            className={`${isMobile ? 'w-full border-t border-gray-200 max-h-[50vh]' : 'w-80 border-r border-gray-200'} overflow-y-auto p-4 space-y-4 flex-shrink-0`}
          >
            {/* Watermark Type Toggle */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Watermark Type</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      type: 'text',
                    })
                  }
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    settings.type === 'text'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      type: 'image',
                    })
                  }
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    settings.type === 'image'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Image
                </button>
              </div>
            </div>

            {/* Text Settings (only for text watermarks) */}
            {settings.type === 'text' && (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Text</Label>
                  <Input
                    value={settings.text}
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        text: e.target.value,
                      })
                    }
                    placeholder="Enter watermark text"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Font</Label>
                  <Select
                    value={settings.font}
                    onValueChange={(value) =>
                      onSettingsChange({
                        ...settings,
                        font: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-teal-300 focus:border-teal-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 max-h-60">
                      {FONT_OPTIONS.map((fontOption) => (
                        <SelectItem
                          key={fontOption.name}
                          value={fontOption.name}
                          className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer"
                        >
                          {fontOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Color Mode</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          fontMode: 'light',
                        })
                      }
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        settings.fontMode === 'light'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          fontMode: 'dark',
                        })
                      }
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        settings.fontMode === 'dark'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSettingsChange({
                          ...settings,
                          fontMode: 'custom',
                        })
                      }
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        settings.fontMode === 'custom'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {settings.fontMode === 'custom' && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Custom Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.customColor}
                        onChange={(e) =>
                          onSettingsChange({
                            ...settings,
                            customColor: e.target.value,
                          })
                        }
                        className="w-16 h-10 p-1 border-2 border-gray-200 rounded"
                      />
                      <Input
                        type="text"
                        value={settings.customColor}
                        onChange={(e) =>
                          onSettingsChange({
                            ...settings,
                            customColor: e.target.value,
                          })
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Image Watermark Settings (only for image watermarks) */}
            {settings.type === 'image' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Watermark Image
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => watermarkFileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {watermarkImage ? 'Change Image' : 'Upload Image'}
                  </Button>
                  {watermarkImage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (onWatermarkImageChange) {
                          onWatermarkImageChange(null)
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={watermarkFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file && onWatermarkImageChange) {
                      try {
                        const img = await createImageFromFile(file)
                        onWatermarkImageChange(img)
                      } catch (error) {
                        console.error('Failed to load watermark image:', error)
                        alert('Failed to load watermark image. Please try again.')
                      }
                    }
                  }}
                  className="hidden"
                />
                {watermarkImage && (
                  <div className="mt-2 p-2 border border-gray-200 rounded-md">
                    <img
                      src={watermarkImage.src}
                      alt="Watermark preview"
                      className="max-h-20 mx-auto"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rotation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(-15)}
                className="h-10 w-10 p-0"
                title="Rotate Left"
              >
                <RotateCw className="w-4 h-4 rotate-180" />
              </Button>
              <div className="text-sm text-gray-600 flex-1 text-center">{settings.rotation}°</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(15)}
                className="h-10 w-10 p-0"
                title="Rotate Right"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Size Controls */}
            {settings.type === 'image' ? (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Size: {Math.round(settings.imageSize)}%
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        imageSize: Math.max(5, settings.imageSize - 5),
                      })
                    }
                    className="h-9 w-9 p-0 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Slider
                    value={[settings.imageSize]}
                    onValueChange={([value]) => onSettingsChange({ ...settings, imageSize: value })}
                    min={5}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        imageSize: Math.min(100, settings.imageSize + 5),
                      })
                    }
                    className="h-9 w-9 p-0 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Font Size: {Math.round(settings.fontSize)}%
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        fontSize: Math.max(5, settings.fontSize - 1),
                      })
                    }
                    className="h-9 w-9 p-0 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => onSettingsChange({ ...settings, fontSize: value })}
                    min={5}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        fontSize: Math.min(50, settings.fontSize + 1),
                      })
                    }
                    className="h-9 w-9 p-0 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            )}

            {/* Opacity */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Opacity: {settings.opacity}%
              </Label>
              <Slider
                value={[settings.opacity]}
                onValueChange={([value]) => onSettingsChange({ ...settings, opacity: value })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <p>
                💡 Drag the watermark to position it • Use buttons or gestures to rotate and resize
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onApply(settings, watermarkImage)
                  onClose()
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                disabled={
                  !(
                    (settings.type === 'text' && settings.text.trim()) ||
                    (settings.type === 'image' && watermarkImage)
                  )
                }
              >
                Apply Watermark
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
