'use client'

import { STYLE_PRESETS, type StylePreset } from '@/features/watermark/constants/style-presets'
import type { WatermarkSettings } from '@/features/watermark'
import { cn } from '@/lib/utils'

interface StylePresetsProps {
  settings: WatermarkSettings
  onApply: (preset: StylePreset) => void
}

export function StylePresets({ settings, onApply }: StylePresetsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Quick styles</p>
      <div className="grid grid-cols-2 gap-2">
        {STYLE_PRESETS.map((preset) => {
          const isLogo = preset.settings.type === 'image'
          const disabled = isLogo && settings.type !== 'image'
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onApply(preset)}
              className={cn(
                'rounded-lg border px-3 py-2.5 text-left transition-colors',
                disabled
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50'
                  : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
              )}
            >
              <span className="block text-sm font-medium text-gray-900">{preset.name}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{preset.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
