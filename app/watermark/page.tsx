'use client'

import type React from 'react'
import { useState, useRef, useCallback, useMemo, Suspense, lazy, useEffect } from 'react'
import { Shield, Zap, Download, Image as ImageIcon } from 'lucide-react'
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
import {
  UploadArea,
  ImageGrid,
  SettingsPanel,
  FullscreenImageModal,
} from '@/features/watermark/components/editor'
import { useDebounce } from '@/hooks/useDebounce'
import { UnifiedToolbar, FeaturePageLayout } from '@/components/layout'
import { LoadingSpinner } from '@/components/common'
import { WATERMARK_FAQ_DATA } from '@/data/faq/watermark'

const ImageSettingsModal = lazy(() => import('@/features/watermark/components/ImageSettingsModal'))

export default function WatermarkingTool() {
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [showPositionPresets, setShowPositionPresets] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { processFiles, isProcessing } = useImageUpload()
  const { analysisCanvasRef, processImage } = useWatermark(settings, watermarkImage)

  const debouncedSettings = useDebounce(settings, 300)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (images.length === 0) return
    setImages((prev) =>
      prev.map((imageItem) => ({
        ...imageItem,
        canvas: processImage(imageItem),
      }))
    )
  }, [debouncedSettings, watermarkImage, images.length, processImage])

  const closeFullscreen = useCallback(() => {
    setFullscreenImage(null)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (fullscreenImage) closeFullscreen()
        else if (editingImageId) setEditingImageId(null)
      }
    }

    if (fullscreenImage || editingImageId) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [mounted, fullscreenImage, editingImageId, closeFullscreen])

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
      }
    },
    [processFiles]
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) handleFileUpload(Array.from(files))
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

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
  }, [])

  const downloadSingleImage = useCallback(async (imageItem: ImageItem) => {
    if (!imageItem.canvas) return
    try {
      const blob = await canvasToBlob(imageItem.canvas)
      const filename = `watermarked-${imageItem.file.name.split('.')[0]}.png`
      await downloadBlob(blob, filename)
    } catch {
      /* download failed */
    }
  }, [])

  const downloadAllAsZip = useCallback(async () => {
    if (images.length === 0) return

    setIsDownloading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()

      await Promise.all(
        images.map(async (imageItem) => {
          if (!imageItem.canvas) return
          const blob = await canvasToBlob(imageItem.canvas)
          zip.file(`watermarked-${imageItem.file.name.split('.')[0]}.png`, blob)
        })
      )

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      await downloadBlob(zipBlob, `imagemark-watermarked-${Date.now()}.zip`)
    } catch {
      /* zip failed */
    } finally {
      setIsDownloading(false)
    }
  }, [images])

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

  const handleWatermarkImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      createImageFromFile(file)
        .then(setWatermarkImage)
        .catch(() => {})
    }
  }, [])

  const openFullscreen = useCallback((canvas: HTMLCanvasElement) => {
    setFullscreenImage(canvas.toDataURL('image/png'))
  }, [])

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
          updatedItem.canvas = processImage(updatedItem)
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

  const togglePositionPresets = useCallback(() => {
    setShowPositionPresets((prev) => {
      if (!prev) setShowAdvancedSettings(false)
      return !prev
    })
  }, [])

  const toggleAdvancedSettings = useCallback(() => {
    setShowAdvancedSettings((prev) => {
      if (!prev) setShowPositionPresets(false)
      return !prev
    })
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (images.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedToolbar
          onUpload={() => fileInputRef.current?.click()}
          onDownload={downloadAllAsZip}
          onSettings={toggleSettings}
          onAddMore={() => fileInputRef.current?.click()}
          fileCount={images.length}
          isProcessing={isDownloading || isProcessing}
        />

        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          {showSettings && (
            <SettingsPanel
              settings={settings}
              showPositionPresets={showPositionPresets}
              showAdvancedSettings={showAdvancedSettings}
              onUpdateSetting={updateSetting}
              onPositionPresetSelect={handlePositionPresetSelect}
              onWatermarkImageUpload={handleWatermarkImageUpload}
              onTogglePositionPresets={togglePositionPresets}
              onToggleAdvancedSettings={toggleAdvancedSettings}
              onResetSettings={resetSettings}
            />
          )}

          <ImageGrid
            images={images}
            onRemove={removeImage}
            onEdit={setEditingImageId}
            onDownload={downloadSingleImage}
            onFullscreen={openFullscreen}
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
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <canvas ref={analysisCanvasRef} style={{ display: 'none' }} />
      </div>
    )
  }

  return (
    <FeaturePageLayout
      icon={ImageIcon}
      title="Watermark your images"
      description="Add text or a logo watermark. Everything runs in your browser — your files never leave your device."
      iconColor="teal"
      features={[
        { icon: Zap, title: 'Fast', description: 'Watermark many images at once' },
        { icon: Shield, title: '100% Private', description: 'Files never leave your browser' },
        { icon: Download, title: 'Always Free', description: 'No limits, no subscriptions' },
      ]}
      faqItems={WATERMARK_FAQ_DATA}
      faqShowAll={false}
      faqMaxItems={4}
    >
      <div className="max-w-4xl mx-auto">
        <UploadArea
          dragActive={dragActive}
          isProcessing={isProcessing}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onFileSelect={handleInputChange}
          fileInputRef={fileInputRef}
        />
      </div>

      <canvas ref={analysisCanvasRef} style={{ display: 'none' }} />
    </FeaturePageLayout>
  )
}
