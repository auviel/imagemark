import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Watermark Tool - Add Watermarks to Videos Free | ImageMark',
  description:
    'Add watermarks to your videos for free. Support for MP4, MOV, and more. Batch video processing, custom positioning, and instant download. Protect your video content.',
  keywords: [
    'video watermark',
    'watermark video',
    'add watermark to video',
    'video watermark tool',
    'free video watermark',
    'MP4 watermark',
    'video protection',
    'batch video watermark',
    'online video watermark',
  ],
  openGraph: {
    title: 'Video Watermark Tool - Add Watermarks to Videos Free | ImageMark',
    description:
      'Add watermarks to your videos for free. Support for MP4, MOV, and more. Batch video processing and instant download.',
    url: 'https://imagemark.app/videos',
    siteName: 'ImageMark',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'ImageMark - Video Watermark Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Watermark Tool - Add Watermarks to Videos Free',
    description:
      'Add watermarks to your videos for free. Support for MP4, MOV, and more. Batch video processing.',
    images: ['/android-chrome-512x512.png'],
  },
  alternates: {
    canonical: 'https://imagemark.app/videos',
  },
}

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
