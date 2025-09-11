import type { Bucket as BucketType, Task } from '@/features/game/gameSlice'
import { dropTask, setShowOnboarding } from '@/features/game/gameSlice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import type { RootState } from '@/store'
import { burstConfetti } from '@/utils/confetti'
import { playCorrect, playWrong } from '@/utils/sound'
import { BUCKETS } from '@/utils/tasks'
import { useState } from 'react'
import Bear from './Bear'
import BearBubble from './bear/BearBubble'
import ScreenShell from './ScreenShell'
import BucketZone from './tasks/Bucket'
import TaskCard from './tasks/TaskCard'

export default function SortingScreen() {
  const game = useAppSelector((state: RootState) => state.game)
  const { tasks, lastMessage, soundEnabled, showOnboarding, correctCount, maxScore } = game
  const dispatch = useAppDispatch()
  const [poof, setPoof] = useState<string | null>(null)
  const [mood, setMood] = useState<'normal'|'happy'|'sad'>('normal')
  const [shake, setShake] = useState<BucketType | null>(null)

  const onDropTo = (taskId: string, bucket: BucketType) => {
    const t = tasks.find((tt: Task) => tt.id === taskId)
    if (!t || t.sortedBucket) return
    dispatch(dropTask({ id: taskId, bucket }))
    if (t.correctBucket === bucket) {
      burstConfetti()
      if (soundEnabled) playCorrect()
      setMood('happy')
  } else {
      setPoof(taskId)
      setShake(bucket)
      if (soundEnabled) playWrong()
      setTimeout(() => setPoof(null), 350)
      setTimeout(() => setShake(null), 350)
      setMood('sad')
    }
  }

  // Live score and max score
  const liveScore = Math.round((correctCount / Math.max(1, tasks.length)) * 100)
  const isNewMax = liveScore > maxScore

  return (
    <ScreenShell title="Sort Tasks" subtitle="Drag sticky notes into buckets" mood={mood}>
      <div className="grid gap-4 sm:gap-6">
        <div className="sr-only" aria-live="polite">{lastMessage || ''}</div>
        <div className="flex items-start justify-center gap-3">
          <Bear size={56} mood={mood} />
          <BearBubble>
            <div className="flex items-center flex-wrap gap-2">
              <span>
                {lastMessage || (showOnboarding
                  ? 'Welcome! Drag sticky notes into buckets. Or, focus a note to reveal quick-send buttons.'
                  : 'Tip: Now = urgent + important. Later = important. Never = distraction.')}
              </span>
              {showOnboarding && (
                <button
                  className="action-btn"
                  onClick={() => dispatch(setShowOnboarding(false))}
                >
                  Got it
                </button>
              )}
            </div>
          </BearBubble>
        </div>

        {/* Live score and max score UI */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="bg-bear-honey/80 text-bear-fur font-semibold px-4 py-2 rounded-xl shadow-sm">
            Live Score: {liveScore}%
          </div>
          <div className="bg-bear-sky/80 text-bear-fur font-semibold px-4 py-2 rounded-xl shadow-sm">
            Max Score: {maxScore}%
          </div>
          {isNewMax && (
            <div className="bg-green-400 text-white font-bold px-4 py-2 rounded-xl shadow animate-bounce">
              🎉 New High Score!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 card_grid_style">
          {tasks.map((t: Task) => (
            <TaskCard
              key={t.id}
              task={t}
              poof={poof === t.id}
              onSendTo={(bucket) => onDropTo(t.id, bucket)}
            />
          ))}
        </div>

        <div className="sticky bottom-0 bg-bear-sky/80 backdrop-blur supports-[backdrop-filter]:bg-bear-sky/60 border-t bg-footerStyle ">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-3 p-3">
            {BUCKETS.map((b) => (
              <BucketZone key={b} label={b} shake={shake === b} onDropTask={(id: string) => onDropTo(id, b)} />
            ))}
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
