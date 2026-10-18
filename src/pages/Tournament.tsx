import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import {
  generateKnockout, generateLeague, generateGroups,
  setResult, clearResult, standings, champion, countByes,
  type Tournament, type Format, type Participant, type TMatch, type Standing
} from '../lib/tournament'

const KEY = 'aurora-tournaments'

export default function TournamentManager() {
  const [list, setList] = useState<Tournament[]>(() => loadJSON(KEY, []))
  const [activeId, setActiveId] = useState<string | null>(list[0]?.id || null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [format, setFormat] = useState<Format>('knockout')
  const [names, setNames] = useState('')
  const [numGroups, setNumGroups] = useState(2)
  const [qualify, setQualify] = useState(2)
  const [error, setError] = useState('')
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [sa, setSa] = useState('')
  const [sb, setSb] = useState('')

  useEffect(() => { saveJSON(KEY, list) }, [list])

  const active = list.find(t => t.id === activeId) || null

  const create = () => {
    const raw = names.split('\n').map(s => s.trim()).filter(Boolean)
    const unique = Array.from(new Set(raw))
    if (unique.length < 2) { setError('Need at least 2 participants'); return }
    if (unique.length !== raw.length) { setError('Duplicate names not allowed'); return }
    const participants: Participant[] = unique.map(n => ({ id: crypto.randomUUID(), name: n }))
    let matches: TMatch[] = []
    let groups: string[][] | undefined
    if (format === 'knockout') matches = generateKnockout(participants)
    else if (format === 'league') matches = generateLeague(participants)
    else {
      const g = generateGroups(participants, numGroups, qualify)
      groups = g.groups
      matches = g.matches
    }
    const t: Tournament = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Tournament',
      format,
      participants,
      matches,
      groups,
      qualifyPerGroup: format === 'groups' ? qualify : undefined,
      winPoints: 3, drawPoints: 1, lossPoints: 0,
      created: Date.now()
    }
    setList([t, ...list])
    setActiveId(t.id)
    setCreating(false)
    setError('')
    setName(''); setNames('')
  }

  const update = (id: string, fn: (t: Tournament) => Tournament) => {
    setList(list.map(t => t.id === id ? fn(t) : t))
  }

  const saveScore = (matchId: string) => {
    if (!active) return
    const a = parseInt(sa, 10)
    const b = parseInt(sb, 10)
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) {
      setError('Scores must be non-negative numbers')
      return
    }
    const allowDraw = active.format !== 'knockout'
    update(active.id, t => ({ ...t, matches: setResult(t.matches, matchId, a, b, allowDraw) }))
    setEditingMatch(null)
    setError('')
  }

  const clear = (matchId: string) => {
    if (!active) return
    if (!confirm('Clear this result? Later matches that depend on it will be reset.')) return
    update(active.id, t => ({ ...t, matches: clearResult(t.matches, matchId) }))
  }

  const del = (id: string) => {
    if (!confirm('Delete this tournament?')) return
    setList(list.filter(t => t.id !== id))
    if (activeId === id) setActiveId(list.find(t => t.id !== id)?.id || null)
  }

  const rename = (id: string) => {
    const n = prompt('New name')
    if (n?.trim()) update(id, t => ({ ...t, name: n.trim() }))
  }

  const nameOf = (t: Tournament, id: string | null) => t.participants.find(p => p.id === id)?.name || (id ? id : 'TBD')

  const statusLabel = (m: TMatch) => m.status === 'bye' ? 'Bye' : m.status === 'completed' ? 'Completed' : m.status === 'in-progress' ? 'In Progress' : 'Upcoming'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18 }}>Tournaments</h2>
        <button className="btn btn-primary" onClick={() => setCreating(!creating)}>{creating ? 'Cancel' : 'New tournament'}</button>
      </div>

      {creating && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tournament name" style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <select value={format} onChange={e => setFormat(e.target.value as Format)} style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
            <option value="knockout">Knockout</option>
            <option value="league">League / Round Robin</option>
            <option value="groups">Groups + Knockout</option>
          </select>
          {format === 'groups' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <label>Groups <input type="number" min={2} max={8} value={numGroups} onChange={e => setNumGroups(+e.target.value)} style={{ width: 60, marginLeft: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 4, color: 'var(--text)' }} /></label>
              <label>Qualify <input type="number" min={1} max={4} value={qualify} onChange={e => setQualify(+e.target.value)} style={{ width: 60, marginLeft: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 4, color: 'var(--text)' }} /></label>
            </div>
          )}
          <textarea value={names} onChange={e => setNames(e.target.value)} placeholder="One participant per line" rows={6} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          {error && <p style={{ color: 'var(--accent)', marginTop: 6, fontSize: 13 }}>{error}</p>}
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={create}>Create</button>
        </div>
      )}

      {list.length === 0 && !creating && <p style={{ color: 'var(--text-muted)' }}>No tournaments yet.</p>}

      {list.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {list.map(t => (
            <button key={t.id} className={`btn ${t.id === activeId ? 'btn-primary' : ''}`} onClick={() => setActiveId(t.id)}>{t.name}</button>
          ))}
        </div>
      )}

      {active && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <strong>{active.name}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>{active.format} · {active.participants.length} players</span>
            </div>
            <div className="quick-actions">
              <button className="btn" onClick={() => rename(active.id)}>Rename</button>
              <button className="btn" onClick={() => del(active.id)}>Delete</button>
            </div>
          </div>

          {active.format === 'knockout' && (
            <div className="panel" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Bracket size {Math.pow(2, Math.ceil(Math.log2(active.participants.length)))} · {countByes(active.matches)} byes
                {champion(active.matches) && <span> · Champion: {nameOf(active, champion(active.matches))}</span>}
              </div>
            </div>
          )}

          {(active.format === 'league' || active.format === 'groups') && (
            <div className="panel" style={{ marginBottom: 12, overflowX: 'auto' }}>
              <h3 style={{ marginBottom: 8 }}>Standings</h3>
              {active.format === 'groups' && active.groups ? (
                active.groups.map((g, gi) => {
                  const table = standings(active.participants, active.matches, g, { win: active.winPoints, draw: active.drawPoints, loss: active.lossPoints })
                  return (
                    <div key={gi} style={{ marginBottom: 12 }}>
                      <strong>Group {gi + 1}</strong>
                      <StandingsTable table={table} />
                    </div>
                  )
                })
              ) : (
                <StandingsTable table={standings(active.participants, active.matches, undefined, { win: active.winPoints, draw: active.drawPoints, loss: active.lossPoints })} />
              )}
            </div>
          )}

          <div className="panel">
            <h3 style={{ marginBottom: 8 }}>Matches</h3>
            {active.matches.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>R{m.round + 1} </span>
                  {nameOf(active, m.a)} {m.scoreA !== null ? m.scoreA : '–'} – {m.scoreB !== null ? m.scoreB : '–'} {nameOf(active, m.b)}
                  <span className="demo-badge">{statusLabel(m)}</span>
                </div>
                {m.status !== 'bye' && m.a && m.b && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn" style={{ fontSize: 12 }} onClick={() => { setEditingMatch(m.id); setSa(String(m.scoreA ?? '')); setSb(String(m.scoreB ?? '')) }}>Score</button>
                    {m.status === 'completed' && <button className="btn" style={{ fontSize: 12 }} onClick={() => clear(m.id)}>Clear</button>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {editingMatch && (
            <div className="panel" style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" min={0} value={sa} onChange={e => setSa(e.target.value)} style={{ width: 70, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} />
                <span>–</span>
                <input type="number" min={0} value={sb} onChange={e => setSb(e.target.value)} style={{ width: 70, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} />
                <button className="btn btn-primary" onClick={() => saveScore(editingMatch)}>Save</button>
                <button className="btn" onClick={() => setEditingMatch(null)}>Cancel</button>
              </div>
              {error && <p style={{ color: 'var(--accent)', marginTop: 6, fontSize: 13 }}>{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StandingsTable({ table }: { table: Standing[] }) {
  return (
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 6 }}>
      <thead><tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}><th>#</th><th>Name</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th><th>+/-</th></tr></thead>
      <tbody>
        {table.map((s, i) => (
          <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
            <td>{i + 1}</td><td>{s.name}</td><td>{s.played}</td><td>{s.won}</td><td>{s.drawn}</td><td>{s.lost}</td><td><strong>{s.points}</strong></td><td>{s.diff}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
