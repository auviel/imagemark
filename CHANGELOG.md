# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-18

### Added
- Footer component with ImageMark logo, copyright, and version information
- Enhanced position preset system with improved X coordinates
- Automatic opacity adjustment for image watermarks (100% default)
- Automatic rotation reset (0°) when selecting position presets

### Changed
- Updated position preset X coordinates for better visual balance:
  - Top Left, Center Left, Bottom Left: 10% → 15%
  - Top Right, Center Right, Bottom Right: 90% → 85%
- Improved default watermark settings for better user experience
- Enhanced footer branding with "ImageMark by Auviel"

### Fixed
- Security vulnerabilities in dependencies
- Dependency conflicts and version mismatches
- Updated all packages to latest stable versions

### Technical Improvements
- Cleaned up unnecessary dependencies (Remix, Svelte, Vue)
- Updated React Day Picker to v9 for React 19 compatibility
- Updated Vaul to v1.1.2 for React 19 compatibility
- Updated date-fns to v3.6.0 for compatibility
- Resolved all npm audit security issues

## [1.0.0] - 2024-01-XX

### Added
- Initial release of ImageMark watermarking tool
- Text watermark functionality with customizable properties
- Image/logo watermark support
- Batch image processing capabilities
- Drag and drop file upload interface
- Real-time watermark preview
- Individual and bulk download options
- Responsive design for all device sizes
- Smart brightness detection for optimal watermark visibility
- Advanced positioning and opacity controls
- ZIP file generation for batch downloads
- Progressive Web App (PWA) manifest
- Comprehensive accessibility features

### Features
- Support for JPEG and PNG input formats
- PNG output with lossless quality
- Client-side processing for maximum privacy
- No server dependencies or data transmission
- Cross-browser compatibility
- Mobile-optimized interface
- Keyboard navigation support
- Screen reader compatibility

### Technical
- Built with Next.js 14 and TypeScript
- Styled with Tailwind CSS and shadcn/ui components
- HTML5 Canvas API for image processing
- Modern React hooks and patterns
- Optimized performance and memory management
\`\`\`

\`\`\`typescriptreact file="app/layout.tsx"
[v0-no-op-code-block-prefix]import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ImageMark - Free Online Watermark Tool | Add Watermarks to Images",
  description:
    "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download. Protect your photos and images with professional watermarks.",
  keywords: [
    "watermark",
    "image watermark",
    "photo watermark",
    "batch watermark",
    "free watermark tool",
    "online watermark",
    "protect images",
    "logo watermark",
    "text watermark",
    "image protection",
  ],
  authors: [{ name: "ImageMark" }],
  creator: "ImageMark",
  publisher: "ImageMark",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://imagemark.app",
    title: "ImageMark - Free Online Watermark Tool",
    description: "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.",
    siteName: "ImageMark",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ImageMark - Free Online Watermark Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageMark - Free Online Watermark Tool",
    description: "Add watermarks to your images for free. Batch processing, text & logo watermarks, instant download.",
    images: ["/og-image.png"],
    creator: "@imagemark",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://imagemark.app",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0D9488" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
