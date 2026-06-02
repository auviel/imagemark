'use client'

import type React from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common'
import { ACCEPTED_FILE_TYPES } from '@/features/watermark'

interface UploadAreaProps {
  dragActive: boolean
  isProcessing: boolean
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function UploadArea({
  dragActive,
  isProcessing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  fileInputRef,
}: UploadAreaProps) {
  return (
    <div className="mb-16">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-teal-400 bg-teal-50'
            : isProcessing
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          onChange={onFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-600">Loading your images…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Drag images here or click to choose files. JPEG, PNG, WebP, GIF, and more — processed
              privately in your browser.
            </p>
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose images
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
