import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

type QNote = { id: string; text: string; created: number }

const KEY = 'aurora-quicknotes'

export default function QuickNotes() {
  const [notes, setNotes] = useState<QNote[]>(() => loadJSON(KEY, []))
  const [text, setText] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => { saveJSON(KEY, notes) }, [notes])

  const save = () => {
    if (!text.trim()) return
    if (editing) {
      setNotes(notes.map(n => n.id === editing ? { ...n, text: text.trim() } : n))
      setEditing(null)
    } else {
      setNotes([{ id: crypto.randomUUID(), text: text.trim(), created: Date.now() }, ...notes])
    }
    setText('')
  }

  const del = (id: string) => {
    if (!confirm('Delete this quick note?')) return
    setNotes(notes.filter(n => n.id !== id))
  }

  const filtered = notes.filter(n => n.text.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <h2>Quick Notes</h2>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Separate from your main Notes. Stored locally.</p>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={inputStyle} />
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Quick note…" style={areaStyle} />
      <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Add'}</button>
      {editing && <button className="btn" style={{ marginLeft: 6 }} onClick={() => { setEditing(null); setText('') }}>Cancel</button>}
      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>No quick notes.</p>}
      {filtered.map(n => (
        <div key={n.id} className="panel" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <p style={{ flex: 1, whiteSpace: 'pre-wrap', fontSize: 14 }}>{n.text}</p>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => navigator.clipboard.writeText(n.text)}>Copy</button>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => { setEditing(n.id); setText(n.text) }}>Edit</button>
            <button className="btn" style={{ fontSize: 12 }} onClick={() => del(n.id)}>×</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }
const areaStyle: React.CSSProperties = { ...inputStyle, minHeight: 60, resize: 'vertical' }
