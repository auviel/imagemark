'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Film, ArrowLeft, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Breadcrumbs } from '@/components/common'
import {
  VideoUploader,
  VideoProcessingCard,
  VideoPreviewModal,
  VideoWatermarkSettings,
  DEFAULT_SETTINGS,
  createVideoItem,
  processVideo,
} from '@/features/watermark'
import { Footer } from '@/components/layout'
import type { VideoItem, VideoProcessingOptions } from '@/types/video'
import type { WatermarkSettings } from '@/features/watermark'

export default function VideosPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [processingOptions, setProcessingOptions] = useState<VideoProcessingOptions>({
    watermarkSettings: DEFAULT_SETTINGS,
    outputFormat: 'mp4',
    quality: 'high',
    frameRate: 30,
    resolution: {
      width: 1280,
      height: 720,
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleVideosSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true)

    try {
      const videoPromises = files.map(createVideoItem)
      const newVideos = await Promise.all(videoPromises)

      setVideos((prev) => [...prev, ...newVideos])
    } catch {
      // Error processing videos
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== id))
  }, [])

  const handleDownloadVideo = useCallback(
    (id: string) => {
      const video = videos.find((v) => v.id === id)
      if (!video || !video.outputUrl) return

      const link = document.createElement('a')
      link.href = video.outputUrl
      link.download = `watermarked-${video.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [videos]
  )

  const handleProcessVideo = useCallback(
    async (id: string) => {
      const videoIndex = videos.findIndex((v) => v.id === id)
      if (videoIndex === -1) return

      const video = videos[videoIndex]

      // Update status to processing
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'processing' } : v)))

      try {
        // Get the appropriate watermark settings
        const settings = video.customSettings || watermarkSettings

        // Process the video
        const outputUrl = await processVideo(video, settings, processingOptions, (progress) => {
          // Update progress
          setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, progress } : v)))
        })

        // Update with completed status and output URL
        setVideos((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, status: 'completed', outputUrl, progress: 100 } : v
          )
        )
      } catch {
        // Update with error status
        setVideos((prev) =>
          prev.map((v) =>
            v.id === id ? { ...v, status: 'error', errorMessage: 'Processing failed' } : v
          )
        )
      }
    },
    [videos, watermarkSettings, processingOptions]
  )

  const handleProcessAll = useCallback(() => {
    videos
      .filter((v) => v.status === 'idle' || v.status === 'error')
      .forEach((v) => handleProcessVideo(v.id))
  }, [videos, handleProcessVideo])

  const handleSaveSettings = useCallback(
    (id: string, newSettings: WatermarkSettings, newOptions: VideoProcessingOptions) => {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                customSettings:
                  JSON.stringify(newSettings) === JSON.stringify(watermarkSettings)
                    ? undefined
                    : newSettings,
              }
            : v
        )
      )

      // If this is the first video, also update the global settings
      if (videos.length === 1) {
        setWatermarkSettings(newSettings)
        setProcessingOptions(newOptions)
      }
    },
    [videos, watermarkSettings]
  )

  const previewVideo = videos.find((v) => v.id === previewVideoId)
  const editingVideo = videos.find((v) => v.id === editingVideoId)

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs />
      </div>

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Film className="w-6 h-6 text-teal-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Video Watermarking</h1>
            </div>
          </div>

          {videos.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleProcessAll}
                disabled={videos.every(
                  (v) => v.status === 'completed' || v.status === 'processing'
                )}
                className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Process All</span>
              </Button>
              <Button
                onClick={() => {
                  // Download all completed videos as ZIP
                }}
                disabled={!videos.some((v) => v.status === 'completed')}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm px-3 sm:px-6 h-8 sm:h-9"
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Download All</span>
                <span className="sm:hidden">ZIP</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {videos.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Add Watermarks to Videos
              </h1>
              <p className="text-gray-600">
                Upload your videos and apply custom watermarks. Supports MP4, WebM, MOV, AVI, and
                MKV formats.
              </p>
            </div>

            <VideoUploader
              onVideosSelected={handleVideosSelected}
              isProcessing={isProcessing}
              className="mb-8"
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <VideoUploader
                onVideosSelected={handleVideosSelected}
                isProcessing={isProcessing}
                maxFiles={10}
                className="mb-4"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {videos.map((video) => (
                <VideoProcessingCard
                  key={video.id}
                  video={video}
                  onRemove={handleRemoveVideo}
                  onDownload={handleDownloadVideo}
                  onSettings={(id) => setEditingVideoId(id)}
                  onPreview={(id) => setPreviewVideoId(id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Video Preview Modal */}
        {previewVideo && (
          <VideoPreviewModal
            video={previewVideo}
            onClose={() => setPreviewVideoId(null)}
            onDownload={handleDownloadVideo}
          />
        )}

        {/* Video Settings Modal */}
        {editingVideo && (
          <VideoWatermarkSettings
            video={editingVideo}
            globalSettings={watermarkSettings}
            processingOptions={processingOptions}
            onClose={() => setEditingVideoId(null)}
            onSave={handleSaveSettings}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}
