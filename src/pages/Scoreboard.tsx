import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

type Match = { id: string; name: string; red: string; blue: string; redScore: number; blueScore: number; history: { team: 'red'|'blue'; delta: number }[] }

const KEY = 'aurora-scoreboard'

export default function Scoreboard() {
  const [match, setMatch] = useState<Match>(() => loadJSON(KEY, {
    id: 'current', name: 'Match', red: 'Red', blue: 'Blue', redScore: 0, blueScore: 0, history: []
  }))
  const [editing, setEditing] = useState(false)
  const [redName, setRedName] = useState(match.red)
  const [blueName, setBlueName] = useState(match.blue)
  const [matchName, setMatchName] = useState(match.name)

  useEffect(() => { saveJSON(KEY, match) }, [match])

  const score = (team: 'red'|'blue', delta: number) => {
    setMatch(m => {
      const next = { ...m, history: [...m.history, { team, delta }] }
      if (team === 'red') next.redScore = Math.max(0, m.redScore + delta)
      else next.blueScore = Math.max(0, m.blueScore + delta)
      return next
    })
  }

  const undo = () => {
    setMatch(m => {
      if (!m.history.length) return m
      const last = m.history[m.history.length - 1]
      const next = { ...m, history: m.history.slice(0, -1) }
      if (last.team === 'red') next.redScore = Math.max(0, m.redScore - last.delta)
      else next.blueScore = Math.max(0, m.blueScore - last.delta)
      return next
    })
  }

  const reset = () => {
    if (!confirm('Reset both scores?')) return
    setMatch(m => ({ ...m, redScore: 0, blueScore: 0, history: [] }))
  }

  const saveNames = () => {
    setMatch(m => ({ ...m, red: redName || 'Red', blue: blueName || 'Blue', name: matchName || 'Match' }))
    setEditing(false)
  }

  const setManual = (team: 'red'|'blue', val: number) => {
    setMatch(m => team === 'red' ? { ...m, redScore: Math.max(0, val) } : { ...m, blueScore: Math.max(0, val) })
  }

  return (
    <div>
      <h1 className="page-title">Scoreboard</h1>
      <p className="subtitle">{match.name} — saved locally</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <div className="panel" style={{ textAlign: 'center', borderTop: '4px solid #D9273E' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{match.red}</div>
          <div style={{ fontSize: 72, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{match.redScore}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn" style={{ minWidth: 48, minHeight: 48 }} onClick={() => score('red', -1)}>−</button>
            <button className="btn btn-primary" style={{ minWidth: 48, minHeight: 48 }} onClick={() => score('red', 1)}>+</button>
          </div>
          <input type="number" value={match.redScore} onChange={e => setManual('red', +e.target.value)} style={{ width: 70, marginTop: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 4, color: 'var(--text)', textAlign: 'center' }} />
        </div>
        <div className="panel" style={{ textAlign: 'center', borderTop: '4px solid #3B82F6' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{match.blue}</div>
          <div style={{ fontSize: 72, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{match.blueScore}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn" style={{ minWidth: 48, minHeight: 48 }} onClick={() => score('blue', -1)}>−</button>
            <button className="btn btn-primary" style={{ minWidth: 48, minHeight: 48, background: '#3B82F6', borderColor: '#3B82F6' }} onClick={() => score('blue', 1)}>+</button>
          </div>
          <input type="number" value={match.blueScore} onChange={e => setManual('blue', +e.target.value)} style={{ width: 70, marginTop: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 4, color: 'var(--text)', textAlign: 'center' }} />
        </div>
      </div>

      <div className="quick-actions" style={{ marginTop: 16 }}>
        <button className="btn" onClick={undo}>Undo</button>
        <button className="btn" onClick={reset}>Reset</button>
        <button className="btn" onClick={() => setEditing(!editing)}>Edit names</button>
      </div>

      {editing && (
        <div className="panel" style={{ marginTop: 12 }}>
          <input value={matchName} onChange={e => setMatchName(e.target.value)} placeholder="Match name" style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <input value={redName} onChange={e => setRedName(e.target.value)} placeholder="Red team" style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <input value={blueName} onChange={e => setBlueName(e.target.value)} placeholder="Blue team" style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <button className="btn btn-primary" onClick={saveNames}>Save</button>
        </div>
      )}
    </div>
  )
}
