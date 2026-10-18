import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import {
  createProject, addTask, toggleTask, deleteTask, addMilestone,
  progress, filterProjects, sortProjects, overdueTasks, upcomingMilestones,
  validateTracker, isOverdue, type Project, type TrackerData, type Status
} from '../lib/tracker'

const KEY = 'aurora-tracker'

export default function Tracker() {
  const [data, setData] = useState<TrackerData>(() => validateTracker(loadJSON(KEY, { projects: [] })))
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Status | ''>('')
  const [sort, setSort] = useState<'name' | 'due' | 'priority' | 'progress'>('name')
  const [view, setView] = useState<'list' | 'board' | 'detail'>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => { saveJSON(KEY, data) }, [data])

  const update = (fn: (d: TrackerData) => TrackerData) => setData(prev => fn(prev))
  const active = data.projects.find(p => p.id === activeId) || null
  const shown = sortProjects(filterProjects(data.projects, q, status || undefined), sort)
  const overdue = overdueTasks(data.projects)
  const upcoming = upcomingMilestones(data.projects)

  const create = () => {
    if (!newName.trim()) return
    const p = createProject(newName)
    update(d => ({ projects: [p, ...d.projects] }))
    setNewName('')
    setActiveId(p.id)
    setView('detail')
  }

  const patch = (id: string, fn: (p: Project) => Project) => {
    update(d => ({ projects: d.projects.map(p => p.id === id ? fn(p) : p) }))
  }

  const del = (id: string) => {
    if (!confirm('Delete this project permanently?')) return
    update(d => ({ projects: d.projects.filter(p => p.id !== id) }))
    if (activeId === id) { setActiveId(null); setView('list') }
  }

  return (
    <div>
      <h1 className="page-title">Project Tracker</h1>
      <p className="subtitle">Local projects with tasks and milestones.</p>

      <div className="quick-actions" style={{ margin: '12px 0' }}>
        <button className={`btn ${view === 'list' ? 'btn-primary' : ''}`} onClick={() => setView('list')}>List</button>
        <button className={`btn ${view === 'board' ? 'btn-primary' : ''}`} onClick={() => setView('board')}>Board</button>
        {active && <button className={`btn ${view === 'detail' ? 'btn-primary' : ''}`} onClick={() => setView('detail')}>Detail</button>}
      </div>

      {overdue.length > 0 && (
        <div className="panel" style={{ marginBottom: 12, borderLeft: '3px solid var(--accent)' }}>
          <strong>{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</strong>
          {overdue.slice(0, 3).map(o => <div key={o.task.id} style={{ fontSize: 13 }}>{o.project.name}: {o.task.text}</div>)}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <strong>Upcoming milestones</strong>
          {upcoming.slice(0, 3).map(u => <div key={u.milestone.id} style={{ fontSize: 13 }}>{u.project.name}: {u.milestone.name} ({u.milestone.date})</div>)}
        </div>
      )}

      {view === 'list' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New project name" style={inputStyle} />
            <button className="btn btn-primary" onClick={create}>Create</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ ...inputStyle, flex: 1 }} />
            <select value={status} onChange={e => setStatus(e.target.value as Status | '')} style={inputStyle}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="done">Done</option>
              <option value="archived">Archived</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} style={inputStyle}>
              <option value="name">Name</option>
              <option value="due">Due</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
            </select>
          </div>
          {shown.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No projects yet.</p>}
          {shown.map(p => (
            <div key={p.id} className="panel" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }} onClick={() => { setActiveId(p.id); setView('detail') }} role="button" tabIndex={0}>
                <strong>{p.name}</strong>
                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{p.status} · {progress(p)}%</span>
                {p.due && <div style={{ fontSize: 12, color: isOverdue(p.due) ? 'var(--accent)' : 'var(--text-muted)' }}>Due {p.due}</div>}
              </div>
              <button className="btn" onClick={() => patch(p.id, pr => ({ ...pr, status: pr.status === 'archived' ? 'active' : 'archived' }))}>{p.status === 'archived' ? 'Restore' : 'Archive'}</button>
            </div>
          ))}
        </>
      )}

      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {(['active', 'paused', 'done', 'archived'] as Status[]).map(s => (
            <div key={s} className="panel">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s}</div>
              {data.projects.filter(p => p.status === s).map(p => (
                <div key={p.id} style={{ padding: 6, marginBottom: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 6, cursor: 'pointer' }} onClick={() => { setActiveId(p.id); setView('detail') }}>
                  {p.name}<div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{progress(p)}%</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === 'detail' && active && (
        <Detail p={active} patch={fn => patch(active.id, fn)} del={() => del(active.id)} />
      )}
    </div>
  )
}

function Detail({ p, patch, del }: { p: Project; patch: (fn: (p: Project) => Project) => void; del: () => void }) {
  const [taskText, setTaskText] = useState('')
  const [msName, setMsName] = useState('')
  const [msDate, setMsDate] = useState('')
  return (
    <div>
      <input value={p.name} onChange={e => patch(pr => ({ ...pr, name: e.target.value }))} style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} />
      <textarea value={p.description} onChange={e => patch(pr => ({ ...pr, description: e.target.value }))} placeholder="Description" style={{ ...inputStyle, minHeight: 60 }} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <select value={p.status} onChange={e => patch(pr => ({ ...pr, status: e.target.value as Status }))} style={inputStyle}>
          <option value="active">Active</option><option value="paused">Paused</option><option value="done">Done</option><option value="archived">Archived</option>
        </select>
        <select value={p.priority} onChange={e => patch(pr => ({ ...pr, priority: e.target.value as Project['priority'] }))} style={inputStyle}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <input type="date" value={p.due || ''} onChange={e => patch(pr => ({ ...pr, due: e.target.value || null }))} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>Progress: <strong>{progress(p)}%</strong> ({p.tasks.filter(t => t.done).length}/{p.tasks.length} tasks)</div>

      <h3 style={{ marginTop: 12 }}>Tasks</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="New task" style={{ ...inputStyle, flex: 1, margin: 0 }} />
        <button className="btn" onClick={() => { if (taskText.trim()) { patch(pr => addTask(pr, taskText)); setTaskText('') } }}>Add</button>
      </div>
      {p.tasks.map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <input type="checkbox" checked={t.done} onChange={() => patch(pr => toggleTask(pr, t.id))} />
          <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
          <input type="date" value={t.due || ''} onChange={e => patch(pr => ({ ...pr, tasks: pr.tasks.map(x => x.id === t.id ? { ...x, due: e.target.value || null } : x) }))} style={{ fontSize: 12 }} />
          <button className="btn" style={{ fontSize: 12 }} onClick={() => patch(pr => deleteTask(pr, t.id))}>×</button>
        </div>
      ))}

      <h3 style={{ marginTop: 12 }}>Milestones</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input value={msName} onChange={e => setMsName(e.target.value)} placeholder="Milestone" style={{ ...inputStyle, flex: 1, margin: 0 }} />
        <input type="date" value={msDate} onChange={e => setMsDate(e.target.value)} style={{ ...inputStyle, width: 140, margin: 0 }} />
        <button className="btn" onClick={() => { if (msName.trim()) { patch(pr => addMilestone(pr, msName, msDate || null)); setMsName(''); setMsDate('') } }}>Add</button>
      </div>
      {p.milestones.map(m => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <input type="checkbox" checked={m.done} onChange={() => patch(pr => ({ ...pr, milestones: pr.milestones.map(x => x.id === m.id ? { ...x, done: !x.done } : x) }))} />
          <span style={{ flex: 1 }}>{m.name}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.date}</span>
        </div>
      ))}

      <button className="btn" style={{ marginTop: 16, color: 'var(--accent)' }} onClick={del}>Delete project</button>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)', fontSize: 14 }
