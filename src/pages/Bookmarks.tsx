import { useState, useEffect } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

type Bm = { id: string; name: string; url: string }

const KEY = 'aurora-bookmarks'

export default function Bookmarks() {
  const [items, setItems] = useState<Bm[]>(() => loadJSON(KEY, [
    { id: '1', name: 'YouTube Channel', url: 'https://www.youtube.com/@popcorn_party1' }
  ]))
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => { saveJSON(KEY, items) }, [items])

  const add = () => {
    if (!name.trim() || !url.trim()) return
    setItems([{ id: crypto.randomUUID(), name, url }, ...items])
    setName(''); setUrl('')
  }

  return (
    <div>
      <h1 className="page-title">Bookmarks</h1>
      <p className="subtitle">Saved locally. <span className="demo-badge">Local only</span></p>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" style={{ flex: 2, minWidth: 180, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <button className="btn btn-primary" onClick={add}><Plus size={14} /> Add</button>
      </div>
      {items.map(b => (
        <div key={b.id} className="panel" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div>{b.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.url}</div>
          </div>
          <a href={b.url} target="_blank" rel="noopener noreferrer" className="btn"><ExternalLink size={14} /></a>
          <button className="icon-btn" onClick={() => setItems(items.filter(x => x.id !== b.id))}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}
