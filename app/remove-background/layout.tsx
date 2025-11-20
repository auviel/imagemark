import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/common'

export const metadata: Metadata = {
  title: 'Remove Background from Images - AI-Powered | ImageMark',
  description:
    'Remove backgrounds from images instantly with AI. Free, fast, and high-quality background removal tool. Perfect for product photos, profile pictures, and more.',
  keywords: [
    'remove background',
    'background removal',
    'transparent background',
    'AI background removal',
    'remove.bg alternative',
    'free background remover',
    'product photo editor',
    'transparent PNG',
  ],
  openGraph: {
    title: 'Remove Background from Images - AI-Powered | ImageMark',
    description:
      'Remove backgrounds from images instantly with AI. Free, fast, and high-quality background removal tool.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove Background from Images - AI-Powered | ImageMark',
    description:
      'Remove backgrounds from images instantly with AI. Free, fast, and high-quality background removal tool.',
  },
}

export default function RemoveBackgroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
