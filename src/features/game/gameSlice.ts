import { generateTasksWithGroq } from '@/utils/ai';
import { generateTasksFromGoal, getScoreHistory, saveScore } from '@/utils/tasks';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

export type Bucket = 'Now' | 'Later' | 'Never'

export interface Task {
  id: string
  text: string
  correctBucket: Bucket
  sortedBucket?: Bucket
}

export interface GameState {
  screen: 'start' | 'sort' | 'results' | 'settings'
  goal: string
  tasks: Task[]
  sortedCount: number
  correctCount: number
  lastMessage?: string
  loading: boolean
  error?: string
  soundEnabled: boolean
  showOnboarding: boolean
  history: GameState['screen'][]
  maxScore: number
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
  history: [],
  maxScore: (() => {
    const arr = getScoreHistory()
    return arr.length ? Math.max(...arr) : 0
  })(),
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
      if (state.screen !== action.payload) {
        state.history.push(state.screen)
        state.screen = action.payload
      }
    },
    goBack(state) {
      const prev = state.history.pop()
      state.screen = prev ?? 'start'
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
        // Calculate score and save
        const score = Math.round((state.correctCount / Math.max(1, state.tasks.length)) * 100)
        saveScore(score)
        // Update maxScore in state
        const arr = getScoreHistory()
        state.maxScore = arr.length ? Math.max(...arr) : score
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
  state.history = []
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

export const generateTasks = createAsyncThunk(
  'game/generateTasks',
  async (goal: string, { signal }) => {
    try {
      return await generateTasksWithGroq(goal, { signal })
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err
      console.warn('AI generation failed, falling back:', err?.message || err)
      toast.error('Task generation failed, using placeholders.', { duration: 4000 })
    }
    // Fallback to local placeholder
    await new Promise((res) => setTimeout(res, 400))
    return generateTasksFromGoal(goal)
  }
)

export const { setGoal, setTasks, goToScreen, goBack, dropTask, reset, toggleSound, setShowOnboarding } = gameSlice.actions
export default gameSlice.reducer
