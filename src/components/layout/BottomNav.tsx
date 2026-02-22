import { useLocation, useNavigate } from 'react-router-dom'
import { Music, List, Calendar, Settings } from 'lucide-react'

const tabs = [
  { path: '/library', label: 'Library', icon: Music },
  { path: '/setlists', label: 'Setlists', icon: List },
  { path: '/gigs', label: 'Gigs', icon: Calendar },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/library') {
      return location.pathname === '/' || location.pathname.startsWith('/library')
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = isActive(path)
        return (
          <button
            key={path}
            className={`nav-tab${active ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="nav-tab-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
