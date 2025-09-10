// Vercel-style serverless function for generating tasks.
// Server env: GROQ_API_KEY. If missing locally, we return a safe fallback.

// Keep these types local to this file; the client has its own types.
type Bucket = 'Now' | 'Later' | 'Never'
type Task = { id: string; text: string; correctBucket: Bucket }

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const isBucket = (b: unknown): b is Bucket => b === 'Now' || b === 'Later' || b === 'Never'

function fallbackTasks(goal: string): Task[] {
  const base: Task[] = [
    { id: 't1', text: `Break goal into 3 steps for: ${goal}`, correctBucket: 'Now' },
    { id: 't2', text: `Schedule time for deep work on: ${goal}`, correctBucket: 'Later' },
    { id: 't3', text: 'Check social media', correctBucket: 'Never' },
    { id: 't4', text: `Gather materials/resources for: ${goal}`, correctBucket: 'Now' },
    { id: 't5', text: 'Tidy your entire room', correctBucket: 'Never' },
    { id: 't6', text: `Email mentor to review outcome of: ${goal}`, correctBucket: 'Later' },
    { id: 't7', text: 'Change phone wallpaper', correctBucket: 'Never' },
  ]
  return base.map((t, i) => ({ ...t, id: `t${i + 1}` }))
}

async function groqGenerate(goal: string, apiKey: string): Promise<Task[]> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.VERCEL_GROQ_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        { role: 'system', content: 'You help users prioritize tasks using the Eisenhower matrix. Respond ONLY with strict JSON matching the required schema.' },
        { role: 'user', content: `Goal: ${goal}\nGenerate 6-8 short, actionable tasks. For each task, set correctBucket to one of "Now" (urgent + important), "Later" (important but not urgent), or "Never" (neither).\nReturn JSON in this shape: {"tasks":[{"text":"...","correctBucket":"Now|Later|Never"}]}` },
      ],
    }),
  })
  if (!res.ok) {
    const detail = await safeText(res)
    throw new Error('GROQ HTTP ' + res.status + (detail ? ': ' + detail : ''))
  }
  const data: any = await res.json()
  const content = data?.choices?.[0]?.message?.content
  const raw = typeof content === 'string' ? content : JSON.stringify(content)
  const jsonText = extractJsonObject(raw)
  const parsed: any = JSON.parse(jsonText)
  const items: any[] = Array.isArray(parsed?.tasks) ? parsed.tasks : []
  const tasks: Task[] = items
    .filter((x) => typeof x?.text === 'string' && isBucket(x?.correctBucket))
    .slice(0, 8)
    .map((x, i) => ({ id: `t${i + 1}`, text: String(x.text).trim(), correctBucket: x.correctBucket }))
  if (!tasks.length) throw new Error('No tasks returned')
  return tasks
}

function extractJsonObject(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch?.[1]) return fenceMatch[1]
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1)
  return text
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text() } catch { return '' }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const goal = String(req.body?.goal || req.query?.goal || '').trim()
    if (!goal) {
      res.status(400).json({ error: 'Missing goal' })
      return
    }
    const key = process.env.GROQ_API_KEY
    if (!key) {
      res.status(200).json({ tasks: fallbackTasks(goal) })
      return
    }
    const tasks = await groqGenerate(goal, key)
    res.status(200).json({ tasks })
  } catch (err: any) {
    console.error('Error generating tasks:', err);
    res.status(200).json({ tasks: fallbackTasks(String(req.body?.goal || '')) })
  }
}
