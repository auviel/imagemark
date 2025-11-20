'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'

interface BreadcrumbItemData {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItemData[]
  className?: string
}

/**
 * Breadcrumbs component with schema markup
 * Automatically generates breadcrumbs from pathname or accepts custom items
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems: BreadcrumbItemData[] = items || generateBreadcrumbsFromPath(pathname)

  // Generate schema markup for SEO
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://imagemark.app${item.href}`,
    })),
  }

  if (breadcrumbItems.length <= 1) {
    return null // Don't show breadcrumbs if only one item
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <div key={item.href} className="flex items-center">
                {index === 0 && (
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
                {index > 0 && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItemData[] {
  const items: BreadcrumbItemData[] = [{ label: 'Home', href: '/' }]

  if (pathname === '/') {
    return items
  }

  const segments = pathname.split('/').filter(Boolean)
  const pathMap: Record<string, string> = {
    watermark: 'Watermark Tool',
    videos: 'Video Watermarking',
    faq: 'FAQ',
    optimize: 'Image Optimization',
    convert: 'Format Conversion',
    resize: 'Resize & Crop',
    bulk: 'Bulk Processing',
    tools: 'Tools',
  }

  let currentPath = ''
  segments.forEach((segment) => {
    currentPath += `/${segment}`
    const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    items.push({ label, href: currentPath })
  })

  return items
}
