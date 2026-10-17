import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

type Task = { id: string; text: string; done: boolean; priority: 'low' | 'med' | 'high' }

const KEY = 'aurora-tasks'

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadJSON(KEY, []))
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')

  useEffect(() => { saveJSON(KEY, tasks) }, [tasks])

  const add = () => {
    if (!text.trim()) return
    setTasks([{ id: crypto.randomUUID(), text: text.trim(), done: false, priority }, ...tasks])
    setText('')
  }

  const toggle = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const del = (id: string) => setTasks(tasks.filter(t => t.id !== id))

  const shown = tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done))

  return (
    <div>
      <h1 className="page-title">Tasks</h1>
      <p className="subtitle">Saved locally. <span className="demo-badge">Local only</span></p>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="New task…" style={{ flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
        <select value={priority} onChange={e => setPriority(e.target.value as any)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px' }}>
          <option value="low">Low</option><option value="med">Medium</option><option value="high">High</option>
        </select>
        <button className="btn btn-primary" onClick={add}><Plus size={14} /> Add</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['all','open','done'] as const).map(f => (
          <button key={f} className={`btn ${filter===f ? 'btn-primary' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {shown.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tasks.</p>}
      {shown.map(t => (
        <div key={t.id} className="panel" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
          <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>{t.text}</span>
          <span className="demo-badge" style={{ background: t.priority==='high' ? 'rgba(217,39,62,0.2)' : undefined }}>{t.priority}</span>
          <button className="icon-btn" onClick={() => del(t.id)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  )
}
