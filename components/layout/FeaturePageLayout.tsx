/**
 * Reusable Feature Page Layout Component
 *
 * Provides a consistent structure for all feature pages:
 * - Header with icon, title, description
 * - Main content area
 * - Features section (optional)
 * - FAQ section (optional, feature-specific)
 * - Footer
 *
 * This ensures all feature pages have the same professional structure
 * while allowing customization per feature.
 */

'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Footer } from '@/components/layout'
import { FAQ } from '@/components/common'
import type { FAQItem } from '@/data/faq'

interface FeaturePageLayoutProps {
  /** Feature icon component */
  icon: LucideIcon
  /** Feature title */
  title: string
  /** Feature description */
  description: string
  /** Icon background color (default: teal) */
  iconColor?: 'teal' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'indigo'
  /** Main content area */
  children: ReactNode
  /** Optional features section (3-column grid) */
  features?: Array<{
    icon: LucideIcon
    title: string
    description: string
  }>
  /** Optional FAQ items (feature-specific) */
  faqItems?: FAQItem[]
  /** Show all FAQ items or limit to maxItems */
  faqShowAll?: boolean
  /** Maximum FAQ items to show (if showAll is false) */
  faqMaxItems?: number
  /** Optional header actions (buttons, etc.) */
  headerActions?: ReactNode
}

const iconColorClasses = {
  teal: 'bg-teal-100 text-teal-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  pink: 'bg-pink-100 text-pink-600',
  indigo: 'bg-indigo-100 text-indigo-600',
}

const iconColorHoverClasses = {
  teal: 'border-teal-400 bg-teal-50',
  blue: 'border-blue-400 bg-blue-50',
  purple: 'border-purple-400 bg-purple-50',
  green: 'border-green-400 bg-green-50',
  orange: 'border-orange-400 bg-orange-50',
  red: 'border-red-400 bg-red-50',
  pink: 'border-pink-400 bg-pink-50',
  indigo: 'border-indigo-400 bg-indigo-50',
}

const iconColorButtonClasses = {
  teal: 'bg-teal-600 hover:bg-teal-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  green: 'bg-green-600 hover:bg-green-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  red: 'bg-red-600 hover:bg-red-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
}

export function FeaturePageLayout({
  icon: Icon,
  title,
  description,
  iconColor = 'teal',
  children,
  features,
  faqItems,
  faqShowAll = false,
  faqMaxItems = 3,
  headerActions,
}: FeaturePageLayoutProps) {
  const iconClass = iconColorClasses[iconColor]
  const hoverClass = iconColorHoverClasses[iconColor]
  const buttonClass = iconColorButtonClasses[iconColor]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-12 h-12 ${iconClass} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
            </div>
            <p className="text-gray-600">{description}</p>
            {headerActions && (
              <div className="flex items-center space-x-2 mt-4">{headerActions}</div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Features Section (optional) */}
      {features && features.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-12 h-12 ${iconClass} rounded-lg flex items-center justify-center mx-auto mb-3`}
                    >
                      <FeatureIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section (optional) */}
      {faqItems && faqItems.length > 0 && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions about {title}
              </p>
            </div>

            <FAQ items={faqItems} showAll={faqShowAll} maxItems={faqMaxItems} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
