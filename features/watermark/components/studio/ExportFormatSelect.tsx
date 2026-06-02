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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ExportFormatPreference)}
      title="Export format (Auto uses JPEG for photos, PNG when transparency matters)"
      aria-label="Export format"
      className={cn(
        'h-8 rounded-md border border-gray-300 bg-white px-2 pr-7 text-xs text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500',
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
