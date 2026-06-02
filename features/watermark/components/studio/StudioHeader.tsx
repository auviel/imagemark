'use client'

import { Plus, Download, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrivacyBadge } from './PrivacyBadge'

interface StudioHeaderProps {
  fileCount: number
  isProcessing: boolean
  onAddFiles: () => void
  onDownloadAll: () => void
  onOpenControls?: () => void
  showMobileControls?: boolean
}

export function StudioHeader({
  fileCount,
  isProcessing,
  onAddFiles,
  onDownloadAll,
  onOpenControls,
  showMobileControls,
}: StudioHeaderProps) {
  return (
    <header className="shrink-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-10 items-center justify-between gap-2 px-3 lg:px-4">
        <PrivacyBadge />

        <div className="flex items-center gap-2">
          {showMobileControls && onOpenControls && (
            <Button variant="outline" size="sm" onClick={onOpenControls} className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Adjust</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onAddFiles} disabled={isProcessing}>
            <Plus className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={onDownloadAll}
            disabled={isProcessing || fileCount === 0}
          >
            <Download className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">
              {isProcessing ? 'Working…' : `Download${fileCount > 1 ? ' all' : ''}`}
            </span>
            <span className="sm:hidden">{isProcessing ? '…' : 'Save'}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
