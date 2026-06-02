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
}

export function StudioSidebar({
  settings,
  onUpdateSetting,
  onPositionPresetSelect,
  onWatermarkImageUpload,
  onApplyStylePreset,
  onResetSettings,
  className,
}: StudioSidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col gap-5 overflow-y-auto border-r border-gray-200 bg-white p-4 sm:p-5',
        className
      )}
    >
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Watermark</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Changes apply to all images unless customized
        </p>
      </div>

      <StylePresets settings={settings} onApply={onApplyStylePreset} />

      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-600">Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {(['text', 'image'] as const).map((type) => (
            <Button
              key={type}
              variant={settings.type === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateSetting('type', type)}
              className={cn(
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
        <>
          <div className="space-y-2">
            <Label htmlFor="wm-text" className="text-xs font-medium text-gray-600">
              Text
            </Label>
            <Input
              id="wm-text"
              value={settings.text}
              onChange={(e) => onUpdateSetting('text', e.target.value)}
              placeholder="e.g. © Your Name"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Font</Label>
            <select
              value={settings.font}
              onChange={(e) => onUpdateSetting('font', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Color</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ['light', 'Light', '#D1D5DB'],
                  ['dark', 'Dark', '#374151'],
                  ['custom', 'Custom', settings.customColor],
                ] as const
              ).map(([mode, label, swatch]) => (
                <Button
                  key={mode}
                  type="button"
                  variant={settings.fontMode === mode ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-9 text-xs',
                    settings.fontMode === mode && 'bg-teal-600 hover:bg-teal-700 text-white'
                  )}
                  onClick={() => onUpdateSetting('fontMode', mode)}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full mr-1 border border-gray-300"
                    style={{ backgroundColor: swatch }}
                  />
                  {label}
                </Button>
              ))}
            </div>
            {settings.fontMode === 'custom' && (
              <ColorPicker
                color={settings.customColor}
                onChange={(color) => onUpdateSetting('customColor', color)}
              />
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-600">Logo file</Label>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onWatermarkImageUpload}
          />
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-xs font-medium text-gray-600">Position</Label>
        <PositionGrid
          selectedPreset={settings.positionPreset}
          onSelectPreset={onPositionPresetSelect}
        />
      </div>

      <SliderField
        label={settings.type === 'text' ? 'Text size' : 'Logo size'}
        value={settings.type === 'text' ? settings.fontSize : settings.imageSize}
        min={5}
        max={settings.type === 'text' ? 30 : 50}
        onChange={(v) => onUpdateSetting(settings.type === 'text' ? 'fontSize' : 'imageSize', v)}
      />
      <SliderField
        label="Opacity"
        value={settings.opacity}
        min={1}
        max={100}
        suffix="%"
        onChange={(v) => onUpdateSetting('opacity', v)}
      />
      <SliderField
        label="Rotation"
        value={settings.rotation}
        min={-180}
        max={180}
        suffix="°"
        step={5}
        onChange={(v) => onUpdateSetting('rotation', v)}
      />

      <Button variant="outline" size="sm" onClick={onResetSettings} className="w-full mt-2">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset settings
      </Button>
    </aside>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="tabular-nums text-gray-500">
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
        className="[&_[role=slider]]:bg-teal-600"
      />
    </div>
  )
}
