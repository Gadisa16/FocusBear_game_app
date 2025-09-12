import { generateTasks, goToScreen, setGoal } from '@/features/game/gameSlice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import type { RootState } from '@/store'
import { unlockAudio } from '@/utils/sound'
import { useState } from 'react'
import Bear from './Bear'
import ScreenShell from './ScreenShell'

export default function StartScreen() {
  const [goal, setGoalInput] = useState<string>('')
  const dispatch = useAppDispatch()
    const game = useAppSelector((s: RootState) => s.game)
    const loading = game.loading

  const start = async () => {
    const g = goal.trim() || 'Finish microeconomics assignment'
    dispatch(setGoal(g))
  unlockAudio()
    await dispatch(generateTasks(g))
    dispatch(goToScreen('sort'))
  }

  return (
    <ScreenShell title="focus bear" subtitle="Sort tasks to train your focus">
      <div className="max-w-md mx-auto grid gap-6">
        <div className="flex items-center gap-3">
          <Bear />
          <div className="bear-bubble">What is your main goal today?</div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!loading) start()
          }}
          className="contents"
        >
          <label className="block">
            <span className="sr-only">Main goal</span>
            <input
              value={goal}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g., Finish microeconomics assignment"
              className="w-full rounded-xl border border-bear-furLight px-4 py-3 text-bear-fur focus:outline-none focus:ring-2 focus:ring-bear-honey bg-white disabled:opacity-50"
              disabled={loading}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="relative w-full bg-bear-honey text-bear-fur font-semibold py-3 rounded-xl shadow hover:opacity-90 active:opacity-80 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-bear-fur/40 transition"
            aria-live="polite"
          >
            {loading ? (
              <span className="bear-spinner-wrapper">
                <span className="bear-spinner" aria-hidden>
                  <span className="ring" />
                  <span className="drop" />
                </span>
                <span className="bear-spinner-text">Generating<span className="bear-spinner-dots" aria-hidden /></span>
                <span className="sr-only">Generating tasks…</span>
              </span>
            ) : (
              'Generate Tasks'
            )}
          </button>
        </form>
        {/* <div className="text-xs text-bear-furLight border rounded-xl p-3 bg-white">
          Placeholder: Add a quick screenshot or 1-2 step instructions here.
        </div> */}
      </div>
    </ScreenShell>
  )
}
