import { useState, useEffect, useRef } from 'react'

export default function Stopwatch() {
  const [ms, setMs] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      if (startRef.current) setMs(Date.now() - startRef.current)
    }, 50)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    startRef.current = Date.now() - ms
    setRunning(true)
  }
  const pause = () => setRunning(false)
  const reset = () => { setRunning(false); setMs(0); setLaps([]) }
  const lap = () => setLaps([ms, ...laps])

  const fmt = (t: number) => {
    const s = Math.floor(t / 1000)
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2,'0')}.${String(Math.floor((t%1000)/10)).padStart(2,'0')}`
  }

  return (
    <div>
      <h1 className="page-title">Stopwatch</h1>
      <div className="panel" style={{ marginTop: 16, textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontSize: 42, fontFamily: 'var(--font-display)', marginBottom: 16 }}>{fmt(ms)}</div>
        <div className="quick-actions">
          {!running ? <button className="btn btn-primary" onClick={start}>Start</button> : <button className="btn" onClick={pause}>Pause</button>}
          <button className="btn" onClick={reset}>Reset</button>
          {running && <button className="btn" onClick={lap}>Lap</button>}
        </div>
        {laps.length > 0 && <div style={{ marginTop: 16, textAlign: 'left' }}>{laps.map((l, i) => <div key={i}>{fmt(l)}</div>)}</div>}
      </div>
    </div>
  )
}
