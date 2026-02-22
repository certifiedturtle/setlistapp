import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { NavDirection } from '@/types'

const tabRoots = ['/library', '/setlists', '/gigs', '/settings']

function getDepth(pathname: string): number {
  return pathname.split('/').filter(Boolean).length
}

function isTabRoot(pathname: string): boolean {
  return tabRoots.some((r) => pathname === r || pathname === '/')
}

export function useNavDirection(): NavDirection {
  const location = useLocation()
  const prevPathname = useRef<string>(location.pathname)
  const directionRef = useRef<NavDirection>('tab')

  useEffect(() => {
    const prev = prevPathname.current
    const next = location.pathname

    if (prev === next) {
      directionRef.current = 'tab'
    } else if (isTabRoot(next) || (isTabRoot(prev) && isTabRoot(next))) {
      directionRef.current = 'tab'
    } else if (getDepth(next) > getDepth(prev)) {
      directionRef.current = 'forward'
    } else {
      directionRef.current = 'back'
    }

    prevPathname.current = next
  }, [location.pathname])

  return directionRef.current
}
