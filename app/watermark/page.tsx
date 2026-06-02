'use client'

import type React from 'react'
import { useState, useRef, useCallback, useMemo, Suspense, lazy, useEffect } from 'react'
import type { WatermarkSettings, ImageItem, PositionPreset } from '@/features/watermark'
import {
  DEFAULT_SETTINGS,
  ACCEPTED_FILE_TYPES,
  useWatermark,
  useImageUpload,
  createWatermarkFromFile,
  downloadBlob,
  exportWatermarkedBlob,
  closeImageBitmap,
  resolveExportFormat,
  type ExportFormatPreference,
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

const FullscreenImageModal = lazy(() =>
  import('@/features/watermark/components/editor/FullscreenImageModal').then((m) => ({
    default: m.FullscreenImageModal,
  }))
)
import { useDebounce } from '@/hooks/useDebounce'
import { useIsMobile } from '@/hooks/use-mobile'
import { LoadingSpinner } from '@/components/common'
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
  const [watermarkImage, setWatermarkImage] = useState<ImageBitmap | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [exportFormat, setExportFormat] = useState<ExportFormatPreference>('auto')
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<ImageItem[]>([])
  imagesRef.current = images

  const { processFiles, isProcessing } = useImageUpload()
  const { processImage } = useWatermark(settings, watermarkImage)
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

  /** Preview: selected image only (debounced). Caches watermarked + original canvases. */
  useEffect(() => {
    if (!selectedImageId) return
    let cancelled = false

    void (async () => {
      const selected = imagesRef.current.find((item) => item.id === selectedImageId)
      if (!selected || selected.image.width === 0) return

      try {
        const previewOriginalCanvas = await processImage(selected, false, 'preview')
        if (cancelled) return
        const canvas = await processImage({ ...selected, previewOriginalCanvas }, true, 'preview')
        if (cancelled) return
        setImages((prev) =>
          prev.map((imageItem) =>
            imageItem.id === selectedImageId
              ? { ...imageItem, canvas, previewOriginalCanvas }
              : imageItem
          )
        )
      } catch {
        /* preview failed — avoid infinite spinner */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debouncedSettings, watermarkImage, selectedImageId, processImage])

  const getPreviewCanvas = useCallback(
    (item: ImageItem, watermarked: boolean): HTMLCanvasElement | null => {
      if (!watermarked) return item.previewOriginalCanvas ?? null
      return item.canvas ?? null
    },
    []
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
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id)
      closeImageBitmap(removed?.image)
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const downloadSingleImage = useCallback(
    async (imageItem: ImageItem) => {
      try {
        const format = resolveExportFormat(imageItem.file.type, exportFormat)
        const base = imageItem.file.name.replace(/\.[^.]+$/, '')
        const blob = await exportWatermarkedBlob(imageItem, settings, watermarkImage, format)
        await downloadBlob(blob, `watermarked-${base}.${format.extension}`)
      } catch {
        /* failed */
      }
    },
    [settings, watermarkImage, exportFormat]
  )

  const handleDownload = useCallback(async () => {
    if (images.length === 0) return
    setIsDownloading(true)
    try {
      if (images.length === 1) {
        await downloadSingleImage(images[0])
        return
      }

      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      for (const imageItem of images) {
        const format = resolveExportFormat(imageItem.file.type, exportFormat)
        const base = imageItem.file.name.replace(/\.[^.]+$/, '')
        const blob = await exportWatermarkedBlob(imageItem, settings, watermarkImage, format)
        zip.file(`watermarked-${base}.${format.extension}`, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      await downloadBlob(zipBlob, `imagemark-watermarked-${Date.now()}.zip`)
    } catch {
      /* failed */
    } finally {
      setIsDownloading(false)
    }
  }, [images, settings, watermarkImage, exportFormat, downloadSingleImage])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setWatermarkImage((prev) => {
      closeImageBitmap(prev)
      return null
    })
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
    if (!file) return
    createWatermarkFromFile(file)
      .then((bitmap) => {
        setWatermarkImage((prev) => {
          closeImageBitmap(prev)
          return bitmap
        })
      })
      .catch(() => {})
    e.target.value = ''
  }, [])

  const openFullscreen = useCallback(() => {
    if (!selectedImage) return
    const canvas = getPreviewCanvas(selectedImage, previewShowWatermark)
    if (canvas) setFullscreenImage(canvas.toDataURL('image/png'))
  }, [selectedImage, previewShowWatermark, getPreviewCanvas])

  const handleImageSettingsSave = useCallback(
    (imageId: string, newSettings: WatermarkSettings) => {
      void (async () => {
        const target = images.find((img) => img.id === imageId)
        if (!target) return
        const isGlobalSettings = JSON.stringify(newSettings) === JSON.stringify(settings)
        const updatedItem: ImageItem = {
          ...target,
          customSettings: isGlobalSettings ? undefined : newSettings,
        }
        const [canvas, previewOriginalCanvas] = await Promise.all([
          processImage(updatedItem, true, 'preview'),
          processImage(updatedItem, false, 'preview'),
        ])
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...updatedItem, canvas, previewOriginalCanvas } : img
          )
        )
      })()
    },
    [images, settings, processImage]
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
        <section className="border-t border-gray-100 bg-gray-50/50 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:max-w-5xl lg:px-8">
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
      </>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-gray-100">
      <StudioHeader
        fileCount={images.length}
        isProcessing={isDownloading || isProcessing}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onDownload={handleDownload}
        onOpenControls={() => setMobileSheetOpen(true)}
        showMobileControls={isMobile}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!isMobile && (
          <StudioSidebar
            {...sidebarProps}
            compact
            className="hidden lg:flex w-[220px] xl:w-[236px]"
          />
        )}

        <div className="flex flex-1 flex-col min-w-0 min-h-0 gap-2 p-2 lg:p-3 overflow-hidden">
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <PreviewPane
              image={selectedImage}
              showWatermark={previewShowWatermark}
              onToggleWatermark={() => setPreviewShowWatermark((v) => !v)}
              onFullscreen={openFullscreen}
              onCustomizeImage={
                selectedImage ? () => setEditingImageId(selectedImage.id) : undefined
              }
              getPreviewCanvas={getPreviewCanvas}
            />
          </div>

          <FileStrip
            compact
            images={images}
            selectedId={selectedImage?.id ?? null}
            onSelect={setSelectedImageId}
            onRemove={removeImage}
            onDownload={downloadSingleImage}
            onAddFiles={() => fileInputRef.current?.click()}
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

      {fullscreenImage && (
        <Suspense fallback={null}>
          <FullscreenImageModal imageUrl={fullscreenImage} onClose={closeFullscreen} />
        </Suspense>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES.join(',')}
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
