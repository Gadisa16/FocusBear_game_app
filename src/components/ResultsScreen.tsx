import { goToScreen, reset } from '@/features/game/gameSlice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import Bear from './Bear'
import ScreenShell from './ScreenShell'

export default function ResultsScreen() {
  const { correctCount, tasks } = useAppSelector(s => s.game)
  const dispatch = useAppDispatch()
  const score = Math.round((correctCount / Math.max(1, tasks.length)) * 100)

  return (
  <ScreenShell title="Results" subtitle="Great focus!" mood="happy">
      <div className="max-w-md mx-auto grid gap-6 text-center">
  <div className="flex justify-center"><Bear mood="happy" /></div>
        <div className="text-4xl font-extrabold text-bear-fur">{correctCount}/{tasks.length} correct</div>
        <div className="text-bear-furLight">Score: {score}%</div>
        <div className="grid gap-3">
          <button onClick={() => dispatch(goToScreen('start'))} className="bg-bear-honey text-bear-fur font-semibold py-3 rounded-xl shadow hover:opacity-90">Set New Goal</button>
          {/* <button onClick={() => dispatch(reset())} className="text-bear-furLight underline">Restart</button> */}
        </div>
        {/* <div className="text-xs text-bear-furLight border rounded-xl p-3 bg-white">
          Placeholder for screenshot or short tips.
        </div> */}
      </div>
    </ScreenShell>
  )
}
