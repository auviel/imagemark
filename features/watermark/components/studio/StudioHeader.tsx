'use client'

import { Download, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExportFormatSelect } from './ExportFormatSelect'
import type { ExportFormatPreference } from '@/features/watermark/utils/export-format'

interface StudioHeaderProps {
  fileCount: number
  isProcessing: boolean
  exportFormat: ExportFormatPreference
  onExportFormatChange: (format: ExportFormatPreference) => void
  onDownload: () => void
  onOpenControls?: () => void
  showMobileControls?: boolean
}

export function StudioHeader({
  fileCount,
  isProcessing,
  exportFormat,
  onExportFormatChange,
  onDownload,
  onOpenControls,
  showMobileControls,
}: StudioHeaderProps) {
  return (
    <header className="shrink-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-10 items-center justify-end gap-2 px-3 lg:px-4">
        <div className="flex items-center gap-2">
          {fileCount > 0 && (
            <ExportFormatSelect value={exportFormat} onChange={onExportFormatChange} />
          )}
          {showMobileControls && onOpenControls && (
            <Button variant="outline" size="sm" onClick={onOpenControls} className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Adjust</span>
            </Button>
          )}
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={onDownload}
            disabled={isProcessing || fileCount === 0}
          >
            <Download className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">
              {isProcessing ? 'Working…' : fileCount > 1 ? 'Download ZIP' : 'Download'}
            </span>
            <span className="sm:hidden">{isProcessing ? '…' : 'Save'}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
