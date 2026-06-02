'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Eye, EyeOff, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common'
import { cn } from '@/lib/utils'
import type { ImageItem } from '@/features/watermark'

interface PreviewPaneProps {
  image: ImageItem | null
  showWatermark: boolean
  onToggleWatermark: () => void
  onFullscreen: () => void
  getPreviewCanvas: (item: ImageItem, watermarked: boolean) => HTMLCanvasElement | null
}

export function PreviewPane({
  image,
  showWatermark,
  onToggleWatermark,
  onFullscreen,
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
  }, [paintPreview, image?.canvas, image?.id])

  const imageLoaded = Boolean(image?.image?.naturalWidth)
  const canvasReady = Boolean(image?.canvas?.width)
  const ready = imageLoaded && (showWatermark ? canvasReady : true)

  if (!image) {
    return (
      <div className="flex flex-1 min-h-[280px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
        <p className="text-sm text-gray-500">Select an image below to preview</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate" title={image.file.name}>
            {image.file.name}
          </p>
          <p className="text-xs text-gray-500">
            {showWatermark ? 'With watermark' : 'Original'}
            {image.customSettings ? ' · Custom settings' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleWatermark}
            className={cn(!showWatermark && 'border-teal-300 bg-teal-50')}
          >
            {showWatermark ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Watermarked
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Original
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onFullscreen}
            disabled={!ready}
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-[#0f1419] min-h-[240px] sm:min-h-[360px] overflow-hidden">
        {!ready ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <LoadingSpinner size="lg" />
            <span className="text-sm">Rendering preview…</span>
          </div>
        ) : (
          <canvas
            ref={(node) => {
              canvasRef.current = node
              if (node) paintPreview()
            }}
            className="max-w-full max-h-[min(70vh,560px)] w-auto h-auto object-contain"
          />
        )}
      </div>
    </div>
  )
}
