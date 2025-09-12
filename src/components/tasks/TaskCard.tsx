import { Bucket, Task } from '@/features/game/gameSlice';
import type { DragEvent, TouchEvent } from 'react';
import React from 'react';
// Add a global property for touch drag state
declare global {
  interface Window {
    __focusbear_dragging?: string;
  }
}

type Props = Readonly<{ task: Task; poof?: boolean; onSendTo?: (bucket: Bucket, event?: React.MouseEvent | React.TouchEvent) => void }>;

export default function TaskCard({ task, poof, onSendTo }: Props) {
  const draggable = !task.sortedBucket;
  const [isDragging, setIsDragging] = React.useState(false);
  // Touch drag state (for mobile)
  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    window.__focusbear_dragging = task.id;
    setIsDragging(true);
  };
  // Clear drag state on touch end/cancel
  const handleTouchEnd = () => {
    if (window.__focusbear_dragging === task.id) {
      window.__focusbear_dragging = undefined;
    }
    setIsDragging(false);
  };
  const onDragStart = (e: DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    setIsDragging(true);
  };
  const onDragEnd = () => setIsDragging(false);
  return (
    <button
      type="button"
      className={`card-sticky text-left cursor-grab active:cursor-grabbing select-none transition-transform transition-shadow duration-200
        ${poof ? 'animate-poof' : ''}
        ${draggable ? 'opacity-100' : 'opacity-50'}
        ${isDragging ? 'z-20 scale-105 shadow-2xl ring-4 ring-bear-honey/40' : ''}`}
      disabled={!draggable}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      aria-label={`Task: ${task.text}`}
      style={{ transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s' }}
    >
      <div className="text-bear-fur font-medium">{task.text}</div>
      {task.sortedBucket && (
        <div className="mt-2 text-xs text-bear-furLight">Sorted: {task.sortedBucket}</div>
      )}
      {/* Sparkle/star effect only when dragging */}
      {isDragging && (
        <span className="absolute left-1/2 top-1/2 pointer-events-none animate-sparkle" aria-hidden>✨</span>
      )}
      {!task.sortedBucket && onSendTo && (
        <div className="mt-3 flex gap-2 opacity-0 focus-within:opacity-100 hover:opacity-100 transition-opacity" aria-label="Quick send options">
          <button type="button" onClick={e => onSendTo('Current Goal', e)} className="px-2 py-1 rounded bg-bear-honey/80 text-bear-fur text-xs">Current Goal</button>
          <button type="button" onClick={e => onSendTo('Next Task', e)} className="px-2 py-1 rounded bg-bear-leaf/20 text-bear-fur text-xs">Next Task</button>
          <button type="button" onClick={e => onSendTo('After Work', e)} className="px-2 py-1 rounded bg-bear-berry/20 text-bear-fur text-xs">After Work</button>
        </div>
      )}
    </button>
  );
}
