import type { ReactNode } from 'react'

export default function BearBubble({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bear-bubble">
      {children}
    </div>
  )
}
