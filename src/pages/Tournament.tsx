import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import {
  generateKnockout, generateLeague, generateGroups,
  setResult, clearResult, standings, champion, countByes,
  groupQualifiers, generateKnockoutFromQualifiers, tiedPositions,
  type Tournament, type Format, type Participant, type TMatch, type Standing
} from '../lib/tournament'

const KEY = 'aurora-tournaments'
type View = 'overview' | 'matches' | 'standings' | 'groups' | 'bracket'

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
  const [view, setView] = useState<View>('matches')
  const [scores, setScores] = useState<Record<string, { a: string; b: string }>>({})

  useEffect(() => { saveJSON(KEY, list) }, [list])

  const active = list.find(t => t.id === activeId) || null

  const update = (id: string, fn: (t: Tournament) => Tournament) => {
    setList(prev => prev.map(t => t.id === id ? fn(t) : t))
  }

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
    setList(prev => [t, ...prev])
    setActiveId(t.id)
    setCreating(false)
    setError('')
    setName(''); setNames('')
    setView('matches')
  }

  const saveScore = (matchId: string) => {
    if (!active) return
    const sc = scores[matchId]
    if (!sc) { setError('Enter both scores'); return }
    const a = parseInt(sc.a, 10)
    const b = parseInt(sc.b, 10)
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) {
      setError('Scores must be non-negative numbers')
      return
    }
    const match = active.matches.find(m => m.id === matchId)
    const allowDraw = active.format !== 'knockout' && match?.stage !== 'knockout'
    const isGroup = match?.stage === 'group'
    if (!allowDraw && a === b) {
      setError('Knockout matches cannot end in a draw')
      return
    }
    update(active.id, t => {
      let next = setResult(t.matches, matchId, a, b, allowDraw)
      if (isGroup && t.format === 'groups' && t.groups && t.qualifyPerGroup) {
        next = syncGroupKnockout(t, next)
      }
      return { ...t, matches: next }
    })
    setError('')
    setScores(prev => { const n = { ...prev }; delete n[matchId]; return n })
  }

  const clear = (matchId: string) => {
    if (!active) return
    if (!confirm('Clear this result? Later matches that depend on it will be reset.')) return
    update(active.id, t => {
      let next = clearResult(t.matches, matchId)
      if (t.format === 'groups' && t.groups && t.qualifyPerGroup) {
        next = syncGroupKnockout(t, next)
      }
      return { ...t, matches: next }
    })
  }

  const del = (id: string) => {
    if (!confirm('Delete this tournament?')) return
    setList(prev => prev.filter(t => t.id !== id))
    if (activeId === id) setActiveId(list.find(t => t.id !== id)?.id || null)
  }

  const rename = (id: string) => {
    const n = prompt('New name')
    if (n?.trim()) update(id, t => ({ ...t, name: n.trim() }))
  }

  const nameOf = (t: Tournament, id: string | null) => t.participants.find(p => p.id === id)?.name || (id ? '?' : 'TBD')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 18 }}>Tournaments</h2>
        <button className="btn btn-primary" onClick={() => setCreating(!creating)}>{creating ? 'Cancel' : 'New'}</button>
      </div>

      {creating && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tournament name" style={inputStyle} />
          <select value={format} onChange={e => setFormat(e.target.value as Format)} style={{ ...inputStyle, marginBottom: 8 }}>
            <option value="knockout">Knockout</option>
            <option value="league">League / Round Robin</option>
            <option value="groups">Groups + Knockout</option>
          </select>
          {format === 'groups' && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <label>Groups <input type="number" min={2} max={8} value={numGroups} onChange={e => setNumGroups(Math.max(2, +e.target.value || 2))} style={numStyle} /></label>
              <label>Qualify each <input type="number" min={1} max={4} value={qualify} onChange={e => setQualify(Math.max(1, +e.target.value || 1))} style={numStyle} /></label>
            </div>
          )}
          <textarea value={names} onChange={e => setNames(e.target.value)} placeholder="One participant per line" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
          {error && <p style={{ color: 'var(--accent)', marginTop: 6, fontSize: 13 }}>{error}</p>}
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={create}>Create</button>
        </div>
      )}

      {list.length === 0 && !creating && <p style={{ color: 'var(--text-muted)' }}>No tournaments yet. Create one to get started.</p>}

      {list.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {list.map(t => (
            <button key={t.id} className={`btn ${t.id === activeId ? 'btn-primary' : ''}`} onClick={() => { setActiveId(t.id); setView('matches'); setError('') }}>{t.name}</button>
          ))}
        </div>
      )}

      {active && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <div>
              <strong>{active.name}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 13 }}>{active.format} · {active.participants.length} players</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn" onClick={() => rename(active.id)}>Rename</button>
              <button className="btn" onClick={() => del(active.id)}>Delete</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
            {(['overview', 'matches', 'standings', ...(active.format === 'groups' ? ['groups'] as View[] : []), ...(active.format !== 'league' ? ['bracket'] as View[] : [])] as View[]).map(v => (
              <button key={v} className={`btn ${view === v ? 'btn-primary' : ''}`} style={{ fontSize: 12 }} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
            ))}
          </div>

          {error && <p style={{ color: 'var(--accent)', marginBottom: 8, fontSize: 13 }}>{error}</p>}

          {view === 'overview' && <Overview t={active} nameOf={nameOf} />}
          {view === 'matches' && <MatchList t={active} scores={scores} setScores={setScores} saveScore={saveScore} clear={clear} nameOf={nameOf} />}
          {view === 'standings' && <StandingsView t={active} />}
          {view === 'groups' && active.groups && <GroupsView t={active} />}
          {view === 'bracket' && <BracketView t={active} nameOf={nameOf} />}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 16 }
