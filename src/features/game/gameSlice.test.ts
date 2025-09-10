import { describe, it, expect } from 'vitest'
import reducer, { dropTask, setTasks, type Task } from '@/features/game/gameSlice'

function makeTasks(): Task[] {
  return [
    { id: '1', text: 'A', correctBucket: 'Now' },
    { id: '2', text: 'B', correctBucket: 'Later' },
  ]
}

describe('gameSlice', () => {
  it('counts correct and ends on results', () => {
    const tasks = makeTasks()
    let state = reducer(undefined, { type: 'init' })
    state = reducer(state, setTasks(tasks))
    state = reducer(state, dropTask({ id: '1', bucket: 'Now' }))
    expect(state.correctCount).toBe(1)
    expect(state.sortedCount).toBe(1)
    expect(state.screen).toBe('start')
    state = reducer(state, dropTask({ id: '2', bucket: 'Later' }))
    expect(state.screen).toBe('results')
  })

  it('handles wrong drop with message', () => {
    const tasks = makeTasks()
    let state = reducer(undefined, { type: 'init' })
    state = reducer(state, setTasks(tasks))
    state = reducer(state, dropTask({ id: '1', bucket: 'Never' }))
    expect(state.correctCount).toBe(0)
    expect(state.sortedCount).toBe(1)
    expect(typeof state.lastMessage).toBe('string')
  })
})
