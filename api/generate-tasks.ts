// Updated bucket labels
type Bucket = 'Current Goal' | 'Next Task' | 'After Work'
type Task = { id: string; text: string; correctBucket: Bucket }

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const isBucket = (b: unknown): b is Bucket => b === 'Current Goal' || b === 'Next Task' || b === 'After Work'

function fallbackTasks(goal: string): Task[] {
  const base: Task[] = [
    { id: 't1', text: `List 3 micro steps for ${goal}`, correctBucket: 'Current Goal' },
    { id: 't2', text: `Draft one opening line for ${goal}`, correctBucket: 'Current Goal' },
    { id: 't3', text: 'Schedule focused work block', correctBucket: 'Next Task' },
    { id: 't4', text: 'Gather 2 reference materials', correctBucket: 'Next Task' },
    { id: 't5', text: 'Check Instagram feed', correctBucket: 'After Work' },
    { id: 't6', text: 'Tidy random folders', correctBucket: 'After Work' },
    { id: 't7', text: 'Browse unrelated news', correctBucket: 'After Work' },
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
      model: process.env.VERCEL_GROQ_MODEL || process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'mixtral-8x7b-32768',
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        {
          //how to behave and constraints (Set the assistant’s rules, persona, and hard constraints.)
          role: 'system',
          content: [
            'You are an expert ADHD productivity coach. Your job is to produce a clean, unambiguous and simple set of tasks split across three buckets: Current Goal, Next Task, and After Work.',
            '- Current Goal = ONLY tiny, immediate next actions that take under 5–10 minutes and directly progress the stated goal. Must be executable right this second (e.g., "Write the opening sentence", "List 3 subtopics").',
            '- Next Task = tasks that are useful but not the exact micro-step toward the current goal. They are still related but involve prep, setup, or future steps (e.g., "Schedule research session", "Gather reading materials").',
            '- After Work = distractions or unrelated activities that do not help the goal at all (e.g., "Check Instagram", "Rearrange files", "Watch YouTube").',
            'Strict rules: If a task could fit both Current Goal and Next Task, ALWAYS classify as Current Goal only if it is a single, bite-sized action that directly moves the goal forward immediately. Otherwise, classify as Next Task. No vague, Confusing, or overlapping tasks since this is for ADHD people or consider as if it is for children.',
            'Keep text concise (4–12 words), imperative, and action-oriented. No explanations or extra fields. Respond ONLY with valid JSON in the schema.'
          ].join('\n')
        },
        {
          //what to do with the given input. (Purpose: Provide the actual task/request and inputs.)
          role: 'user',
          content: [
            `Goal: ${goal}`,
            'Generate exactly 6–8 tasks with a balanced mix: at least 2 Current Goal, 2 Next Task, 2 After Work.',
            'Examples:',
            '- Current Goal: "Draft opening sentence", "List 3 main points", "Jot down 5 references", "Write one opening sentence", "Open the document and write the title".',
            '- Next Task: "Schedule research time", "Review assignment outline", "Gather 3 articles", "Find 3 reference articles to read later".',
            '- After Work: "Check TikTok", "Sort old photos", "Read random news".',
            'Return strict JSON of this shape: {"tasks":[{"text":"...","correctBucket":"Current Goal|Next Task|After Work"}]}'
          ].join('\n')
        },
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
  // We rely on the model's classification now; minimal distinctness enforcement.
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

// Legacy heuristic + enrichment functions removed (commented out) to trust the model's direct labeling.
// If classification quality degrades, reintroduce a light validation layer here.

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

// Named export for local testing and dev middleware
export async function generateTasksForGoal(goal: string): Promise<Task[]> {
  const g = String(goal || '').trim()
  if (!g) return fallbackTasks('')
  const key = process.env.GROQ_API_KEY
  try {
    if (!key) return fallbackTasks(g)
    const tasks = await groqGenerate(g, key)
    return tasks
  } catch (e: any) {
    console.warn('Groq generation failed, using fallback:', e?.message || e)
    return fallbackTasks(g)
  }
}