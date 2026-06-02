'use client'

import { useLayoutEffect, useRef } from 'react'
import { X, Download, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImageItem } from '@/features/watermark'

interface FileStripProps {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onDownload: (item: ImageItem) => void
  onAddFiles?: () => void
  compact?: boolean
}

const THUMB_MAX_EDGE = 128

function paintBitmapThumb(canvas: HTMLCanvasElement, bitmap: ImageBitmap): boolean {
  if (!bitmap.width || !bitmap.height) return false
  const scale = Math.min(THUMB_MAX_EDGE / bitmap.width, THUMB_MAX_EDGE / bitmap.height, 1)
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  return true
}

function StripThumb({ item }: { item: ImageItem }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      paintBitmapThumb(canvas, item.image)
    } catch {
      /* invalid or closed bitmap */
    }
  }, [item.image, item.id])

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full min-h-0 min-w-0 object-cover"
      aria-hidden
    />
  )
}

export function FileStrip({
  images,
  selectedId,
  onSelect,
  onRemove,
  onDownload,
  onAddFiles,
  compact,
}: FileStripProps) {
  if (images.length === 0) return null

  const thumbClass = compact ? 'w-[4.5rem] h-[4.5rem]' : 'w-20 sm:w-24'

  return (
    <div
      className={cn(
        'shrink-0 border-t border-gray-200 bg-white shadow-[0_-1px_0_0_rgba(0,0,0,0.05)]',
        compact ? 'px-3 py-2.5 min-h-[5.75rem]' : 'px-4 py-3'
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        {compact && (
          <span className="text-[11px] font-medium text-gray-500 shrink-0 pr-0.5 tabular-nums">
            {images.length}
          </span>
        )}
        {images.map((item) => {
          const selected = item.id === selectedId
          return (
            <div
              key={item.id}
              className={cn(
                'group relative shrink-0 rounded-md border-2 overflow-hidden transition-all',
                thumbClass,
                selected
                  ? 'border-teal-500 ring-1 ring-teal-500/40'
                  : 'border-gray-200 hover:border-teal-300'
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="block w-full h-full bg-gray-100"
              >
                <StripThumb item={item} />
              </button>
              {item.customSettings && (
                <span className="absolute top-0.5 left-0.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
              )}
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onDownload(item)}
                  className="h-6 w-6 flex items-center justify-center rounded bg-white/95 shadow-sm"
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="h-6 w-6 flex items-center justify-center rounded bg-white/95 shadow-sm"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
        {onAddFiles && (
          <button
            type="button"
            onClick={onAddFiles}
            title="Add images"
            aria-label="Add images"
            className={cn(
              'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border-2 border-dashed border-gray-300 text-gray-500 transition-colors',
              'hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-600',
              thumbClass
            )}
          >
            <Plus className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
            {!compact && <span className="text-[10px] font-medium">Add</span>}
          </button>
        )}
      </div>
      {!compact && (
        <p className="text-xs text-gray-500 mt-2">
          {images.length} image{images.length !== 1 ? 's' : ''} · click a thumbnail to preview
        </p>
      )}
    </div>
  )
}
