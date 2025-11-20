'use client'

import type React from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface FullscreenImageModalProps {
  imageUrl: string | null
  onClose: () => void
}

export function FullscreenImageModal({ imageUrl, onClose }: FullscreenImageModalProps) {
  if (!imageUrl) return null

  // Check if URL is a blob or data URL (can't be optimized)
  const isBlobOrDataUrl = imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
          title="Close fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
          {isBlobOrDataUrl ? (
            <img
              src={imageUrl}
              alt="Fullscreen preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              src={imageUrl}
              alt="Fullscreen preview"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
              priority
              sizes="90vw"
            />
          )}
        </div>
      </div>
    </div>
  )
}
