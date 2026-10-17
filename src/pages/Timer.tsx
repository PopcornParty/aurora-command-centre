import { useState, useEffect, useRef } from 'react'

export default function Timer() {
  const [mode, setMode] = useState<'timer' | 'stop'>('stop')
  const [running, setRunning] = useState(false)
  const [ms, setMs] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const [target, setTarget] = useState(60)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      const start = Date.now() - ms
      ref.current = window.setInterval(() => setMs(Date.now() - start), 50)
    } else if (ref.current) clearInterval(ref.current)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])

  const fmt = (t: number) => {
    const s = Math.floor(t / 1000)
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2,'0')}.${String(Math.floor((t%1000)/10)).padStart(2,'0')}`
  }

  return (
    <div>
      <h1 className="page-title">Timer & Stopwatch</h1>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <button className={`btn ${mode==='stop'?'btn-primary':''}`} onClick={() => { setMode('stop'); setRunning(false); setMs(0) }}>Stopwatch</button>
        <button className={`btn ${mode==='timer'?'btn-primary':''}`} onClick={() => { setMode('timer'); setRunning(false); setMs(0) }}>Timer</button>
      </div>
      {mode === 'timer' && (
        <div style={{ marginBottom: 12 }}>
          <label>Seconds: <input type="number" value={target} onChange={e => setTarget(+e.target.value)} style={{ width: 80, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        </div>
      )}
      <div className="panel" style={{ textAlign: 'center', fontSize: 42, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
        {mode === 'timer' ? fmt(Math.max(0, target*1000 - ms)) : fmt(ms)}
      </div>
      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'}</button>
        <button className="btn" onClick={() => { setRunning(false); setMs(0); setLaps([]) }}>Reset</button>
        {mode === 'stop' && <button className="btn" onClick={() => setLaps([ms, ...laps])}>Lap</button>}
      </div>
      {laps.length > 0 && <div className="panel" style={{ marginTop: 16 }}>{laps.map((l,i) => <div key={i}>{fmt(l)}</div>)}</div>
    </div>
  )
}
