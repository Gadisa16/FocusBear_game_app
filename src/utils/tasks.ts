// Score history utilities
const SCORE_KEY = 'focusbear-score-history'
export function saveScore(score: number) {
  try {
    const raw = localStorage.getItem(SCORE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    const newArr = [score, ...arr].slice(0, 5)
    localStorage.setItem(SCORE_KEY, JSON.stringify(newArr))
  } catch {}
}

export function getScoreHistory(): number[] {
  try {
    const raw = localStorage.getItem(SCORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}
import { Bucket, Task } from '@/features/game/gameSlice'

export function generateTasksFromGoal(goal: string): Task[] {
  // Lightweight placeholder "AI" generation for wireframe
  const base: Task[] = [
    { id: 't1', text: `List 3 micro steps for ${goal}`, correctBucket: 'Current Goal' },
    { id: 't2', text: `Draft one opening line for ${goal}`, correctBucket: 'Current Goal' },
    { id: 't3', text: 'Schedule focused work block', correctBucket: 'Next Task' },
    { id: 't4', text: 'Gather 2 reference materials', correctBucket: 'Next Task' },
    { id: 't5', text: 'Check Instagram feed', correctBucket: 'After Work' },
    { id: 't6', text: 'Tidy random folders', correctBucket: 'After Work' },
    { id: 't7', text: 'Browse unrelated news', correctBucket: 'After Work' },
  ]
  // Ensure IDs unique
  return base.map((t, i) => ({ ...t, id: `t${i+1}` }))
}

export const BUCKETS: Bucket[] = ['Current Goal', 'Next Task', 'After Work']
