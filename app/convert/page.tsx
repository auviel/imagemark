'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RefreshCw, Upload, Download, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Breadcrumbs } from '@/components/common'
import { Footer } from '@/components/layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProcessedImage {
  id: string
  originalFile: File
  originalUrl: string
  convertedUrl: string | null
  targetFormat: string
  status: 'idle' | 'processing' | 'completed' | 'error'
  errorMessage?: string
  originalSize?: number
  convertedSize?: number
}

const SUPPORTED_FORMATS = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos' },
  { value: 'png', label: 'PNG', description: 'Supports transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern web format' },
  { value: 'avif', label: 'AVIF', description: 'Best compression' },
  { value: 'gif', label: 'GIF', description: 'Animated images' },
] as const

export default function ConvertPage() {
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<ProcessedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    const newImages: ProcessedImage[] = files.map((file) => {
      const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const originalUrl = URL.createObjectURL(file)
      return {
        id,
        originalFile: file,
        originalUrl,
        convertedUrl: null,
        targetFormat: 'webp', // Default to WebP, user can change per image
        status: 'idle',
      }
    })

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  const processImage = useCallback(async (image: ProcessedImage) => {
    // Update status to processing
    setImages((prev) =>
      prev.map((img) => (img.id === image.id ? { ...img, status: 'processing' } : img))
    )

    try {
      const formData = new FormData()
      formData.append('image', image.originalFile)
      formData.append('format', image.targetFormat)

      const response = await fetch('/api/v1/image/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Format conversion failed')
      }

      const data = await response.json()

      if (!data.success || !data.data?.convertedImage) {
        throw new Error('Invalid response from server')
      }

      // Convert base64 data URL to Blob for proper file handling
      // This ensures macOS Finder can generate thumbnails correctly
      const base64Response = await fetch(data.data.convertedImage)
      const processedBlob = await base64Response.blob()

      // Create object URL from blob for proper MIME type handling
      const blobUrl = URL.createObjectURL(processedBlob)

      // Update with converted image
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                convertedUrl: blobUrl,
                status: 'completed',
                originalSize: data.data.originalSize,
                convertedSize: data.data.convertedSize,
              }
            : img
        )
      )
    } catch (error) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Processing failed',
              }
            : img
        )
      )
    }
  }, [])

  const handleFormatChange = useCallback((id: string, format: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, targetFormat: format, status: 'idle' } : img))
    )
  }, [])

  const handleProcessAll = useCallback(() => {
    images
      .filter((img) => img.status === 'idle' || img.status === 'error')
      .forEach((img) => processImage(img))
  }, [images, processImage])

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.originalUrl)
        if (image.convertedUrl && image.convertedUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.convertedUrl)
        }
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const handleDownload = useCallback((image: ProcessedImage) => {
    if (!image.convertedUrl) return

    // Fetch the blob URL to get the actual blob
    fetch(image.convertedUrl)
      .then((response) => response.blob())
      .then((blob) => {
        // Determine correct MIME type based on format
        const mimeTypes: Record<string, string> = {
          jpeg: 'image/jpeg',
          jpg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
          avif: 'image/avif',
          gif: 'image/gif',
        }

        const mimeType = mimeTypes[image.targetFormat] || blob.type || 'image/jpeg'

        // Create a new blob with the correct MIME type
        // This ensures macOS Finder recognizes the file type correctly
        const typedBlob = new Blob([blob], { type: mimeType })

        // Create object URL from typed blob
        const url = URL.createObjectURL(typedBlob)

        // Create download link
        const link = document.createElement('a')
        link.href = url
        const originalName = image.originalFile.name.replace(/\.[^/.]+$/, '')
        link.download = `${originalName}.${image.targetFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up object URL after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 100)
      })
      .catch((error) => {
        console.error('Download failed:', error)
      })
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const hasImages = images.length > 0
  const hasCompletedImages = images.some((img) => img.status === 'completed')
  const hasIdleImages = images.some((img) => img.status === 'idle' || img.status === 'error')

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs />
      </div>

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Convert Format</h1>
                <p className="text-gray-600 mt-1">
                  Convert images between formats (JPEG, PNG, WebP, AVIF, GIF)
                </p>
              </div>
            </div>

            {hasImages && (
              <div className="flex items-center space-x-2">
                {hasIdleImages && (
                  <Button
                    onClick={handleProcessAll}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Convert All
                  </Button>
                )}
                {hasCompletedImages && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      images
                        .filter((img) => img.status === 'completed')
                        .forEach((img) => handleDownload(img))
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        {!hasImages && (
          <div className="max-w-2xl mx-auto">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer ${
                dragActive
                  ? 'border-teal-400 bg-teal-50'
                  : isProcessing
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <p className="text-gray-600">Processing your images...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-teal-600" />
                  </div>
                  <Button
                    size="lg"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold mb-4"
                  >
                    Choose Images
                  </Button>
                  <p className="text-gray-500 text-center">
                    or drag and drop • JPG, PNG, GIF, WebP, AVIF • Up to 10MB per image
                  </p>
                  <p className="text-gray-400 text-sm mt-2 text-center">
                    Convert to modern formats for better performance
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Multiple Formats</h3>
                <p className="text-sm text-gray-600">
                  Convert between JPEG, PNG, WebP, AVIF, and GIF formats
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Optimized Output</h3>
                <p className="text-sm text-gray-600">
                  Get smaller file sizes with modern formats like WebP and AVIF
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Fast Processing</h3>
                <p className="text-sm text-gray-600">
                  Convert images in seconds with high-quality results
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Grid */}
        {hasImages && (
          <div>
            {/* Upload More */}
            <div
              className={`mb-6 border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                dragActive
                  ? 'border-teal-400 bg-teal-50'
                  : isProcessing
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Drop more images or click to upload</span>
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-square bg-gray-100">
                    {image.status === 'processing' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <LoadingSpinner size="md" className="mb-2" />
                          <p className="text-sm text-gray-600">Processing...</p>
                        </div>
                      </div>
                    ) : image.status === 'error' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                        <div className="text-center">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-600">{image.errorMessage}</p>
                        </div>
                      </div>
                    ) : image.convertedUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={image.convertedUrl}
                          alt="Converted"
                          className="w-full h-full object-contain"
                          onClick={() => setPreviewImage(image)}
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={image.originalUrl}
                          alt="Original"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Info & Actions */}
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 truncate mb-3">
                      {image.originalFile.name}
                    </p>

                    {/* Format Selector */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-1 block">Convert to:</label>
                      <Select
                        value={image.targetFormat}
                        onValueChange={(value) => handleFormatChange(image.id, value)}
                        disabled={image.status === 'processing'}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Size Info */}
                    {image.status === 'completed' && image.originalSize && image.convertedSize && (
                      <div className="text-xs text-gray-600 mb-3">
                        <div>Original: {(image.originalSize / 1024).toFixed(1)} KB</div>
                        <div>Converted: {(image.convertedSize / 1024).toFixed(1)} KB</div>
                        {image.originalSize > image.convertedSize && (
                          <div className="text-green-600 font-medium">
                            Saved:{' '}
                            {(
                              ((image.originalSize - image.convertedSize) / image.originalSize) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      {image.status === 'idle' && (
                        <Button
                          size="sm"
                          onClick={() => processImage(image)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Convert
                        </Button>
                      )}

                      {image.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(image)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}

                      {image.status === 'error' && (
                        <Button size="sm" onClick={() => processImage(image)} variant="outline">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(image.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Error Message */}
                    {image.status === 'error' && image.errorMessage && (
                      <p className="text-xs text-red-500 mt-2">{image.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </Button>
            {previewImage.convertedUrl && (
              <img
                src={previewImage.convertedUrl}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
