import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

type Props = Readonly<{
  label: 'Now' | 'Later' | 'Never'
  onDropTask: (id: string) => void
  shake?: boolean
}>

export default function Bucket({ label, onDropTask, shake }: Props) {
  const descriptions: Record<Props['label'], string> = {
    Now: 'Urgent and important!',
    Later: 'Important but not urgent!',
    Never: 'Neither important nor urgent!',
  }

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      onDropTask(id)
      e.currentTarget.classList.add('dropped')
      e.currentTarget.classList.remove('is-over')
      setTimeout(() => e.currentTarget.classList.remove('dropped'), 220)
    }
  }
  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('is-over')
  }
  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.currentTarget.classList.remove('is-over')
  }

  // Per-bucket accent color and tooltip id
  const borderColorMap: Record<Props['label'], `#${string}`> = {
    Now: '#2A9D8F',
    Later: '#FFB703',
    Never: '#E76F51',
  }
  const borderColor = borderColorMap[label]
  const tooltipId = `bucket-tip-${label}`

  return (
    <section
      className={`bear-bucket relative w-[90px] h-[90px] sm:w-[150px] sm:h-[150px] bg-transparent rounded-full p-3 pt-6 flex items-center justify-center text-[#6B4F3A] font-semibold ${shake ? 'animate-shake' : ''} border-4 border-dashed transition-transform transition-shadow transition-bg duration-200 ease-in-out cursor-pointer`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.currentTarget.classList.remove('is-over'); onDrop(e) }}
      // Tooltip
      data-tooltip-id={tooltipId}
      data-tooltip-content={descriptions[label]}
      aria-label={`Drop zone: ${label}`}
      style={{ ['--bucket-border' as any]: borderColor, borderColor } as React.CSSProperties}
    >
      {/* Minimalist "broken line" ears (outline only) */}

      {/* Responsive facial features for mobile/desktop */}
      {/* Ears */}
      <div className="ear left absolute rounded-full border-2 border-dashed border-[var(--bucket-border)] bg-transparent opacity-70
        w-4 h-4 -top-2 left-1
        sm:w-7 sm:h-7 sm:-top-[14px] sm:left-4" aria-hidden />
      <div className="ear right absolute rounded-full border-2 border-dashed border-[var(--bucket-border)] bg-transparent opacity-70
        w-4 h-4 -top-2 right-1
        sm:w-7 sm:h-7 sm:-top-[14px] sm:right-4" aria-hidden />

      {/* Eyes */}
      <div className="eye left-eye absolute rounded-full border-2 border-[var(--bucket-border)] bg-transparent animate-blink opacity-70
        w-2 h-2 top-[28px] left-[18px]
        sm:w-3 sm:h-3 sm:top-[56px] sm:left-[46px]" />
      <div className="eye right-eye absolute rounded-full border-2 border-[var(--bucket-border)] bg-transparent animate-blink opacity-70
        w-2 h-2 top-[28px] right-[18px]
        sm:w-3 sm:h-3 sm:top-[56px] sm:right-[46px]" />

      {/* Nose */}
      <div className="nose absolute rounded-full border-2 border-[var(--bucket-border)] bg-transparent opacity-60
        w-2 h-2 top-[38px] left-1/2 -translate-x-1/2
        sm:w-3 sm:h-3 sm:top-[78px]" />

      {/* Mouth */}
      <div className="mouth absolute h-0 left-1/2 -translate-x-1/2 border-t-2 border-[var(--bucket-border)] opacity-70
        w-6 top-[48px]
        sm:w-10 sm:top-[102px]" />

      {/* Label only; description moved to tooltip */}
      <span className="label absolute bottom-2 text-lg font-bold text-center">{label}</span>

      {/* Tooltip content */}
      <Tooltip id={tooltipId} place="top" />
    </section>
  )
}