/**
 * Interactive Watermark Preview Modal
 *
 * Allows users to visually position, resize, and rotate watermarks
 * with drag-and-drop, pinch-to-zoom, and rotation gestures.
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, RotateCw, ZoomIn, ZoomOut, Upload, Hand, Type, Eye, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  const [showTip, setShowTip] = useState(false)
  const [fontPopoverOpen, setFontPopoverOpen] = useState(false)
  const [rotatePopoverOpen, setRotatePopoverOpen] = useState(false)
  const [sizePopoverOpen, setSizePopoverOpen] = useState(false)
  const [opacityPopoverOpen, setOpacityPopoverOpen] = useState(false)
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Check if user has seen the tip before
  useEffect(() => {
    if (isOpen) {
      const hasSeenTip = localStorage.getItem('watermark-tip-dismissed')
      // Show tip if:
      // 1. User hasn't dismissed it before
      // 2. There's a watermark visible (text or image)
      const hasWatermark =
        (settings.type === 'text' && settings.text.trim()) ||
        (settings.type === 'image' && watermarkImage)

      if (!hasSeenTip && hasWatermark) {
        setShowTip(true)
      }
    }
  }, [isOpen, settings.type, settings.text, watermarkImage])

  const handleDismissTip = () => {
    setShowTip(false)
    localStorage.setItem('watermark-tip-dismissed', 'true')
  }

  // Handle watermark image file processing
  const handleWatermarkImageFile = useCallback(
    async (file: File) => {
      if (!onWatermarkImageChange) return

      try {
        // Create image without cleanup for watermark (we need to keep the blob URL)
        const img = new Image()
        img.crossOrigin = 'anonymous'

        const imageUrl = URL.createObjectURL(file)
        img.src = imageUrl

        // Wait for image to load
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            resolve()
          }
          img.onerror = () => {
            URL.revokeObjectURL(imageUrl)
            reject(new Error('Failed to load watermark image'))
          }
        })

        // Store the blob URL on the image so we can clean it up later if needed
        ;(img as any)._blobUrl = imageUrl

        onWatermarkImageChange(img)
      } catch (error) {
        alert('Failed to load watermark image. Please try again.')
      }
    },
    [onWatermarkImageChange]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        await handleWatermarkImageFile(file)
      }
    },
    [handleWatermarkImageFile]
  )

  // Cleanup blob URLs on unmount or when watermark image changes
  useEffect(() => {
    return () => {
      if (watermarkImage && (watermarkImage as any)._blobUrl) {
        URL.revokeObjectURL((watermarkImage as any)._blobUrl)
      }
    }
  }, [watermarkImage])

  useEffect(() => {
    if (!isOpen || !imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img

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

  const drawWatermarkImageOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
      if (!watermarkImage) return

      // Ensure watermark image is loaded
      if (!watermarkImage.complete || watermarkImage.naturalWidth === 0) {
        return
      }

      // Ensure high-quality image smoothing is enabled for watermark
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      ctx.save()
      ctx.globalAlpha = settings.opacity / 100

      // Use the base image dimensions (not scaled) for size calculation
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
    },
    [watermarkImage, settings, scale]
  )

  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    canvas.width = containerSize.width || img.width
    canvas.height = containerSize.height || img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Enable high-quality image smoothing for better quality when scaling
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    if (settings.type === 'text' && settings.text.trim()) {
      drawWatermarkOverlay(ctx, canvas, img)
    } else if (settings.type === 'image' && watermarkImage) {
      drawWatermarkImageOverlay(ctx, canvas, img)
    }
  }, [settings, watermarkImage, containerSize, scale, drawWatermarkImageOverlay])

  useEffect(() => {
    if (isOpen && imageRef.current) {
      updateCanvas()
    }
  }, [settings, watermarkImage, isOpen, scale, updateCanvas])

  // Ensure watermark image is loaded before drawing
  useEffect(() => {
    if (watermarkImage && !watermarkImage.complete) {
      const handleLoad = () => {
        if (imageRef.current) {
          updateCanvas()
        }
      }
      watermarkImage.addEventListener('load', handleLoad)
      return () => {
        watermarkImage.removeEventListener('load', handleLoad)
      }
    } else if (watermarkImage && watermarkImage.complete && imageRef.current) {
      updateCanvas()
    }
  }, [watermarkImage, updateCanvas])

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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault() // Prevent scrolling
        const pos = getPositionFromEvent(e)
        setIsDragging(true)
        setDragStart(pos)
        setInitialPosition({ x: settings.positionX, y: settings.positionY })
      } else if (e.touches.length === 2) {
        e.preventDefault()
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
        e.preventDefault()
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
                      rotation: 0,
                      opacity: 100,
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
                  <div className="relative">
                    <Input
                      value={settings.text}
                      onChange={(e) =>
                        onSettingsChange({
                          ...settings,
                          text: e.target.value,
                        })
                      }
                      placeholder="Enter watermark text"
                      className="w-full pr-12"
                    />
                    <Popover open={fontPopoverOpen} onOpenChange={setFontPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                          title="Select font"
                        >
                          <Type className="w-4 h-4 text-gray-600" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2 bg-white border-2 border-gray-200">
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {FONT_OPTIONS.map((fontOption) => (
                            <button
                              key={fontOption.name}
                              type="button"
                              onClick={() => {
                                onSettingsChange({
                                  ...settings,
                                  font: fontOption.name,
                                })
                                setFontPopoverOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                settings.font === fontOption.name
                                  ? 'bg-teal-600 text-white'
                                  : 'hover:bg-teal-50 text-gray-700'
                              }`}
                              style={{
                                fontFamily: fontOption.name,
                              }}
                            >
                              {fontOption.name}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Color Mode Control */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-gray-700 flex-1">Color</Label>
                  <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-24 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50 flex items-center gap-1.5"
                        title="Select color mode"
                      >
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{
                            backgroundColor:
                              settings.fontMode === 'light'
                                ? '#D1D5DB'
                                : settings.fontMode === 'dark'
                                  ? '#374151'
                                  : settings.customColor,
                          }}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {settings.fontMode === 'custom' ? 'Custom' : settings.fontMode}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 bg-white border-2 border-gray-200">
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700 block">
                          Color Mode
                        </Label>
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
                        {settings.fontMode === 'custom' && (
                          <div className="space-y-2 pt-2 border-t border-gray-200">
                            <Label className="text-sm font-medium text-gray-700 block">
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
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Image Watermark Settings (only for image watermarks) */}
            {settings.type === 'image' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Watermark Image
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => watermarkFileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
                    ${
                      isDraggingOver
                        ? 'border-teal-500 bg-teal-50'
                        : watermarkImage
                          ? 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/50'
                          : 'border-gray-300 bg-white hover:border-teal-400 hover:bg-teal-50/50'
                    }
                  `}
                >
                  {watermarkImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-full">
                        <img
                          src={watermarkImage.src}
                          alt="Watermark preview"
                          className="max-h-32 mx-auto rounded object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Clean up blob URL if it exists
                            if ((watermarkImage as any)._blobUrl) {
                              URL.revokeObjectURL((watermarkImage as any)._blobUrl)
                            }
                            if (onWatermarkImageChange) {
                              onWatermarkImageChange(null)
                            }
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`rounded-full p-3 ${
                          isDraggingOver ? 'bg-teal-100' : 'bg-gray-100'
                        }`}
                      >
                        <Upload
                          className={`w-6 h-6 ${
                            isDraggingOver ? 'text-teal-600' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {isDraggingOver ? 'Drop image here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, GIF, WebP</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={watermarkFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      await handleWatermarkImageFile(file)
                    }
                    // Reset input to allow selecting the same file again
                    e.target.value = ''
                  }}
                  className="hidden"
                />
              </div>
            )}

            {/* Rotation Control */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700 flex-1">Rotation</Label>
              <Popover open={rotatePopoverOpen} onOpenChange={setRotatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-20 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                    title="Adjust rotation"
                  >
                    <RotateCw className="w-4 h-4 text-gray-600 mr-1" />
                    <span className="text-sm text-gray-700">{settings.rotation}°</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-white border-2 border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Rotation: {settings.rotation}°
                      </Label>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRotate(-15)}
                          className="h-8 w-8 p-0"
                          title="Rotate Left"
                        >
                          <RotateCw className="w-3 h-3 rotate-180" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRotate(15)}
                          className="h-8 w-8 p-0"
                          title="Rotate Right"
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[settings.rotation]}
                      onValueChange={([value]) =>
                        onSettingsChange({ ...settings, rotation: value })
                      }
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Size Control */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700 flex-1">
                {settings.type === 'image' ? 'Size' : 'Font Size'}
              </Label>
              <Popover open={sizePopoverOpen} onOpenChange={setSizePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-20 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                    title={`Adjust ${settings.type === 'image' ? 'size' : 'font size'}`}
                  >
                    {settings.type === 'image' ? (
                      <ZoomIn className="w-4 h-4 text-gray-600 mr-1" />
                    ) : (
                      <Type className="w-4 h-4 text-gray-600 mr-1" />
                    )}
                    <span className="text-sm text-gray-700">
                      {Math.round(
                        settings.type === 'image' ? settings.imageSize : settings.fontSize
                      )}
                      %
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-white border-2 border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        {settings.type === 'image' ? 'Size' : 'Font Size'}:{' '}
                        {Math.round(
                          settings.type === 'image' ? settings.imageSize : settings.fontSize
                        )}
                        %
                      </Label>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (settings.type === 'image') {
                              onSettingsChange({
                                ...settings,
                                imageSize: Math.max(5, settings.imageSize - 5),
                              })
                            } else {
                              onSettingsChange({
                                ...settings,
                                fontSize: Math.max(5, settings.fontSize - 1),
                              })
                            }
                          }}
                          className="h-8 w-8 p-0"
                          title="Decrease"
                        >
                          <ZoomOut className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (settings.type === 'image') {
                              onSettingsChange({
                                ...settings,
                                imageSize: Math.min(100, settings.imageSize + 5),
                              })
                            } else {
                              onSettingsChange({
                                ...settings,
                                fontSize: Math.min(50, settings.fontSize + 1),
                              })
                            }
                          }}
                          className="h-8 w-8 p-0"
                          title="Increase"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[settings.type === 'image' ? settings.imageSize : settings.fontSize]}
                      onValueChange={([value]) => {
                        if (settings.type === 'image') {
                          onSettingsChange({ ...settings, imageSize: value })
                        } else {
                          onSettingsChange({ ...settings, fontSize: value })
                        }
                      }}
                      min={settings.type === 'image' ? 5 : 5}
                      max={settings.type === 'image' ? 100 : 50}
                      step={settings.type === 'image' ? 5 : 1}
                      className="w-full"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Opacity Control */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700 flex-1">Opacity</Label>
              <Popover open={opacityPopoverOpen} onOpenChange={setOpacityPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-20 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50"
                    title="Adjust opacity"
                  >
                    <Eye className="w-4 h-4 text-gray-600 mr-1" />
                    <span className="text-sm text-gray-700">{settings.opacity}%</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 bg-white border-2 border-gray-200">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
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
                </PopoverContent>
              </Popover>
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

              {/* One-time tip overlay */}
              {showTip && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                  <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl relative">
                    <button
                      onClick={handleDismissTip}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Dismiss tip"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-100 rounded-full p-2 flex-shrink-0">
                        <Hand className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Interactive Watermark</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {isMobile ? (
                            <>
                              Drag the watermark to position it • Pinch to resize • Rotate with two
                              fingers
                            </>
                          ) : (
                            <>
                              Drag the watermark to position it • Use the rotation buttons or drag
                              to rotate • Adjust size with the slider
                            </>
                          )}
                        </p>
                        <Button
                          onClick={handleDismissTip}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm"
                          size="sm"
                        >
                          Got it!
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
