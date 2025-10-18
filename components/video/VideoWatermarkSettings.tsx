"use client"

import React, { useState } from "react"
import { X, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "@/components/ColorPicker"
import { PositionGrid } from "@/components/PositionGrid"
import type { VideoItem, VideoProcessingOptions } from "@/types/video"
import type { WatermarkSettings, PositionPreset } from "@/types/watermark"
import { FONT_OPTIONS } from "@/constants/watermark"

interface VideoWatermarkSettingsProps {
  video: VideoItem
  globalSettings: WatermarkSettings
  processingOptions: VideoProcessingOptions
  onClose: () => void
  onSave: (id: string, settings: WatermarkSettings, options: VideoProcessingOptions) => void
}

export const VideoWatermarkSettings: React.FC<VideoWatermarkSettingsProps> = ({
  video,
  globalSettings,
  processingOptions,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<WatermarkSettings>(
    video.customSettings || { ...globalSettings }
  )
  const [localOptions, setLocalOptions] = useState<VideoProcessingOptions>({ ...processingOptions })
  const [useGlobalSettings, setUseGlobalSettings] = useState(!video.customSettings)
  const [activeTab, setActiveTab] = useState("watermark")

  const updateLocalSetting = <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
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
  }

  const updateProcessingOption = <K extends keyof VideoProcessingOptions>(key: K, value: VideoProcessingOptions[K]) => {
    setLocalOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handlePositionPresetSelect = (preset: PositionPreset) => {
    setLocalSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
      rotation: 0,
    }))
  }

  const handleSave = () => {
    onSave(
      video.id,
      useGlobalSettings ? globalSettings : localSettings,
      localOptions
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Video Settings</h2>
              <p className="text-sm text-gray-600 mt-1">{video.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="watermark">Watermark</TabsTrigger>
              <TabsTrigger value="output">Output Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="watermark">
              {/* Use Global Settings Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="useGlobal"
                    checked={useGlobalSettings}
                    onCheckedChange={setUseGlobalSettings}
                  />
                  <Label htmlFor="useGlobal" className="text-sm font-medium text-gray-700">
                    Use global watermark settings
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, this video will use the global settings. Disable to customize this video individually.
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
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Logo</Label>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="text-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                      <div className="mt-4">
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
            </TabsContent>

            <TabsContent value="output">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Output Format</Label>
                    <Select
                      value={localOptions.outputFormat}
                      onValueChange={(value) => updateProcessingOption("outputFormat", value as "mp4" | "webm")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                        <SelectItem value="webm">WebM (VP9)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4 has better compatibility, WebM may offer better quality at smaller file sizes.
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Quality</Label>
                    <Select
                      value={localOptions.quality}
                      onValueChange={(value) => updateProcessingOption("quality", value as "high" | "medium" | "low")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (Larger file)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="low">Low (Smaller file)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Higher quality results in larger file sizes.
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Frame Rate</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={localOptions.frameRate || 30}
                      onChange={(e) => {
                        const value = Math.max(15, Math.min(60, Number(e.target.value) || 30))
                        updateProcessingOption("frameRate", value)
                      }}
                      className="w-20 text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                      min={15}
                      max={60}
                    />
                    <span className="text-sm text-gray-500">fps</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Standard frame rates: 24fps (film), 30fps (standard video), 60fps (smooth motion)
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Trim Video</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Start Time (seconds)</Label>
                      <Input
                        type="number"
                        value={localOptions.startTime || 0}
                        onChange={(e) => updateProcessingOption("startTime", Number(e.target.value) || 0)}
                        className="border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        min={0}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">End Time (seconds)</Label>
                      <Input
                        type="number"
                        value={localOptions.endTime || video.duration}
                        onChange={(e) => updateProcessingOption("endTime", Number(e.target.value) || video.duration)}
                        className="border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Resolution</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Width (pixels)</Label>
                      <Input
                        type="number"
                        value={localOptions.resolution?.width || 1280}
                        onChange={(e) => updateProcessingOption("resolution", {
                          width: Number(e.target.value) || 1280,
                          height: localOptions.resolution?.height || 720
                        })}
                        className="border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        min={320}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Height (pixels)</Label>
                      <Input
                        type="number"
                        value={localOptions.resolution?.height || 720}
                        onChange={(e) => updateProcessingOption("resolution", {
                          width: localOptions.resolution?.width || 1280,
                          height: Number(e.target.value) || 720
                        })}
                        className="border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                        min={240}
                        step={1}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Common resolutions: 1920×1080 (Full HD), 1280×720 (HD), 854×480 (SD)
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Apply Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
