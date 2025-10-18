"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

import type { WatermarkSettings, ImageItem, PositionPreset } from "@/types/watermark"
import { FONT_OPTIONS } from "@/constants/watermark"
import { ColorPicker } from "@/components/ColorPicker"
import { PositionGrid } from "@/components/PositionGrid"

interface ImageSettingsModalProps {
  imageItem: ImageItem
  globalSettings: WatermarkSettings
  watermarkImage: HTMLImageElement | null
  onClose: () => void
  onSave: (settings: WatermarkSettings) => void
}

const ImageSettingsModal: React.FC<ImageSettingsModalProps> = ({
  imageItem,
  globalSettings,
  watermarkImage,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<WatermarkSettings>(
    imageItem.customSettings || { ...globalSettings },
  )
  const [useGlobalSettings, setUseGlobalSettings] = useState(!imageItem.customSettings)

  const updateLocalSetting = useCallback(<K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
    setLocalSettings((prev) => {
      const newSettings = { ...prev, [key]: value }

      // Clear preset selection if manually updating position
      if (key === "positionX" || key === "positionY") {
        newSettings.positionPreset = "custom"
      }

      // Set opacity to 100% when switching to image watermark type
      if (key === "type" && value === "image") {
        newSettings.opacity = 100
      }

      return newSettings
    })
  }, [])

  const handlePositionPresetSelect = useCallback((preset: PositionPreset) => {
    setLocalSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
      rotation: 0,
    }))
  }, [])

  const handleSave = () => {
    onSave(useGlobalSettings ? globalSettings : localSettings)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Image Settings</h2>
              <p className="text-sm text-gray-600 mt-1">{imageItem.file.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Use Global Settings Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="useGlobal"
                checked={useGlobalSettings}
                onChange={(e) => setUseGlobalSettings(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="useGlobal" className="text-sm font-medium text-gray-700">
                Use global watermark settings
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              When enabled, this image will use the global settings. Disable to customize this image individually.
            </p>
          </div>

          {/* Custom Settings Panel */}
          {!useGlobalSettings && (
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Watermark Type</Label>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <Button
                    variant={localSettings.type === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateLocalSetting("type", "text")}
                    className={`h-10 font-medium transition-all ${
                      localSettings.type === "text"
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                        : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    Text
                  </Button>
                  <Button
                    variant={localSettings.type === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateLocalSetting("type", "image")}
                    className={`h-10 font-medium transition-all ${
                      localSettings.type === "image"
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                        : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    Image
                  </Button>
                </div>
              </div>

              {/* Text Settings */}
              {localSettings.type === "text" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Watermark Text</Label>
                    <Input
                      value={localSettings.text}
                      onChange={(e) => updateLocalSetting("text", e.target.value)}
                      placeholder="Enter your watermark text"
                      className="text-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</Label>
                    <select
                      value={localSettings.font}
                      onChange={(e) => updateLocalSetting("font", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                          {font.name} ({font.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Text Color</Label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button
                          variant={localSettings.fontMode === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateLocalSetting("fontMode", "light")}
                          className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                            localSettings.fontMode === "light"
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                              : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-400" />
                            <span>Light</span>
                          </div>
                        </Button>
                        <Button
                          variant={localSettings.fontMode === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateLocalSetting("fontMode", "dark")}
                          className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                            localSettings.fontMode === "dark"
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                              : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-gray-700 rounded-full border border-gray-600" />
                            <span>Dark</span>
                          </div>
                        </Button>
                        <Button
                          variant={localSettings.fontMode === "custom" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateLocalSetting("fontMode", "custom")}
                          className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                            localSettings.fontMode === "custom"
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                              : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: localSettings.customColor }}
                            />
                            <span>Custom</span>
                          </div>
                        </Button>
                      </div>

                      {localSettings.fontMode === "custom" && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <ColorPicker
                            color={localSettings.customColor}
                            onChange={(color) => updateLocalSetting("customColor", color)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Settings */}
              {localSettings.type === "image" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span>Size</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={localSettings.imageSize}
                        onChange={(e) => {
                          const value = Math.max(5, Math.min(50, Number(e.target.value) || 5))
                          updateLocalSetting("imageSize", value)
                        }}
                        className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        min={5}
                        max={50}
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </Label>
                  <Slider
                    value={[localSettings.imageSize]}
                    onValueChange={(value) => updateLocalSetting("imageSize", value[0])}
                    min={5}
                    max={50}
                    step={1}
                    className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                  />
                </div>
              )}

              {/* Position Presets */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Position Presets</Label>
                <PositionGrid
                  selectedPreset={localSettings.positionPreset}
                  onSelectPreset={handlePositionPresetSelect}
                />
              </div>

              {/* Advanced Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Advanced Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Size</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={localSettings.fontSize}
                          onChange={(e) => {
                            const value = Math.max(5, Math.min(30, Number(e.target.value) || 5))
                            updateLocalSetting("fontSize", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={5}
                          max={30}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.fontSize]}
                      onValueChange={(value) => updateLocalSetting("fontSize", value[0])}
                      min={5}
                      max={30}
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
                          value={localSettings.rotation}
                          onChange={(e) => {
                            const value = Math.max(-180, Math.min(180, Number(e.target.value) || 0))
                            updateLocalSetting("rotation", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={-180}
                          max={180}
                        />
                        <span className="text-xs text-gray-500">°</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.rotation]}
                      onValueChange={(value) => updateLocalSetting("rotation", value[0])}
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
                          value={localSettings.opacity}
                          onChange={(e) => {
                            const value = Math.max(1, Math.min(100, Number(e.target.value) || 1))
                            updateLocalSetting("opacity", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={1}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.opacity]}
                      onValueChange={(value) => updateLocalSetting("opacity", value[0])}
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
                          value={localSettings.positionX}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            updateLocalSetting("positionX", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.positionX]}
                      onValueChange={(value) => updateLocalSetting("positionX", value[0])}
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
                          value={localSettings.positionY}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, Number(e.target.value) || 0))
                            updateLocalSetting("positionY", value)
                          }}
                          className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </Label>
                    <Slider
                      value={[localSettings.positionY]}
                      onValueChange={(value) => updateLocalSetting("positionY", value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
                Apply Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageSettingsModal
