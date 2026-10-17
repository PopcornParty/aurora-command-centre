import { useState, useEffect } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

type Note = { id: string; title: string; body: string; updated: number }

const KEY = 'aurora-notes'

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => loadJSON(KEY, []))
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => { saveJSON(KEY, notes) }, [notes])

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(query.toLowerCase()) ||
    n.body.toLowerCase().includes(query.toLowerCase())
  )

  const save = () => {
    if (!title.trim() && !body.trim()) return
    if (editing) {
      setNotes(notes.map(n => n.id === editing.id ? { ...n, title, body, updated: Date.now() } : n))
    } else {
      setNotes([{ id: crypto.randomUUID(), title: title || 'Untitled', body, updated: Date.now() }, ...notes])
    }
    setEditing(null); setTitle(''); setBody('')
  }

  const del = (id: string) => setNotes(notes.filter(n => n.id !== id))

  return (
    <div>
      <h1 className="page-title">Notes</h1>
      <p className="subtitle">Saved locally in your browser. <span className="demo-badge">Local only</span></p>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <Search size={16} style={{ alignSelf: 'center', color: 'var(--text-muted)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes…" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
      </div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 16, marginBottom: 8, outline: 'none' }} />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write a note…" rows={4} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', resize: 'vertical' }} />
        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={save}><Plus size={14} /> {editing ? 'Update' : 'Save Note'}</button>
      </div>
      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No notes yet.</p>}
      {filtered.map(n => (
        <div key={n.id} className="panel" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{n.title}</strong>
            <button className="icon-btn" onClick={() => del(n.id)} aria-label="Delete"><Trash2 size={14} /></button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6, whiteSpace: 'pre-wrap' }}>{n.body}</p>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => { setEditing(n); setTitle(n.title); setBody(n.body) }}>Edit</button>
        </div>
      ))}
    </div>
  )
}
