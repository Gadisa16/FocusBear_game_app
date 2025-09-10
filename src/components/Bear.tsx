type Props = { size?: number }

export default function Bear({ size = 80 }: Props) {
  return (
    <div className="relative" style={{ width: size, height: size }} aria-label="FocusBear mascot">
      <div className="absolute inset-0 bg-bear-fur rounded-full" />
      <div className="absolute -top-2 left-2 w-5 h-5 bg-bear-fur rounded-full" />
      <div className="absolute -top-2 right-2 w-5 h-5 bg-bear-fur rounded-full" />
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 bg-bear-honey rounded-full" />
      <div className="absolute left-1/3 top-1/3 w-3 h-3 bg-white rounded-full" />
      <div className="absolute right-1/3 top-1/3 w-3 h-3 bg-white rounded-full" />
    </div>
  )
}
