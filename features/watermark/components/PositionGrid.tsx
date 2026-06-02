'use client'

import type { PositionPreset } from '../types'
import { POSITION_PRESETS } from '../constants'
import type React from 'react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

interface PositionGridProps {
  selectedPreset: string
  onSelectPreset: (preset: PositionPreset) => void
  compact?: boolean
}

function dotStyle(presetId: string): React.CSSProperties {
  return {
    top: presetId.includes('top') ? '2px' : presetId.includes('bottom') ? 'auto' : '50%',
    bottom: presetId.includes('bottom') ? '2px' : 'auto',
    left: presetId.includes('left') ? '2px' : presetId.includes('right') ? 'auto' : '50%',
    right: presetId.includes('right') ? '2px' : 'auto',
    transform: presetId.includes('center')
      ? presetId === 'center'
        ? 'translate(-50%, -50%)'
        : presetId.includes('center-left') || presetId.includes('center-right')
          ? 'translateY(-50%)'
          : 'translateX(-50%)'
      : 'none',
  }
}

export const PositionGrid: React.FC<PositionGridProps> = memo(
  ({ selectedPreset, onSelectPreset, compact }) => {
    if (compact) {
      return (
        <div className="grid grid-cols-3 gap-1">
          {POSITION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              title={preset.name}
              aria-label={`Position: ${preset.name}`}
              className={cn(
                'flex items-center justify-center rounded-md p-1.5 transition-colors',
                selectedPreset === preset.id
                  ? 'bg-teal-100 text-teal-700 ring-1 ring-teal-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              )}
            >
              <div className="w-5 h-5 border border-current rounded relative bg-white">
                <div
                  className="absolute w-1 h-1 bg-current rounded-sm"
                  style={dotStyle(preset.id)}
                />
              </div>
            </button>
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {POSITION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 touch-manipulation ${
              selectedPreset === preset.id
                ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500 shadow-md scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102 active:scale-95'
            }`}
            title={preset.name}
            aria-label={`Position: ${preset.name}`}
          >
            <div className="text-current mb-1">
              <div className="w-8 h-8 border-2 border-current rounded-md relative bg-white">
                <div
                  className="absolute w-2 h-2 bg-current rounded-sm z-10"
                  style={dotStyle(preset.id)}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-center leading-tight">{preset.name}</span>

            {selectedPreset === preset.id && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-600 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }
)

PositionGrid.displayName = 'PositionGrid'
