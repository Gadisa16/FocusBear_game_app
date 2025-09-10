import { setShowOnboarding, toggleSound } from '@/features/game/gameSlice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import type { RootState } from '@/store'
import type { PropsWithChildren } from 'react'
import Bear from './Bear'

interface Props {
  title: string
  subtitle?: string
  mood?: 'normal' | 'happy' | 'sad'
}

export default function ScreenShell({ title, subtitle, mood = 'normal', children }: PropsWithChildren<Props>) {
  const game = useAppSelector((state: RootState) => state.game)
  const soundEnabled = game.soundEnabled
  const dispatch = useAppDispatch()
  return (
    <div className="min-h-full flex flex-col">
      <header
        className="p-4 flex items-center gap-3 justify-between"
        style={{ background: 'rgba(0, 0, 0, 0.16)' }}
      >
        <div className="flex items-center gap-3">
          <Bear size={40} mood={mood} />
          <div>
            <h1 className="text-xl font-bold text-bear-fur">{title}</h1>
            {subtitle && <p className="text-sm text-bear-furLight">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            onClick={() => dispatch(toggleSound())}
            className="px-3 py-2 rounded-lg border bg-white text-bear-fur hover:bg-bear-sky"
            title="Toggle sound"
          >{soundEnabled ? '🔊' : '🔈'}</button>
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
