import type { PropsWithChildren } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import type { RootState } from '@/store'
import { toggleSound, setShowOnboarding } from '@/features/game/gameSlice'
import Bear from './Bear'

interface Props {
  title: string
  subtitle?: string
}

export default function ScreenShell({ title, subtitle, children }: PropsWithChildren<Props>) {
  const game = useAppSelector((state: RootState) => state.game)
  const soundEnabled = game.soundEnabled
  const dispatch = useAppDispatch()
  return (
    <div className="min-h-full flex flex-col">
      <header className="p-4 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Bear size={40} />
          <div>
            <h1 className="text-xl font-bold text-bear-fur">{title}</h1>
            {subtitle && <p className="text-sm text-bear-furLight">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            onClick={() => dispatch(toggleSound())}
            className="px-3 py-2 rounded-lg border bg-white text-bear-fur hover:bg-bear-sky d-flex items-center justify-center"
            title="Toggle sound"
          >{soundEnabled ? '🔊' : '🔈x'}</button>
          <button
            aria-label="Help"
            onClick={() => dispatch(setShowOnboarding(true))}
            className="px-3 py-2 rounded-lg border bg-white text-bear-fur hover:bg-bear-sky"
            title="Show help"
          >?</button>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
