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
      model: process.env.VERCEL_GROQ_MODEL || process.env.GROQ_MODEL || process.env.VITE_GROQ_MODEL || 'mixtral-8x7b-32768',
      temperature: 0.4, // Slightly increased for variety while keeping consistency
      max_tokens: 700,
      messages: [
        {
          //how to behave and constraints (Set the assistant’s rules, persona, and hard constraints.)
          role: 'system',
          content:
            [
              'You are an expert at the Eisenhower matrix tailored for ADHD users. Your job is to produce a clean, unambiguous set of tasks split across Now / Later / Never with crystal-clear distinctions.',
              '- Now = urgent + important: ONLY tiny, immediate next actions that take under 5-10 minutes, no preparation needed, doable right this second (e.g., "Jot down 3 key ideas" not "Research topic"). These are micro-first-steps to build momentum without overwhelm.',
              '- Later = important but not urgent: Larger tasks, planning, scheduling, follow-ups, or actions that require setup/time blocking/deliverables beyond a quick start (e.g., "Schedule research session" or "Draft full section"). These can wait but advance the goal long-term.',
              '- Never = neither: Pure distractions, irrelevant chores, or low-value activities that derail focus (e.g., "Check social media" or "Organize unrelated files"). Avoid any tie to the goal.',
              'Strict rules: If a task could fit Now or Later, ALWAYS classify as Now, but only if it is a single, bite-sized action that can be done immediately without preparation. No multi-part, vague, or overlapping tasks. Ensure buckets are distinctly different—Now feels instant, Later feels planned/future.',
              'Keep text concise (4–12 words), imperative, one single action per task. No explanations, prefixes, or extra fields. Respond ONLY with strict JSON that matches the schema.'
            ].join('\n')
        },
        {
          //what to do with the given input. (Purpose: Provide the actual task/request and inputs.)
          role: 'user',
          content:
            [
              `Goal: ${goal}`,
              'Generate exactly 6–8 tasks with a balanced mix: at least 2 Now, 2 Later, 2 Never. Ensure clear separation—no Now task should feel like it could be delayed, no Later should seem immediate.',
              'Use these examples to strictly guide classification (adapt to goal but maintain distinction):',
              '- Now: "List 3 main sections", "Write opening sentence", "Brainstorm 5 keywords".',
              '- Later: "Research competitors in depth", "Schedule writing session", "Submit plan for award".',
              '- Never: "Browse unrelated news", "Check Facebook", "Tidy desk unnecessarily".',
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
  // First, deterministically re-bucket tasks using strict heuristics.
  const rebucketed = original.map((t) => ({ ...t, correctBucket: classifyBucket(t.text) }))

  const unique = deduplicateTasks(rebucketed);
  const byBucket = groupTasksByBucket(unique);

  ensureAllBucketsPresent(goal, unique, byBucket);
  ensureMinPerBucket(goal, unique, byBucket, rebucketed.length);

  const mixed = mixBuckets(byBucket);

  const targetTotal = Math.min(8, Math.max(6, rebucketed.length));
  topUpTasks(goal, mixed, targetTotal);

  return mixed.map((t, i) => ({ ...t, id: `t${i + 1}` }));
}

// Heuristic classifier to make Now/Later/Never distinctions unambiguous.
function classifyBucket(text: string): Bucket {
  const s = text.trim().toLowerCase()
  // Never: distractions/low value
  const neverWords = [
    'facebook', 'instagram', 'tiktok', 'twitter', 'x.com', 'reddit', 'youtube', 'social media', 'browse', 'news',
    'tidy', 'clean', 'organize', 'rearrange', 'wallpaper', 'fonts', 'logo', 'colors', 'aesthetics', 'customize', 'unrelated'
  ]
  if (neverWords.some((w) => s.includes(w))) return 'Never'

  // Now: micro first steps under ~10 minutes
  const nowPhrases = [
    'jot', 'list ', 'write first', 'one-sentence', 'write one sentence', 'brainstorm', 'sketch', 'outline',
    'create project folder', 'create the project folder', 'open doc', 'name file', 'add 3 bullets', 'add three bullets',
    'note ', 'quick outline', 'draft 3 bullets', 'first three bullets'
  ]
  const laterPhrases = [
    'schedule', 'book', 'plan', 'submit', 'research', 'gather', 'collect', 'compile', 'build', 'draft', 'present',
    'review session', 'financial model', 'market research', 'meeting', 'meet', 'email', 'call', 'apply', 'file', 'prepare'
  ]

  const nowHit = nowPhrases.some((w) => s.includes(w))
  const laterHit = laterPhrases.some((w) => s.includes(w))

  if (nowHit && !laterHit) return 'Now'
  if (laterHit && !nowHit) return 'Later'
  if (nowHit && laterHit) {
    // Prefer Later when ambiguous unless clearly tiny/micro
    const microHints = ['first', 'one', 'quick', '3 ', ' three ', ' outline']
    return microHints.some((h) => s.includes(h)) && s.length <= 60 ? 'Now' : 'Later'
  }

  // Fallback heuristics: very short imperative tasks => Now; otherwise Later
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length <= 6) return 'Now'
  return 'Later'
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
      `Jot down 3 key ideas for ${g}`,
      'Create project folder',
      'Write one-sentence summary',
      'List top 3 milestones',
      'Brainstorm 5 keywords',
      'Sketch quick outline',
    ],
    Later: [
      `Schedule deep work for ${g}`,
      'Research detailed resources',
      'Book mentor feedback session',
      `Build full model for ${g}`,
      'Submit for external review',
      'Plan implementation timeline',
    ],
    Never: [
      'Check social media feeds',
      'Tweak unrelated aesthetics',
      'Organize entire workspace',
      'Browse random news sites',
      'Customize fonts playfully',
      'Clean old email inbox',
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

// Named export for local testing and dev middleware
export async function generateTasksForGoal(goal: string): Promise<Task[]> {
  const g = String(goal || '').trim()
  if (!g) return ensureDistinctBuckets('', fallbackTasks(''))
  const key = process.env.GROQ_API_KEY
  try {
    if (!key) return ensureDistinctBuckets(g, fallbackTasks(g))
    const tasks = await groqGenerate(g, key)
    return tasks
  } catch (e: any) {
    console.warn('Groq generation failed, using fallback:', e?.message || e)
    return ensureDistinctBuckets(g, fallbackTasks(g))
  }
}