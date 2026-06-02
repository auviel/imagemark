'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  compact?: boolean
}

function normalizeHex(color: string): string {
  const trimmed = color.trim()
  if (/^#[0-9A-F]{6}$/i.test(trimmed)) return trimmed.toLowerCase()
  if (/^[0-9A-F]{6}$/i.test(trimmed)) return `#${trimmed.toLowerCase()}`
  return '#ffffff'
}

function hexToInputValue(hex: string): string {
  return normalizeHex(hex).replace('#', '').toUpperCase()
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, compact }) => {
  const normalized = normalizeHex(color)
  const [hexInput, setHexInput] = useState(hexToInputValue(color))

  useEffect(() => {
    setHexInput(hexToInputValue(color))
  }, [color])

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = normalizeHex(e.target.value)
    onChange(next)
    setHexInput(hexToInputValue(next))
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
    setHexInput(raw.toUpperCase())
    if (raw.length === 6) {
      onChange(normalizeHex(raw))
    }
  }

  const isValidHex = hexInput.length === 6

  return (
    <div className={cn(compact ? 'space-y-1.5' : 'space-y-3')}>
      {!compact && <p className="text-sm font-medium text-gray-700">Custom color</p>}
      <div className="flex items-center gap-2">
        {/* Native picker overlays swatch — reliable click target */}
        <label
          className={cn(
            'relative shrink-0 cursor-pointer overflow-hidden rounded-md border border-gray-300 shadow-sm',
            compact ? 'h-8 w-10' : 'h-10 w-12'
          )}
          title="Pick a color"
        >
          <input
            type="color"
            value={normalized}
            onChange={handleNativeChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Open color picker"
          />
          <span
            className="block h-full w-full"
            style={{ backgroundColor: normalized }}
            aria-hidden
          />
        </label>

        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-400">
            #
          </span>
          <span
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded border border-gray-200 shadow-inner"
            style={{ backgroundColor: isValidHex ? normalized : '#e5e7eb' }}
            title="Preview"
            aria-hidden
          />
          <Input
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder="FFFFFF"
            maxLength={6}
            className={cn(
              'font-mono pr-9 pl-6',
              compact ? 'h-8 text-xs' : 'h-9 text-sm',
              isValidHex
                ? 'border-gray-300 focus-visible:ring-teal-500'
                : 'border-amber-300 focus-visible:ring-amber-500'
            )}
            spellCheck={false}
          />
        </div>
      </div>
      {!compact && (
        <p className="text-xs text-gray-500">Click the swatch or type a 6-digit hex code</p>
      )}
    </div>
  )
}
