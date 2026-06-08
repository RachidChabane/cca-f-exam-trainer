import { useEffect, useRef, useState } from 'react'

/**
 * Wall-clock countdown to `endsAt` (epoch ms). Ticks every second while
 * `active`, returns remaining ms, and calls `onExpire` exactly once when it
 * hits zero. Resets when `endsAt` changes (a new session).
 */
export function useCountdown(endsAt: number, active: boolean, onExpire: () => void): number {
  const [now, setNow] = useState(() => Date.now())
  const firedRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    firedRef.current = false
  }, [endsAt])

  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active, endsAt])

  const remaining = Math.max(0, endsAt - now)

  useEffect(() => {
    if (active && remaining <= 0 && !firedRef.current) {
      firedRef.current = true
      onExpireRef.current()
    }
  }, [active, remaining])

  return remaining
}

/** Format ms as H:MM:SS or MM:SS. */
export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
