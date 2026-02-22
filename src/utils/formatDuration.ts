export function secsToDisplay(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function parseDuration(str: string): number {
  const [m, s] = str.split(':').map(Number)
  return (m || 0) * 60 + (s || 0)
}

export function addDurationStrings(durations: string[]): string {
  const total = durations.reduce((acc, d) => acc + parseDuration(d), 0)
  return secsToDisplay(total)
}
