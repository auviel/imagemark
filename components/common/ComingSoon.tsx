'use client'

import { Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFeatureByPath } from '@/constants/features'
import { usePathname } from 'next/navigation'

export function ComingSoon() {
  const pathname = usePathname()
  const feature = getFeatureByPath(pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">{feature?.name || 'Feature'} Coming Soon</CardTitle>
          <CardDescription className="text-base mt-2">
            {feature?.description || 'This feature is currently under development.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-800 text-center">
              We're working hard to bring you this feature. Check back soon!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/watermark">Try Watermark Tool</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
