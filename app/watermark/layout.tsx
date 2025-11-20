import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Watermark Tool - Add Watermarks to Images & Videos | ImageMark',
  description:
    'Add professional watermarks to your images and videos for free. Batch processing, text & logo watermarks, instant download. Protect your content with ImageMark.',
  keywords: [
    'watermark tool',
    'image watermark',
    'video watermark',
    'free watermark',
    'batch watermark',
    'logo watermark',
    'text watermark',
    'protect images',
    'watermark generator',
    'online watermark',
  ],
  openGraph: {
    title: 'Free Watermark Tool - Add Watermarks to Images & Videos | ImageMark',
    description:
      'Add professional watermarks to your images and videos for free. Batch processing, text & logo watermarks, instant download.',
    url: 'https://imagemark.app/watermark',
    siteName: 'ImageMark',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'ImageMark - Free Watermark Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Watermark Tool - Add Watermarks to Images & Videos',
    description:
      'Add professional watermarks to your images and videos for free. Batch processing, text & logo watermarks.',
    images: ['/android-chrome-512x512.png'],
  },
  alternates: {
    canonical: 'https://imagemark.app/watermark',
  },
}

export default function WatermarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
