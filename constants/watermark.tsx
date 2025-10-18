import type { WatermarkSettings, PositionPreset, FontOption } from "@/types/watermark"

export const DEFAULT_SETTINGS: WatermarkSettings = {
  type: "text",
  text: "Enter text",
  font: "Inter",
  fontSize: 14,
  fontMode: "light",
  customColor: "#ffffff",
  opacity: 10,
  rotation: -45,
  positionX: 50,
  positionY: 50,
  positionPreset: "center",
  imageSize: 25,
}

export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
] as const

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", 
  "video/x-msvideo"
] as const

export const ANALYSIS_SIZE = 100

export const FONT_OPTIONS: FontOption[] = [
  { name: "Inter", family: "Inter, sans-serif", category: "Sans Serif" },
  { name: "Roboto", family: "Roboto, sans-serif", category: "Sans Serif" },
  { name: "Open Sans", family: "'Open Sans', sans-serif", category: "Sans Serif" },
  { name: "Lato", family: "Lato, sans-serif", category: "Sans Serif" },
  { name: "Montserrat", family: "Montserrat, sans-serif", category: "Sans Serif" },
  { name: "Poppins", family: "Poppins, sans-serif", category: "Sans Serif" },
  { name: "Source Sans Pro", family: "'Source Sans Pro', sans-serif", category: "Sans Serif" },
  { name: "Arial", family: "Arial, sans-serif", category: "Sans Serif" },
  { name: "Helvetica", family: "Helvetica, Arial, sans-serif", category: "Sans Serif" },
  { name: "Playfair Display", family: "'Playfair Display', serif", category: "Serif" },
  { name: "Merriweather", family: "Merriweather, serif", category: "Serif" },
  { name: "Lora", family: "Lora, serif", category: "Serif" },
  { name: "Crimson Text", family: "'Crimson Text', serif", category: "Serif" },
  { name: "Times New Roman", family: "'Times New Roman', Times, serif", category: "Serif" },
  { name: "Georgia", family: "Georgia, serif", category: "Serif" },
  { name: "Fira Code", family: "'Fira Code', monospace", category: "Monospace" },
  { name: "Source Code Pro", family: "'Source Code Pro', monospace", category: "Monospace" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace", category: "Monospace" },
  { name: "Courier New", family: "'Courier New', Courier, monospace", category: "Monospace" },
  { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "Display" },
  { name: "Oswald", family: "Oswald, sans-serif", category: "Display" },
  { name: "Anton", family: "Anton, sans-serif", category: "Display" },
  { name: "Bangers", family: "Bangers, cursive", category: "Display" },
  { name: "Impact", family: "Impact, 'Arial Black', sans-serif", category: "Display" },
  { name: "Dancing Script", family: "'Dancing Script', cursive", category: "Script" },
  { name: "Pacifico", family: "Pacifico, cursive", category: "Script" },
  { name: "Great Vibes", family: "'Great Vibes', cursive", category: "Script" },
]

export const POSITION_PRESETS: PositionPreset[] = [
  {
    id: "top-left",
    name: "Top Left",
    x: 15,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "top-center",
    name: "Top Center",
    x: 50,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "top-right",
    name: "Top Right",
    x: 85,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "center-left",
    name: "Center Left",
    x: 15,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-1/2 left-0.5 transform -translate-y-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "center",
    name: "Center",
    x: 50,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "center-right",
    name: "Center Right",
    x: 85,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-1/2 right-0.5 transform -translate-y-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "bottom-left",
    name: "Bottom Left",
    x: 15,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "bottom-center",
    name: "Bottom Center",
    x: 50,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: "bottom-right",
    name: "Bottom Right",
    x: 85,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
]
