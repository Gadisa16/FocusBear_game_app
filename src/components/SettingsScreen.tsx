import { goToScreen } from '@/features/game/gameSlice'
import { useAppDispatch } from '@/hooks'
import { getSoundSettings, playCorrect, playWrong, setSoundType, setSoundVolume, setVibrateEnabled, SoundType, unlockAudio } from '@/utils/sound'
import { getScoreHistory } from '@/utils/tasks'
import { Listbox } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Tooltip } from 'react-tooltip'
import ScreenShell from './ScreenShell'


export default function SettingsScreen() {
  const dispatch = useAppDispatch()
  // Load from localStorage or fallback to defaults
  function getInitialSettings() {
    try {
      const raw = localStorage.getItem('focusbear-sound-settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        return {
          type: parsed.type || getSoundSettings().type,
          volume: typeof parsed.volume === 'number' ? parsed.volume : getSoundSettings().volume,
          vibrate: typeof parsed.vibrate === 'boolean' ? parsed.vibrate : getSoundSettings().vibrate,
        }
      }
    } catch {}
    return getSoundSettings()
  }
  const initial = getInitialSettings()
  const [type, setType] = useState<SoundType>(initial.type)
  const [volume, setVolume] = useState<number>(initial.volume)
  const [vibrate, setVibrate] = useState<boolean>(initial.vibrate)

  useEffect(() => {
    unlockAudio()
    // Always apply loaded settings to sound engine
    setSoundType(type)
    setSoundVolume(volume)
    setVibrateEnabled(vibrate)
  }, [])

  function saveSettings() {
    setSoundType(type)
    setSoundVolume(volume)
    setVibrateEnabled(vibrate)
    localStorage.setItem('focusbear-sound-settings', JSON.stringify({ type, volume, vibrate }))
  }

  function apply() {
    try {
      saveSettings()
      toast.success('Settings saved!')
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e)
      toast.error('Failed to save settings')
    }
  }

  return (
    <ScreenShell title="Settings" subtitle="Sounds and history">
      <div className="max-w-md mx-auto grid gap-6">
        <section className="grid gap-2">
          <h2 className="font-semibold text-bear-fur">Sound Type</h2>
          <Listbox value={type} onChange={setType}>
            <div className="relative w-full max-w-xs">
              <Listbox.Button className="w-full border rounded-xl px-4 py-3 pr-10 text-bear-fur bg-white focus:outline-none focus:ring-2 focus:ring-bear-honey shadow-sm transition text-base sm:text-sm cursor-pointer text-left relative">
                {type}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bear-furLight text-lg">▼</span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {['sine','square','triangle','sawtooth','chime','pop'].map((t) => (
                  <Listbox.Option
                    key={t}
                    value={t}
                    className={({ active }) => `relative cursor-pointer select-none py-2 pl-4 pr-4 ${active ? 'bg-bear-honey/20 text-bear-fur' : 'text-bear-fur'}`}
                  >
                    {t}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </section>

        <section className="grid gap-2">
          <h2 className="font-semibold text-bear-fur">Volume</h2>
          <input
            className="cursor-pointer"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          <div className="text-sm text-bear-furLight">{Math.round(volume * 100)}%</div>
        </section>

        <section className="grid gap-2">
          <label className="flex items-center gap-2">
            <input className='cursor-pointer' type="checkbox" checked={vibrate} onChange={(e) => setVibrate(e.target.checked)} />
            <span>Vibration fallback</span>
          </label>
        </section>

        <section className="flex flex-wrap gap-3 justify-center">
          <button
            className="bg-bear-honey text-bear-fur font-semibold py-1 px-3 rounded-xl shadow hover:opacity-90 active:opacity-80 transition"
            onClick={apply}
            type="button"
          >Apply</button>
          <button
            className="bg-white text-bear-fur font-semibold py-3 px-6 rounded-xl border shadow hover:bg-bear-sky/40 active:opacity-80 transition"
            onClick={() => { saveSettings(); playCorrect() }}
            type="button"
          >Test Correct</button>
          <button
            className="bg-white text-bear-fur font-semibold py-3 px-6 rounded-xl border shadow hover:bg-bear-sky/40 active:opacity-80 transition"
            onClick={() => { saveSettings(); playWrong() }}
            type="button"
          >Test Wrong</button>
        </section>

        <section className="grid gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-bear-fur mb-0">Recent Scores</h2>
            <button
              aria-label="Clear score"
              className="text-bear-furLight hover:text-red-500 transition p-1 rounded-full focus:outline-none"
              style={{ lineHeight: 0 }}
              onClick={() => {
                localStorage.removeItem('focusbear-score-history');
                toast.success('Score history cleared!');
                window.location.reload();
              }}
              data-tooltip-id="clear-score-tip"
              data-tooltip-content="Clear score"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8V15M10 8V15M14 8V15M3 5H17M8 5V3H12V5M5 5V17C5 17.5523 5.44772 18 6 18H14C14.5523 18 15 17.5523 15 17V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            <Tooltip id="clear-score-tip" />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {getScoreHistory().length === 0 ? (
              <span className="text-bear-furLight">No scores yet.</span>
            ) : (
              getScoreHistory().map((s, i) => (
                <span key={i*3} className="bg-[rgb(0,0,0,0.08)] text-bear-fur font-semibold px-3 py-1 rounded-xl shadow-sm">
                  {s}%
                </span>
              ))
            )}
          </div>
        </section>

        <div>
          <button className="bg-bear-honey text-bear-fur font-semibold py-3 px-4 rounded-xl shadow hover:opacity-90"
            onClick={() => dispatch(goToScreen('start'))}>Back</button>
        </div>
      </div>
    </ScreenShell>
  )
}
