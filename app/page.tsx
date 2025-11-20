'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FEATURES } from '@/constants/features'
import { Footer } from '@/components/layout'
import { FAQ, Breadcrumbs } from '@/components/common'
import { FAQ_DATA } from '@/data/faq'
import { UnifiedToolbar } from '@/components/layout'

export default function HomePage() {
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const enabledFeatures = FEATURES.filter((f) => f.enabled)
  const comingSoonFeatures = FEATURES.filter((f) => f.comingSoon)

  const displayedFeatures = showAllFeatures ? FEATURES : FEATURES.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-teal-100 text-teal-800 hover:bg-teal-100">
            <Sparkles className="w-3 h-3 mr-1" />
            Free Image Processing Suite
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            All-in-One Image Tools
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Watermark, optimize, convert, resize, and more. Everything you need to process images,
            all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/watermark">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {displayedFeatures.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card
                  key={feature.id}
                  className={`
                    relative overflow-hidden transition-all duration-200
                    ${
                      feature.enabled
                        ? 'hover:shadow-lg hover:border-teal-300 cursor-pointer'
                        : 'opacity-75 cursor-not-allowed'
                    }
                  `}
                >
                  {feature.enabled ? (
                    <Link href={feature.path} className="block h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-teal-600" />
                          </div>
                          {feature.enabled && (
                            <Badge variant="default" className="bg-teal-600">
                              Available
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="ghost"
                          className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        >
                          Try Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Link>
                  ) : (
                    <>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-gray-400" />
                          </div>
                          {feature.comingSoon && <Badge variant="secondary">Coming Soon</Badge>}
                        </div>
                        <CardTitle className="text-xl">{feature.name}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="ghost"
                          disabled
                          className="w-full text-gray-400 cursor-not-allowed"
                        >
                          Coming Soon
                        </Button>
                      </CardContent>
                    </>
                  )}
                </Card>
              )
            })}
          </div>

          {!showAllFeatures && FEATURES.length > 6 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllFeatures(true)}
                className="text-gray-700 hover:text-gray-900"
              >
                Explore More Features
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {showAllFeatures && FEATURES.length > 6 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllFeatures(false)}
                className="text-gray-700 hover:text-gray-900"
              >
                Show Less
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Key Features Highlight */}
        <div className="grid sm:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">Process multiple images in seconds</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-gray-600 text-sm">Files never leave your browser</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
            <p className="text-gray-600 text-sm">No limits, no subscriptions</p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions about ImageMark
              </p>
            </div>

            <FAQ items={FAQ_DATA} maxItems={3} />

            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/faq">
                  View all FAQs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </div>
  )
}
