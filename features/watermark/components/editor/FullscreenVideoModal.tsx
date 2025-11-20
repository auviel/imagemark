'use client'

import type React from 'react'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FullscreenVideoModalProps {
  videoBlob: Promise<Blob> | null
  onClose: () => void
}

export function FullscreenVideoModal({ videoBlob, onClose }: FullscreenVideoModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!videoBlob) {
      setVideoUrl(null)
      return
    }

    let url: string | null = null

    videoBlob
      .then((blob) => {
        if (blob && blob.size > 0) {
          url = URL.createObjectURL(blob)
          setVideoUrl(url)
        }
      })
      .catch(() => {
        setVideoUrl(null)
      })

    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [videoBlob])

  if (!videoUrl) return null

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
        <video
          src={videoUrl}
          controls
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}
