/// <reference lib="webworker" />
import type { WatermarkSettings } from '../types'
import { drawWatermarkOnCanvasCore } from '../utils/canvas-draw-core'
import { ensureFontsLoadedInWorker } from '../utils/font-loader'

export interface ExportWorkerRequest {
  id: string
  image: ImageBitmap
  watermarkImage: ImageBitmap | null
  settings: WatermarkSettings
  mimeType: 'image/png' | 'image/jpeg'
  quality?: number
}

export interface ExportWorkerSuccess {
  id: string
  ok: true
  buffer: ArrayBuffer
  mimeType: string
}

export interface ExportWorkerFailure {
  id: string
  ok: false
  error: string
}

export type ExportWorkerResponse = ExportWorkerSuccess | ExportWorkerFailure

self.onmessage = async (event: MessageEvent<ExportWorkerRequest>) => {
  const { id, image, watermarkImage, settings, mimeType, quality } = event.data

  try {
    await ensureFontsLoadedInWorker(settings)

    const canvas = new OffscreenCanvas(image.width, image.height)
    drawWatermarkOnCanvasCore(
      image,
      image.width,
      image.height,
      canvas,
      settings,
      watermarkImage,
      watermarkImage?.width,
      watermarkImage?.height,
      undefined,
      'high'
    )

    const blob = await canvas.convertToBlob({
      type: mimeType,
      quality: mimeType === 'image/jpeg' ? (quality ?? 0.92) : undefined,
    })

    const buffer = await blob.arrayBuffer()
    image.close()
    watermarkImage?.close()

    const response: ExportWorkerSuccess = { id, ok: true, buffer, mimeType }
    self.postMessage(response, [buffer])
  } catch (err) {
    try {
      image.close()
      watermarkImage?.close()
    } catch {
      /* already closed */
    }
    const response: ExportWorkerFailure = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : 'Export failed',
    }
    self.postMessage(response)
  }
}
