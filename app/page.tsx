"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo, Suspense, lazy } from "react"
import { Download, Settings, ChevronDown, RotateCcw, X, Plus, Upload, Shield, Zap, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useEffect } from "react"

// Types
import type { WatermarkSettings, ImageItem, PositionPreset, VideoItem } from "@/types/watermark"

// Constants
import { DEFAULT_SETTINGS, FONT_OPTIONS, ACCEPTED_FILE_TYPES, ACCEPTED_VIDEO_TYPES } from "@/constants/watermark"

// Utils
import { createImageFromFile, downloadBlob, canvasToBlob } from "@/utils/image"
import { createVideoFromFile } from "@/utils/video"

// Hooks
import { useWatermark } from "@/hooks/useWatermark"
import { useImageUpload } from "@/hooks/useImageUpload"
import { useVideoUpload } from "@/hooks/useVideoUpload"
import { useDebounce } from "@/hooks/useDebounce"

// Components
import { ImageMarkLogo } from "@/components/ImageMarkLogo"
import { Footer } from "@/components/Footer"
import { ColorPicker } from "@/components/ColorPicker"
import { PositionGrid } from "@/components/PositionGrid"
import { ImageCanvas } from "@/components/ImageCanvas"
import { VideoCanvas } from "@/components/VideoCanvas"
import { LoadingSpinner } from "@/components/LoadingSpinner"

// Lazy load heavy components
const ImageSettingsModal = lazy(() => import("@/components/ImageSettingsModal"))
const VideoSettingsModal = lazy(() => import("@/components/VideoSettingsModal"))

