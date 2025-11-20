'use client'

import { useRouter } from 'next/navigation'
import { useRef, useCallback, useState } from 'react'
import { Upload, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturePageLayout } from '@/components/layout'
import { CONVERT_FAQ_DATA } from '@/data/faq/convert'

export default function ConvertPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    async (files: File[]) => {
      const filePromises = files.map((file) => {
        return new Promise<{ name: string; type: string; dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              dataUrl: reader.result as string,
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      try {
        const fileData = await Promise.all(filePromises)
        sessionStorage.setItem('editor_pending_files', JSON.stringify(fileData))
        router.push('/editor?feature=convert')
      } catch (error) {
        console.error('Failed to process files:', error)
        router.push('/editor?feature=convert')
      }
    },
    [router]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files)
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  return (
    <FeaturePageLayout
      icon={RefreshCw}
      title="Convert Image Format"
      description="Convert images between formats (JPEG, PNG, WebP, AVIF, GIF)"
      iconColor="teal"
      features={[
        {
          icon: RefreshCw,
          title: 'Multiple Formats',
          description: 'Convert between JPEG, PNG, WebP, AVIF, and GIF',
        },
        {
          icon: Upload,
          title: 'Batch Processing',
          description: 'Convert multiple images at once',
        },
      ]}
      faqItems={CONVERT_FAQ_DATA}
      faqShowAll={false}
      faqMaxItems={4}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
            dragActive
              ? 'border-teal-400 bg-teal-50 scale-[1.02]'
              : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Choose Images
            </Button>
            <p className="text-xs text-gray-500">
              or drag and drop images here • or paste from clipboard (Ctrl/Cmd + V)
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </FeaturePageLayout>
  )
}
