'use client'

import type React from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  FONT_OPTIONS,
  ColorPicker,
  PositionGrid,
  type WatermarkSettings,
  type PositionPreset,
} from '@/features/watermark'
import type { StylePreset } from '@/features/watermark/constants/style-presets'
import { StylePresets } from './StylePresets'
import { cn } from '@/lib/utils'

interface StudioSidebarProps {
  settings: WatermarkSettings
  onUpdateSetting: <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => void
  onPositionPresetSelect: (preset: PositionPreset) => void
  onWatermarkImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onApplyStylePreset: (preset: StylePreset) => void
  onResetSettings: () => void
  className?: string
  compact?: boolean
  /** Hide title row when sheet header already shows it (mobile) */
  hideHeader?: boolean
  /** Two-column sliders — saves height on mobile sheet */
  denseSliders?: boolean
}

export function StudioSidebar({
  settings,
  onUpdateSetting,
  onPositionPresetSelect,
  onWatermarkImageUpload,
  onApplyStylePreset,
  onResetSettings,
  className,
  compact = false,
  hideHeader = false,
  denseSliders = false,
}: StudioSidebarProps) {
  const sliderFields = (
    <>
      <SliderField
        compact={compact}
        label={settings.type === 'text' ? 'Size' : 'Logo'}
        value={settings.type === 'text' ? settings.fontSize : settings.imageSize}
        min={5}
        max={settings.type === 'text' ? 30 : 50}
        onChange={(v) => onUpdateSetting(settings.type === 'text' ? 'fontSize' : 'imageSize', v)}
      />
      <SliderField
        compact={compact}
        label="Opacity"
        value={settings.opacity}
        min={1}
        max={100}
        suffix="%"
        onChange={(v) => onUpdateSetting('opacity', v)}
      />
      <SliderField
        compact={compact}
        label="Rotate"
        value={settings.rotation}
        min={-180}
        max={180}
        suffix="°"
        step={5}
        onChange={(v) => onUpdateSetting('rotation', v)}
      />
    </>
  )

  return (
    <aside
      className={cn(
        'flex flex-col shrink-0 overflow-y-auto overflow-x-hidden border-r border-gray-200 bg-white',
        compact ? (hideHeader ? 'gap-2 p-3' : 'gap-2.5 p-2.5') : 'gap-5 p-4 sm:p-5',
        className
      )}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between gap-1">
          <h2 className={cn('font-semibold text-gray-900', compact ? 'text-xs' : 'text-sm')}>
            Watermark
          </h2>
          <Button
            variant="ghost"
            size={compact ? 'icon' : 'sm'}
            onClick={onResetSettings}
            className={cn(compact ? 'h-7 w-7' : '', 'text-gray-500 shrink-0')}
            title="Reset settings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {!compact && <span className="ml-1">Reset</span>}
          </Button>
        </div>
      )}

      <StylePresets
        settings={settings}
        onApply={onApplyStylePreset}
        compact={compact || hideHeader}
      />

      <div className={cn('space-y-1', compact && 'space-y-0.5')}>
        <Label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
          Type
        </Label>
        <div className="grid grid-cols-2 gap-1">
          {(['text', 'image'] as const).map((type) => (
            <Button
              key={type}
              variant={settings.type === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateSetting('type', type)}
              className={cn(
                compact ? 'h-7 text-xs' : 'h-9',
                settings.type === type &&
                  'bg-teal-600 hover:bg-teal-700 text-white border-transparent'
              )}
            >
              {type === 'text' ? 'Text' : 'Logo'}
            </Button>
          ))}
        </div>
      </div>

      {settings.type === 'text' ? (
        <div className={cn('space-y-2', compact && 'space-y-1.5')}>
          <div className="space-y-1">
            <Label htmlFor="wm-text" className="text-[10px] font-medium text-gray-500">
              Text
            </Label>
            <Input
              id="wm-text"
              value={settings.text}
              onChange={(e) => onUpdateSetting('text', e.target.value)}
              placeholder="e.g. © Your Name"
              className={cn('text-xs', compact ? 'h-8' : 'h-9')}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-gray-500">Font</Label>
            <select
              value={settings.font}
              onChange={(e) => onUpdateSetting('font', e.target.value)}
              className={cn(
                'w-full rounded-md border border-gray-300 bg-white px-2 text-xs',
                compact ? 'h-8' : 'h-9'
              )}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-gray-500">Color</Label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { mode: 'light' as const, label: 'Light', swatch: '#D1D5DB' },
                { mode: 'dark' as const, label: 'Dark', swatch: '#374151' },
                { mode: 'custom' as const, label: 'Custom' },
              ].map(({ mode, label, swatch }) => {
                const selected = settings.fontMode === mode
                const isCustom = mode === 'custom'
                const customBg = settings.customColor
                const customTextLight = isCustom && isLightHex(customBg)

                return (
                  <Button
                    key={mode}
                    type="button"
                    variant={selected && !isCustom ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-8 text-[10px] justify-center',
                      selected &&
                        !isCustom &&
                        'bg-teal-600 hover:bg-teal-700 text-white border-transparent',
                      selected && isCustom && 'border-transparent hover:opacity-90',
                      selected && isCustom && (customTextLight ? 'text-gray-900' : 'text-white')
                    )}
                    style={
                      selected && isCustom
                        ? { backgroundColor: customBg, borderColor: customBg }
                        : undefined
                    }
                    onClick={() => onUpdateSetting('fontMode', mode)}
                  >
                    {!compact && !isCustom && swatch && (
                      <span
                        className="inline-block h-2 w-2 rounded-full border border-gray-300 shrink-0"
                        style={{ backgroundColor: swatch }}
                      />
                    )}
                    <span className={cn(!compact && !isCustom && 'ml-1')}>{label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
          {settings.fontMode === 'custom' && (
            <ColorPicker
              compact
              color={settings.customColor}
              onChange={(color) => onUpdateSetting('customColor', color)}
            />
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-gray-500">Logo</Label>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onWatermarkImageUpload}
            className={cn('text-xs', compact ? 'h-8 py-1' : '')}
          />
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
          Position
        </Label>
        <PositionGrid
          compact={compact}
          selectedPreset={settings.positionPreset}
          onSelectPreset={onPositionPresetSelect}
        />
      </div>

      {denseSliders ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">{sliderFields}</div>
      ) : (
        <div className={cn('space-y-2', compact && 'space-y-1.5')}>{sliderFields}</div>
      )}
    </aside>
  )
}

function isLightHex(hex: string): boolean {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return true
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
  compact,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (v: number) => void
  compact?: boolean
}) {
  return (
    <div className={cn(compact ? 'space-y-0.5' : 'space-y-1.5')}>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-medium text-gray-500">{label}</span>
        <span className="tabular-nums text-gray-400">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:bg-teal-600"
      />
    </div>
  )
}
