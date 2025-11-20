import type { Metadata } from 'next'
import { FAQ, Breadcrumbs } from '@/components/common'
import { FAQ_DATA } from '@/data/faq'
import { Footer } from '@/components/layout'
import { ImageMarkLogo } from '@/components/common'
import Link from 'next/link'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | ImageMark',
  description:
    'Find answers to common questions about ImageMark watermark tool. Learn how to add watermarks, supported formats, security, and more.',
  keywords: [
    'watermark FAQ',
    'image watermark questions',
    'watermark tool help',
    'ImageMark support',
    'watermarking guide',
  ],
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs />
      </div>

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <ImageMarkLogo className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">ImageMark</span>
            </Link>

            <Link href="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_DATA.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about ImageMark. Can't find what you're looking for?
            <Link
              href="https://github.com/auviel/imagemark/issues"
              className="text-teal-600 hover:underline ml-1"
            >
              Contact us
            </Link>
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <FAQ items={FAQ_DATA} showAll={true} />
        </div>

        {/* Additional Help */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            If you can't find the answer you're looking for, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://github.com/auviel/imagemark/issues">
              <Button className="w-full sm:w-auto">Report an Issue</Button>
            </Link>
            <Link href="https://www.auviel.com">
              <Button variant="outline" className="w-full sm:w-auto">
                Visit Auviel
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
