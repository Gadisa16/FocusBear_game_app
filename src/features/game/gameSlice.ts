import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { generateTasksFromGoal } from '@/utils/tasks'

export type Bucket = 'Now' | 'Later' | 'Never'

export interface Task {
  id: string
  text: string
  correctBucket: Bucket
  sortedBucket?: Bucket
}

export interface GameState {
  screen: 'start' | 'sort' | 'results'
  goal: string
  tasks: Task[]
  sortedCount: number
  correctCount: number
  lastMessage?: string
  loading: boolean
  error?: string
  soundEnabled: boolean
  showOnboarding: boolean
}

const initialState: GameState = {
  screen: 'start',
  goal: '',
  tasks: [],
  sortedCount: 0,
  correctCount: 0,
  loading: false,
  soundEnabled: true,
  showOnboarding: true,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGoal(state, action: PayloadAction<string>) {
      state.goal = action.payload
    },
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload
      state.sortedCount = 0
      state.correctCount = 0
    },
    goToScreen(state, action: PayloadAction<GameState['screen']>) {
      state.screen = action.payload
    },
    setShowOnboarding(state, action: PayloadAction<boolean>) {
      state.showOnboarding = action.payload
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled
    },
    dropTask(state, action: PayloadAction<{ id: string; bucket: Bucket }>) {
      const t = state.tasks.find((x: Task) => x.id === action.payload.id)
      if (!t) return
      if (t.sortedBucket) return
      t.sortedBucket = action.payload.bucket
      state.sortedCount += 1
      const correct = t.correctBucket === action.payload.bucket
      if (correct) {
        state.correctCount += 1
        state.lastMessage = pick(['Great focus!', 'Honey sweet pick!', 'Bear-y good choice!', 'Nailed it!'])
      } else {
        state.lastMessage = pick(['Oops—honey trap!', 'Try again, cub!', 'Close! Think urgency + importance.'])
      }
      if (state.sortedCount >= state.tasks.length) {
        state.screen = 'results'
      }
    },
    reset(state) {
      state.screen = 'start'
      state.goal = ''
      state.tasks = []
      state.sortedCount = 0
      state.correctCount = 0
      state.lastMessage = undefined
      state.loading = false
      state.error = undefined
      state.showOnboarding = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateTasks.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(generateTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
        state.sortedCount = 0
        state.correctCount = 0
      })
      .addCase(generateTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to generate tasks'
      })
  }
})

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export const generateTasks = createAsyncThunk('game/generateTasks', async (goal: string) => {
  // Placeholder for real AI call; simulate latency
  await new Promise(res => setTimeout(res, 500))
  return generateTasksFromGoal(goal)
})

export const { setGoal, setTasks, goToScreen, dropTask, reset, toggleSound, setShowOnboarding } = gameSlice.actions
export default gameSlice.reducer
