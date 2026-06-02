'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Eye, EyeOff, Maximize2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common'
import { cn } from '@/lib/utils'
import type { ImageItem } from '@/features/watermark'

interface PreviewPaneProps {
  image: ImageItem | null
  showWatermark: boolean
  onToggleWatermark: () => void
  onFullscreen: () => void
  onCustomizeImage?: () => void
  getPreviewCanvas: (item: ImageItem, watermarked: boolean) => HTMLCanvasElement | null
}

export function PreviewPane({
  image,
  showWatermark,
  onToggleWatermark,
  onFullscreen,
  onCustomizeImage,
  getPreviewCanvas,
}: PreviewPaneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const paintPreview = useCallback(() => {
    const el = canvasRef.current
    if (!el || !image) return

    const source = getPreviewCanvas(image, showWatermark)
    if (!source || source.width === 0 || source.height === 0) return

    el.width = source.width
    el.height = source.height
    const ctx = el.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, source.width, source.height)
    ctx.drawImage(source, 0, 0)
  }, [image, showWatermark, getPreviewCanvas])

  useEffect(() => {
    paintPreview()
  }, [paintPreview, image?.canvas, image?.previewOriginalCanvas, image?.id, showWatermark])

  const imageLoaded = Boolean(image?.image?.width)
  const watermarkedReady = Boolean(image?.canvas?.width)
  const originalReady = Boolean(image?.previewOriginalCanvas?.width || image?.canvas?.width)
  const ready = imageLoaded && (showWatermark ? watermarkedReady : originalReady)

  if (!image) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80">
        <p className="text-xs text-gray-500">Select an image below</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 min-h-0 min-w-0 rounded-lg border border-gray-200 bg-[#0f1419] overflow-hidden">
      {!ready ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
          <LoadingSpinner size="md" />
          <span className="text-xs">Rendering…</span>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 items-center justify-center">
          <canvas
            ref={(node) => {
              canvasRef.current = node
              if (node) paintPreview()
            }}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
        </div>
      )}

      {/* Filename — top-left on panel */}
      <div className="absolute top-2 left-2 max-w-[calc(100%-5rem)] rounded-md bg-black/55 px-2 py-1 backdrop-blur-sm pointer-events-none">
        <p className="text-[11px] font-medium text-white truncate" title={image.file.name}>
          {image.file.name}
        </p>
        <p className="text-[10px] text-white/70 truncate">
          {showWatermark ? 'Watermarked' : 'Original'}
          {image.customSettings ? ' · Custom' : ''}
        </p>
      </div>

      {/* Actions — top-right on panel */}
      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/55 p-1 backdrop-blur-sm">
        {onCustomizeImage && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20 hover:text-white"
            onClick={onCustomizeImage}
            title="Customize this image only"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 text-white hover:bg-white/20 hover:text-white',
            !showWatermark && 'bg-teal-600/80 hover:bg-teal-600/90'
          )}
          onClick={onToggleWatermark}
          title={showWatermark ? 'Show original' : 'Show watermarked'}
        >
          {showWatermark ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20 hover:text-white disabled:opacity-40"
          onClick={onFullscreen}
          disabled={!ready}
          title="Fullscreen"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
