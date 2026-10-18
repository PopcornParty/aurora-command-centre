import { useState, useEffect, useRef } from 'react'

export default function FocusMode() {
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60 * 1000)
  const [running, setRunning] = useState(false)
  const endRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      if (endRef.current) {
        const left = Math.max(0, endRef.current - Date.now())
        setRemaining(left)
        if (left <= 0) setRunning(false)
      }
    }, 200)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    const ms = minutes * 60 * 1000
    setRemaining(ms)
    endRef.current = Date.now() + ms
    setRunning(true)
  }
  const pause = () => {
    if (endRef.current) setRemaining(Math.max(0, endRef.current - Date.now()))
    setRunning(false)
    endRef.current = null
  }
  const reset = () => { setRunning(false); endRef.current = null; setRemaining(minutes * 60 * 1000) }

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div>
      <h1 className="page-title">Focus</h1>
      <p className="subtitle">Local focus timer. Accurate across tab switches.</p>
      <div className="panel" style={{ marginTop: 16, textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontSize: 56, fontFamily: 'var(--font-display)' }}>{fmt(remaining)}</div>
        <div style={{ margin: '12px 0' }}>
          <label>Minutes <input type="number" min={1} max={180} value={minutes} disabled={running} onChange={e => { const v = Math.max(1, +e.target.value || 25); setMinutes(v); if (!running) setRemaining(v * 60000) }} style={{ width: 70, marginLeft: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        </div>
        <div className="quick-actions" style={{ justifyContent: 'center' }}>
          {!running ? <button className="btn btn-primary" onClick={start}>Start</button> : <button className="btn" onClick={pause}>Pause</button>}
          <button className="btn" onClick={reset}>Reset</button>
        </div>
        {remaining === 0 && !running && <p style={{ color: 'var(--accent)', marginTop: 12 }}>Session complete</p>}
      </div>
    </div>
  )
}
