'use client'

import { useCallback, useState } from 'react'
import type { ImageItem } from '../types'
import { createImageFromFile, validateFileTypes } from '../utils'

function toFileList(files: FileList | File[]): FileList {
  if (files instanceof FileList) return files
  const dt = new DataTransfer()
  files.forEach((f) => dt.items.add(f))
  return dt.files
}

export const useImageUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false)

  const processFiles = useCallback(async (files: FileList | File[]): Promise<ImageItem[]> => {
    setIsProcessing(true)

    try {
      const validFiles = validateFileTypes(toFileList(files))

      if (validFiles.length === 0) {
        return []
      }

      const imagePromises = validFiles.map(async (file, index) => {
        const image = await createImageFromFile(file)
        return {
          id: `${Date.now()}-${index}`,
          image,
          file,
        }
      })

      return await Promise.all(imagePromises)
    } catch {
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    processFiles,
    isProcessing,
  }
}
