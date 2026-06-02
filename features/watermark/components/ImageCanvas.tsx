'use client'

import React from 'react'
import { useEffect, useRef } from 'react'

interface ImageCanvasProps {
  canvas: HTMLCanvasElement
  onClick: () => void
  className?: string
  title?: string
  maxDisplayWidth?: number
}

export const ImageCanvas: React.FC<ImageCanvasProps> = React.memo(
  ({
    canvas,
    onClick,
    className = 'w-full h-auto rounded-lg shadow-sm max-h-48 sm:max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity',
    title = 'Click to view fullscreen',
    maxDisplayWidth = 300,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      const canvasElement = canvasRef.current
      if (!canvasElement || !canvas) return

      // Ensure source canvas has content
      if (canvas.width === 0 || canvas.height === 0) return

      const ctx = canvasElement.getContext('2d')
      if (!ctx) return

      // Set canvas dimensions
      canvasElement.width = canvas.width
      canvasElement.height = canvas.height

      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(canvas, 0, 0)

      // Set display size for responsive behavior
      const maxWidth = maxDisplayWidth
      const aspectRatio = canvas.height / canvas.width

      if (canvas.width > maxWidth) {
        canvasElement.style.width = `${maxWidth}px`
        canvasElement.style.height = `${maxWidth * aspectRatio}px`
      } else {
        canvasElement.style.width = `${canvas.width}px`
        canvasElement.style.height = `${canvas.height}px`
      }
    }, [canvas, maxDisplayWidth])

    return <canvas ref={canvasRef} onClick={onClick} className={className} title={title} />
  }
)

ImageCanvas.displayName = 'ImageCanvas'
