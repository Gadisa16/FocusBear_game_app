import { goBack, goToScreen, toggleSound } from '@/features/game/gameSlice'
import { useAppDispatch, useAppSelector } from '@/hooks'
import type { RootState } from '@/store'
import type { PropsWithChildren } from 'react'
import { Tooltip } from 'react-tooltip'

interface Props {
  title: string
  subtitle?: string
  mood?: 'normal' | 'happy' | 'sad'
}

export default function ScreenShell({ title, subtitle, mood = 'normal', children }: PropsWithChildren<Props>) {
  const game = useAppSelector((state: RootState) => state.game)
  const soundEnabled = game.soundEnabled
  const dispatch = useAppDispatch()
  const handleBearClick = () => {
  dispatch(goBack())
  }
  return (
    <div className="min-h-full flex flex-col">
      <header
        className="p-4 flex items-center gap-3 justify-between bg-headerStyle">
        <div className="flex items-center gap-3">
            <button
            aria-label="Back to goal input"
            onClick={handleBearClick}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            data-tooltip-id="app_logo_placeholder"
            data-tooltip-content="Back to start"
            >
            <img src="/FocusBearLogo.svg" alt="FocusBear Logo" width={40} height={40} />
            <Tooltip id="app_logo_placeholder" place="right" />
            </button>
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
            data-tooltip-id="sound-tooltip"
            data-tooltip-content="toggle sound!"
          >{soundEnabled ? '🔊' : '🔈'}
          <Tooltip id="sound-tooltip" place="bottom" />
          </button>
          <button
            aria-label="Settings"
            onClick={() => dispatch(goToScreen('settings'))}
            className="px-3 py-2 rounded-lg border bg-white text-bear-fur hover:bg-bear-sky"
            data-tooltip-id="settings-tooltip"
            data-tooltip-content="Sound & history"
          >⚙️
            <Tooltip id="settings-tooltip" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
