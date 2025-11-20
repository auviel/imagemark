'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Play, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/common'

interface VideoCanvasProps {
  canvas: Promise<Blob>
  onClick: () => void
  className?: string
  title?: string
}

export const VideoCanvas: React.FC<VideoCanvasProps> = React.memo(
  ({
    canvas,
    onClick,
    className = 'w-full h-auto rounded-lg shadow-sm max-h-48 sm:max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity relative',
    title = 'Click to view fullscreen',
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      let isMounted = true
      let objectUrl: string | null = null

      const loadVideo = async () => {
        try {
          setIsLoading(true)
          setError(null)

          const blob = await canvas

          if (!isMounted) return

          // Validate blob
          if (!blob || blob.size === 0) {
            throw new Error('Invalid video blob')
          }

          objectUrl = URL.createObjectURL(blob)
          setVideoUrl(objectUrl)
        } catch {
          if (isMounted) {
            setError('Failed to load video')
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }

      loadVideo()

      // Cleanup function
      return () => {
        isMounted = false
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }
      }
    }, [canvas])

    const handleClick = () => {
      if (!isLoading && !error && videoUrl) {
        onClick()
      }
    }

    if (isLoading) {
      return (
        <div className={`${className} bg-gray-100 rounded-lg`}>
          <div className="w-full h-48 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="md" className="mb-2" />
              <span className="text-sm text-gray-500">Processing video...</span>
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className={`${className} bg-gray-100`}>
          <div className="w-full h-48 flex items-center justify-center">
            <div className="text-center text-red-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={className} onClick={handleClick} title={title}>
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover rounded-lg"
              muted
              playsInline
              preload="metadata"
              onError={() => setError('Video playback error')}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                <Play className="w-6 h-6 text-gray-800 ml-1" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No video available</span>
          </div>
        )}
      </div>
    )
  }
)

VideoCanvas.displayName = 'VideoCanvas'
