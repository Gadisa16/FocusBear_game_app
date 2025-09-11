let ctx: AudioContext | null = null

type OscType = 'sine' | 'square' | 'triangle' | 'sawtooth'
export type SoundType = OscType | 'chime' | 'pop'

const config = {
  type: 'sine' as SoundType,
  volume: 0.06, // 0..1
  attack: 0.01, // seconds
  release: 0.05, // seconds
  vibrate: true,
}

function getCtx() {
  if (typeof window === 'undefined') return null
  // @ts-ignore
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  // Attempt to resume if suspended (will only succeed in a user gesture)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* noop */ })
  }
  return ctx
}

export function unlockAudio() {
  const ac = getCtx()
  if (!ac) return
  if (ac.state === 'suspended') {
    // Must be called from a user gesture (click/touch)
    ac.resume().catch(() => { /* noop */ })
  }
}

export function setSoundType(type: SoundType) {
  config.type = type
}

export function setSoundVolume(volume: number) {
  config.volume = Math.max(0, Math.min(1, volume))
}

export function setVibrateEnabled(enabled: boolean) {
  config.vibrate = !!enabled
}

export function getSoundSettings(): { type: SoundType; volume: number; vibrate: boolean } {
  return { type: config.type, volume: config.volume, vibrate: config.vibrate }
}

function vibrate(ms: number | number[]) {
  try {
    // @ts-ignore
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms)
  } catch { /* ignore */ }
}

function scheduleDisconnect(ac: AudioContext, osc: OscillatorNode, gain: GainNode, stopAt: number) {
  osc.onended = () => {
    try { osc.disconnect() } catch { /* noop */ }
    try { gain.disconnect() } catch { /* noop */ }
  }
  // Safety: ensure it stops
  osc.stop(stopAt + 0.005)
}

function playTone(freq: number, duration: number, type: SoundType) {
  const ac = getCtx()
  if (!ac) return

  // Special styles
  if (type === 'chime') return playChime(ac, freq, duration)
  if (type === 'pop') return playPop(ac, freq, Math.min(duration, 0.12))

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const oscTypes = ['sine','square','triangle','sawtooth'] as const
  function isOscType(x: SoundType): x is OscType {
    return (oscTypes as readonly string[]).includes(x as string)
  }
  const chosen: OscType = isOscType(type) ? type : 'sine'
  osc.type = chosen
  osc.frequency.setValueAtTime(freq, ac.currentTime)

  const now = ac.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(config.volume, now + config.attack)
  gain.gain.linearRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  scheduleDisconnect(ac, osc, gain, now + duration + config.release)
}

// Distinct "wrong" sound: a short downward chirp for better audibility
function playDownChirp(startHz: number, endHz: number, duration: number, type: SoundType) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const oscTypes = ['sine','square','triangle','sawtooth'] as const
  function isOscType(x: SoundType): x is OscType { return (oscTypes as readonly string[]).includes(x as string) }
  osc.type = isOscType(type) ? type : 'sine'

  const now = ac.currentTime
  osc.frequency.setValueAtTime(startHz, now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, endHz), now + duration)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(config.volume, now + Math.min(0.02, duration / 3))
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  scheduleDisconnect(ac, osc, gain, now + duration + 0.02)
}

function playChime(ac: AudioContext, baseFreq: number, duration: number) {
  const now = ac.currentTime
  const osc1 = ac.createOscillator()
  const osc2 = ac.createOscillator()
  const gain = ac.createGain()

  osc1.type = 'triangle'
  osc2.type = 'sine'
  osc1.frequency.setValueAtTime(baseFreq, now)
  osc2.frequency.setValueAtTime(baseFreq * 1.5, now)
  // Gentle upward glide
  osc1.frequency.linearRampToValueAtTime(baseFreq * 1.03, now + duration)
  osc2.frequency.linearRampToValueAtTime(baseFreq * 1.55, now + duration)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(config.volume, now + 0.02)
  gain.gain.linearRampToValueAtTime(0.0001, now + duration)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ac.destination)

  osc1.start(now)
  osc2.start(now)
  // Stop both with cleanup
  const stopAt = now + duration + 0.03
  osc1.onended = () => { try { osc1.disconnect() } catch {} }
  osc2.onended = () => { try { osc2.disconnect() } catch {} }
  setTimeout(() => { try { gain.disconnect() } catch {} }, (duration + 0.05) * 1000)
  osc1.stop(stopAt)
  osc2.stop(stopAt)
}

function playPop(ac: AudioContext, freq: number, duration: number) {
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, now)
  // Very quick decay
  gain.gain.setValueAtTime(config.volume, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, duration))

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  scheduleDisconnect(ac, osc, gain, now + duration)
}

function beep(freq: number, duration = 0.12) {
  playTone(freq, duration, config.type)
  if (config.vibrate) vibrate(20)
}

export function playCorrect() {
  // Playful/celebratory: quick ascending arpeggio like a happy jingle (C-E-G-C')
  const ac = getCtx()
  if (!ac) return
  // Notes: C5 (523), E5 (659), G5 (784), C6 (1047) Hz for a major chord ascent
  playChime(ac, 523, 0.1)
  setTimeout(() => playChime(ac, 659, 0.1), 80)
  setTimeout(() => playChime(ac, 784, 0.1), 160)
  setTimeout(() => playChime(ac, 1047, 0.12), 240) // Slightly longer final note
  // Faint sparkle sweep
  setTimeout(() => playTone(880, 0.15, config.type), 300)
  if (config.vibrate) vibrate([15, 10, 15]) // Pattern for celebration
}

export function playWrong() {
  // Downward chirp for clearer perception on small speakers
  playDownChirp(660, 330, 0.16, config.type)
  if (config.vibrate) vibrate(30)
}