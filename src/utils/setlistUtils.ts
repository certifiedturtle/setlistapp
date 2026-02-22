import { Setlist, Song } from '@/types'
import { secsToDisplay } from './formatDuration'

export function getTotalDuration(setlist: Setlist, songMap: Record<string, Song>): number {
  return setlist.songs.reduce((acc, ss) => {
    const song = songMap[ss.songId]
    return acc + (song?.durationSecs ?? 0)
  }, 0)
}

export function getTotalDurationDisplay(setlist: Setlist, songMap: Record<string, Song>): string {
  return secsToDisplay(getTotalDuration(setlist, songMap))
}

export function getProgress(setlist: Setlist, songMap: Record<string, Song>): number {
  const total = getTotalDuration(setlist, songMap)
  if (!setlist.targetDuration) return 0
  return Math.min(total / setlist.targetDuration, 1)
}

export function formatSetlistDate(date?: string, time?: string): string {
  if (!date) return 'No date set'
  const d = new Date(date + 'T00:00:00')
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const dateStr = d.toLocaleDateString('en-US', options)
  return time ? `${dateStr} · ${time}` : dateStr
}

export function isUpcoming(date?: string): boolean {
  if (!date) return false
  const d = new Date(date + 'T00:00:00')
  return d >= new Date()
}
