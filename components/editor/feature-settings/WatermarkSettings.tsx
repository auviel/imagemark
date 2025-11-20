/**
 * Watermark Feature Settings Component
 *
 * Shows applied watermarks as pills with edit/delete actions.
 */

'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Type, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEFAULT_SETTINGS } from '@/features/watermark/constants'
import type { WatermarkSettings } from '@/features/watermark/types'
import { WatermarkPreviewModal } from '../WatermarkPreviewModal'
import type { EditorImage } from '@/lib/editor/types'

interface WatermarkSettingsProps {
  /** Callback when settings are applied (for new watermarks) */
  onApply: (settings: WatermarkSettings, watermarkImage: HTMLImageElement | null) => void
  /** Callback when watermark is updated (for editing existing watermarks) */
  onUpdate: (
    watermarkId: string,
    settings: WatermarkSettings,
    watermarkImage: HTMLImageElement | null
  ) => void
  /** Callback when watermark is removed */
  onRemove: (watermarkId: string) => void
  /** Whether processing is in progress */
  isProcessing?: boolean
  /** Preview image URL (from first uploaded image) */
  previewImageUrl?: string
  /** Current images in editor */
  images: EditorImage[]
}

interface AppliedWatermark {
  id: string
  settings: WatermarkSettings
  watermarkImage: HTMLImageElement | null
  appliedToImages: string[]
  featureOrder: number
}

export function WatermarkSettings({
  onApply,
  onUpdate,
  onRemove,
  isProcessing = false,
  previewImageUrl,
  images,
}: WatermarkSettingsProps) {
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [editingWatermark, setEditingWatermark] = useState<AppliedWatermark | null>(null)
  const [currentSettings, setCurrentSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [currentWatermarkImage, setCurrentWatermarkImage] = useState<HTMLImageElement | null>(null)

  // Extract all applied watermarks from images
  // Each watermark instance gets a unique ID based on image ID + feature order
  const appliedWatermarks = useMemo(() => {
    const watermarkMap = new Map<string, AppliedWatermark>()

    images.forEach((image) => {
      // Find all watermark features for this image (there can be multiple)
      const watermarkFeatures = image.appliedFeatures.filter((f) => f.featureId === 'watermark')

      watermarkFeatures.forEach((watermarkFeature) => {
        const settings = watermarkFeature.settings.watermarkSettings as WatermarkSettings
        const watermarkImage = watermarkFeature.settings.watermarkImage as HTMLImageElement | null

        // Create a unique ID for this watermark instance: imageId + order
        // Use a separator that won't appear in image IDs
        const watermarkId = `${image.id}::${watermarkFeature.order}`

        if (!watermarkMap.has(watermarkId)) {
          watermarkMap.set(watermarkId, {
            id: watermarkId,
            settings,
            watermarkImage,
            appliedToImages: [],
            featureOrder: watermarkFeature.order,
          })
        }

        watermarkMap.get(watermarkId)!.appliedToImages.push(image.id)
      })
    })

    return Array.from(watermarkMap.values())
  }, [images])

  const handleAddNew = () => {
    setEditingWatermark(null)
    setCurrentSettings(DEFAULT_SETTINGS)
    setCurrentWatermarkImage(null)
    setPreviewModalOpen(true)
  }

  const handleEdit = (watermark: AppliedWatermark) => {
    setEditingWatermark(watermark)
    setCurrentSettings(watermark.settings)
    setCurrentWatermarkImage(watermark.watermarkImage)
    setPreviewModalOpen(true)
  }

  const handleDelete = (watermarkId: string) => {
    if (confirm('Remove this watermark from all images?')) {
      onRemove(watermarkId)
    }
  }

  const handleModalApply = (
    settings: WatermarkSettings,
    watermarkImage: HTMLImageElement | null
  ) => {
    if (editingWatermark) {
      // Update existing watermark
      onUpdate(editingWatermark.id, settings, watermarkImage)
    } else {
      // Add new watermark
      onApply(settings, watermarkImage)
    }
    setPreviewModalOpen(false)
    setEditingWatermark(null)
  }

  return (
    <div className="space-y-4">
      {/* Add New Watermark Button */}
      <Button
        onClick={handleAddNew}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
        disabled={!previewImageUrl || isProcessing}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Watermark
      </Button>

      {/* Applied Watermarks */}
      {appliedWatermarks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Applied Watermarks</p>
          {appliedWatermarks.map((watermark) => (
            <div
              key={watermark.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {watermark.settings.type === 'text' ? (
                  <Type className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {watermark.settings.type === 'text'
                      ? watermark.settings.text || 'Text Watermark'
                      : 'Image Watermark'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Applied to {watermark.appliedToImages.length} image
                    {watermark.appliedToImages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(watermark)}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(watermark.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewImageUrl && (
        <WatermarkPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false)
            setEditingWatermark(null)
          }}
          onApply={handleModalApply}
          imageUrl={previewImageUrl}
          settings={currentSettings}
          watermarkImage={currentWatermarkImage}
          onSettingsChange={(settings) => {
            setCurrentSettings(settings)
          }}
          onWatermarkImageChange={(newImage) => {
            setCurrentWatermarkImage(newImage)
          }}
        />
      )}
    </div>
  )
}
