import type { WatermarkSettings, ImageItem } from '../types'
import { drawWatermarkOnCanvasCore } from './canvas-draw-core'
import { ensureFontsLoaded } from './font-loader'
import type { ResolvedExportFormat } from './export-format'
import type { ExportWorkerRequest, ExportWorkerResponse } from '../workers/export.worker'

let workerInstance: Worker | null = null
let workerFailed = false

function getExportWorker(): Worker | null {
  if (workerFailed || typeof Worker === 'undefined') return null
  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('../workers/export.worker.ts', import.meta.url))
      workerInstance.onerror = () => {
        workerFailed = true
        workerInstance?.terminate()
        workerInstance = null
      }
    } catch {
      workerFailed = true
      return null
    }
  }
  return workerInstance
}

async function copyBitmap(bitmap: ImageBitmap): Promise<ImageBitmap> {
  return createImageBitmap(bitmap)
}

function exportOnMainThread(
  image: ImageBitmap,
  settings: WatermarkSettings,
  watermarkImage: ImageBitmap | null,
  format: ResolvedExportFormat
): Promise<Blob> {
  return ensureFontsLoaded(settings).then(() => {
    const canvas = document.createElement('canvas')
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
    return canvasToBlob(canvas, format.mime, format.quality)
  })
}

function exportViaWorker(
  image: ImageBitmap,
  settings: WatermarkSettings,
  watermarkImage: ImageBitmap | null,
  format: ResolvedExportFormat
): Promise<Blob> {
  const worker = getExportWorker()
  if (!worker) {
    return exportOnMainThread(image, settings, watermarkImage, format)
  }

  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()

    const onMessage = (event: MessageEvent<ExportWorkerResponse>) => {
      if (event.data.id !== id) return
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)

      if (event.data.ok) {
        resolve(new Blob([event.data.buffer], { type: event.data.mimeType }))
      } else {
        reject(new Error(event.data.error))
      }
    }

    const onError = () => {
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
      workerFailed = true
      exportOnMainThread(image, settings, watermarkImage, format).then(resolve).catch(reject)
    }

    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)

    Promise.all([
      copyBitmap(image),
      watermarkImage ? copyBitmap(watermarkImage) : Promise.resolve(null),
    ])
      .then(([imageCopy, watermarkCopy]) => {
        const payload: ExportWorkerRequest = {
          id,
          image: imageCopy,
          watermarkImage: watermarkCopy,
          settings,
          mimeType: format.mime,
          quality: format.quality,
        }
        const transfers: Transferable[] = [imageCopy]
        if (watermarkCopy) transfers.push(watermarkCopy)
        worker.postMessage(payload, transfers)
      })
      .catch(reject)
  })
}

export function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mime: 'image/png' | 'image/jpeg',
  quality?: number
): Promise<Blob> {
  const jpegQuality = mime === 'image/jpeg' ? (quality ?? 0.92) : undefined

  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type: mime, quality: jpegQuality })
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      mime,
      jpegQuality
    )
  })
}

export async function exportWatermarkedBlob(
  imageItem: ImageItem,
  settings: WatermarkSettings,
  watermarkImage: ImageBitmap | null,
  format: ResolvedExportFormat
): Promise<Blob> {
  const effectiveSettings = imageItem.customSettings ?? settings
  try {
    return await exportViaWorker(imageItem.image, effectiveSettings, watermarkImage, format)
  } catch {
    return exportOnMainThread(imageItem.image, effectiveSettings, watermarkImage, format)
  }
}

export function closeImageBitmap(bitmap: ImageBitmap | null | undefined): void {
  if (!bitmap) return
  try {
    bitmap.close()
  } catch {
    /* already closed */
  }
}
