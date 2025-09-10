import { Bucket, Task } from '@/features/game/gameSlice';
import type { DragEvent } from 'react';

type Props = Readonly<{ task: Task; poof?: boolean; onSendTo?: (bucket: Bucket) => void }>;

export default function TaskCard({ task, poof, onSendTo }: Props) {
  const draggable = !task.sortedBucket
  const onDragStart = (e: DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('text/plain', task.id)
  }
  return (
    <button
      type="button"
      className={`card-sticky text-left cursor-grab active:cursor-grabbing select-none ${poof ? 'animate-poof' : ''} ${draggable ? 'opacity-100' : 'opacity-50'}`}
      disabled={!draggable}
      draggable={draggable}
      onDragStart={onDragStart}
      aria-label={`Task: ${task.text}`}
    >
      <div className="text-bear-fur font-medium">{task.text}</div>
      {task.sortedBucket && (
        <div className="mt-2 text-xs text-bear-furLight">Sorted: {task.sortedBucket}</div>
      )}
      {!task.sortedBucket && onSendTo && (
        <div className="mt-3 flex gap-2 opacity-0 focus-within:opacity-100 hover:opacity-100 transition-opacity" aria-label="Quick send options">
          <button type="button" onClick={() => onSendTo('Now')} className="px-2 py-1 rounded bg-bear-honey/80 text-bear-fur text-xs">Now</button>
          <button type="button" onClick={() => onSendTo('Later')} className="px-2 py-1 rounded bg-bear-leaf/20 text-bear-fur text-xs">Later</button>
          <button type="button" onClick={() => onSendTo('Never')} className="px-2 py-1 rounded bg-bear-berry/20 text-bear-fur text-xs">Never</button>
        </div>
      )}
    </button>
  )
}