const numStyle: React.CSSProperties = { width: 56, marginLeft: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)', fontSize: 16 }

function syncGroupKnockout(t: Tournament, matches: TMatch[]): TMatch[] {
  if (!t.groups || !t.qualifyPerGroup) return matches
  const { qualifiers, ties } = groupQualifiers(t.participants, matches, t.groups, t.qualifyPerGroup, { win: t.winPoints, draw: t.drawPoints, loss: t.lossPoints })
  const groupMatches = matches.filter(m => m.stage === 'group')
  if (!qualifiers || ties.length) return groupMatches
  const qParts = qualifiers.map(id => t.participants.find(p => p.id === id)!).filter(Boolean)
  const ko = generateKnockoutFromQualifiers(qParts)
  return [...groupMatches, ...ko]
}

function Overview({ t, nameOf }: { t: Tournament; nameOf: (t: Tournament, id: string | null) => string }) {
  const done = t.matches.filter(m => m.status === 'completed' || m.status === 'bye').length
  const champ = champion(t.matches)
  return (
    <div className="panel">
      <p style={{ marginBottom: 6 }}><strong>{t.participants.length}</strong> participants</p>
      <p style={{ marginBottom: 6 }}>{done} / {t.matches.length} matches finished</p>
      {t.format === 'knockout' && <p style={{ marginBottom: 6 }}>{countByes(t.matches)} byes</p>}
      {champ && <p style={{ color: 'var(--accent)', fontWeight: 600 }}>Champion: {nameOf(t, champ)}</p>}
      {!champ && <p style={{ color: 'var(--text-muted)' }}>No champion yet</p>}
    </div>
  )
}

