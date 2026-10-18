import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { createScenario, rank, validateScenario, type Scenario } from '../lib/decision'

const KEY = 'aurora-decisions'

export default function DecisionCalc() {
  const [list, setList] = useState<Scenario[]>(() => loadJSON(KEY, []).map(validateScenario).filter(Boolean) as Scenario[])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => { saveJSON(KEY, list) }, [list])

  const active = list.find(s => s.id === activeId) || null
  const patch = (fn: (s: Scenario) => Scenario) => setList(l => l.map(s => s.id === activeId ? fn({ ...s, updated: Date.now() }) : s))

  const create = () => {
    if (!newName.trim()) return
    const s = createScenario(newName)
    setList([s, ...list])
    setActiveId(s.id)
    setNewName('')
  }

  const del = (id: string) => {
    if (!confirm('Delete this scenario?')) return
    setList(l => l.filter(s => s.id !== id))
    if (activeId === id) setActiveId(null)
  }

  if (!active) {
    return (
      <div>
        <h1 className="page-title">Decision Calculator</h1>
        <p className="subtitle">Compare options by criteria you define. Scores are relative to your inputs.</p>
        <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New scenario" style={inputStyle} />
          <button className="btn btn-primary" onClick={create}>Create</button>
        </div>
        {list.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No scenarios yet.</p>}
        {list.map(s => (
          <div key={s.id} className="panel" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setActiveId(s.id)} role="button" tabIndex={0} style={{ flex: 1 }}>{s.name}</span>
            <button className="btn" onClick={() => del(s.id)}>Delete</button>
          </div>
        ))}
      </div>
    )
  }

  const ranked = rank(active.options, active.criteria)

  return (
    <div>
      <button className="btn" onClick={() => setActiveId(null)} style={{ marginBottom: 10 }}>← Back</button>
      <input value={active.name} onChange={e => patch(s => ({ ...s, name: e.target.value }))} style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} />
      <textarea value={active.description} onChange={e => patch(s => ({ ...s, description: e.target.value }))} placeholder="Description" style={{ ...inputStyle, minHeight: 50 }} />

      <h3 style={{ marginTop: 12 }}>Criteria</h3>
      {active.criteria.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={c.name} onChange={e => patch(s => ({ ...s, criteria: s.criteria.map(x => x.id === c.id ? { ...x, name: e.target.value } : x) }))} style={{ ...inputStyle, flex: 1, margin: 0 }} />
          <input type="number" min={0} value={c.weight} onChange={e => patch(s => ({ ...s, criteria: s.criteria.map(x => x.id === c.id ? { ...x, weight: +e.target.value || 0 } : x) }))} style={{ ...inputStyle, width: 60, margin: 0 }} />
          <label style={{ fontSize: 12 }}><input type="checkbox" checked={c.higherIsBetter} onChange={e => patch(s => ({ ...s, criteria: s.criteria.map(x => x.id === c.id ? { ...x, higherIsBetter: e.target.checked } : x) }))} /> Higher better</label>
          <button className="btn" onClick={() => patch(s => ({ ...s, criteria: s.criteria.filter(x => x.id !== c.id) }))}>×</button>
        </div>
      ))}
      <button className="btn" onClick={() => patch(s => ({ ...s, criteria: [...s.criteria, { id: crypto.randomUUID(), name: 'Criterion', weight: 1, higherIsBetter: true }] }))}>Add criterion</button>

      <h3 style={{ marginTop: 16 }}>Options</h3>
      {active.options.map(o => (
        <div key={o.id} className="panel" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input value={o.name} onChange={e => patch(s => ({ ...s, options: s.options.map(x => x.id === o.id ? { ...x, name: e.target.value } : x) }))} style={{ ...inputStyle, flex: 1, margin: 0 }} />
            <button className="btn" onClick={() => patch(s => ({ ...s, options: s.options.filter(x => x.id !== o.id) }))}>×</button>
          </div>
          {active.criteria.map(c => (
            <label key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8, fontSize: 13 }}>
              {c.name}
              <input type="number" min={1} max={10} value={o.scores[c.id] ?? ''} onChange={e => patch(s => ({ ...s, options: s.options.map(x => x.id === o.id ? { ...x, scores: { ...x.scores, [c.id]: e.target.value === '' ? null : +e.target.value } } : x) }))} style={{ width: 50 }} />
            </label>
          ))}
        </div>
      ))}
      <button className="btn" onClick={() => patch(s => ({ ...s, options: [...s.options, { id: crypto.randomUUID(), name: 'Option', description: '', scores: {} }] }))}>Add option</button>

      <h3 style={{ marginTop: 16 }}>Results</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Weighted average of scores. Higher is better unless marked otherwise. Missing scores are excluded, not treated as zero.</p>
      {ranked.map(r => (
        <div key={r.option.id} className="panel" style={{ marginBottom: 6 }}>
          <strong>{r.rank > 0 ? `#${r.rank}` : '—'} {r.option.name}</strong>
          <span style={{ marginLeft: 8 }}>{r.score != null ? r.score.toFixed(2) : 'Incomplete'}</span>
          {r.missing > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--warning)' }}>{r.missing} missing</span>}
        </div>
      ))}
      {ranked.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Add options and criteria to see results.</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)', fontSize: 14 }
