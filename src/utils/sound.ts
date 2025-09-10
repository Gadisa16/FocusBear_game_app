let ctx: AudioContext | null = null
function getCtx() {
  if (typeof window === 'undefined') return null
  // @ts-ignore
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

function beep(freq: number, duration = 0.12) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.value = 0.04
  osc.connect(gain)
  gain.connect(ac.destination)
  const now = ac.currentTime
  osc.start(now)
  osc.stop(now + duration)
}

export function playCorrect() {
  beep(880, 0.1)
}

export function playWrong() {
  beep(220, 0.14)
}
