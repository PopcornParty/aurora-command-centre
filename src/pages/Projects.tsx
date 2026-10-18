import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

type Project = { id: string; name: string; description: string; created: number }

const KEY = 'aurora-projects'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(() => loadJSON(KEY, []))
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => { saveJSON(KEY, projects) }, [projects])

  const add = () => {
    if (!name.trim()) return
    setProjects([{ id: crypto.randomUUID(), name: name.trim(), description: desc, created: Date.now() }, ...projects])
    setName(''); setDesc('')
  }

  const del = (id: string) => { if (confirm('Delete this project?')) setProjects(projects.filter(p => p.id !== id)) }

  const filtered = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <h1 className="page-title">Projects</h1>
      <p className="subtitle">Organise related work. Stored locally.</p>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" style={{ flex: 2, minWidth: 180, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <button className="btn btn-primary" onClick={add}><Plus size={14} /> Add</button>
      </div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects…" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', marginBottom: 12 }} />
      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No projects yet.</p>}
      {filtered.map(p => (
        <div key={p.id} className="panel" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{p.name}</strong>
            <button className="icon-btn" onClick={() => del(p.id)}><Trash2 size={14} /></button>
          </div>
          {p.description && <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>{p.description}</p>}
        </div>
      ))}
    </div>
  )
}
