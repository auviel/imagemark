'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ImageMarkLogo as Logo } from '@/components/common'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const onTool = pathname === '/watermark'

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <Logo className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">ImageMark</span>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/faq"
              className={cn(
                'text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors',
                pathname === '/faq' && 'text-teal-700 font-semibold'
              )}
            >
              FAQ
            </Link>
            {!onTool && (
              <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                <Link href="/watermark">
                  Open tool
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white">
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-700 py-2"
                >
                  FAQ
                </Link>
                {!onTool && (
                  <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                    <Link href="/watermark" onClick={() => setMobileMenuOpen(false)}>
                      Open watermark tool
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
