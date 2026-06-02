import type { WatermarkSettings, PositionPreset } from '../types/watermark'
export { FONT_OPTIONS } from './fonts'

export const DEFAULT_SETTINGS: WatermarkSettings = {
  type: 'text',
  text: '',
  font: 'Inter',
  fontSize: 14,
  fontMode: 'light',
  customColor: '#ffffff',
  opacity: 10,
  rotation: -45,
  positionX: 50,
  positionY: 50,
  positionPreset: 'center',
  imageSize: 25,
}

export const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
] as const

export const POSITION_PRESETS: PositionPreset[] = [
  {
    id: 'top-left',
    name: 'Top Left',
    x: 15,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'top-center',
    name: 'Top Center',
    x: 50,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'top-right',
    name: 'Top Right',
    x: 85,
    y: 10,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'center-left',
    name: 'Center Left',
    x: 15,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-1/2 left-0.5 transform -translate-y-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'center',
    name: 'Center',
    x: 50,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'center-right',
    name: 'Center Right',
    x: 85,
    y: 50,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute top-1/2 right-0.5 transform -translate-y-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'bottom-left',
    name: 'Bottom Left',
    x: 15,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'bottom-center',
    name: 'Bottom Center',
    x: 50,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
  {
    id: 'bottom-right',
    name: 'Bottom Right',
    x: 85,
    y: 90,
    icon: (
      <div className="w-8 h-8 border-2 border-gray-300 rounded-md relative bg-white">
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
]
