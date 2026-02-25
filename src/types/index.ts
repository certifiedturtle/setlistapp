export type SongKey =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E'
  | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

export type EnergyLevel = 'high' | 'mid' | 'low'

export type SongType = 'cover' | 'original'

export interface Song {
  id: string
  title: string
  artist: string
  key: SongKey
  duration: string // e.g. "4:32"
  durationSecs: number // seconds for math
  type: SongType
  genre: string
  energy: EnergyLevel
  lyrics?: string
  toneNotes?: string
  stageName?: string
  tags: string[]
  year?: number
}

export interface SetlistSong {
  songId: string
  order: number
}

export interface Setlist {
  id: string
  name: string
  date?: string // ISO date string e.g. "2024-09-14"
  time?: string // e.g. "9:00 PM"
  venue?: string
  songs: SetlistSong[]
  targetDuration: number // seconds
}

export interface Gig {
  id: string
  bandId: string
  createdBy: string
  name: string
  date?: string       // ISO date string e.g. "2026-08-14"
  venue?: string
  notes?: string
  setlistId?: string
  createdAt: string
  loadInTime?:     string   // "HH:MM" 24-hr
  soundCheckTime?: string
  doorsTime?:      string
  setStartTime?:   string
  setEndTime?:     string
  loadOutTime?:    string
  location?:       string
  contactName?:    string
  contactPhone?:   string
  ticketLink?:     string
  equipment?:      { items: string[]; otherText?: string }
}

export type NavDirection = 'forward' | 'back' | 'tab'
