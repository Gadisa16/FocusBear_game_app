import confetti from 'canvas-confetti'

export function burstConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 60,
      startVelocity: 35,
      gravity: 0.9,
      origin: { y: 0.6 },
      colors: ['#FFB703', '#2A9D8F', '#E76F51', '#6B4F3A']
    })
  } catch {}
}
