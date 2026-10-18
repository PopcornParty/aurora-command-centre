import { useState, useEffect } from 'react'
import { CheckSquare, StickyNote, Folder, Bookmark, Calculator, Timer, FileText, Settings } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

interface Props {
  greeting: string
  setPage: (p: any) => void
}

const DASH_KEY = 'aurora-dashboard'
const DEFAULT_WIDGETS = ['status', 'launch', 'tasks', 'notes']

export default function HomePage({ greeting, setPage }: Props) {
  const [prefs, setPrefs] = useState<{ visible: string[]; order: string[] }>(() => {
    const saved = loadJSON<{ visible?: string[]; order?: string[] } | string[]>(DASH_KEY, { visible: DEFAULT_WIDGETS, order: DEFAULT_WIDGETS })
    if (Array.isArray(saved)) return { visible: saved, order: DEFAULT_WIDGETS }
    return { visible: saved.visible || DEFAULT_WIDGETS, order: saved.order || DEFAULT_WIDGETS }
  })
  const [editing, setEditing] = useState(false)
  useEffect(() => { saveJSON(DASH_KEY, prefs) }, [prefs])
  const widgets = prefs.visible
  const toggle = (id: string) => setPrefs(p => ({ ...p, visible: p.visible.includes(id) ? p.visible.filter(x => x !== id) : [...p.visible, id] }))
  const move = (id: string, dir: -1 | 1) => {
    setPrefs(p => {
      const order = [...p.order]
      const i = order.indexOf(id)
      if (i < 0) return p
      const j = i + dir
      if (j < 0 || j >= order.length) return p
      ;[order[i], order[j]] = [order[j], order[i]]
      return { ...p, order }
    })
  }
  const reset = () => { setPrefs({ visible: DEFAULT_WIDGETS, order: DEFAULT_WIDGETS }); setEditing(false) }
  const orderedVisible = prefs.order.filter(id => prefs.visible.includes(id))
  const tasks = loadJSON<any[]>('aurora-tasks', [])
  const notes = loadJSON<any[]>('aurora-notes', [])
  const projects = loadJSON<any[]>('aurora-projects', [])
  const openTasks = tasks.filter(t => !t.done).length
  const doneTasks = tasks.filter(t => t.done).length
  const pinnedNotes = notes.filter(n => n.pinned).slice(0, 3)

  return (
    <>
      <div>
        <div className="greeting">{greeting}</div>
        <h1 className="page-title">Command Centre</h1>
        <p className="subtitle">Your local workspace. All data stays on this device.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="btn" onClick={() => setEditing(!editing)}><Settings size={14} /> Layout</button>
      </div>
      {editing && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>Show and reorder widgets</div>
          {prefs.order.map(id => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <label style={{ flex: 1, fontSize: 13 }}>
                <input type="checkbox" checked={widgets.includes(id)} onChange={() => toggle(id)} /> {id}
              </label>
              <button className="btn" style={{ fontSize: 12, minWidth: 32 }} onClick={() => move(id, -1)} aria-label="Move up">↑</button>
              <button className="btn" style={{ fontSize: 12, minWidth: 32 }} onClick={() => move(id, 1)} aria-label="Move down">↓</button>
            </div>
          ))}
          <button className="btn" style={{ marginTop: 8 }} onClick={reset}>Reset</button>
        </div>
      )}

      {orderedVisible.map(id => {
        if (id === 'status') return <div key="status" className="status-row">
          <div className="status-module"><div className="status-label">Open Tasks</div><div className="status-value">{openTasks}</div></div>
          <div className="status-module"><div className="status-label">Completed</div><div className="status-value">{doneTasks}</div></div>
          <div className="status-module"><div className="status-label">Notes</div><div className="status-value">{notes.length}</div></div>
          <div className="status-module"><div className="status-label">Projects</div><div className="status-value">{projects.length}</div></div>
        </div>
        if (id === 'launch') return <div key="launch" className="panel">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Quick Launch</h3>
          <div className="quick-actions">
            <button className="btn" onClick={() => setPage('tasks')}><CheckSquare size={14} /> Tasks</button>
            <button className="btn" onClick={() => setPage('notes')}><StickyNote size={14} /> Notes</button>
            <button className="btn" onClick={() => setPage('projects')}><Folder size={14} /> Projects</button>
            <button className="btn" onClick={() => setPage('bookmarks')}><Bookmark size={14} /> Bookmarks</button>
            <button className="btn" onClick={() => setPage('calculator')}><Calculator size={14} /> Calculator</button>
            <button className="btn" onClick={() => setPage('timer')}><Timer size={14} /> Timer</button>
            <button className="btn" onClick={() => setPage('scratchpad')}><FileText size={14} /> Scratchpad</button>
          </div>
        </div>
        if (id === 'tracker') return <div key="tracker" className="panel"><h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Project Tracker</h3><button className="btn" onClick={() => setPage('tracker')}>Open Tracker</button></div>
        if (id === 'tools') return <div key="tools" className="panel"><h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Tools</h3><div className="quick-actions"><button className="btn" onClick={() => setPage('toolshub')}>Tools Hub</button><button className="btn" onClick={() => setPage('timer')}>Timer</button><button className="btn" onClick={() => setPage('focus')}>Focus</button></div></div>
        if (id === 'notes' && pinnedNotes.length > 0) return <div key="notes" className="panel"><h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Pinned Notes</h3>{pinnedNotes.map(n => <div key={n.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}><strong>{n.title || 'Untitled'}</strong><p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{n.body?.slice(0, 120)}{n.body?.length > 120 ? '…' : ''}</p></div>)}</div>
        if (id === 'tasks' && openTasks > 0) return <div key="tasks" className="panel"><h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Open Tasks</h3>{tasks.filter(t => !t.done).slice(0, 5).map(t => <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ flex: 1 }}>{t.text}</span><span className="demo-badge">{t.priority}</span></div>)}</div>
        return null
      })}

      {tasks.length === 0 && notes.length === 0 && (
        <div className="panel">
          <p style={{ color: 'var(--text-muted)' }}>No tasks or notes yet. Use the buttons above to get started.</p>
        </div>
      )}
    </>
  )
}
