import { goToScreen } from '@/features/game/gameSlice'
import { useAppDispatch } from '@/hooks'
import { getSoundSettings, playCorrect, playWrong, setSoundType, setSoundVolume, setVibrateEnabled, SoundType, unlockAudio } from '@/utils/sound'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
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

  function apply() {
    try {
      setSoundType(type)
      setSoundVolume(volume)
      setVibrateEnabled(vibrate)
      // Save to localStorage
      localStorage.setItem('focusbear-sound-settings', JSON.stringify({ type, volume, vibrate }))
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
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SoundType)}
            className="border rounded-lg px-3 py-2 cursor-pointer"
          >
            {['sine','square','triangle','sawtooth','chime','pop'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
            onClick={() => { apply(); playCorrect() }}
            type="button"
          >Test Correct</button>
          <button
            className="bg-white text-bear-fur font-semibold py-3 px-6 rounded-xl border shadow hover:bg-bear-sky/40 active:opacity-80 transition"
            onClick={() => { apply(); playWrong() }}
            type="button"
          >Test Wrong</button>
        </section>

        <section className="grid gap-2">
          <h2 className="font-semibold text-bear-fur">History / Score</h2>
          <p className="text-sm text-bear-furLight">Coming soon: recent scores and achievements.</p>
        </section>

        <div>
          <button className="bg-bear-honey text-bear-fur font-semibold py-3 px-4 rounded-xl shadow hover:opacity-90"
            onClick={() => dispatch(goToScreen('start'))}>Back</button>
        </div>
      </div>
    </ScreenShell>
  )
}
