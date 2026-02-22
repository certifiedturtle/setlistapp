import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronLeft, Plus, Share2 } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { DraggableSongRow } from '@/components/setlist/DraggableSongRow'
import { useSetlistStore } from '@/store/setlistStore'
import { useSongStore } from '@/store/songStore'
import { useUiStore } from '@/store/uiStore'
import { secsToDisplay } from '@/utils/formatDuration'
import { Song } from '@/types'

export function SetlistBuilderPage() {
  const { setlistId } = useParams<{ setlistId: string }>()
  const navigate = useNavigate()
  const openSongPicker = useUiStore((s) => s.openSongPicker)

  const setlist = useSetlistStore((s) => s.setlists.find((sl) => sl.id === setlistId))
  const reorderSongs = useSetlistStore((s) => s.reorderSongs)
  const removeSongFromSetlist = useSetlistStore((s) => s.removeSongFromSetlist)
  const renameSetlist = useSetlistStore((s) => s.renameSetlist)

  const allSongs = useSongStore((s) => s.songs)
  const songMap = Object.fromEntries(allSongs.map((s) => [s.id, s])) as Record<string, Song>

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  if (!setlist || !setlistId) {
    return (
      <PageTransition>
        <div className="empty-state" style={{ height: '100%' }}>
          <div className="empty-state-title">Setlist not found</div>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
            Go back
          </button>
        </div>
      </PageTransition>
    )
  }

  const totalSecs = setlist.songs.reduce((acc, ss) => {
    return acc + (songMap[ss.songId]?.durationSecs ?? 0)
  }, 0)

  const targetSecs = setlist.targetDuration ?? 3600
  const progressPct = Math.min((totalSecs / targetSecs) * 100, 100)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    if (over && active.id !== over.id) {
      reorderSongs(setlistId, String(active.id), String(over.id))
    }
  }

  const sortedSongs = [...setlist.songs].sort((a, b) => a.order - b.order)
  const songIds = sortedSongs.map((ss) => ss.songId)

  return (
    <PageTransition>
      {/* Header */}
      <div className="builder-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ChevronLeft size={18} />
          Setlists
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="share-icon-btn"
            onClick={() => navigate(`/setlists/${setlistId}/share`)}
            aria-label="Share setlist"
          >
            <Share2 size={18} />
          </button>
          <button className="save-btn" aria-label="Save setlist">
            Save
          </button>
        </div>
      </div>

      {/* Editable name */}
      <input
        className="setlist-name-input"
        value={setlist.name}
        onFocus={() => setEditingName(true)}
        onBlur={() => setEditingName(false)}
        onChange={(e) => renameSetlist(setlistId, e.target.value)}
        aria-label="Setlist name"
      />
      <div style={{ height: 12 }} />

      {/* Total time bar */}
      <div className="total-time-bar">
        <div>
          <div className="total-time-label">Total set time</div>
          <div style={{ marginTop: 4 }}>
            <div className="progress-bar-wrap" style={{ width: 140 }}>
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="total-time-value">{secsToDisplay(totalSecs)}</div>
          <div className="total-time-target">of {secsToDisplay(targetSecs)}</div>
        </div>
      </div>

      {/* Drag-to-reorder list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
          {sortedSongs.map((ss) => (
            <DraggableSongRow
              key={ss.songId}
              songId={ss.songId}
              song={songMap[ss.songId]}
              onRemove={() => removeSongFromSetlist(setlistId, ss.songId)}
            />
          ))}
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeDragId ? (
            <DraggableSongRow
              songId={activeDragId}
              song={songMap[activeDragId]}
              onRemove={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add songs button */}
      <button
        className="add-songs-btn"
        onClick={() => openSongPicker(setlistId)}
        aria-label="Add songs from library"
      >
        <Plus size={18} />
        Add songs from library
      </button>

      <div style={{ height: 40 }} />
    </PageTransition>
  )
}
