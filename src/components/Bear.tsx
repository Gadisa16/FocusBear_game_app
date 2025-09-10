type Props = Readonly<{ size?: number; mood?: 'normal' | 'happy' | 'sad' }>

export default function Bear({ size = 80, mood = 'normal' }: Props) {
  const scale = size / 150
  let mouthClass = 'w-[50px] h-[10px] bg-black top-[110px] left-[50px] rounded-[10px]'
  if (mood === 'happy') mouthClass = 'w-[60px] top-[100px] left-[45px] border-black border-solid'
  if (mood === 'sad') mouthClass = 'w-[60px] top-[110px] left-[45px] border-black border-solid'

  return (
    <div className="relative" style={{ width: size, height: size }} aria-label={`FocusBear mascot ${mood}`}>
      <div
        className={`bear ${mood} relative w-[150px] h-[150px] bg-[#c68c53] rounded-full`}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* ears */}
        <div className="ear left-ear absolute w-[50px] h-[50px] bg-[#c68c53] rounded-full -top-5 left-[10px]" />
        <div className="ear right-ear absolute w-[50px] h-[50px] bg-[#c68c53] rounded-full -top-5 right-[10px]" />
        {/* eyes (blink always) */}
        <div className="eye left-eye absolute w-5 h-5 bg-black rounded-full top-[50px] left-10" />
        <div className="eye right-eye absolute w-5 h-5 bg-black rounded-full top-[50px] right-10" />
        {/* nose */}
        <div className="nose absolute w-[30px] h-5 bg-black rounded-full top-[80px] left-[60px]" />
        {/* mouth */}
        <div className={`mouth absolute ${mouthClass}`} />
        {/* tongue only when happy */}
        {mood === 'happy' && (
          <div className="tongue absolute w-[30px] h-[15px] bg-pink-400 rounded-full top-[115px] left-[60px]" />
        )}
      </div>
    </div>
  )
}
