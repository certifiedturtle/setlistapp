import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { Song } from '@/types'
import clsx from 'clsx'

interface DraggableSongRowProps {
  songId: string
  song: Song | undefined
  onRemove: () => void
  isDragOverlay?: boolean
}

export function DraggableSongRow({ songId, song, onRemove, isDragOverlay }: DraggableSongRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: songId })

  const style = isDragOverlay
    ? { boxShadow: '0 8px 30px rgba(0,0,0,0.5)', borderRadius: 12, opacity: 1 }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }

  if (!song) return null

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={clsx('draggable-row', { 'is-dragging': isDragging })}
    >
      <button
        className="drag-handle"
        {...(isDragOverlay ? {} : listeners)}
        {...(isDragOverlay ? {} : attributes)}
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <span className={clsx('energy-dot', song.energy)} />

      <div className="draggable-row-content">
        <div className="draggable-row-title">{song.title}</div>
        <div className="draggable-row-duration">{song.duration}</div>
      </div>

      {!isDragOverlay && (
        <button className="remove-btn" onClick={onRemove} aria-label={`Remove ${song.title}`}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}