function MatchList({ t, scores, setScores, saveScore, clear, nameOf }: {
  t: Tournament
  scores: Record<string, { a: string; b: string }>
  setScores: React.Dispatch<React.SetStateAction<Record<string, { a: string; b: string }>>>
  saveScore: (id: string) => void
  clear: (id: string) => void
  nameOf: (t: Tournament, id: string | null) => string
}) {
  const playable = t.matches.filter(m => m.status !== 'bye' && m.a && m.b)
  if (!playable.length) return <p style={{ color: 'var(--text-muted)' }}>No matches ready yet.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {playable.map(m => {
        const sc = scores[m.id] || { a: m.scoreA !== null ? String(m.scoreA) : '', b: m.scoreB !== null ? String(m.scoreB) : '' }
        const done = m.status === 'completed'
        return (
          <div key={m.id} className="panel" style={{ borderLeft: done ? '3px solid var(--success)' : '3px solid var(--accent)', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {m.stage === 'group' ? `Group ${(m.group ?? 0) + 1}` : `Round ${m.round + 1}`}
              </span>
              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: done ? 'rgba(61,139,110,0.2)' : 'rgba(217,39,62,0.15)', color: done ? 'var(--success)' : 'var(--accent)' }}>
                {done ? 'Completed' : 'Upcoming'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 80, fontWeight: 500 }}>{nameOf(t, m.a)}</span>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={sc.a} onChange={e => setScores(prev => ({ ...prev, [m.id]: { ...sc, a: e.target.value.replace(/[^0-9]/g, '') } }))} style={{ width: 56, height: 44, textAlign: 'center', fontSize: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} aria-label="Score A" />
              <span style={{ color: 'var(--text-muted)' }}>–</span>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={sc.b} onChange={e => setScores(prev => ({ ...prev, [m.id]: { ...sc, b: e.target.value.replace(/[^0-9]/g, '') } }))} style={{ width: 56, height: 44, textAlign: 'center', fontSize: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} aria-label="Score B" />
              <span style={{ flex: 1, minWidth: 80, textAlign: 'right', fontWeight: 500 }}>{nameOf(t, m.b)}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="btn btn-primary" style={{ minHeight: 40 }} onClick={() => saveScore(m.id)}>Save Result</button>
              {done && <button className="btn" style={{ minHeight: 40 }} onClick={() => clear(m.id)}>Clear</button>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StandingsView({ t }: { t: Tournament }) {
  const rules = { win: t.winPoints, draw: t.drawPoints, loss: t.lossPoints }
  if (t.format === 'groups' && t.groups) {
    return (
      <div>
        {t.groups.map((g, gi) => {
          const table = standings(t.participants, t.matches, g, rules)
          const ties = t.qualifyPerGroup ? tiedPositions(table, t.qualifyPerGroup) : []
          return (
            <div key={gi} className="panel" style={{ marginBottom: 12 }}>
              <h3 style={{ marginBottom: 6 }}>Group {gi + 1}</h3>
              <StandingsTable table={table} qualify={t.qualifyPerGroup} ties={ties} />
              {ties.length > 0 && <p style={{ color: 'var(--warning)', fontSize: 12, marginTop: 6 }}>Tie affects qualification at positions {ties.map(i => i + 1).join(', ')}. Resolve by changing results.</p>}
            </div>
          )
        })}
      </div>
    )
  }
  return <div className="panel"><StandingsTable table={standings(t.participants, t.matches, undefined, rules)} /></div>
}

function GroupsView({ t }: { t: Tournament }) {
  if (!t.groups) return null
  const rules = { win: t.winPoints, draw: t.drawPoints, loss: t.lossPoints }
  const { qualifiers, ties } = t.qualifyPerGroup ? groupQualifiers(t.participants, t.matches, t.groups, t.qualifyPerGroup, rules) : { qualifiers: null, ties: [] }
  return (
    <div>
      {ties.length > 0 && <div className="panel" style={{ marginBottom: 12, borderLeft: '3px solid var(--warning)' }}><p style={{ color: 'var(--warning)' }}>Qualification unresolved due to ties. Knockout will generate once ties are broken.</p></div>}
      {qualifiers && <div className="panel" style={{ marginBottom: 12, borderLeft: '3px solid var(--success)' }}><p>Qualifiers: {qualifiers.map(id => t.participants.find(p => p.id === id)?.name).join(', ')}</p><p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Seeded by group position (A1, B1, … then A2, B2, …). Knockout generated automatically.</p></div>}
      {!qualifiers && ties.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Complete all group matches to generate the knockout.</p>}
    </div>
  )
}

function BracketView({ t, nameOf }: { t: Tournament; nameOf: (t: Tournament, id: string | null) => string }) {
  const ko = t.matches.filter(m => m.stage !== 'group')
  if (!ko.length) return <p style={{ color: 'var(--text-muted)' }}>No bracket yet. Complete group stage first.</p>
  const rounds = Array.from(new Set(ko.map(m => m.round))).sort((a, b) => a - b)
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
      <div style={{ display: 'flex', gap: 16, minWidth: 'max-content' }}>
        {rounds.map(r => (
          <div key={r} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', minWidth: 160 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>{r === rounds[rounds.length - 1] ? 'Final' : `Round ${r + 1}`}</div>
            {ko.filter(m => m.round === r).map(m => (
              <div key={m.id} style={{ background: 'rgba(20,22,27,0.8)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, margin: '4px 0', borderLeft: m.status === 'bye' ? '3px solid var(--text-muted)' : m.status === 'completed' ? '3px solid var(--success)' : '3px solid var(--accent)' }}>
                <div style={{ fontSize: 13, fontWeight: m.winner === m.a ? 700 : 400 }}>{nameOf(t, m.a)} {m.scoreA !== null ? m.scoreA : ''}</div>
                <div style={{ fontSize: 13, fontWeight: m.winner === m.b ? 700 : 400, marginTop: 2 }}>{nameOf(t, m.b)} {m.scoreB !== null ? m.scoreB : ''}</div>
                {m.status === 'bye' && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>BYE</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function StandingsTable({ table, qualify, ties }: { table: Standing[]; qualify?: number; ties?: number[] }) {
  return (
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
      <thead><tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}><th style={{ padding: 4 }}>#</th><th>Name</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th><th>+/-</th></tr></thead>
      <tbody>
        {table.map((s, i) => {
          const isTied = ties?.includes(i)
          const qualifies = qualify && i < qualify && !isTied
          return (
            <tr key={s.id} style={{ borderTop: '1px solid var(--border)', background: qualifies ? 'rgba(61,139,110,0.1)' : isTied ? 'rgba(196,138,58,0.1)' : undefined }}>
              <td style={{ padding: 4 }}>{i + 1}</td><td>{s.name}</td><td>{s.played}</td><td>{s.won}</td><td>{s.drawn}</td><td>{s.lost}</td><td><strong>{s.points}</strong></td><td>{s.diff}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