export default function WatermarkingTool() {
  // State
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [hasEditedSettings, setHasEditedSettings] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [showPositionPresets, setShowPositionPresets] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom Hooks
  const { processFiles, isProcessing } = useImageUpload()
  const { processVideos, isProcessingVideos } = useVideoUpload()
  const { analysisCanvasRef, analyzeBrightness, processImage, hasWatermark } = useWatermark(settings, watermarkImage)

  // Debounced settings for performance
  const debouncedSettings = useDebounce(settings, 300)

  // Effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update canvases when settings change (debounced)
  useEffect(() => {
    if (images.length > 0 && hasWatermark) {
      setImages((prev) =>
        prev.map((imageItem) => ({
          ...imageItem,
          canvas: processImage(imageItem),
        })),
      )
    }
  }, [debouncedSettings, hasWatermark, watermarkImage]) // Remove processImage and images.length from dependencies to prevent infinite loops

  // Replace the video processing useEffect with this corrected version:
  useEffect(() => {
    if (videos.length > 0) {
      const processVideos = async () => {
        const updatedVideos = await Promise.all(
          videos.map(async (videoItem) => {
            try {
              if (!videoItem.canvas) {
                const videoSettings = videoItem.customSettings || settings
                const processedBlob = await createVideoFromFile(
                  videoItem.file,
                  hasWatermark ? videoSettings : undefined,
                  watermarkImage,
                )
                return {
                  ...videoItem,
                  canvas: Promise.resolve(processedBlob),
                }
              }
              return videoItem
            } catch (error) {
              console.error("Error processing video:", error)
              return videoItem
            }
          }),
        )
        setVideos(updatedVideos)
      }

      processVideos()
    }
  }, [debouncedSettings, hasWatermark, watermarkImage, videos.length])

  // Keyboard event handler - only run on client side
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (fullscreenImage) {
          closeFullscreen()
        } else if (editingImageId) {
          setEditingImageId(null)
        } else if (fullscreenVideo) {
          closeFullscreenVideo()
        } else if (editingVideoId) {
          setEditingVideoId(null)
        }
      }
    }

    if (fullscreenImage || editingImageId || fullscreenVideo || editingVideoId) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [mounted, fullscreenImage, editingImageId, fullscreenVideo, editingVideoId])

  // Memoized handlers
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const newImages = await processFiles(files)

      if (newImages.length > 0) {
        // Analyze brightness for the first image
        const fontMode = analyzeBrightness(newImages[0].image)
        setSettings((prev) => ({ ...prev, fontMode }))

        // Add images first
        setImages((prev) => [...prev, ...newImages])

        // Process canvases after a short delay to ensure state is updated
        setTimeout(() => {
          setImages((current) =>
            current.map((imageItem) => ({
              ...imageItem,
              canvas: processImage(imageItem),
            })),
          )
        }, 100)
      }
    },
    [processFiles, analyzeBrightness, processImage],
  )

  // Also update the video upload handler:
  const handleVideoUpload = useCallback(
    async (files: FileList | File[]) => {
      const newVideos = await processVideos(files)

      if (newVideos.length > 0) {
        // Add videos first
        setVideos((prev) => [...prev, ...newVideos])

        // Process videos after a short delay
        setTimeout(async () => {
          const processedVideos = await Promise.all(
            newVideos.map(async (videoItem) => {
              try {
                const videoSettings = videoItem.customSettings || settings
                const processedBlob = await createVideoFromFile(
                  videoItem.file,
                  hasWatermark ? videoSettings : undefined,
                  watermarkImage,
                )
                return {
                  ...videoItem,
                  canvas: Promise.resolve(processedBlob),
                }
              } catch (error) {
                console.error("Error processing video:", error)
                return {
                  ...videoItem,
                  canvas: Promise.resolve(new Blob([videoItem.file], { type: "video/mp4" })),
                }
              }
            }),
          )

          setVideos((current) => {
            const existingVideos = current.filter((v) => !newVideos.find((nv) => nv.id === v.id))
            return [...existingVideos, ...processedVideos]
          })
        }, 100)
      }
    },
    [processVideos, settings, hasWatermark, watermarkImage],
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        const fileArray = Array.from(files)
        const imageFiles = fileArray.filter((file) => ACCEPTED_FILE_TYPES.includes(file.type as any))
        const videoFiles = fileArray.filter((file) => ACCEPTED_VIDEO_TYPES.includes(file.type as any))

        if (imageFiles.length > 0) {
          handleFileUpload(imageFiles)
        }

        if (videoFiles.length > 0) {
          handleVideoUpload(videoFiles)
        }
      }
    },
    [handleFileUpload, handleVideoUpload],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files) {
        const files = e.dataTransfer.files
        const imageFiles = Array.from(files).filter((file) => ACCEPTED_FILE_TYPES.includes(file.type))
        const videoFiles = Array.from(files).filter((file) => ACCEPTED_VIDEO_TYPES.includes(file.type))

        if (imageFiles.length > 0) {
          handleFileUpload(imageFiles)
        }

        if (videoFiles.length > 0) {
          handleVideoUpload(videoFiles)
        }
      }
    },
    [handleFileUpload, handleVideoUpload],
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const removeVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((vid) => vid.id !== id))
  }, [])

  const goHome = useCallback(() => {
    setImages([])
    setVideos([])
    setShowSettings(false)
    setHasEditedSettings(false)
    setWatermarkImage(null)
    setEditingImageId(null)
    setEditingVideoId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
    if (!showSettings) {
      setHasEditedSettings(true)
    }
  }, [showSettings])

  const downloadSingleImage = useCallback(async (imageItem: ImageItem) => {
    if (!imageItem.canvas) return

    try {
      const blob = await canvasToBlob(imageItem.canvas)
      const filename = `watermarked-${imageItem.file.name.split(".")[0]}.png`
      await downloadBlob(blob, filename)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }, [])

  // And update the downloadSingleVideo function:
  const downloadSingleVideo = useCallback(async (videoItem: VideoItem) => {
    if (!videoItem.canvas) return

    try {
      const blob = await videoItem.canvas
      if (!blob || blob.size === 0) {
        throw new Error("Invalid video blob")
      }

      const filename = `watermarked-${videoItem.file.name.split(".")[0]}.mp4`
      await downloadBlob(blob, filename)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }, [])

  const downloadAllAsZip = useCallback(async () => {
    if (images.length === 0 && videos.length === 0) return

    setIsDownloading(true)

    try {
      // Lazy load JSZip only when needed
      const { default: JSZip } = await import("jszip")
      const zip = new JSZip()

      const blobPromises = images.map(async (imageItem) => {
        if (!imageItem.canvas) return

        const blob = await canvasToBlob(imageItem.canvas)
        const fileName = `watermarked-${imageItem.file.name.split(".")[0]}.png`
        zip.file(fileName, blob)
      })

      const videoBlobPromises = videos.map(async (videoItem) => {
        if (!videoItem.canvas) return

        const blob = await videoItem.canvas
        const fileName = `watermarked-${videoItem.file.name.split(".")[0]}.mp4`
        zip.file(fileName, blob)
      })

      await Promise.all([...blobPromises, ...videoBlobPromises])

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const filename = `imagemark-watermarked-${Date.now()}.zip`
      await downloadBlob(zipBlob, filename)
    } catch (error) {
      console.error("Zip download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }, [images, videos])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const updateSetting = useCallback(<K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
    setSettings((prev) => {
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
    setSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
      rotation: 0,
    }))
  }, [])

  const handleWatermarkImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      createImageFromFile(file)
        .then(setWatermarkImage)
        .catch((error) => console.error("Failed to load watermark image:", error))
    }
  }, [])

  // And fix the fullscreen video handler:
  const openFullscreenVideo = useCallback(async (canvas: Promise<Blob>) => {
    try {
      const blob = await canvas
      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob)
        setFullscreenVideo(url)
      }
    } catch (error) {
      console.error("Error opening fullscreen video:", error)
    }
  }, [])

  const closeFullscreenVideo = useCallback(() => {
    if (fullscreenVideo) {
      URL.revokeObjectURL(fullscreenVideo)
    }
    setFullscreenVideo(null)
  }, [fullscreenVideo])

  const openFullscreen = useCallback((canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL("image/png")
    setFullscreenImage(dataUrl)
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreenImage(null)
  }, [])

  const handleImageSettingsSave = useCallback(
    (imageId: string, newSettings: WatermarkSettings) => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            const isGlobalSettings = JSON.stringify(newSettings) === JSON.stringify(settings)
            const updatedItem = {
              ...img,
              customSettings: isGlobalSettings ? undefined : newSettings,
            }
            // Update canvas immediately
            updatedItem.canvas = processImage(updatedItem)
            return updatedItem
          }
          return img
        }),
      )
    },
    [settings, processImage],
  )

  const handleVideoSettingsSave = useCallback(
    async (videoId: string, newSettings: WatermarkSettings) => {
      setVideos((prev) =>
        prev.map((vid) => {
          if (vid.id === videoId) {
            const isGlobalSettings = JSON.stringify(newSettings) === JSON.stringify(settings)
            const updatedItem = {
              ...vid,
              customSettings: isGlobalSettings ? undefined : newSettings,
            }
            // Update canvas immediately with new settings
            updatedItem.canvas = createVideoFromFile(updatedItem.file, newSettings, watermarkImage)
            return updatedItem
          }
          return vid
        }),
      )
    },
    [settings, watermarkImage],
  )

  const editingImage = useMemo(() => {
    return editingImageId ? images.find((img) => img.id === editingImageId) : null
  }, [editingImageId, images])

  const editingVideo = useMemo(() => {
    return editingVideoId ? videos.find((vid) => vid.id === editingVideoId) : null
  }, [editingVideoId, videos])

  const togglePositionPresets = useCallback(() => {
    setShowPositionPresets((prev) => {
      const newValue = !prev
      // If opening position presets, close advanced settings
      if (newValue) {
        setShowAdvancedSettings(false)
      }
      return newValue
    })
  }, [])

  const toggleAdvancedSettings = useCallback(() => {
    setShowAdvancedSettings((prev) => {
      const newValue = !prev
      // If opening advanced settings, close position presets
      if (newValue) {
        setShowPositionPresets(false)
      }
      return newValue
    })
  }, [])

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Results view - after images and videos are uploaded
  if (images.length > 0 || videos.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={goHome}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
              title="Go to home page"
            >
              <ImageMarkLogo className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">ImageMark</h1>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                title="Add more files"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add More</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSettings}
                className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                title="Edit watermark settings"
              >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{showSettings ? "Hide" : "Edit"}</span>
              </Button>
              <Button
                onClick={downloadAllAsZip}
                disabled={isDownloading || (images.length === 0 && videos.length === 0)}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm px-3 sm:px-6 h-8 sm:h-9"
                title="Download all images and videos as zip"
              >
                {isDownloading ? (
                  <LoadingSpinner size="sm" className="sm:mr-2" />
                ) : (
                  <Download className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{isDownloading ? "Creating..." : "Download All"}</span>
                <span className="sm:hidden">{isDownloading ? "..." : "ZIP"}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          {/* Watermark Notice */}
          {!showSettings && !hasEditedSettings && (
            <div className="mb-4 sm:mb-6 bg-teal-50 border border-teal-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Settings className="w-5 h-5 text-teal-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Watermark applied!</span>{" "}
                    <button onClick={toggleSettings} className="underline hover:no-underline font-medium">
                      Click Edit
                    </button>{" "}
                    to customize your watermark text, position, and style.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
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
                        variant={settings.type === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("type", "text")}
                        className={`h-10 font-medium transition-all ${
                          settings.type === "text"
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                            : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                        }`}
                      >
                        Text
                      </Button>
                      <Button
                        variant={settings.type === "image" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("type", "image")}
                        className={`h-10 font-medium transition-all ${
                          settings.type === "image"
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                            : "border-gray-300 hover:border-teal-400 hover:text-teal-600"
                        }`}
                      >
                        Image
                      </Button>
                    </div>
                  </div>

                  {/* Text Settings */}
                  {settings.type === "text" && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Watermark Text</Label>
                        <Input
                          value={settings.text}
                          onChange={(e) => updateSetting("text", e.target.value)}
                          placeholder="Enter your watermark text"
                          className="text-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</Label>
                        <select
                          value={settings.font}
                          onChange={(e) => updateSetting("font", e.target.value)}
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
                              variant={settings.fontMode === "light" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSetting("fontMode", "light")}
                              className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                settings.fontMode === "light"
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
                              variant={settings.fontMode === "dark" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSetting("fontMode", "dark")}
                              className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                settings.fontMode === "dark"
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
                              variant={settings.fontMode === "custom" ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSetting("fontMode", "custom")}
                              className={`h-12 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                settings.fontMode === "custom"
                                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
                                  : "border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
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

                          {settings.fontMode === "custom" && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <ColorPicker
                                color={settings.customColor}
                                onChange={(color) => updateSetting("customColor", color)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Image Settings */}
                  {settings.type === "image" && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Logo</Label>
                        <Input
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={handleWatermarkImageUpload}
                          className="text-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Position Presets */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
                    <Collapsible open={showPositionPresets} onOpenChange={setShowPositionPresets}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-700 p-0 hover:text-teal-600 mb-3 font-medium"
                          onClick={togglePositionPresets}
                        >
                          Position Presets
                          <ChevronDown
                            className={`w-4 h-4 ml-2 transition-transform ${showPositionPresets ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <PositionGrid
                          selectedPreset={settings.positionPreset}
                          onSelectPreset={handlePositionPresetSelect}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Advanced Settings */}
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
                    <Collapsible open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 p-0 hover:text-teal-600 mt-4"
                          onClick={toggleAdvancedSettings}
                        >
                          Advanced Settings
                          <ChevronDown
                            className={`w-4 h-4 ml-2 transition-transform ${showAdvancedSettings ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                              <span>{settings.type === "text" ? "Text Size" : "Image Size"}</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={settings.type === "text" ? settings.fontSize : settings.imageSize}
                                  onChange={(e) => {
                                    if (settings.type === "text") {
                                      const value = Math.max(5, Math.min(30, Number(e.target.value) || 5))
                                      updateSetting("fontSize", value)
                                    } else {
                                      const value = Math.max(5, Math.min(50, Number(e.target.value) || 5))
                                      updateSetting("imageSize", value)
                                    }
                                  }}
                                  className="w-16 h-6 px-2 text-xs text-center border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                                  min={5}
                                  max={settings.type === "text" ? 30 : 50}
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </Label>
                            <Slider
                              value={[settings.type === "text" ? settings.fontSize : settings.imageSize]}
                              onValueChange={(value) => {
                                if (settings.type === "text") {
                                  updateSetting("fontSize", value[0])
                                } else {
                                  updateSetting("imageSize", value[0])
                                }
                              }}
                              min={5}
                              max={settings.type === "text" ? 30 : 50}
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
                                    updateSetting("rotation", value)
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
                              onValueChange={(value) => updateSetting("rotation", value[0])}
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
                                    updateSetting("opacity", value)
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
                              onValueChange={(value) => updateSetting("opacity", value[0])}
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
                                    updateSetting("positionX", value)
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
                              onValueChange={(value) => updateSetting("positionX", value[0])}
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
                                    updateSetting("positionY", value)
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
                              onValueChange={(value) => updateSetting("positionY", value[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-teal-600 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-0 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-gray-200 [&>span:first-child]:rounded-full [&>span:last-child]:bg-teal-600 [&>span:last-child]:rounded-full"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={resetSettings}
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
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {images.map((imageItem) => (
              <div key={imageItem.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(imageItem.id)}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-8 sm:h-8 p-0"
                  title="Remove image"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>

                {/* Custom Settings Indicator */}
                {imageItem.customSettings && (
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-teal-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    <span className="text-xs font-bold">•</span>
                  </div>
                )}

                {imageItem.canvas ? (
                  <ImageCanvas canvas={imageItem.canvas} onClick={() => openFullscreen(imageItem.canvas!)} />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LoadingSpinner size="md" className="mb-2" />
                      <span className="text-xs text-gray-500">Processing...</span>
                    </div>
                  </div>
                )}

                <div className="mt-2 sm:mt-3 flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2" title={imageItem.file.name}>
                    {imageItem.file.name}
                  </span>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingImageId(imageItem.id)}
                      className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-1.5 sm:px-3 h-7 sm:h-8 min-w-[2rem] sm:min-w-[auto]"
                      title="Customize watermark for this image"
                    >
                      <Edit3 className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSingleImage(imageItem)}
                      className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-1.5 sm:px-3 h-7 sm:h-8 min-w-[2rem] sm:min-w-[auto]"
                      title="Download this image"
                    >
                      <Download className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {videos.map((videoItem) => (
              <div key={videoItem.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVideo(videoItem.id)}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-8 sm:h-8 p-0"
                  title="Remove video"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>

                {/* Custom Settings Indicator */}
                {videoItem.customSettings && (
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-teal-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    <span className="text-xs font-bold">•</span>
                  </div>
                )}

                {videoItem.canvas && (
                  <VideoCanvas canvas={videoItem.canvas} onClick={() => openFullscreenVideo(videoItem.canvas!)} />
                )}

                <div className="mt-2 sm:mt-3 flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2" title={videoItem.file.name}>
                    {videoItem.file.name}
                  </span>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingVideoId(videoItem.id)}
                      className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-1.5 sm:px-3 h-7 sm:h-8 min-w-[2rem] sm:min-w-[auto]"
                      title="Customize watermark for this video"
                    >
                      <Edit3 className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSingleVideo(videoItem)}
                      className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-1.5 sm:px-3 h-7 sm:h-8 min-w-[2rem] sm:min-w-[auto]"
                      title="Download this video"
                    >
                      <Download className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Individual Image Settings Modal */}
          {editingImage && (
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ImageSettingsModal
                imageItem={editingImage}
                globalSettings={settings}
                watermarkImage={watermarkImage}
                onClose={() => setEditingImageId(null)}
                onSave={(newSettings) => handleImageSettingsSave(editingImage.id, newSettings)}
              />
            </Suspense>
          )}

          {/* Individual Video Settings Modal */}
          {editingVideo && (
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <VideoSettingsModal
                videoItem={editingVideo}
                globalSettings={settings}
                watermarkImage={watermarkImage}
                onClose={() => setEditingVideoId(null)}
                onSave={(newSettings) => handleVideoSettingsSave(editingVideo.id, newSettings)}
              />
            </Suspense>
          )}

          {/* Fullscreen Modal */}
          {fullscreenImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
              onClick={closeFullscreen}
            >
              <div className="relative max-w-full max-h-full">
                <button
                  onClick={closeFullscreen}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                  title="Close fullscreen"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={fullscreenImage || "/placeholder.svg"}
                  alt="Fullscreen preview"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Fullscreen Video Modal */}
          {fullscreenVideo && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
              onClick={closeFullscreenVideo}
            >
              <div className="relative max-w-full max-h-full">
                <button
                  onClick={closeFullscreenVideo}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
                  title="Close fullscreen"
                >
                  <X className="w-6 h-6" />
                </button>
                <video
                  src={fullscreenVideo}
                  controls
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={[...ACCEPTED_FILE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",")}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <canvas ref={analysisCanvasRef} style={{ display: "none" }} />
      </div>
    )
  }

  // Landing page - before image or video upload
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <ImageMarkLogo className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-gray-900">ImageMark</h1>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Add Watermarks <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">Free</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Protect your images and videos with custom watermarks. Fast, secure, and completely free.
          </p>
        </div>

        {/* Upload area */}
        <div className="mb-16">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer ${
              dragActive
                ? "border-teal-400 bg-teal-50"
                : isProcessing || isProcessingVideos
                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-teal-400 hover:bg-teal-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={[...ACCEPTED_FILE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",")}
              multiple
              onChange={handleInputChange}
              className="hidden"
              disabled={isProcessing || isProcessingVideos}
            />

            {isProcessing || isProcessingVideos ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">Processing your files...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-teal-600" />
                </div>
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Images or Videos
                </Button>
                <p className="text-gray-500">
                  or drag and drop • JPG, PNG, GIF, WebP, BMP, TIFF, SVG, MP4, MOV • Multiple files supported
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">Process multiple images and videos in seconds</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-gray-600 text-sm">Files never leave your browser</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
            <p className="text-gray-600 text-sm">No limits, no subscriptions</p>
          </div>
        </div>
      </main>

      <Footer />

      <canvas ref={analysisCanvasRef} style={{ display: "none" }} />
    </div>
  )
}
