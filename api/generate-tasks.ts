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
        {
          //how to behave and constraints (Set the assistant’s rules, persona, and hard constraints.)
          role: 'system',
          content:
            [
              'You are an expert at the Eisenhower matrix for ADHD users. Your job is to produce a clean, unambiguous set of tasks split across Now / Later / Never.',
              '- Now = urgent + important, tiny next actions doable immediately in under 10 minutes (micro-steps).',
              '- Later = important but not urgent. Scheduling, planning, follow-ups, larger deliverables that are not a tiny first step.',
              '- Never = distractions or nice-to-haves not needed for the goal right now (e.g., checking social media, tweaking aesthetics).',
              'If a task could be either Now or Later, choose Later unless it is a single tiny first step. Avoid ambiguous or multi-part tasks.',
              'Keep text concise (4–9 words), imperative, one action per task. No explanations or extra fields. Respond ONLY with strict JSON that matches the schema.'
            ].join('\n')
        },
        {
          //what to do with the given input. (Purpose: Provide the actual task/request and inputs.)
          role: 'user',
          content:
            [
              `Goal: ${goal}`,
              'Generate 6–8 tasks with a clear mix across all three buckets (include all three buckets). Provide at least two tasks per bucket when possible.',
              'Use these examples to guide classification:',
              '- Now: "Sketch a one-page outline"',
              '- Later: "Submit business plan for award"',
              '- Never: "Check Facebook or Instagram"',
              'Return strict JSON of this shape: {"tasks":[{"text":"...","correctBucket":"Now|Later|Never"}]}'
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
  return ensureDistinctBuckets(goal, tasks)
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

// Ensure the output always includes all three buckets with ADHD-friendly clarity.
function ensureDistinctBuckets(goal: string, original: Task[]): Task[] {
  const unique = deduplicateTasks(original);
  const byBucket = groupTasksByBucket(unique);

  ensureAllBucketsPresent(goal, unique, byBucket);
  ensureMinPerBucket(goal, unique, byBucket, original.length);

  const mixed = mixBuckets(byBucket);

  const targetTotal = Math.min(8, Math.max(6, original.length));
  topUpTasks(goal, mixed, targetTotal);

  return mixed.map((t, i) => ({ ...t, id: `t${i + 1}` }));
}

function deduplicateTasks(tasks: Task[]): Map<string, Task> {
  const unique = new Map<string, Task>();
  for (const t of tasks) {
    const key = t.text.trim().toLowerCase();
    if (!unique.has(key)) unique.set(key, t);
  }
  return unique;
}

function groupTasksByBucket(unique: Map<string, Task>): Record<Bucket, Task[]> {
  const byBucket = { Now: [] as Task[], Later: [] as Task[], Never: [] as Task[] };
  for (const t of unique.values()) byBucket[t.correctBucket].push(t);
  return byBucket;
}

function ensureAllBucketsPresent(goal: string, unique: Map<string, Task>, byBucket: Record<Bucket, Task[]>) {
  const needs: Bucket[] = (['Now', 'Later', 'Never'] as Bucket[]).filter((b) => byBucket[b].length === 0);
  const sugg0 = suggestionsByBucket(goal);
  for (const b of needs) {
    for (const text of sugg0[b]) {
      const key = text.trim().toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, { id: 'tmp', text, correctBucket: b });
        byBucket[b].push({ id: 'tmp', text, correctBucket: b });
        break;
      }
    }
  }
}

function ensureMinPerBucket(goal: string, unique: Map<string, Task>, byBucket: Record<Bucket, Task[]>, originalLength: number) {
  const targetTotal = Math.min(8, Math.max(6, originalLength));
  const minPer = targetTotal >= 6 ? 2 : 1;
  const sugg1 = suggestionsByBucket(goal);
  for (const b of ['Now', 'Later', 'Never'] as Bucket[]) {
    while (byBucket[b].length < minPer) {
      const pick = sugg1[b].find((txt) => !unique.has(txt.trim().toLowerCase()));
      if (!pick) break;
      unique.set(pick.trim().toLowerCase(), { id: 'tmp', text: pick, correctBucket: b });
      byBucket[b].push({ id: 'tmp', text: pick, correctBucket: b });
    }
  }
}

function mixBuckets(byBucket: Record<Bucket, Task[]>): Task[] {
  const pools = [byBucket.Now, byBucket.Later, byBucket.Never];
  const mixed: Task[] = [];
  let added = true;
  while (mixed.length < 8 && added) {
    added = false;
    for (const pool of pools) {
      const t = pool.shift();
      if (t && mixed.length < 8) {
        mixed.push(t);
        added = true;
      }
    }
  }
  return mixed;
}

function topUpTasks(goal: string, mixed: Task[], targetTotal: number) {
  const sugg = suggestionsByBucket(goal);
  const order: Bucket[] = ['Now', 'Later', 'Never'];
  let oi = 0;
  while (mixed.length < targetTotal) {
    const b = order[oi % order.length];
    const pick = sugg[b].find((txt) => !mixed.some((x) => x.text.toLowerCase() === txt.toLowerCase()));
    if (pick) mixed.push({ id: 'tmp', text: pick, correctBucket: b });
    oi++;
    if (oi > 30) break; // safety
  }
}

function suggestionsByBucket(goal: string): Record<Bucket, string[]> {
  const g = goal.trim()
  return {
    Now: [
      'Create the project folder',
      'Sketch a one-page outline',
      'Write a one-sentence goal',
      'List top three milestones',
      'Write the first three bullets',
      'List key assumptions to test',
    ],
    Later: [
      `Block calendar time for ${g}`,
      'Book a mentor review',
      'Research templates and examples',
      'Gather market research sources',
      `Submit ${g} for an award`,
      'Build a basic financial model',
    ],
    Never: [
      'Check Facebook or Instagram',
      'Tweak logo or colors',
      'Rearrange desk accessories',
      'Clean email inbox completely',
      'Browse startup news',
      'Customize fonts for fun',
    ],
  }
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
      res.status(200).json({ tasks: ensureDistinctBuckets(goal, fallbackTasks(goal)) })
      return
    }
    const tasks = await groqGenerate(goal, key)
    res.status(200).json({ tasks })
  } catch (err: any) {
    console.error('Error generating tasks:', err);
    res.status(200).json({ tasks: ensureDistinctBuckets(String(req.body?.goal || ''), fallbackTasks(String(req.body?.goal || ''))) })
  }
}
