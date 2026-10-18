import { useState, useEffect, useRef } from 'react'

export default function Timer() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [remainingMs, setRemainingMs] = useState(60000)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const endRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const alertedRef = useRef(false)

  const totalMs = () => Math.max(0, (hours * 3600 + minutes * 60 + seconds) * 1000)

  const tick = () => {
    if (!endRef.current) return
    const left = Math.max(0, endRef.current - Date.now())
    setRemainingMs(left)
    if (left <= 0 && !alertedRef.current) {
      alertedRef.current = true
      setRunning(false)
      setCompleted(true)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = 880
        g.gain.setValueAtTime(0.3, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        o.start(); o.stop(ctx.currentTime + 0.5)
      } catch {}
    }
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(tick, 100)
      return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }
    return undefined
  }, [running])

  const start = () => {
    const ms = totalMs()
    if (ms <= 0) return
    setRemainingMs(ms)
    endRef.current = Date.now() + ms
    alertedRef.current = false
    setCompleted(false)
    setRunning(true)
  }

  const pause = () => {
    if (endRef.current) setRemainingMs(Math.max(0, endRef.current - Date.now()))
    setRunning(false)
    endRef.current = null
  }

  const resume = () => {
    if (remainingMs <= 0) return
    endRef.current = Date.now() + remainingMs
    alertedRef.current = false
    setCompleted(false)
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    endRef.current = null
    alertedRef.current = false
    setCompleted(false)
    setRemainingMs(totalMs())
  }

  const fmt = (ms: number) => {
    const s = Math.ceil(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    return `${m}:${String(sec).padStart(2,'0')}`
  }

  return (
    <div>
      <h1 className="page-title">Timer</h1>
      <div className="panel" style={{ marginTop: 16, textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 48, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
          {fmt(remainingMs)}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <label>H <input type="number" min={0} max={99} value={hours} disabled={running} onChange={e => setHours(Math.max(0, Math.min(99, +e.target.value || 0)))} style={{ width: 60, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
          <label>M <input type="number" min={0} max={59} value={minutes} disabled={running} onChange={e => setMinutes(Math.max(0, Math.min(59, +e.target.value || 0)))} style={{ width: 60, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
          <label>S <input type="number" min={0} max={59} value={seconds} disabled={running} onChange={e => setSeconds(Math.max(0, Math.min(59, +e.target.value || 0)))} style={{ width: 60, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        </div>
        <div className="quick-actions" style={{ justifyContent: 'center' }}>
          {!running ? (
            remainingMs > 0 && remainingMs < totalMs() && !completed
              ? <button className="btn btn-primary" onClick={resume}>Resume</button>
              : <button className="btn btn-primary" onClick={start}>Start</button>
          ) : (
            <button className="btn" onClick={pause}>Pause</button>
          )}
          <button className="btn" onClick={reset}>Reset</button>
        </div>
        {completed && <p style={{ color: 'var(--accent)', marginTop: 16, fontWeight: 500 }}>Time’s up</p>}
      </div>
    </div>
  )
}
