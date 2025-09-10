import type { Bucket, Task } from '@/features/game/gameSlice'

// Client calls our serverless API; no API keys in the browser.
const isBucket = (b: unknown): b is Bucket => b === 'Now' || b === 'Later' || b === 'Never'

export async function generateTasksWithGroq(goal: string, opts?: { signal?: AbortSignal }): Promise<Task[]> {
  const controller = new AbortController()
  const signal = opts?.signal ?? controller.signal
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
      signal,
    })
    if (!res.ok) {
      let detail = ''
      try { detail = await res.text() } catch { /* noop */ }
      throw new Error('API HTTP ' + res.status + (detail ? ': ' + detail : ''))
    }
    const data: any = await res.json()
    const items: any[] = Array.isArray(data?.tasks) ? data.tasks : []
    const tasks: Task[] = items
      .filter((x) => typeof x?.text === 'string' && isBucket(x?.correctBucket))
      .slice(0, 8)
      .map((x, i) => ({ id: `t${i + 1}`, text: String(x.text).trim(), correctBucket: x.correctBucket }))
    if (!tasks.length) throw new Error('No tasks returned')
    return tasks
  } finally {
    clearTimeout(timeout)
  }
}
