'use client'

import { Shield } from 'lucide-react'

export function PrivacyBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800"
      title="Your images are processed locally in this browser tab"
    >
      <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Private · local processing</span>
    </div>
  )
}
