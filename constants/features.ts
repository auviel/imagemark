import type { LucideIcon } from 'lucide-react'
import {
  Droplet,
  Zap,
  RefreshCw,
  Scissors,
  Package,
  Archive,
  Lock,
  Smartphone,
  BarChart,
  Eraser,
  Image,
  Settings,
} from 'lucide-react'

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

export interface FeatureCategory {
  id: string
  name: string
  icon: LucideIcon
  features: Feature[]
}

export const FEATURES: Feature[] = [
  {
    id: 'resize',
    name: 'Resize',
    path: '/resize',
    icon: Scissors,
    description: 'Resize images to specific dimensions or aspect ratios',
    enabled: false,
    comingSoon: true,
    priority: 'medium',
    category: 'editing',
  },
  {
    id: 'optimize',
    name: 'Optimize',
    path: '/optimize',
    icon: Zap,
    description: 'Compress images to reduce file size while maintaining quality',
    enabled: false,
    comingSoon: true,
    priority: 'high',
    category: 'optimization',
  },
  {
    id: 'convert',
    name: 'Convert',
    path: '/convert',
    icon: RefreshCw,
    description: 'Convert images between formats (JPEG, PNG, WebP, AVIF)',
    enabled: true,
    comingSoon: false,
    priority: 'high',
    category: 'optimization',
  },
  {
    id: 'watermark',
    name: 'Watermark',
    path: '/watermark',
    icon: Droplet,
    description: 'Add text or logo watermarks to images and videos',
    enabled: true,
    priority: 'high',
    category: 'editing',
  },
  {
    id: 'background-removal',
    name: 'Remove Background',
    path: '/remove-background',
    icon: Eraser,
    description: 'AI-powered automatic background removal',
    enabled: true,
    comingSoon: false,
    priority: 'high',
    category: 'editing',
  },
  {
    id: 'exif',
    name: 'Remove EXIF',
    path: '/exif',
    icon: Lock,
    description: 'Remove metadata and location data from images',
    enabled: false,
    comingSoon: true,
    priority: 'medium',
    category: 'optimization',
  },
  {
    id: 'bulk',
    name: 'Bulk Process',
    path: '/bulk',
    icon: Package,
    description: 'Process multiple images at once',
    enabled: false,
    comingSoon: true,
    priority: 'medium',
    category: 'batch',
  },
  {
    id: 'archive',
    name: 'Archive Optimizer',
    path: '/archive',
    icon: Archive,
    description: 'Optimize all images inside a ZIP archive',
    enabled: false,
    comingSoon: true,
    priority: 'medium',
    category: 'batch',
  },
  {
    id: 'adaptive',
    name: 'Adaptive Images',
    path: '/adaptive',
    icon: Smartphone,
    description: 'Generate multiple sizes for responsive design',
    enabled: false,
    comingSoon: true,
    priority: 'medium',
    category: 'advanced',
  },
  {
    id: 'quality',
    name: 'Quality Check',
    path: '/quality',
    icon: BarChart,
    description: 'Compare original vs optimized images side-by-side',
    enabled: false,
    comingSoon: true,
    priority: 'low',
    category: 'advanced',
  },
  {
    id: 'on-the-fly',
    name: 'On-the-Fly',
    path: '/on-the-fly',
    icon: Zap,
    description: 'Real-time image transformations via URL',
    enabled: false,
    comingSoon: true,
    priority: 'low',
    category: 'advanced',
  },
]

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'editing',
    name: 'Editing',
    icon: Image,
    features: FEATURES.filter((f) => f.category === 'editing'),
  },
  {
    id: 'optimization',
    name: 'Optimization',
    icon: Zap,
    features: FEATURES.filter((f) => f.category === 'optimization'),
  },
  {
    id: 'more',
    name: 'More',
    icon: Settings,
    features: FEATURES.filter((f) => f.category === 'advanced'),
  },
]

export const getFeatureByPath = (path: string): Feature | undefined => {
  return FEATURES.find((feature) => feature.path === path)
}

export const getEnabledFeatures = (): Feature[] => {
  return FEATURES.filter((feature) => feature.enabled)
}

export const getComingSoonFeatures = (): Feature[] => {
  return FEATURES.filter((feature) => feature.comingSoon)
}
