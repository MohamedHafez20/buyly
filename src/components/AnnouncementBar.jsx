import { useEffect, useMemo, useState } from 'react'
import { listActiveAnnouncements } from '../services/announcements'
import { useResource } from '../lib/useResource'
import AnnouncementBarView from './AnnouncementBarView'

// Storefront announcement bar. Fetches the active bars and auto-rotates through
// them when more than one is showing. All visual styling comes from the API data
// via <AnnouncementBarView/> — this container only owns data and rotation.
//
// Announcements are controlled entirely by the admin (active flag / schedule);
// visitors cannot dismiss them, so there is no per-visitor dismissal state here.
export default function AnnouncementBar() {
  const { data } = useResource(() => listActiveAnnouncements(), [])
  const bars = useMemo(() => data || [], [data])

  const [index, setIndex] = useState(0)

  // Auto-rotate through the bars. The active bar's autoRotateSeconds sets the
  // cadence. Only runs when there is more than one bar.
  const current = bars.length ? bars[index % bars.length] : null
  const rotateMs = Math.max(2, Number(current?.autoRotateSeconds) || 5) * 1000

  useEffect(() => {
    if (bars.length <= 1) return
    const t = setInterval(() => setIndex((i) => i + 1), rotateMs)
    return () => clearInterval(t)
  }, [bars.length, rotateMs])

  if (!current) return null

  // When rotating through multiple bars, the incoming bar always slides in
  // horizontally (left → right) for a smooth carousel-style transition. A single
  // bar just plays whatever entrance animation it was configured with, if any.
  const animate =
    bars.length > 1
      ? 'slide-x'
      : current.animation && current.animation !== 'none'
        ? current.animation
        : undefined

  return (
    <AnnouncementBarView
      // Keyed by id so the mount animation replays on each rotation.
      key={current.id}
      bar={current}
      animate={animate}
    />
  )
}
