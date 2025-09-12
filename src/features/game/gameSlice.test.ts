import reducer, { dropTask, setTasks, type Task } from '@/features/game/gameSlice'
import { describe, expect, it } from 'vitest'

function makeTasks(): Task[] {
  return [
    { id: '1', text: 'A', correctBucket: 'Current Goal' },
    { id: '2', text: 'B', correctBucket: 'Next Task' },
  ]
}

describe('gameSlice', () => {
  it('counts correct and ends on results', () => {
    const tasks = makeTasks()
    let state = reducer(undefined, { type: 'init' })
    state = reducer(state, setTasks(tasks))
  state = reducer(state, dropTask({ id: '1', bucket: 'Current Goal' }))
    expect(state.correctCount).toBe(1)
    expect(state.sortedCount).toBe(1)
    expect(state.screen).toBe('start')
  state = reducer(state, dropTask({ id: '2', bucket: 'Next Task' }))
    expect(state.screen).toBe('results')
  })

  it('handles wrong drop with message', () => {
    const tasks = makeTasks()
    let state = reducer(undefined, { type: 'init' })
    state = reducer(state, setTasks(tasks))
  state = reducer(state, dropTask({ id: '1', bucket: 'After Work' }))
    expect(state.correctCount).toBe(0)
    expect(state.sortedCount).toBe(1)
    expect(typeof state.lastMessage).toBe('string')
  })
})
