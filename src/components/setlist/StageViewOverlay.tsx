import { useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Song } from '@/types'

interface StageViewOverlayProps {
  songs: Song[]
  onExit: () => void
}

const MAX_FONT_PX = 72

function displayTitle(title: string, fontSize: number): string {
  const containerWidth = window.innerWidth - 64
  const estimatedWidth = title.length * fontSize * 0.6
  if (estimatedWidth <= containerWidth) return title
  return title
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join('.')
}

export function StageViewOverlay({ songs, onExit }: StageViewOverlayProps) {
  const [showX, setShowX] = useState(false)
  const lastTapRef = useRef<number>(0)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fontSize = Math.min(MAX_FONT_PX, (window.innerHeight * 0.85) / songs.length / 1.4)

  const handleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setShowX(true)
      hideTimerRef.current = setTimeout(() => setShowX(false), 3000)
    }
    lastTapRef.current = now
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleTap}
      onTouchEnd={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 32px',
        zIndex: 9999,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {songs.map((song) => (
        <div
          key={song.id}
          style={{
            flex: 'none',
            textAlign: 'center',
            fontSize,
            fontWeight: 700,
            color: '#000',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {song.stageName ? song.stageName : displayTitle(song.title, fontSize)}
        </div>
      ))}

      <AnimatePresence>
        {showX && (
          <motion.button
            key="exit-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation()
              onExit()
            }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '2px solid #000',
              background: '#fff',
              color: '#000',
              fontSize: 22,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            aria-label="Exit stage view"
          >
            ×
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
