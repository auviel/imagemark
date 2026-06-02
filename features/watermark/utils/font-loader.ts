import type { WatermarkSettings } from '../types'
import { getFontFamily } from '../constants/fonts'

type FontFaceContainer = { fonts?: FontFaceSet }

const FONT_LOAD_TIMEOUT_MS = 2000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([
    promise,
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), ms)),
  ])
}

/** Preload watermark font on the main thread before canvas text draw. */
export async function ensureFontsLoaded(settings: WatermarkSettings): Promise<void> {
  if (settings.type !== 'text' || !settings.text.trim()) return
  if (typeof document === 'undefined' || !document.fonts?.load) return

  const family = getFontFamily(settings.font)
  const sampleSize = Math.max(12, Math.round((settings.fontSize / 100) * 48))
  try {
    await withTimeout(document.fonts.load(`bold ${sampleSize}px ${family}`), FONT_LOAD_TIMEOUT_MS)
  } catch {
    /* fall back to system font */
  }
}

/** Worker-safe font preload when FontFaceSet is available. */
export async function ensureFontsLoadedInWorker(settings: WatermarkSettings): Promise<void> {
  if (settings.type !== 'text' || !settings.text.trim()) return
  const fonts = (self as FontFaceContainer).fonts
  if (!fonts?.load) return

  const family = getFontFamily(settings.font)
  const sampleSize = Math.max(12, Math.round((settings.fontSize / 100) * 48))
  try {
    await withTimeout(fonts.load(`bold ${sampleSize}px ${family}`), FONT_LOAD_TIMEOUT_MS)
  } catch {
    /* system fallback */
  }
}
