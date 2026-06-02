/** Max longest edge for live preview canvases (export stays full resolution). */
export const MAX_PREVIEW_EDGE = 1920

export function getPreviewDimensions(
  width: number,
  height: number,
  maxEdge: number = MAX_PREVIEW_EDGE
): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= maxEdge) return { width, height }
  const scale = maxEdge / longest
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}
