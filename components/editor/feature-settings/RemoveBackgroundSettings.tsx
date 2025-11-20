/**
 * Remove Background Feature Settings Component
 *
 * Shows compression options for background removal
 */

'use client'

import { useState } from 'react'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RemoveBackgroundSettingsProps {
  /** Callback when background removal is applied */
  onApply: (compression: 'lossless' | 'lossy') => void
  /** Whether processing is in progress */
  isProcessing?: boolean
}

export function RemoveBackgroundSettings({
  onApply,
  isProcessing = false,
}: RemoveBackgroundSettingsProps) {
  const [compression, setCompression] = useState<'lossless' | 'lossy'>('lossless')

  const handleApply = () => {
    onApply(compression)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Remove the background from your images using AI. For best results, images are
          automatically converted to PNG first.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Compression</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCompression('lossless')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              compression === 'lossless'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lossless
            <span className="block text-xs mt-0.5 opacity-90">Better quality</span>
          </button>
          <button
            type="button"
            onClick={() => setCompression('lossy')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              compression === 'lossy'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lossy
            <span className="block text-xs mt-0.5 opacity-90">Smaller file</span>
          </button>
        </div>
      </div>

      <Button
        onClick={handleApply}
        disabled={isProcessing}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        <Scissors className="w-4 h-4 mr-2" />
        {isProcessing ? 'Processing...' : 'Remove Background'}
      </Button>
    </div>
  )
}
