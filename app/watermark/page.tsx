'use client'

import type React from 'react'
import { useState, useRef, useCallback, useMemo, Suspense, lazy, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import type { WatermarkSettings, ImageItem, PositionPreset } from '@/features/watermark'
import {
  DEFAULT_SETTINGS,
  ACCEPTED_FILE_TYPES,
  useWatermark,
  useImageUpload,
  createImageFromFile,
  downloadBlob,
  canvasToBlob,
} from '@/features/watermark'
import type { StylePreset } from '@/features/watermark/constants/style-presets'
import {
  StudioHeader,
  StudioSidebar,
  PreviewPane,
  FileStrip,
  EmptyStudio,
  MobileControlsSheet,
} from '@/features/watermark/components/studio'
import { FullscreenImageModal } from '@/features/watermark/components/editor'
import { useDebounce } from '@/hooks/useDebounce'
import { useIsMobile } from '@/hooks/use-mobile'
import { LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout'
import { FAQ } from '@/components/common'
import { WATERMARK_FAQ_DATA } from '@/data/faq/watermark'

const ImageSettingsModal = lazy(() => import('@/features/watermark/components/ImageSettingsModal'))

export default function WatermarkingTool() {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [previewShowWatermark, setPreviewShowWatermark] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { processFiles, isProcessing } = useImageUpload()
  const { analysisCanvasRef, processImage } = useWatermark(settings, watermarkImage)
  const debouncedSettings = useDebounce(settings, 300)

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) ?? images[0] ?? null,
    [images, selectedImageId]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (images.length === 0) {
      setSelectedImageId(null)
      return
    }
    if (!selectedImageId || !images.some((img) => img.id === selectedImageId)) {
      setSelectedImageId(images[0].id)
    }
  }, [images, selectedImageId])

  useEffect(() => {
    if (images.length === 0) return
    setImages((prev) =>
      prev.map((imageItem) => ({
        ...imageItem,
        canvas: processImage(imageItem, true),
      }))
    )
  }, [debouncedSettings, watermarkImage, images.length, processImage])

  const getPreviewCanvas = useCallback(
    (item: ImageItem, watermarked: boolean): HTMLCanvasElement | null => {
      if (!watermarked) return processImage(item, false)
      return item.canvas ?? processImage(item, true)
    },
    [processImage]
  )

  const closeFullscreen = useCallback(() => setFullscreenImage(null), [])

  useEffect(() => {
    if (!mounted) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (fullscreenImage) closeFullscreen()
        else if (editingImageId) setEditingImageId(null)
        else if (mobileSheetOpen) setMobileSheetOpen(false)
      }
    }
    if (fullscreenImage || editingImageId || mobileSheetOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [mounted, fullscreenImage, editingImageId, mobileSheetOpen, closeFullscreen])

  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const imageFiles = fileArray.filter((file) =>
        ACCEPTED_FILE_TYPES.includes(file.type as (typeof ACCEPTED_FILE_TYPES)[number])
      )
      if (imageFiles.length === 0) return

      const newImages = await processFiles(imageFiles)
      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages])
        setSelectedImageId(newImages[0].id)
        setPreviewShowWatermark(true)
      }
    },
    [processFiles]
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) handleFileUpload(Array.from(files))
      event.target.value = ''
    },
    [handleFileUpload]
  )

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
      if (e.dataTransfer.files) handleFileUpload(Array.from(e.dataTransfer.files))
    },
    [handleFileUpload]
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const downloadSingleImage = useCallback(
    async (imageItem: ImageItem) => {
      const canvas = imageItem.canvas ?? processImage(imageItem, true)
      try {
        const blob = await canvasToBlob(canvas)
        await downloadBlob(blob, `watermarked-${imageItem.file.name.split('.')[0]}.png`)
      } catch {
        /* failed */
      }
    },
    [processImage]
  )

  const downloadAllAsZip = useCallback(async () => {
    if (images.length === 0) return
    setIsDownloading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      await Promise.all(
        images.map(async (imageItem) => {
          const canvas = imageItem.canvas ?? processImage(imageItem, true)
          const blob = await canvasToBlob(canvas)
          zip.file(`watermarked-${imageItem.file.name.split('.')[0]}.png`, blob)
        })
      )
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      await downloadBlob(zipBlob, `imagemark-watermarked-${Date.now()}.zip`)
    } catch {
      /* failed */
    } finally {
      setIsDownloading(false)
    }
  }, [images, processImage])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setWatermarkImage(null)
  }, [])

  const updateSetting = useCallback(
    <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value }
        if (key === 'positionX' || key === 'positionY') {
          newSettings.positionPreset = 'custom'
        }
        if (key === 'type' && value === 'image') {
          newSettings.opacity = 100
        }
        return newSettings
      })
    },
    []
  )

  const handlePositionPresetSelect = useCallback((preset: PositionPreset) => {
    setSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
      rotation: 0,
    }))
  }, [])

  const handleApplyStylePreset = useCallback((preset: StylePreset) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
      text: preset.settings.text ?? prev.text,
    }))
  }, [])

  const handleWatermarkImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file)
      createImageFromFile(file)
        .then(setWatermarkImage)
        .catch(() => {})
  }, [])

  const openFullscreen = useCallback(() => {
    if (!selectedImage) return
    const canvas = getPreviewCanvas(selectedImage, previewShowWatermark)
    if (canvas) setFullscreenImage(canvas.toDataURL('image/png'))
  }, [selectedImage, previewShowWatermark, getPreviewCanvas])

  const handleImageSettingsSave = useCallback(
    (imageId: string, newSettings: WatermarkSettings) => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id !== imageId) return img
          const isGlobalSettings = JSON.stringify(newSettings) === JSON.stringify(settings)
          const updatedItem = {
            ...img,
            customSettings: isGlobalSettings ? undefined : newSettings,
          }
          updatedItem.canvas = processImage(updatedItem, true)
          return updatedItem
        })
      )
    },
    [settings, processImage]
  )

  const editingImage = useMemo(
    () => (editingImageId ? images.find((img) => img.id === editingImageId) : null),
    [editingImageId, images]
  )

  const sidebarProps = {
    settings,
    onUpdateSetting: updateSetting,
    onPositionPresetSelect: handlePositionPresetSelect,
    onWatermarkImageUpload: handleWatermarkImageUpload,
    onApplyStylePreset: handleApplyStylePreset,
    onResetSettings: resetSettings,
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <>
        <EmptyStudio
          dragActive={dragActive}
          isProcessing={isProcessing}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onChooseFiles={() => fileInputRef.current?.click()}
        />
        <section className="border-t border-gray-100 py-12 bg-gray-50/50">
          <div className="max-w-2xl mx-auto px-4">
            <FAQ items={WATERMARK_FAQ_DATA} maxItems={4} />
          </div>
        </section>
        <Footer />
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <canvas ref={analysisCanvasRef} className="hidden" />
      </>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-gray-50">
      <StudioHeader
        fileCount={images.length}
        isProcessing={isDownloading || isProcessing}
        onAddFiles={() => fileInputRef.current?.click()}
        onDownloadAll={downloadAllAsZip}
        onOpenControls={() => setMobileSheetOpen(true)}
        showMobileControls={isMobile}
      />

      <div className="flex flex-1 min-h-0">
        {!isMobile && (
          <StudioSidebar
            {...sidebarProps}
            className="hidden lg:flex w-[300px] xl:w-[320px] shrink-0"
          />
        )}

        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <div className="flex flex-1 flex-col p-4 sm:p-6 min-h-0">
            <div className="flex items-center justify-end gap-2 mb-2 lg:hidden">
              {selectedImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingImageId(selectedImage.id)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  This image only
                </Button>
              )}
            </div>
            <PreviewPane
              image={selectedImage}
              showWatermark={previewShowWatermark}
              onToggleWatermark={() => setPreviewShowWatermark((v) => !v)}
              onFullscreen={openFullscreen}
              getPreviewCanvas={getPreviewCanvas}
            />
            {selectedImage && !isMobile && (
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                  onClick={() => setEditingImageId(selectedImage.id)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Customize watermark for this image only
                </Button>
              </div>
            )}
          </div>

          <FileStrip
            images={images}
            selectedId={selectedImage?.id ?? null}
            onSelect={setSelectedImageId}
            onRemove={removeImage}
            onDownload={downloadSingleImage}
          />
        </div>
      </div>

      <MobileControlsSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        {...sidebarProps}
      />

      {editingImage && (
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <ImageSettingsModal
            imageItem={editingImage}
            globalSettings={settings}
            watermarkImage={watermarkImage}
            onClose={() => setEditingImageId(null)}
            onSave={(newSettings) => handleImageSettingsSave(editingImage.id, newSettings)}
          />
        </Suspense>
      )}

      <FullscreenImageModal imageUrl={fullscreenImage} onClose={closeFullscreen} />

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(',')}
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
      <canvas ref={analysisCanvasRef} className="hidden" />
    </div>
  )
}
