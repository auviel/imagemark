import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watermark Images — Free & Private | ImageMark',
  description:
    'Add text or logo watermarks to images in your browser. Batch processing, ZIP download, no account. Your files never leave your device.',
  keywords: [
    'watermark tool',
    'image watermark',
    'free watermark',
    'batch watermark',
    'logo watermark',
    'text watermark',
    'protect images',
    'private watermark',
    'browser watermark',
  ],
  openGraph: {
    title: 'Watermark Images — Free & Private | ImageMark',
    description: 'Add text or logo watermarks in your browser. Free, private, no account required.',
    url: 'https://imagemark.app/watermark',
    siteName: 'ImageMark',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'ImageMark watermark tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watermark Images — Free & Private | ImageMark',
    description: 'Free in-browser image watermarking. Your files stay on your device.',
    images: ['/android-chrome-512x512.png'],
  },
  alternates: {
    canonical: 'https://imagemark.app/watermark',
  },
}

export default function WatermarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
