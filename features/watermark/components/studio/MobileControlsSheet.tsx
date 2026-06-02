'use client'

import type React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { WatermarkSettings, PositionPreset } from '@/features/watermark'
import type { StylePreset } from '@/features/watermark/constants/style-presets'
import { StudioSidebar } from './StudioSidebar'

interface MobileControlsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: WatermarkSettings
  onUpdateSetting: <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => void
  onPositionPresetSelect: (preset: PositionPreset) => void
  onWatermarkImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onApplyStylePreset: (preset: StylePreset) => void
  onResetSettings: () => void
}

export function MobileControlsSheet({
  open,
  onOpenChange,
  ...sidebarProps
}: MobileControlsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        <SheetHeader className="px-5 pt-5 pb-2 border-b border-gray-100">
          <SheetTitle>Watermark settings</SheetTitle>
        </SheetHeader>
        <StudioSidebar {...sidebarProps} className="border-0 h-[calc(85vh-4rem)]" />
      </SheetContent>
    </Sheet>
  )
}
