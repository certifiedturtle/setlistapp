import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavDirection } from '@/hooks/useNavDirection'
import { NavDirection } from '@/types'

const variants = {
  forward: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-25%', opacity: 0 },
  },
  back: {
    initial: { x: '-25%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  tab: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
}

const transition = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 35,
  mass: 0.8,
}

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const direction = useNavDirection()
  const v = variants[direction]

  return (
    <motion.div
      className="page"
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
