import type { NextConfig } from "next"
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Security headers configuration
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://vercel.live",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  // Enable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Image optimization - enabled for better performance
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Ensure static files are properly served
  trailingSlash: false,
  async redirects() {
    return [
      { source: '/editor', destination: '/watermark', permanent: true },
      { source: '/convert', destination: '/watermark', permanent: true },
      { source: '/convert/:path*', destination: '/watermark', permanent: true },
      { source: '/remove-background', destination: '/watermark', permanent: true },
      { source: '/remove-background/:path*', destination: '/watermark', permanent: true },
      { source: '/optimize', destination: '/watermark', permanent: true },
      { source: '/optimize/:path*', destination: '/watermark', permanent: true },
      { source: '/resize', destination: '/watermark', permanent: true },
      { source: '/resize/:path*', destination: '/watermark', permanent: true },
      { source: '/bulk', destination: '/watermark', permanent: true },
      { source: '/archive', destination: '/watermark', permanent: true },
      { source: '/exif', destination: '/watermark', permanent: true },
      { source: '/quality', destination: '/watermark', permanent: true },
      { source: '/adaptive', destination: '/watermark', permanent: true },
      { source: '/on-the-fly', destination: '/watermark', permanent: true },
      { source: '/videos', destination: '/watermark', permanent: true },
    ]
  },
  // Security headers and static file headers
  async headers() {
    return [
      // Apply security headers to all routes
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Specific headers for manifest and icon files
      {
        source: "/site.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/favicon-:size.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/android-chrome-:size.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          ...securityHeaders,
        ],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          ...securityHeaders,
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
