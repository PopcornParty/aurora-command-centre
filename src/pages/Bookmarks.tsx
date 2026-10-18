import { useState, useEffect } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

type Bookmark = { id: string; title: string; url: string; category: string }

const KEY = 'aurora-bookmarks'

export default function Bookmarks() {
  const [items, setItems] = useState<Bookmark[]>(() => loadJSON(KEY, []))
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [cat] = useState('General')
  const [query, setQuery] = useState('')

  useEffect(() => { saveJSON(KEY, items) }, [items])

  const add = () => {
    if (!title.trim() || !url.trim()) return
    let u = url.trim()
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u
    try { new URL(u) } catch { alert('Invalid URL'); return }
    setItems([{ id: crypto.randomUUID(), title: title.trim(), url: u, category: cat }, ...items])
    setTitle(''); setUrl('')
  }

  const del = (id: string) => setItems(items.filter(i => i.id !== id))

  const filtered = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.url.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <h1 className="page-title">Bookmarks</h1>
      <p className="subtitle">External links only. Stored locally.</p>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" style={{ flex: 2, minWidth: 160, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <button className="btn btn-primary" onClick={add}><Plus size={14} /> Add</button>
      </div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', marginBottom: 12 }} />
      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No bookmarks.</p>}
      {filtered.map(i => (
        <div key={i.id} className="panel" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <strong>{i.title}</strong>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i.url}</div>
          </div>
          <a href={i.url} target="_blank" rel="noopener noreferrer" className="icon-btn"><ExternalLink size={14} /></a>
          <button className="icon-btn" onClick={() => del(i.id)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}
