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
      className={`bear-bucket relative w-[150px] h-[150px] bg-transparent rounded-full p-3 pt-6 flex items-center justify-center text-[#6B4F3A] font-semibold ${shake ? 'animate-shake' : ''} border-4 border-dashed transition-transform transition-shadow transition-bg duration-200 ease-in-out cursor-pointer`}
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
      <div className="ear left absolute w-7 h-7 rounded-full -top-[14px] left-4 border-2 border-dashed border-[var(--bucket-border)] bg-transparent opacity-70" aria-hidden />
      <div className="ear right absolute w-7 h-7 rounded-full -top-[14px] right-4 border-2 border-dashed border-[var(--bucket-border)] bg-transparent opacity-70" aria-hidden />

      {/* Neutral/calm face (no happy/sad). Keep subtle blink, outline-only features. */}
      <div className="eye left-eye absolute w-3 h-3 rounded-full top-[56px] left-[46px] border-2 border-[var(--bucket-border)] bg-transparent animate-blink opacity-70" />
      <div className="eye right-eye absolute w-3 h-3 rounded-full top-[56px] right-[46px] border-2 border-[var(--bucket-border)] bg-transparent animate-blink opacity-70" />
      <div className="nose absolute w-3 h-3 rounded-full top-[78px] left-1/2 -translate-x-1/2 border-2 border-[var(--bucket-border)] bg-transparent opacity-60" />
      <div className="mouth absolute w-10 h-0 top-[102px] left-1/2 -translate-x-1/2 border-t-2 border-[var(--bucket-border)] opacity-70" />

      {/* Label only; description moved to tooltip */}
      <span className="label absolute bottom-2 text-lg font-bold text-center">{label}</span>

      {/* Tooltip content */}
      <Tooltip id={tooltipId} place="top" />
    </section>
  )
}