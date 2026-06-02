'use client'

import type React from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { WatermarkSettings, PositionPreset } from '@/features/watermark'
import { FONT_OPTIONS, ColorPicker, PositionGrid } from '@/features/watermark'

interface SettingsPanelProps {
  settings: WatermarkSettings
  showPositionPresets: boolean
  showAdvancedSettings: boolean
  onUpdateSetting: <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => void
  onPositionPresetSelect: (preset: PositionPreset) => void
  onWatermarkImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTogglePositionPresets: () => void
  onToggleAdvancedSettings: () => void
  onResetSettings: () => void
}

export function SettingsPanel({
  settings,
  showPositionPresets,
  showAdvancedSettings,
  onUpdateSetting,
  onPositionPresetSelect,
  onWatermarkImageUpload,
  onTogglePositionPresets,
  onToggleAdvancedSettings,
  onResetSettings,
}: SettingsPanelProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Global Watermark Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Type Selection */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Watermark Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={settings.type === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateSetting('type', 'text')}
                className={`h-10 font-medium transition-all ${
                  settings.type === 'text'
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                    : 'border-gray-300 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                Text
              </Button>
              <Button
                variant={settings.type === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateSetting('type', 'image')}
                className={`h-10 font-medium transition-all ${
                  settings.type === 'image'
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md'
                    : 'border-gray-300 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                Image
              </Button>
            </div>
          </div>

          {/* Text Settings */}
          {settings.type === 'text' && (
            <>
              <div className="sm:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Watermark Text
                </Label>
                <Input
                  value={settings.text}
                  onChange={(e) => onUpdateSetting('text', e.target.value)}
                  placeholder="e.g. © Your Name"
                  className="text-sm focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</Label>
                <select
                  value={settings.font}
                  onChange={(e) => onUpdateSetting('font', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Text Color</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant={settings.fontMode === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateSetting('fontMode', 'light')}
                      className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                        settings.fontMode === 'light'
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg'
                          : 'border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-400" />
                        <span>Light</span>
                      </div>
                    </Button>
                    <Button
                      variant={settings.fontMode === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateSetting('fontMode', 'dark')}
                      className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                        settings.fontMode === 'dark'
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg'
                          : 'border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-gray-700 rounded-full border border-gray-600" />
                        <span>Dark</span>
                      </div>
                    </Button>
                    <Button
                      variant={settings.fontMode === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateSetting('fontMode', 'custom')}
                      className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                        settings.fontMode === 'custom'
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg'
                          : 'border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: settings.customColor }}
                        />
                        <span>Custom</span>
                      </div>
                    </Button>
                  </div>

                  {settings.fontMode === 'custom' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <ColorPicker
                        color={settings.customColor}
                        onChange={(color) => onUpdateSetting('customColor', color)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Image Settings */}
          {settings.type === 'image' && (
            <>
              <div className="sm:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Logo</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={onWatermarkImageUpload}
                  className="text-sm focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </>
          )}

          {/* Position Presets */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
            <Collapsible open={showPositionPresets} onOpenChange={onTogglePositionPresets}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 p-0 hover:text-teal-600 mb-3 font-medium"
                  onClick={onTogglePositionPresets}
                >
                  Position Presets
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${showPositionPresets ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <PositionGrid
                  selectedPreset={settings.positionPreset}
                  onSelectPreset={onPositionPresetSelect}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Advanced Settings */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
            <Collapsible open={showAdvancedSettings} onOpenChange={onToggleAdvancedSettings}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 p-0 hover:text-teal-600 mt-4"
                  onClick={onToggleAdvancedSettings}
                >
                  Advanced Settings
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>{settings.type === 'text' ? 'Text Size' : 'Image Size'}</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={settings.type === 'text' ? settings.fontSize : settings.imageSize}
                          onChange={(e) => {
                            if (settings.type === 'text') {
                              const value = Math.max(5, Math.min(30, Number(e.target.value) || 5))
                              onUpdateSetting('fontSize', value)
                            } else {
                              const value = Math.max(5, Math.min(50, Number(e.target.value) || 5))
                              onUpdateSetting('imageSize', value)
                            }
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={5}
                          max={settings.type === 'text' ? 30 : 50}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[settings.type === 'text' ? settings.fontSize : settings.imageSize]}
                      onValueChange={(value) => {
                        if (settings.type === 'text') {
                          onUpdateSetting('fontSize', value[0])
                        } else {
                          onUpdateSetting('imageSize', value[0])
                        }
                      }}
                      min={5}
                      max={settings.type === 'text' ? 30 : 50}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Rotation</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={settings.rotation}
                          onChange={(e) => {
                            const value = Math.max(-180, Math.min(180, Number(e.target.value) || 0))
                            onUpdateSetting('rotation', value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={-180}
                          max={180}
                        />
                        <span className="text-xs text-gray-500">°</span>
                      </div>
                    </Label>
                    <Slider
                      value={[settings.rotation]}
                      onValueChange={(value) => onUpdateSetting('rotation', value[0])}
                      min={-180}
                      max={180}
                      step={5}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Opacity</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={settings.opacity}
                          onChange={(e) => {
                            const value = Math.max(1, Math.min(100, Number(e.target.value) || 1))
                            onUpdateSetting('opacity', value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={1}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[settings.opacity]}
                      onValueChange={(value) => onUpdateSetting('opacity', value[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Position X</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={settings.positionX}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            onUpdateSetting('positionX', value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[settings.positionX]}
                      onValueChange={(value) => onUpdateSetting('positionX', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Position Y</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={settings.positionY}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            onUpdateSetting('positionY', value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[settings.positionY]}
                      onValueChange={(value) => onUpdateSetting('positionY', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={onResetSettings}
                  variant="outline"
                  size="sm"
                  className="mt-4 text-gray-600 border-gray-300 hover:border-teal-300 hover:text-teal-600"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  )
}
