import type { WatermarkSettings } from '../types'

export interface StylePreset {
  id: string
  name: string
  description: string
  settings: Partial<WatermarkSettings>
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'subtle-corner',
    name: 'Subtle corner',
    description: 'Small, light, bottom-right',
    settings: {
      type: 'text',
      positionPreset: 'bottom-right',
      positionX: 85,
      positionY: 90,
      fontSize: 8,
      opacity: 12,
      rotation: 0,
      fontMode: 'light',
    },
  },
  {
    id: 'copyright',
    name: 'Copyright',
    description: 'Centered, readable',
    settings: {
      type: 'text',
      positionPreset: 'center',
      positionX: 50,
      positionY: 50,
      fontSize: 12,
      opacity: 28,
      rotation: 0,
      fontMode: 'light',
    },
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    description: 'Classic tiled look',
    settings: {
      type: 'text',
      positionPreset: 'center',
      positionX: 50,
      positionY: 50,
      fontSize: 14,
      opacity: 10,
      rotation: -45,
      fontMode: 'light',
    },
  },
  {
    id: 'logo-corner',
    name: 'Logo corner',
    description: 'For uploaded logos',
    settings: {
      type: 'image',
      positionPreset: 'bottom-right',
      positionX: 85,
      positionY: 90,
      imageSize: 18,
      opacity: 85,
      rotation: 0,
    },
  },
]
