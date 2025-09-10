import { Bucket, Task } from '@/features/game/gameSlice'

export function generateTasksFromGoal(goal: string): Task[] {
  // Lightweight placeholder "AI" generation for wireframe
  const base: Task[] = [
    { id: 't1', text: `Break goal into 3 steps for: ${goal}`, correctBucket: 'Now' },
    { id: 't2', text: `Schedule time for deep work on: ${goal}`, correctBucket: 'Later' },
    { id: 't3', text: 'Check social media', correctBucket: 'Never' },
    { id: 't4', text: `Gather materials/resources for: ${goal}`, correctBucket: 'Now' },
    { id: 't5', text: 'Tidy your entire room', correctBucket: 'Never' },
    { id: 't6', text: `Email mentor to review outcome of: ${goal}`, correctBucket: 'Later' },
    { id: 't7', text: 'Change phone wallpaper', correctBucket: 'Never' },
  ]
  // Ensure IDs unique
  return base.map((t, i) => ({ ...t, id: `t${i+1}` }))
}

export const BUCKETS: Bucket[] = ['Now', 'Later', 'Never']
