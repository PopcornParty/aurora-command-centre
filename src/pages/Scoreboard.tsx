import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import TournamentManager from './Tournament'
import PokerTable from './PokerTable'

type Player = { name: string; score: number }
type HistoryEntry = { player: number; delta: number }
type Match = {
  id: string
  name: string
  players: Player[]
  history: HistoryEntry[]
  count: 2 | 3 | 4
}

const KEY = 'aurora-scoreboard'
const COLORS = ['#D9273E', '#3B82F6', '#22C55E', '#F59E0B']
const DEFAULT_NAMES = ['Red', 'Blue', 'Green', 'Yellow']

function migrate(raw: unknown): Match {
  if (raw && typeof raw === 'object' && 'players' in raw) return raw as Match
  const old = raw as { name?: string; red?: string; blue?: string; redScore?: number; blueScore?: number } | null
  return {
    id: 'current',
    name: old?.name || 'Match',
    players: [
      { name: old?.red || 'Red', score: old?.redScore || 0 },
      { name: old?.blue || 'Blue', score: old?.blueScore || 0 },
      { name: 'Green', score: 0 },
      { name: 'Yellow', score: 0 }
    ],
    history: [],
    count: 2
  }
}

export default function Scoreboard() {
  const [tab, setTab] = useState<'live' | 'poker' | 'tournaments'>('live')
  const [match, setMatch] = useState<Match>(() => migrate(loadJSON(KEY, null)))
  const [editing, setEditing] = useState(false)
  const [names, setNames] = useState(match.players.map(p => p.name))
  const [matchName, setMatchName] = useState(match.name)

  useEffect(() => { saveJSON(KEY, match) }, [match])

  const score = (idx: number, delta: number) => {
    setMatch(m => {
      const players = m.players.map((p, i) => i === idx ? { ...p, score: Math.max(0, p.score + delta) } : p)
      return { ...m, players, history: [...m.history, { player: idx, delta }] }
    })
  }

  const undo = () => {
    setMatch(m => {
      if (!m.history.length) return m
      const last = m.history[m.history.length - 1]
      const players = m.players.map((p, i) => i === last.player ? { ...p, score: Math.max(0, p.score - last.delta) } : p)
      return { ...m, players, history: m.history.slice(0, -1) }
    })
  }

  const reset = () => {
    if (!confirm('Reset all scores?')) return
    setMatch(m => ({ ...m, players: m.players.map(p => ({ ...p, score: 0 })), history: [] }))
  }

  const setCount = (c: 2 | 3 | 4) => {
    setMatch(m => ({ ...m, count: c }))
  }

  const saveNames = () => {
    setMatch(m => ({
      ...m,
      name: matchName || 'Match',
      players: m.players.map((p, i) => ({ ...p, name: names[i]?.trim() || DEFAULT_NAMES[i] }))
    }))
    setEditing(false)
  }

  const setManual = (idx: number, val: number) => {
    setMatch(m => ({
      ...m,
      players: m.players.map((p, i) => i === idx ? { ...p, score: Math.max(0, val) } : p)
    }))
  }

  const active = match.players.slice(0, match.count)

  return (
    <div>
      <h1 className="page-title">Scoreboard & Tournaments</h1>
      <div className="quick-actions" style={{ margin: '12px 0' }}>
        <button className={`btn ${tab === 'live' ? 'btn-primary' : ''}`} onClick={() => setTab('live')}>Live Score</button>
        <button className={`btn ${tab === 'poker' ? 'btn-primary' : ''}`} onClick={() => setTab('poker')}>Poker Table</button>
        <button className={`btn ${tab === 'tournaments' ? 'btn-primary' : ''}`} onClick={() => setTab('tournaments')}>Tournaments</button>
      </div>
      {tab === 'tournaments' ? <TournamentManager /> : tab === 'poker' ? <PokerTable /> : <>
        <p className="subtitle">{match.name} — saved locally</p>

        <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
          {([2, 3, 4] as const).map(c => (
            <button key={c} className={`btn ${match.count === c ? 'btn-primary' : ''}`} onClick={() => setCount(c)}>{c} players</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {active.map((p, i) => (
            <div key={i} className="panel" style={{ textAlign: 'center', borderTop: `4px solid ${COLORS[i]}` }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 64, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{p.score}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                <button className="btn" style={{ minWidth: 48, minHeight: 48 }} onClick={() => score(i, -1)}>−</button>
                <button className="btn btn-primary" style={{ minWidth: 48, minHeight: 48, background: COLORS[i], borderColor: COLORS[i] }} onClick={() => score(i, 1)}>+</button>
              </div>
              <input type="number" value={p.score} onChange={e => setManual(i, +e.target.value)} style={{ width: 70, marginTop: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 4, color: 'var(--text)', textAlign: 'center' }} />
            </div>
          ))}
        </div>

        <div className="quick-actions" style={{ marginTop: 16 }}>
          <button className="btn" onClick={undo}>Undo</button>
          <button className="btn" onClick={reset}>Reset</button>
          <button className="btn" onClick={() => setEditing(!editing)}>Edit names</button>
        </div>

        {editing && (
          <div className="panel" style={{ marginTop: 12 }}>
            <input value={matchName} onChange={e => setMatchName(e.target.value)} placeholder="Match name" style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
            {active.map((_, i) => (
              <input key={i} value={names[i]} onChange={e => setNames(n => { const c = [...n]; c[i] = e.target.value; return c })} placeholder={`Player ${i + 1}`} style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
            ))}
            <button className="btn btn-primary" onClick={saveNames}>Save</button>
          </div>
        )}
      </>}
    </div>
  )
}
