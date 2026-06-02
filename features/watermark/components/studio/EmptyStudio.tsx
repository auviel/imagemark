'use client'

import type React from 'react'
import { Upload, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common'
import { PrivacyBadge } from './PrivacyBadge'

interface EmptyStudioProps {
  dragActive: boolean
  isProcessing: boolean
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onChooseFiles: () => void
}

export function EmptyStudio({
  dragActive,
  isProcessing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onChooseFiles,
}: EmptyStudioProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <PrivacyBadge />
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-gray-900 text-center tracking-tight">
          Watermark your images
        </h1>
        <p className="mt-3 max-w-md text-center text-gray-600">
          Drop photos here, set your mark, download. Free, unlimited, and nothing leaves your
          device.
        </p>

        <div
          className={`mt-10 w-full max-w-xl rounded-2xl border-2 border-dashed p-10 sm:p-14 transition-colors ${
            dragActive
              ? 'border-teal-400 bg-teal-50'
              : isProcessing
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-teal-300'
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <LoadingSpinner size="lg" className="mb-3" />
              <p className="text-sm text-gray-600">Loading images…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100">
                <Upload className="h-7 w-7 text-teal-600" />
              </div>
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={onChooseFiles}
              >
                Choose images
              </Button>
              <p className="mt-4 text-sm text-gray-500">or drag and drop · JPEG, PNG, WebP, GIF…</p>
            </div>
          )}
        </div>

        <div className="mt-12 grid w-full max-w-lg grid-cols-3 gap-6 text-center">
          <div>
            <Shield className="mx-auto h-5 w-5 text-teal-600 mb-2" />
            <p className="text-xs font-medium text-gray-900">Private</p>
            <p className="text-xs text-gray-500 mt-0.5">Local only</p>
          </div>
          <div>
            <Zap className="mx-auto h-5 w-5 text-teal-600 mb-2" />
            <p className="text-xs font-medium text-gray-900">Batch</p>
            <p className="text-xs text-gray-500 mt-0.5">Many at once</p>
          </div>
          <div>
            <Upload className="mx-auto h-5 w-5 text-teal-600 mb-2" />
            <p className="text-xs font-medium text-gray-900">Free</p>
            <p className="text-xs text-gray-500 mt-0.5">No account</p>
          </div>
        </div>
      </div>
    </div>
  )
}
