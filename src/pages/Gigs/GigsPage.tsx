import { Calendar } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'

export function GigsPage() {
  return (
    <PageTransition>
      <div className="screen-header">
        <h1 className="screen-title">Gigs</h1>
      </div>
      <div className="stub-page">
        <div className="stub-icon">
          <Calendar size={64} />
        </div>
        <div className="stub-title">Gig Calendar</div>
        <div className="stub-desc">
          Track upcoming shows, link setlists to gigs, and manage your performance schedule.
          Coming soon.
        </div>
      </div>
    </PageTransition>
  )
}
