import { CheckSquare, StickyNote, Folder, Bookmark, Calculator, Timer, FileText } from 'lucide-react'
import { loadJSON } from '../lib/storage'

interface Props {
  greeting: string
  setPage: (p: any) => void
}

export default function HomePage({ greeting, setPage }: Props) {
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

      <div className="status-row">
        <div className="status-module">
          <div className="status-label">Open Tasks</div>
          <div className="status-value">{openTasks}</div>
        </div>
        <div className="status-module">
          <div className="status-label">Completed</div>
          <div className="status-value">{doneTasks}</div>
        </div>
        <div className="status-module">
          <div className="status-label">Notes</div>
          <div className="status-value">{notes.length}</div>
        </div>
        <div className="status-module">
          <div className="status-label">Projects</div>
          <div className="status-value">{projects.length}</div>
        </div>
      </div>

      <div className="panel">
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

      {pinnedNotes.length > 0 && (
        <div className="panel">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Pinned Notes</h3>
          {pinnedNotes.map(n => (
            <div key={n.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <strong>{n.title || 'Untitled'}</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{n.body?.slice(0, 120)}{n.body?.length > 120 ? '…' : ''}</p>
            </div>
          ))}
        </div>
      )}

      {openTasks > 0 && (
        <div className="panel">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Open Tasks</h3>
          {tasks.filter(t => !t.done).slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ flex: 1 }}>{t.text}</span>
              <span className="demo-badge">{t.priority}</span>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && notes.length === 0 && (
        <div className="panel">
          <p style={{ color: 'var(--text-muted)' }}>No tasks or notes yet. Use the buttons above to get started.</p>
        </div>
      )}
    </>
  )
}
