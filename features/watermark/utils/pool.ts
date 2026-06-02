/** Run async tasks with a concurrency limit. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return []
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await fn(items[index], index)
    }
  }

  const workers = Math.min(Math.max(1, limit), items.length)
  await Promise.all(Array.from({ length: workers }, () => worker()))
  return results
}
