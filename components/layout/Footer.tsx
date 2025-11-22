import type React from 'react'
import { ImageMarkLogo } from '@/components/common'

interface FooterProps {
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear()
  const version = '1.2.2' // You can update this or get it from package.json

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 py-8 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <ImageMarkLogo className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">ImageMark</span>
          </div>

          {/* Copyright and Version */}
          <div className="flex flex-col items-center space-y-2 text-sm text-gray-600">
            <p>
              © {currentYear} ImageMark by{' '}
              <a
                href="https://auviel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Auviel
              </a>
              . All rights reserved.
            </p>
            <p className="text-xs text-gray-500">Version {version}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
