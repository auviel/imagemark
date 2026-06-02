'use client'

import type React from 'react'
import { RotateCcw, X } from 'lucide-react'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
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
  onResetSettings,
  ...sidebarProps
}: MobileControlsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideClose
        className="flex h-[min(88dvh,720px)] max-h-[88dvh] flex-col rounded-t-2xl p-0 gap-0"
      >
        <SheetHeader className="flex shrink-0 flex-row items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-left">
          <SheetTitle className="min-w-0 flex-1 text-sm font-semibold">
            Watermark settings
          </SheetTitle>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500"
              onClick={onResetSettings}
              title="Reset settings"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <StudioSidebar
          {...sidebarProps}
          compact
          hideHeader
          denseSliders
          onResetSettings={onResetSettings}
          className="min-h-0 flex-1 border-0"
        />
      </SheetContent>
    </Sheet>
  )
}
