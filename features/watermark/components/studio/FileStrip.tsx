'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImageItem } from '@/features/watermark'

interface FileStripProps {
  images: ImageItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onDownload: (item: ImageItem) => void
}

function useThumbUrl(item: ImageItem): string {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (item.image.naturalWidth > 0 && item.image.src) {
      setUrl(item.image.src)
      return
    }
    const objectUrl = URL.createObjectURL(item.file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [item])

  return url
}

function StripThumb({ item }: { item: ImageItem }) {
  const url = useThumbUrl(item)
  if (!url) {
    return <div className="w-full h-full bg-gray-200 animate-pulse" />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-full h-full object-cover" />
  )
}

export function FileStrip({ images, selectedId, onSelect, onRemove, onDownload }: FileStripProps) {
  if (images.length === 0) return null

  return (
    <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {images.map((item) => {
          const selected = item.id === selectedId
          return (
            <div
              key={item.id}
              className={cn(
                'group relative shrink-0 w-20 sm:w-24 rounded-lg border-2 overflow-hidden transition-all',
                selected
                  ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-md'
                  : 'border-gray-200 hover:border-teal-300'
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="block w-full aspect-square bg-gray-100"
              >
                <StripThumb item={item} />
              </button>
              {item.customSettings && (
                <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-teal-500" />
              )}
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 bg-white/90"
                  onClick={() => onDownload(item)}
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 bg-white/90"
                  onClick={() => onRemove(item.id)}
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {images.length} image{images.length !== 1 ? 's' : ''} · click a thumbnail to preview
      </p>
    </div>
  )
}
