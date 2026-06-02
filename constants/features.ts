import type { LucideIcon } from 'lucide-react'
import { Droplet } from 'lucide-react'

export interface Feature {
  id: string
  name: string
  path: string
  icon: LucideIcon
  description: string
  enabled: boolean
  comingSoon?: boolean
  priority: 'high' | 'medium' | 'low'
  category?: string
}

/** ImageMark ships one tool: private, in-browser image watermarking. */
export const FEATURES: Feature[] = [
  {
    id: 'watermark',
    name: 'Watermark',
    path: '/watermark',
    icon: Droplet,
    description: 'Add text or logo watermarks to your images — free, private, in your browser',
    enabled: true,
    priority: 'high',
    category: 'editing',
  },
]

export const getFeatureByPath = (path: string): Feature | undefined => {
  return FEATURES.find((feature) => feature.path === path)
}

export const getEnabledFeatures = (): Feature[] => {
  return FEATURES.filter((feature) => feature.enabled)
}
