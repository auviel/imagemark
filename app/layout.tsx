import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { Suspense } from 'react'
import { Navigation } from '@/components/layout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ServiceWorkerRegistration } from '@/components/common/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://imagemark.app'),
  title: 'ImageMark - Free Online Watermark Tool | Add Watermarks to Images',
  description:
    'Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download. Protect your photos and images with professional watermarks.',
  keywords: [
    'watermark',
    'image watermark',
    'photo watermark',
    'batch watermark',
    'free watermark tool',
    'online watermark',
    'protect images',
    'logo watermark',
    'text watermark',
    'image protection',
  ],
  authors: [{ name: 'Auviel' }],
  creator: 'Auviel',
  publisher: 'Auviel',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://imagemark.app',
    title: 'ImageMark - Free Online Watermark Tool',
    description:
      'Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.',
    siteName: 'ImageMark',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'ImageMark - Free Online Watermark Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImageMark - Free Online Watermark Tool',
    description:
      'Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.',
    images: ['/android-chrome-512x512.png'],
    creator: '@auviel',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://imagemark.app',
  },
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <meta name="theme-color" content="#0D9488" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.shortpixel.com" />
        <link rel="preconnect" href="https://api.shortpixel.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=Crimson+Text:wght@400;700&family=Fira+Code:wght@400;700&family=Source+Code+Pro:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Bebas+Neue&family=Oswald:wght@400;700&family=Anton&family=Bangers&family=Dancing+Script:wght@400;700&family=Pacifico&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/android-chrome-512x512.png" as="image" type="image/png" />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'ImageMark',
              description:
                'Free online watermark tool for images and videos. Add professional watermarks to protect your content.',
              url: 'https://imagemark.app',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'Auviel',
                url: 'https://www.auviel.com',
              },
              featureList: [
                'Text watermarking',
                'Image watermarking',
                'Video watermarking',
                'Batch processing',
                'Real-time preview',
                'Multiple file formats',
                'Privacy-first processing',
              ],
            }),
          }}
        />
        <Navigation />
        <ErrorBoundary>
          <Suspense>{children}</Suspense>
        </ErrorBoundary>
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
