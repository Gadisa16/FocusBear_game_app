type Props = {
  label: 'Now' | 'Later' | 'Never'
  onDropTask: (id: string) => void
  shake?: boolean
}

export default function Bucket({ label, onDropTask, shake }: Props) {
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onDropTask(id)
  }

  return (
    <section
      className={`rounded-bucket border-2 border-dashed border-bear-furLight bg-white/80 min-h-[100px] p-3 flex items-center justify-center text-bear-fur font-semibold ${shake ? 'animate-shake' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      aria-label={`Drop zone: ${label}`}
    >
      {label}
    </section>
  )
}
