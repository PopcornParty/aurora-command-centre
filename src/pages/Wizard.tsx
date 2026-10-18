import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { createGuide, findStep, nextStep, validateGuide, validateImported, type Guide, type Step } from '../lib/wizard'

const KEY = 'aurora-guides'

export default function Wizard() {
  const [list, setList] = useState<Guide[]>(() => loadJSON(KEY, []).map(validateImported).filter(Boolean) as Guide[])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mode, setMode] = useState<'edit' | 'follow'>('edit')
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [path, setPath] = useState<string[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => { saveJSON(KEY, list) }, [list])

  const active = list.find(g => g.id === activeId) || null
  const patch = (fn: (g: Guide) => Guide) => setList(l => l.map(g => g.id === activeId ? fn({ ...g, updated: Date.now() }) : g))

  const create = () => {
    if (!newName.trim()) return
    const g = createGuide(newName)
    setList([g, ...list])
    setActiveId(g.id)
    setMode('edit')
    setNewName('')
  }

  const del = (id: string) => {
    if (!confirm('Delete this guide?')) return
    setList(l => l.filter(g => g.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const startFollow = () => {
    if (!active) return
    setCurrentId(active.startId)
    setPath([active.startId])
    setMode('follow')
  }

  if (!active) {
    return (
      <div>
        <h1 className="page-title">Troubleshooting Wizard</h1>
        <p className="subtitle">Create and follow step-by-step guides. You define the questions and branches.</p>
        <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New guide" style={inputStyle} />
          <button className="btn btn-primary" onClick={create}>Create</button>
        </div>
        {list.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No guides yet.</p>}
        {list.map(g => (
          <div key={g.id} className="panel" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => { setActiveId(g.id); setMode('edit') }} role="button" tabIndex={0} style={{ flex: 1 }}>{g.name}</span>
            <button className="btn" onClick={() => del(g.id)}>Delete</button>
          </div>
        ))}
      </div>
    )
  }

  if (mode === 'follow') {
    const step = currentId ? findStep(active, currentId) : null
    if (!step) return <div><p>Guide ended or step missing.</p><button className="btn" onClick={() => setMode('edit')}>Back to edit</button></div>
    const go = (answer?: string) => {
      const next = nextStep(active, step, answer)
      if (next) { setCurrentId(next); setPath([...path, next]) }
    }
    return (
      <div>
        <button className="btn" onClick={() => setMode('edit')} style={{ marginBottom: 10 }}>← Edit</button>
        <div className="panel">
          <h2>{step.title}</h2>
          <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>{step.body || '(No details)'}</p>
          {step.type === 'yesno' && (
            <div className="quick-actions">
              <button className="btn btn-primary" onClick={() => go('yes')}>Yes</button>
              <button className="btn" onClick={() => go('no')}>No</button>
            </div>
          )}
          {step.type === 'choice' && step.choices?.map(c => (
            <button key={c.label} className="btn" style={{ margin: 4 }} onClick={() => go(c.label)}>{c.label}</button>
          ))}
          {(step.type === 'info' || step.type === 'check' || step.type === 'cause' || step.type === 'solution') && step.next && (
            <button className="btn btn-primary" onClick={() => go()}>Next</button>
          )}
          {step.type === 'end' && <p style={{ color: 'var(--text-muted)' }}>End of guide.</p>}
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => { if (path.length > 1) { const p = path.slice(0, -1); setPath(p); setCurrentId(p[p.length - 1]) } }}>Back</button>
            <button className="btn" style={{ marginLeft: 6 }} onClick={startFollow}>Restart</button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Step {path.length}. This is user-authored guidance, not professional advice.</p>
      </div>
    )
  }

  const validation = validateGuide(active)

  return (
    <div>
      <button className="btn" onClick={() => setActiveId(null)} style={{ marginBottom: 10 }}>← Back</button>
      <input value={active.name} onChange={e => patch(g => ({ ...g, name: e.target.value }))} style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} />
      <textarea value={active.description} onChange={e => patch(g => ({ ...g, description: e.target.value }))} placeholder="Description" style={{ ...inputStyle, minHeight: 50 }} />
      {!validation.ok && <p style={{ color: 'var(--accent)', fontSize: 13 }}>{validation.errors.join('; ')}</p>}
      <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={startFollow} disabled={!validation.ok}>Follow guide</button>

      <h3>Steps</h3>
      {active.steps.map(s => (
        <div key={s.id} className="panel" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <select value={s.type} onChange={e => patch(g => ({ ...g, steps: g.steps.map(x => x.id === s.id ? { ...x, type: e.target.value as Step['type'] } : x) }))} style={inputStyle}>
              <option value="info">Info</option><option value="yesno">Yes/No</option><option value="choice">Choice</option><option value="check">Check</option><option value="cause">Cause</option><option value="solution">Solution</option><option value="end">End</option>
            </select>
            <input value={s.title} onChange={e => patch(g => ({ ...g, steps: g.steps.map(x => x.id === s.id ? { ...x, title: e.target.value } : x) }))} placeholder="Title" style={{ ...inputStyle, flex: 1, margin: 0 }} />
            <button className="btn" onClick={() => patch(g => ({ ...g, steps: g.steps.filter(x => x.id !== s.id) }))}>×</button>
          </div>
          <textarea value={s.body} onChange={e => patch(g => ({ ...g, steps: g.steps.map(x => x.id === s.id ? { ...x, body: e.target.value } : x) }))} placeholder="Details" style={{ ...inputStyle, minHeight: 40, width: '100%' }} />
          {s.type === 'yesno' && (
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <label style={{ fontSize: 12 }}>Yes → <select value={s.yesNext || ''} onChange={e => patch(g => ({ ...g, steps: g.steps.map(x => x.id === s.id ? { ...x, yesNext: e.target.value } : x) }))} style={inputStyle}><option value="">—</option>{active.steps.filter(x => x.id !== s.id).map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
              <label style={{ fontSize: 12 }}>No → <select value={s.noNext || ''} onChange={e => patch(g => ({ ...g, steps: g.steps.map(x => x.id === s.id ? { ...x, noNext: e.target.value } : x) }))} style={inputStyle}><option value="">—</option>{active.steps.filter(x => x.id !== s.id).map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
            </div>
          )}
          {s.type !== 'yesno' && s.type !== 'choice' && s.type !== 'end' && (
            <label style={{ fontSize: 12, marginTop: 4, display: 'block' }}>Next → <select value={s.next || ''} onChange={e => patch(g => ({ ...g, steps: g.steps.map(x => x.id === s.id ? { ...x, next: e.target.value } : x) }))} style={inputStyle}><option value="">—</option>{active.steps.filter(x => x.id !== s.id).map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
          )}
        </div>
      ))}
      <button className="btn" onClick={() => patch(g => ({ ...g, steps: [...g.steps, { id: crypto.randomUUID(), type: 'info', title: 'Step', body: '' }] }))}>Add step</button>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)', fontSize: 14 }
