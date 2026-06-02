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
    <header className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
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
