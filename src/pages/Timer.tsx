import { useState, useEffect } from 'react'

export default function Timer() {
  const [seconds, setSeconds] = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [running, setRunning] = useState(false)
  const endRef = useState<number | null>(null)[0]

  useEffect(() => {
    if (!running) return
    const tick = () => {
      if (endRef) {
        const left = Math.max(0, Math.round((endRef - Date.now()) / 1000))
        setRemaining(left)
        if (left <= 0) setRunning(false)
      }
    }
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    const total = Math.max(1, seconds)
    setRemaining(total)
    // simplified for brevity
    setRunning(true)
  }

  const pause = () => setRunning(false)
  const reset = () => { setRunning(false); setRemaining(seconds) }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div>
      <h1 className="page-title">Timer</h1>
      <div className="panel" style={{ marginTop: 16, textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontSize: 48, fontFamily: 'var(--font-display)', marginBottom: 12 }}>{fmt(remaining)}</div>
        <div style={{ marginBottom: 12 }}>
          <label>Seconds: <input type="number" value={seconds} onChange={e => setSeconds(+e.target.value)} disabled={running} style={{ width: 80, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        </div>
        <div className="quick-actions">
          {!running ? <button className="btn btn-primary" onClick={start}>Start</button> : <button className="btn" onClick={pause}>Pause</button>}
          <button className="btn" onClick={reset}>Reset</button>
        </div>
        {remaining === 0 && !running && <p style={{ color: 'var(--accent)', marginTop: 12 }}>Time’s up</p>}
      </div>
    </div>
  )
}
