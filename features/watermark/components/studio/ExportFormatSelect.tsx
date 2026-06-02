'use client'

import type { ExportFormatPreference } from '@/features/watermark/utils/export-format'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ExportFormatPreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
]

interface ExportFormatSelectProps {
  value: ExportFormatPreference
  onChange: (value: ExportFormatPreference) => void
  className?: string
}

export function ExportFormatSelect({ value, onChange, className }: ExportFormatSelectProps) {
  return (
    <div
      className={cn('inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5', className)}
      title="Export format (Auto uses JPEG for photos, PNG when transparency matters)"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded px-2 py-1 text-[10px] font-medium transition-colors',
            value === opt.value
              ? 'bg-white text-teal-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
